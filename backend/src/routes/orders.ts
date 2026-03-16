import { Router, Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { v4 as uuidv4 } from 'uuid';
import db from '../db';

const router = Router();

// GET /api/orders/:sessionId - list orders for a session
router.get('/:sessionId', (req: Request, res: Response) => {
  const orders = db.prepare(`
    SELECT * FROM orders WHERE session_id = ? ORDER BY created_at DESC
  `).all(req.params.sessionId);
  res.json(orders);
});

// GET /api/orders/:sessionId/:orderId - get order details
router.get('/:sessionId/:orderId', (req: Request, res: Response) => {
  const order = db.prepare(
    'SELECT * FROM orders WHERE id = ? AND session_id = ?'
  ).get(req.params.orderId, req.params.sessionId);

  if (!order) {
    return res.status(404).json({ error: 'Order not found' });
  }

  const orderItems = db.prepare(
    'SELECT * FROM order_items WHERE order_id = ?'
  ).all(req.params.orderId);

  res.json({ ...order as object, items: orderItems });
});

// POST /api/orders/:sessionId - create order from cart
router.post(
  '/:sessionId',
  [
    body('fulfillment_type').isIn(['delivery', 'pickup']),
    body('fulfillment_address').isString().optional(),
    body('fulfillment_store').isString().optional(),
    body('scheduled_at').isISO8601().optional(),
    body('bundle_deal_id').isString().optional(),
    body('notes').isString().optional(),
  ],
  (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { sessionId } = req.params;
    const {
      fulfillment_type,
      fulfillment_address,
      fulfillment_store,
      scheduled_at,
      bundle_deal_id,
      notes,
    } = req.body;

    // Get cart items
    const cartItems = db.prepare(`
      SELECT
        ci.*,
        i.name as item_name,
        iv.brand,
        iv.quality_tier,
        iv.base_price
      FROM cart_items ci
      JOIN items i ON ci.item_id = i.id
      LEFT JOIN item_variants iv ON ci.variant_id = iv.id
      WHERE ci.session_id = ?
    `).all(sessionId) as Array<{
      id: string;
      item_id: string;
      variant_id: string | null;
      item_name: string;
      brand: string | null;
      quality_tier: string | null;
      base_price: number;
      quantity: number;
      notes: string | null;
    }>;

    if (cartItems.length === 0) {
      return res.status(400).json({ error: 'Cart is empty' });
    }

    const subtotal = cartItems.reduce((sum, item) => sum + (item.base_price || 0) * item.quantity, 0);

    // Calculate discount from bundle deal
    let discountAmount = 0;
    if (bundle_deal_id) {
      const deal = db.prepare(
        'SELECT * FROM bundle_deals WHERE id = ? AND is_active = 1'
      ).get(bundle_deal_id) as { discount_type: string; discount_value: number; min_order_amount: number | null } | undefined;

      if (deal && (!deal.min_order_amount || subtotal >= deal.min_order_amount)) {
        if (deal.discount_type === 'percentage') {
          discountAmount = (subtotal * deal.discount_value) / 100;
        } else {
          discountAmount = deal.discount_value;
        }
      }
    }

    const taxRate = 0.08; // 8% tax
    const taxableAmount = subtotal - discountAmount;
    const taxAmount = taxableAmount * taxRate;
    const total = taxableAmount + taxAmount;

    const orderId = uuidv4();

    const createOrder = db.transaction(() => {
      db.prepare(`
        INSERT INTO orders (id, session_id, fulfillment_type, fulfillment_address, fulfillment_store,
          scheduled_at, subtotal, discount_amount, tax_amount, total, bundle_deal_id, notes)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        orderId, sessionId, fulfillment_type,
        fulfillment_address || null, fulfillment_store || null,
        scheduled_at || null,
        Math.round(subtotal * 100) / 100,
        Math.round(discountAmount * 100) / 100,
        Math.round(taxAmount * 100) / 100,
        Math.round(total * 100) / 100,
        bundle_deal_id || null, notes || null
      );

      const insertOrderItem = db.prepare(`
        INSERT INTO order_items (id, order_id, item_id, variant_id, item_name, brand, quality_tier,
          quantity, unit_price, line_total, notes)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      for (const ci of cartItems) {
        insertOrderItem.run(
          uuidv4(), orderId, ci.item_id, ci.variant_id,
          ci.item_name, ci.brand, ci.quality_tier,
          ci.quantity,
          Math.round((ci.base_price || 0) * 100) / 100,
          Math.round((ci.base_price || 0) * ci.quantity * 100) / 100,
          ci.notes
        );
      }

      // Clear the cart
      db.prepare('DELETE FROM cart_items WHERE session_id = ?').run(sessionId);
    });

    createOrder();

    const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(orderId);
    const orderItems = db.prepare('SELECT * FROM order_items WHERE order_id = ?').all(orderId);

    res.status(201).json({ ...order as object, items: orderItems });
  }
);

// PATCH /api/orders/:sessionId/:orderId/status - update order status
router.patch(
  '/:sessionId/:orderId/status',
  [body('status').isIn(['pending', 'confirmed', 'processing', 'ready', 'out_for_delivery', 'delivered', 'cancelled'])],
  (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { sessionId, orderId } = req.params;
    const { status } = req.body;

    const result = db.prepare(`
      UPDATE orders SET status = ?, updated_at = datetime('now')
      WHERE id = ? AND session_id = ?
    `).run(status, orderId, sessionId);

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(orderId);
    res.json(order);
  }
);

export default router;

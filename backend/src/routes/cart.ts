import { Router, Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { v4 as uuidv4 } from 'uuid';
import db from '../db';

const router = Router();

// GET /api/cart/:sessionId
router.get('/:sessionId', (req: Request, res: Response) => {
  const { sessionId } = req.params;

  const cartItems = db.prepare(`
    SELECT
      ci.*,
      i.name as item_name,
      i.unit,
      i.image_url,
      c.name as category_name,
      c.icon as category_icon,
      iv.brand,
      iv.quality_tier,
      iv.size,
      iv.base_price,
      iv.is_organic
    FROM cart_items ci
    JOIN items i ON ci.item_id = i.id
    JOIN categories c ON i.category_id = c.id
    LEFT JOIN item_variants iv ON ci.variant_id = iv.id
    WHERE ci.session_id = ?
    ORDER BY ci.added_at DESC
  `).all(sessionId);

  const subtotal = (cartItems as Array<{ base_price: number; quantity: number }>).reduce(
    (sum: number, item) => sum + (item.base_price || 0) * item.quantity,
    0
  );

  res.json({ items: cartItems, subtotal, count: cartItems.length });
});

// POST /api/cart/:sessionId/items - add item to cart
router.post(
  '/:sessionId/items',
  [
    body('item_id').isString().notEmpty(),
    body('quantity').isInt({ min: 1 }).optional(),
    body('variant_id').isString().optional(),
    body('notes').isString().optional(),
  ],
  (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { sessionId } = req.params;
    const { item_id, variant_id, quantity = 1, notes } = req.body;

    // Check if item exists
    const item = db.prepare('SELECT id FROM items WHERE id = ? AND is_active = 1').get(item_id);
    if (!item) {
      return res.status(404).json({ error: 'Item not found' });
    }

    // Check if already in cart
    const existing = db.prepare(
      'SELECT id, quantity FROM cart_items WHERE session_id = ? AND item_id = ? AND (variant_id = ? OR (variant_id IS NULL AND ? IS NULL))'
    ).get(sessionId, item_id, variant_id || null, variant_id || null);

    if (existing) {
      const updated = db.prepare(
        'UPDATE cart_items SET quantity = quantity + ?, notes = COALESCE(?, notes), updated_at = datetime(\'now\') WHERE id = ? RETURNING *'
      ).get(quantity, notes || null, (existing as { id: string }).id);
      return res.json(updated);
    }

    const id = uuidv4();
    const cartItem = db.prepare(`
      INSERT INTO cart_items (id, session_id, item_id, variant_id, quantity, notes)
      VALUES (?, ?, ?, ?, ?, ?)
      RETURNING *
    `).get(id, sessionId, item_id, variant_id || null, quantity, notes || null);

    res.status(201).json(cartItem);
  }
);

// PATCH /api/cart/:sessionId/items/:itemId - update quantity/notes
router.patch(
  '/:sessionId/items/:cartItemId',
  [
    body('quantity').isInt({ min: 0 }).optional(),
    body('notes').isString().optional(),
    body('variant_id').isString().optional({ nullable: true }),
  ],
  (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { sessionId, cartItemId } = req.params;
    const { quantity, notes, variant_id } = req.body;

    const existing = db.prepare(
      'SELECT id FROM cart_items WHERE id = ? AND session_id = ?'
    ).get(cartItemId, sessionId);

    if (!existing) {
      return res.status(404).json({ error: 'Cart item not found' });
    }

    if (quantity === 0) {
      db.prepare('DELETE FROM cart_items WHERE id = ?').run(cartItemId);
      return res.json({ message: 'Item removed from cart' });
    }

    const updates: string[] = ["updated_at = datetime('now')"];
    const params: (string | number | null)[] = [];

    if (quantity !== undefined) { updates.push('quantity = ?'); params.push(quantity); }
    if (notes !== undefined) { updates.push('notes = ?'); params.push(notes); }
    if (variant_id !== undefined) { updates.push('variant_id = ?'); params.push(variant_id); }

    params.push(cartItemId);
    const updated = db.prepare(
      `UPDATE cart_items SET ${updates.join(', ')} WHERE id = ? RETURNING *`
    ).get(...params);

    res.json(updated);
  }
);

// DELETE /api/cart/:sessionId/items/:cartItemId
router.delete('/:sessionId/items/:cartItemId', (req: Request, res: Response) => {
  const { sessionId, cartItemId } = req.params;
  const result = db.prepare(
    'DELETE FROM cart_items WHERE id = ? AND session_id = ?'
  ).run(cartItemId, sessionId);

  if (result.changes === 0) {
    return res.status(404).json({ error: 'Cart item not found' });
  }
  res.json({ message: 'Item removed' });
});

// DELETE /api/cart/:sessionId - clear cart
router.delete('/:sessionId', (req: Request, res: Response) => {
  db.prepare('DELETE FROM cart_items WHERE session_id = ?').run(req.params.sessionId);
  res.json({ message: 'Cart cleared' });
});

export default router;

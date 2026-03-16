import { Router, Request, Response } from 'express';
import db from '../db';

const router = Router();

// GET /api/bundles - list active bundle deals
router.get('/', (_req: Request, res: Response) => {
  const bundles = db.prepare(`
    SELECT
      bd.*,
      GROUP_CONCAT(i.id) as item_ids,
      GROUP_CONCAT(i.name) as item_names,
      COUNT(bdi.item_id) as item_count
    FROM bundle_deals bd
    LEFT JOIN bundle_deal_items bdi ON bd.id = bdi.bundle_id
    LEFT JOIN items i ON bdi.item_id = i.id
    WHERE bd.is_active = 1
      AND (bd.valid_until IS NULL OR bd.valid_until >= date('now'))
    GROUP BY bd.id
    ORDER BY bd.discount_value DESC
  `).all();

  res.json(bundles);
});

// GET /api/bundles/recommend - recommend bundles for a cart session
router.get('/recommend/:sessionId', (req: Request, res: Response) => {
  const { sessionId } = req.params;

  // Get cart items for session
  const cartItems = db.prepare(`
    SELECT ci.item_id, iv.base_price, ci.quantity
    FROM cart_items ci
    LEFT JOIN item_variants iv ON ci.variant_id = iv.id
    WHERE ci.session_id = ?
  `).all(sessionId) as Array<{ item_id: string; base_price: number; quantity: number }>;

  if (cartItems.length === 0) {
    return res.json({ bundles: [], message: 'Cart is empty' });
  }

  const cartItemIds = cartItems.map(ci => ci.item_id);
  const cartTotal = cartItems.reduce((sum, ci) => sum + (ci.base_price || 0) * ci.quantity, 0);

  // Find bundles that match cart items
  const bundles = db.prepare(`
    SELECT
      bd.*,
      COUNT(DISTINCT bdi.item_id) as matched_items,
      (SELECT COUNT(*) FROM bundle_deal_items WHERE bundle_id = bd.id) as total_bundle_items
    FROM bundle_deals bd
    JOIN bundle_deal_items bdi ON bd.id = bdi.bundle_id
    WHERE bd.is_active = 1
      AND (bd.valid_until IS NULL OR bd.valid_until >= date('now'))
      AND (bd.min_order_amount IS NULL OR bd.min_order_amount <= ?)
      AND bdi.item_id IN (${cartItemIds.map(() => '?').join(',')})
    GROUP BY bd.id
    HAVING matched_items > 0
    ORDER BY matched_items DESC, bd.discount_value DESC
  `).all(cartTotal, ...cartItemIds) as Array<{
    id: string;
    name: string;
    discount_type: string;
    discount_value: number;
    matched_items: number;
    total_bundle_items: number;
    min_order_amount: number | null;
  }>;

  // Calculate estimated savings for each bundle
  const recommendations = bundles.map(bundle => {
    let savings = 0;
    if (bundle.discount_type === 'percentage') {
      savings = (cartTotal * bundle.discount_value) / 100;
    } else {
      savings = bundle.discount_value;
    }

    return {
      ...bundle,
      estimated_savings: Math.round(savings * 100) / 100,
      match_percentage: Math.round((bundle.matched_items / bundle.total_bundle_items) * 100),
    };
  });

  res.json({ bundles: recommendations, cart_total: cartTotal });
});

// GET /api/bundles/:id - get bundle details
router.get('/:id', (req: Request, res: Response) => {
  const bundle = db.prepare('SELECT * FROM bundle_deals WHERE id = ?').get(req.params.id);
  if (!bundle) {
    return res.status(404).json({ error: 'Bundle not found' });
  }

  const items = db.prepare(`
    SELECT i.*, c.name as category_name
    FROM bundle_deal_items bdi
    JOIN items i ON bdi.item_id = i.id
    JOIN categories c ON i.category_id = c.id
    WHERE bdi.bundle_id = ?
  `).all(req.params.id);

  res.json({ ...bundle as object, items });
});

export default router;

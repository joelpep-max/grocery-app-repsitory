import { Router, Request, Response } from 'express';
import db from '../db';

const router = Router();

// GET /api/items - list items with optional category filter and search
router.get('/', (req: Request, res: Response) => {
  const { category_id, search, quality_tier, is_organic, page = '1', limit = '20' } = req.query;

  const offset = (parseInt(page as string) - 1) * parseInt(limit as string);
  const conditions: string[] = ['i.is_active = 1'];
  const params: (string | number)[] = [];

  if (category_id) {
    conditions.push('i.category_id = ?');
    params.push(category_id as string);
  }

  if (search) {
    conditions.push("(i.name LIKE ? OR i.description LIKE ?)");
    params.push(`%${search}%`, `%${search}%`);
  }

  let variantFilter = '';
  if (quality_tier) {
    variantFilter += ` AND iv.quality_tier = '${quality_tier}'`;
  }
  if (is_organic === 'true') {
    variantFilter += ' AND iv.is_organic = 1';
  }

  const whereClause = conditions.length > 0 ? 'WHERE ' + conditions.join(' AND ') : '';

  const items = db.prepare(`
    SELECT
      i.*,
      c.name as category_name,
      c.icon as category_icon,
      MIN(iv.base_price) as min_price,
      MAX(iv.base_price) as max_price,
      COUNT(DISTINCT iv.id) as variant_count,
      MAX(iv.is_organic) as has_organic
    FROM items i
    JOIN categories c ON i.category_id = c.id
    LEFT JOIN item_variants iv ON iv.item_id = i.id AND iv.is_active = 1 ${variantFilter}
    ${whereClause}
    GROUP BY i.id
    ORDER BY c.sort_order, i.name
    LIMIT ? OFFSET ?
  `).all(...params, parseInt(limit as string), offset);

  const total = (db.prepare(`
    SELECT COUNT(DISTINCT i.id) as count
    FROM items i
    JOIN categories c ON i.category_id = c.id
    LEFT JOIN item_variants iv ON iv.item_id = i.id AND iv.is_active = 1 ${variantFilter}
    ${whereClause}
  `).get(...params) as { count: number }).count;

  res.json({
    items,
    pagination: {
      total,
      page: parseInt(page as string),
      limit: parseInt(limit as string),
      pages: Math.ceil(total / parseInt(limit as string))
    }
  });
});

// GET /api/items/:id - get item with all variants
router.get('/:id', (req: Request, res: Response) => {
  const item = db.prepare(`
    SELECT i.*, c.name as category_name, c.icon as category_icon
    FROM items i
    JOIN categories c ON i.category_id = c.id
    WHERE i.id = ? AND i.is_active = 1
  `).get(req.params.id);

  if (!item) {
    return res.status(404).json({ error: 'Item not found' });
  }

  const variants = db.prepare(
    'SELECT * FROM item_variants WHERE item_id = ? AND is_active = 1 ORDER BY base_price ASC'
  ).all(req.params.id);

  res.json({ ...item as object, variants });
});

export default router;

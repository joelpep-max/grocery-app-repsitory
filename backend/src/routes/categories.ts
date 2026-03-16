import { Router, Request, Response } from 'express';
import db from '../db';

const router = Router();

// GET /api/categories
router.get('/', (_req: Request, res: Response) => {
  const categories = db.prepare(
    'SELECT * FROM categories ORDER BY sort_order ASC'
  ).all();
  res.json(categories);
});

// GET /api/categories/:id
router.get('/:id', (req: Request, res: Response) => {
  const category = db.prepare('SELECT * FROM categories WHERE id = ?').get(req.params.id);
  if (!category) {
    return res.status(404).json({ error: 'Category not found' });
  }
  res.json(category);
});

export default router;

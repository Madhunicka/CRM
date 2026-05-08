import { Router, Request, Response } from 'express';
import db from '../lib/db.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

router.use(authMiddleware);

// GET /api/users - List all salespeople
router.get('/', async (_req: Request, res: Response): Promise<void> => {
  try {
    const result = await db.query('SELECT id, name, email, role FROM users ORDER BY name ASC');
    res.json(result.rows);
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;

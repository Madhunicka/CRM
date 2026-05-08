import { Router, Request, Response } from 'express';
import db from '../lib/db.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

router.use(authMiddleware);

router.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const { status, source, salesperson, q } = req.query;
    
    let query = `
      SELECT l.*, 
             json_build_object('id', u.id, 'name', u.name, 'email', u.email) as "assignedTo"
      FROM leads l
      LEFT JOIN users u ON l."assignedToId" = u.id
      WHERE 1=1
    `;
    const params: any[] = [];
    let paramIndex = 1;

    if (status && status !== 'All') {
      query += ` AND l.status = $${paramIndex++}`;
      params.push(status);
    }

    if (source && source !== 'All') {
      query += ` AND l.source = $${paramIndex++}`;
      params.push(source);
    }

    if (salesperson && salesperson !== 'All') {
      query += ` AND l."assignedToId" = $${paramIndex++}`;
      params.push(salesperson);
    }

    if (q) {
      query += ` AND (l.name ILIKE $${paramIndex} OR l.company ILIKE $${paramIndex} OR l.email ILIKE $${paramIndex})`;
      params.push(`%${q}%`);
      paramIndex++;
    }

    query += ` ORDER BY l."createdAt" DESC`;

    const result = await db.query(query, params);
    const leads = result.rows.map(row => ({
      ...row,
      dealValue: parseFloat(row.dealValue || 0)
    }));
    res.json(leads);
  } catch (error) {
    console.error('Get leads error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const leadResult = await db.query(`
      SELECT l.*, 
             json_build_object('id', u.id, 'name', u.name, 'email', u.email) as "assignedTo"
      FROM leads l
      LEFT JOIN users u ON l."assignedToId" = u.id
      WHERE l.id = $1
    `, [req.params.id]);

    const lead = leadResult.rows[0];

    if (!lead) {
      res.status(404).json({ error: 'Lead not found' });
      return;
    }

    const notesResult = await db.query(`
      SELECT n.*, 
             json_build_object('id', u.id, 'name', u.name, 'email', u.email) as user
      FROM notes n
      JOIN users u ON n."userId" = u.id
      WHERE n."leadId" = $1
      ORDER BY n."createdAt" DESC
    `, [req.params.id]);

    lead.notes = notesResult.rows;

    if (lead) {
      lead.dealValue = parseFloat(lead.dealValue || 0);
    }
    res.json(lead);
  } catch (error) {
    console.error('Get lead error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, company, email, phone, source, dealValue, status } = req.body;

    if (!name || !company || !email || !phone || !source) {
      res.status(400).json({ error: 'All fields are required.' });
      return;
    }

    const id = `lead_${Math.random().toString(36).substr(2, 9)}`;
    const result = await db.query(`
      INSERT INTO leads (id, name, company, email, phone, source, "dealValue", status, "assignedToId")
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `, [id, name, company, email, phone, source, parseFloat(dealValue) || 0, status || 'New', req.body.assignedToId || req.user!.id]);

    const lead = result.rows[0];
    
    const userResult = await db.query('SELECT id, name, email FROM users WHERE id = $1', [req.user!.id]);
    lead.assignedTo = userResult.rows[0];

    if (lead) {
      lead.dealValue = parseFloat(lead.dealValue || 0);
    }
    res.status(201).json(lead);
  } catch (error) {
    console.error('Create lead error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.put('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, company, email, phone, source, dealValue, status } = req.body;

    if (!name || !company || !email || !phone || !source) {
      res.status(400).json({ error: 'All fields are required.' });
      return;
    }

    const result = await db.query(`
      UPDATE leads 
      SET name = $1, company = $2, email = $3, phone = $4, source = $5, "dealValue" = $6, status = $7, "assignedToId" = $8, "updatedAt" = CURRENT_TIMESTAMP
      WHERE id = $9
      RETURNING *
    `, [name, company, email, phone, source, parseFloat(dealValue) || 0, status || 'New', req.body.assignedToId || req.user!.id, req.params.id]);

    const lead = result.rows[0];
    if (!lead) {
      res.status(404).json({ error: 'Lead not found' });
      return;
    }

    const userResult = await db.query('SELECT id, name, email FROM users WHERE id = $1', [lead.assignedToId]);
    lead.assignedTo = userResult.rows[0];

    if (lead) {
      lead.dealValue = parseFloat(lead.dealValue || 0);
    }
    res.json(lead);
  } catch (error) {
    console.error('Update lead error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.patch('/:id/status', async (req: Request, res: Response): Promise<void> => {
  try {
    const { status } = req.body;

    if (!status) {
      res.status(400).json({ error: 'Status is required' });
      return;
    }

    const result = await db.query(`
      UPDATE leads SET status = $1, "updatedAt" = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *
    `, [status, req.params.id]);

    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Lead not found' });
      return;
    }

    const lead = result.rows[0];
    if (lead) {
      lead.dealValue = parseFloat(lead.dealValue || 0);
    }
    res.json(lead);
  } catch (error) {
    console.error('Update status error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.delete('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await db.query('DELETE FROM leads WHERE id = $1', [req.params.id]);
    res.json({ success: true });
  } catch (error) {
    console.error('Delete lead error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/:id/notes', async (req: Request, res: Response): Promise<void> => {
  try {
    const { content } = req.body;

    if (!content?.trim()) {
      res.status(400).json({ error: 'Note content is required' });
      return;
    }

    const id = `note_${Math.random().toString(36).substr(2, 9)}`;
    const result = await db.query(`
      INSERT INTO notes (id, content, "leadId", "userId")
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `, [id, content, req.params.id, req.user!.id]);

    const note = result.rows[0];
    
    const userResult = await db.query('SELECT id, name, email FROM users WHERE id = $1', [req.user!.id]);
    note.user = userResult.rows[0];

    res.status(201).json(note);
  } catch (error) {
    console.error('Add note error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;

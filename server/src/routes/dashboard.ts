import { Router, Request, Response } from 'express';
import db from '../lib/db.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

router.use(authMiddleware);

// GET /api/dashboard/stats
router.get('/stats', async (_req: Request, res: Response): Promise<void> => {
  try {
    // Basic counts
    const countsResult = await db.query(`
      SELECT 
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE status = 'New') as new,
        COUNT(*) FILTER (WHERE status = 'Contacted') as contacted,
        COUNT(*) FILTER (WHERE status = 'Qualified') as qualified,
        COUNT(*) FILTER (WHERE status = 'Proposal Sent') as proposal,
        COUNT(*) FILTER (WHERE status = 'Won') as won,
        COUNT(*) FILTER (WHERE status = 'Lost') as lost
      FROM leads
    `);
    const counts = countsResult.rows[0];

    // Aggregations
    const aggResult = await db.query(`
      SELECT 
        SUM("dealValue") as "totalValue",
        SUM("dealValue") FILTER (WHERE status = 'Won') as "wonValue"
      FROM leads
    `);
    const aggs = aggResult.rows[0];

    // Recent Leads
    const recentResult = await db.query(`
      SELECT l.*, 
             json_build_object('id', u.id, 'name', u.name, 'email', u.email) as "assignedTo"
      FROM leads l
      LEFT JOIN users u ON l."assignedToId" = u.id
      ORDER BY l."createdAt" DESC
      LIMIT 5
    `);

    const totalLeads = parseInt(counts.total);
    const wonLeads = parseInt(counts.won);
    const totalValue = parseFloat(aggs.totalValue || 0);
    const wonValue = parseFloat(aggs.wonValue || 0);

    const total = totalLeads || 1;
    const conversionRate = totalLeads > 0 ? ((wonLeads / totalLeads) * 100).toFixed(1) : '0.0';
    const avgDeal = totalValue / total;

    res.json({
      totalLeads,
      newLeads: parseInt(counts.new),
      contactedLeads: parseInt(counts.contacted),
      qualifiedLeads: parseInt(counts.qualified),
      proposalLeads: parseInt(counts.proposal),
      wonLeads,
      lostLeads: parseInt(counts.lost),
      totalValue,
      wonValue,
      recentLeads: recentResult.rows,
      conversionRate,
      avgDeal,
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;

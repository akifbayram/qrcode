import { Router } from 'express';
import { query } from '../db.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.use(authenticate);

async function verifyHomeMembership(homeId: string, userId: string): Promise<boolean> {
  const result = await query(
    'SELECT id FROM home_members WHERE home_id = $1 AND user_id = $2',
    [homeId, userId]
  );
  return result.rows.length > 0;
}

// GET /api/tag-colors?home_id=X — list all tag colors for a home
router.get('/', async (req, res) => {
  try {
    const homeId = req.query.home_id as string;
    if (!homeId) {
      res.status(400).json({ error: 'home_id query parameter is required' });
      return;
    }

    if (!await verifyHomeMembership(homeId, req.user!.id)) {
      res.status(403).json({ error: 'Not a member of this home' });
      return;
    }

    const result = await query(
      'SELECT id, home_id, tag, color, created_at, updated_at FROM tag_colors WHERE home_id = $1 ORDER BY tag',
      [homeId]
    );

    res.json(result.rows);
  } catch (err) {
    console.error('List tag colors error:', err);
    res.status(500).json({ error: 'Failed to list tag colors' });
  }
});

// PUT /api/tag-colors — upsert tag color
router.put('/', async (req, res) => {
  try {
    const { homeId, tag, color } = req.body;

    if (!homeId || !tag) {
      res.status(400).json({ error: 'homeId and tag are required' });
      return;
    }

    if (!await verifyHomeMembership(homeId, req.user!.id)) {
      res.status(403).json({ error: 'Not a member of this home' });
      return;
    }

    // If color is empty, remove the tag color
    if (!color) {
      await query(
        'DELETE FROM tag_colors WHERE home_id = $1 AND tag = $2',
        [homeId, tag]
      );
      res.json({ deleted: true });
      return;
    }

    const result = await query(
      `INSERT INTO tag_colors (home_id, tag, color)
       VALUES ($1, $2, $3)
       ON CONFLICT (home_id, tag) DO UPDATE SET color = $3, updated_at = now()
       RETURNING id, home_id, tag, color, created_at, updated_at`,
      [homeId, tag, color]
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.error('Upsert tag color error:', err);
    res.status(500).json({ error: 'Failed to upsert tag color' });
  }
});

// DELETE /api/tag-colors/:tag?home_id=X — remove a tag color
router.delete('/:tag', async (req, res) => {
  try {
    const tag = req.params.tag;
    const homeId = req.query.home_id as string;

    if (!homeId) {
      res.status(400).json({ error: 'home_id query parameter is required' });
      return;
    }

    if (!await verifyHomeMembership(homeId, req.user!.id)) {
      res.status(403).json({ error: 'Not a member of this home' });
      return;
    }

    await query(
      'DELETE FROM tag_colors WHERE home_id = $1 AND tag = $2',
      [homeId, tag]
    );

    res.json({ deleted: true });
  } catch (err) {
    console.error('Delete tag color error:', err);
    res.status(500).json({ error: 'Failed to delete tag color' });
  }
});

export default router;

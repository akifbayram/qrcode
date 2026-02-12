import { Request, Response, NextFunction } from 'express';
import { query } from '../db.js';

/**
 * Middleware factory to verify user is member of a location.
 * Reads locationId from req.params[paramName] or req.body.locationId or req.query.location_id.
 */
export function requireLocationMember(paramName = 'id') {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    const locationId = req.params[paramName] || req.body?.locationId || req.query.location_id;
    if (!locationId) {
      res.status(400).json({ error: 'Location ID required' });
      return;
    }

    const result = await query(
      'SELECT id FROM location_members WHERE location_id = $1 AND user_id = $2',
      [locationId, userId]
    );

    if (result.rows.length === 0) {
      res.status(403).json({ error: 'Not a member of this location' });
      return;
    }

    next();
  };
}

/** Check if a user is the owner of a location */
export async function isLocationOwner(locationId: string, userId: string): Promise<boolean> {
  const result = await query(
    'SELECT id FROM location_members WHERE location_id = $1 AND user_id = $2 AND role = $3',
    [locationId, userId, 'owner']
  );
  return result.rows.length > 0;
}

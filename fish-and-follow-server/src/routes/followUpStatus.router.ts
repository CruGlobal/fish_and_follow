import { Router } from 'express';
import { db } from '../db/client';
import { followUpStatus } from '../db/schema';
import { eq } from 'drizzle-orm';

export const followUpStatusRouter = Router();

// GET all statuses
followUpStatusRouter.get('/', async (_req, res) => {
  const statuses = await db.select().from(followUpStatus);
  res.json(statuses);
});

// GET status by number
followUpStatusRouter.get('/:number', async (req, res) => {
  const { number } = req.params;
  const result = await db.select().from(followUpStatus).where(eq(followUpStatus.number, parseInt(number)));
  if (result.length === 0) return res.status(404).json({ error: 'Not found' });
  res.json(result[0]);
});

// POST create status
followUpStatusRouter.post('/', async (req, res) => {
  const { number, description } = req.body;

  try {
    const inserted = await db.insert(followUpStatus).values({ number, description }).returning();
    res.status(201).json(inserted[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create follow-up status' });
  }
});

// PUT update status by number
followUpStatusRouter.put('/:number', async (req, res) => {
  const { number } = req.params;
  const { description } = req.body;

  try {
    const updated = await db
      .update(followUpStatus)
      .set({ description })
      .where(eq(followUpStatus.number, parseInt(number)))
      .returning();

    res.json(updated[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update follow-up status' });
  }
});

// DELETE status by number
followUpStatusRouter.delete('/:number', async (req, res) => {
  const { number } = req.params;
  
  try {
    await db.delete(followUpStatus).where(eq(followUpStatus.number, parseInt(number)));
    res.status(204).send();
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to delete follow-up status' });
  }
});

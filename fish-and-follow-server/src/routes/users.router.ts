import { Router } from 'express';
import { db } from '../db/client';
import { user } from '../db/schema';
import { eq } from 'drizzle-orm';

export const usersRouter = Router();

// GET all users
usersRouter.get('/', async (_req, res) => {
  const users = await db.select().from(user);
  res.json(users);
});

// GET user by ID
usersRouter.get('/:id', async (req, res) => {
  const { id } = req.params;
  const result = await db.select().from(user).where(eq(user.id, id));
  if (result.length === 0) return res.status(404).json({ error: 'Not found' });
  res.json(result[0]);
});

// POST create user
usersRouter.post('/', async (req, res) => {
  const { role, username, email, contactId } = req.body;
  
  try {
    const inserted = await db.insert(user).values({ role, username, email, contactId }).returning();
    res.status(201).json(inserted[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create user' });
  }
});

// PUT update user by ID
usersRouter.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { role, username, email, contactId } = req.body;

  try {
    const updated = await db
      .update(user)
      .set({ role, username, email, contactId })
      .where(eq(user.id, id))
      .returning();

    res.json(updated[0]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update user' });
  }
});

// DELETE user by ID
usersRouter.delete('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    await db.delete(user).where(eq(user.id, id));
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

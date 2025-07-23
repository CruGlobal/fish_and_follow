import { Router } from 'express';
import { db } from '../db/client';
import { contact } from '../db/schema';
import { eq } from 'drizzle-orm';

export const contactsRouter = Router();

// Get all contacts
contactsRouter.get('/', async (_req, res) => {
  const contacts = await db.select().from(contact);
  res.json(contacts);
});

// Get contact by ID
contactsRouter.get('/:id', async (req, res) => {
  const { id } = req.params;
  const result = await db.select().from(contact).where(eq(contact.id, id));
  if (result.length === 0) return res.status(404).json({ error: 'Not found' });
  res.json(result[0]);
});

// POST Create contact
contactsRouter.post('/', async (req, res) => {
  const { firstName, lastName, phoneNumber, email, campus, 
    major, year, isInterested, gender, followUpStatusNumber } = req.body;
    
  try {
    const inserted = await db.insert(contact).values({ firstName, lastName, 
        phoneNumber, email, campus, major, year, isInterested, gender, 
        followUpStatusNumber }).returning();
    res.status(201).json(inserted[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create contact' });
  }
});

// PUT Update contact
contactsRouter.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { firstName, lastName, phoneNumber, email, campus, 
    major, year, isInterested, gender, followUpStatusNumber } = req.body;

  try {
    const updated = await db
      .update(contact)
      .set({ firstName, lastName, phoneNumber, email, campus, 
        major, year, isInterested, gender, followUpStatusNumber })
      .where(eq(contact.id, id))
      .returning();

    res.json(updated[0]);
  } catch (error) {
    console.error("Update Error:", error);
    res.status(500).json({ error: 'Failed to update contact' });
  }
});

// DELETE contact by ID
contactsRouter.delete('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    await db.delete(contact).where(eq(contact.id, id));
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete contact' });
  }
});
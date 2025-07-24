import { Router, Request, Response } from 'express';
import { db } from '../db/client';
import { contact } from '../db/schema';
import { eq, sql, asc } from 'drizzle-orm';
import {
  parseFieldsParameter,
  getContactFieldNames,
  getDefaultContactFields,
  getContactFieldObjects,
} from '../contacts/search-utils';

export const contactsRouter = Router();

// Get all contacts
contactsRouter.get('/', async (_req, res) => {
  const contacts = await db.select().from(contact);
  res.json(contacts);
});

contactsRouter.get('/search', async (req: Request, res: Response) => {
  const { search = '', fuzzy = 'true', threshold = '0.6', limit = '50', fields } = req.query;

  const searchThreshold = Math.max(0.1, Math.min(1, parseFloat(threshold as string) || 0.6));
  const maxResults = Math.max(1, Math.min(100, parseInt(limit as string) || 50));
  const useFuzzy = fuzzy === 'true';
  const hasSearchQuery = search && typeof search === 'string' && search.trim();

  // Use utility function to parse and validate fields
  const fieldsToSelect = parseFieldsParameter(fields);

  try {
    let results;

    if (hasSearchQuery) {
      console.log(
        `🔍 Using ${useFuzzy ? 'fuzzy' : 'exact'} search for: "${search}" with threshold: ${searchThreshold}`,
      );

      const searchQuery = search.trim();
      const maxDistance = Math.round((1 - searchThreshold) * searchQuery.length);

      // Use raw SQL for fuzzy search since Drizzle doesn't have built-in levenshtein
      const selectClause = fieldsToSelect.join(', ');
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const rawResults = await db.execute(
        sql`
          SELECT ${sql.raw(selectClause)}
          FROM ${contact}
          WHERE levenshtein(${contact.firstName}, ${searchQuery}) <= ${maxDistance}
            OR levenshtein(${contact.lastName}, ${searchQuery}) <= ${maxDistance}
          ORDER BY LEAST(
            levenshtein(${contact.firstName}, ${searchQuery}),
            levenshtein(${contact.lastName}, ${searchQuery})
          ) ASC
          LIMIT ${maxResults}
        `,
      );
      results = (rawResults as { rows?: unknown[] }).rows || [];
    } else {
      // Use Drizzle query builder for simple queries
      const query = db
        .select()
        .from(contact)
        .orderBy(asc(contact.firstName), asc(contact.lastName))
        .limit(maxResults);

      const allResults = await query;

      // Filter fields if specific fields were requested
      if (fieldsToSelect.length > 0 && !fieldsToSelect.includes('*')) {
        results = allResults.map((row) => {
          const filtered: Record<string, unknown> = {};
          fieldsToSelect.forEach((field) => {
            if (field in row) {
              filtered[field] = row[field as keyof typeof row];
            }
          });
          return filtered;
        });
      } else {
        results = allResults;
      }
    }

    console.log(
      `✅ Found ${results.length} ${hasSearchQuery ? `matches for "${search}"` : 'contacts'}`,
    );
    res.json({
      success: true,
      contacts: results,
      query: search || null,
      fuzzySearch: useFuzzy,
      threshold: searchThreshold,
      total: results.length,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ error: 'Failed to search contacts' });
  }
});

// Get available contact fields from schema (must be before /:id route)
contactsRouter.get('/fields', (_req, res) => {
  try {
    // Extract field information directly from schema without database queries
    const fields = getContactFieldObjects();

    res.json({
      success: true,
      fields,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error extracting fields:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to extract contact fields',
      message: 'Unable to retrieve schema information',
    });
  }
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

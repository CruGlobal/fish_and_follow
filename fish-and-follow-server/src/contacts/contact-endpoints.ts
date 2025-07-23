import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { tempContacts } from './temp-contacts-data';
import {
  Contact,
  searchContactsWithFuzzy,
  advancedSearchContacts,
  searchContacts,
} from './search-utils';

const router = Router();

// Contact form data interface for API requests
interface ContactFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  company?: string;
  message?: string;
}

interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp: string;
}

// In-memory storage (replace with database in production)
const contacts: Contact[] = [
  {
    id: '1',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    phone: '+1-555-123-4567',
    company: 'Acme Corp',
    message: 'Interested in your services',
    createdAt: '2025-01-15T10:30:00Z',
    updatedAt: '2025-01-15T10:30:00Z',
  },
  {
    id: '2',
    firstName: 'Jane',
    lastName: 'Smith',
    email: 'jane.smith@example.com',
    phone: '+1-555-987-6543',
    company: 'Tech Solutions',
    message: 'Would like to schedule a demo',
    createdAt: '2025-01-14T14:20:00Z',
    updatedAt: '2025-01-14T14:20:00Z',
  },
  {
    id: '3',
    firstName: 'Michael',
    lastName: 'Johnson',
    email: 'm.johnson@company.com',
    phone: '+1-555-456-7890',
    company: 'Innovation Labs',
    message: 'Looking for partnership opportunities',
    createdAt: '2025-01-13T09:15:00Z',
    updatedAt: '2025-01-13T09:15:00Z',
  },
  // Add temporary contacts for testing
  ...tempContacts,
];

// Validation helpers
const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const validatePhone = (phone: string): boolean => {
  const phoneRegex = /^[+]?[1-9][\d]{0,15}$/;
  const cleanPhone = phone.replace(/[\s\-().]/g, '');
  return phoneRegex.test(cleanPhone) && cleanPhone.length >= 7;
};

// Safe date creation helper
const createISOTimestamp = (): string => {
  try {
    return new Date().toISOString();
  } catch (dateError) {
    console.error('❌ Error creating timestamp:', dateError);
    // Fallback to current time in milliseconds as string
    return Date.now().toString();
  }
};

// Safe UUID generation helper
const generateContactId = (): string => {
  try {
    const generatedId = (uuidv4 as () => string)();
    if (!generatedId || typeof generatedId !== 'string') {
      throw new Error('Invalid UUID generated');
    }
    return generatedId;
  } catch (error) {
    console.error('❌ Error generating UUID:', error);
    // Fallback to timestamp-based ID
    return `contact_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
};

const validateContactData = (data: Partial<ContactFormData>): string[] => {
  const errors: string[] = [];

  if (!data.firstName?.trim()) {
    errors.push('First name is required');
  }
  if (!data.lastName?.trim()) {
    errors.push('Last name is required');
  }
  if (!data.email?.trim()) {
    errors.push('Email is required');
  } else if (!validateEmail(data.email)) {
    errors.push('Invalid email format');
  }
  if (!data.phone?.trim()) {
    errors.push('Phone number is required');
  } else if (!validatePhone(data.phone)) {
    errors.push('Invalid phone number format');
  }

  return errors;
};

// Routes

// GET /contacts - Get all contacts
router.get('/', (req: Request, res: Response) => {
  try {
    console.log('=== Get contacts endpoint called ===');
    const { search = '', fuzzy = 'true', threshold = '0.6' } = req.query;

    let filteredContacts = [...contacts];

    if (search) {
      const searchQuery = search as string;
      const useFuzzy = fuzzy === 'true';
      const searchThreshold = Math.max(0.1, Math.min(1, parseFloat(threshold as string) || 0.6));

      if (useFuzzy) {
        console.log(`🔍 Using fuzzy search with threshold: ${searchThreshold}`);
        filteredContacts = searchContactsWithFuzzy(filteredContacts, searchQuery, searchThreshold);
      } else {
        console.log('🔍 Using exact search');
        filteredContacts = searchContacts(filteredContacts, searchQuery);
      }
    }

    // Sort by creation date (newest first)
    filteredContacts.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );

    console.log(`✅ Returning ${filteredContacts.length} contacts`);

    // Enhanced response with search metadata
    const response = {
      contacts: filteredContacts,
      total: filteredContacts.length,
      searchQuery: search || null,
      fuzzySearch: fuzzy === 'true',
      threshold: parseFloat(threshold as string) || 0.6,
      timestamp: createISOTimestamp(),
    };

    res.status(200).json(response);
  } catch (error) {
    console.error('❌ Error in get contacts endpoint:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve contacts',
      message: error instanceof Error ? error.message : 'Unknown error',
      timestamp: createISOTimestamp(),
    } as ApiResponse);
  }
});

// GET /contacts/search - Advanced search with detailed results
router.get('/search', (req: Request, res: Response) => {
  try {
    console.log('=== Advanced search endpoint called ===');
    const { q: query = '', threshold = '0.6', limit = '50' } = req.query;

    if (!query || typeof query !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Query parameter "q" is required',
        timestamp: createISOTimestamp(),
      } as ApiResponse);
    }

    const searchThreshold = Math.max(0.1, Math.min(1, parseFloat(threshold as string) || 0.6));
    const maxResults = Math.max(1, Math.min(100, parseInt(limit as string) || 50));

    console.log(`🔍 Advanced search for: "${query}" with threshold: ${searchThreshold}`);

    // Use the imported advancedSearchContacts function
    const searchResults = advancedSearchContacts(contacts, query, searchThreshold, maxResults);

    console.log(`✅ Found ${searchResults.length} matches out of ${contacts.length} contacts`);

    const response = {
      success: true,
      results: searchResults.map((result) => ({
        contact: result.contact,
        score: Math.round(result.score * 100) / 100,
        matchedFields: result.matchedFields,
        fieldScores: Object.fromEntries(
          Object.entries(result.fieldScores || {}).map(([field, score]) => [
            field,
            typeof score === 'number' ? Math.round(score * 100) / 100 : 0,
          ]),
        ),
      })),
      query,
      threshold: searchThreshold,
      total: searchResults.length,
      totalContacts: contacts.length,
      timestamp: createISOTimestamp(),
    };

    res.status(200).json(response);
  } catch (error) {
    console.error('❌ Error in advanced search endpoint:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to perform advanced search',
      message: error instanceof Error ? error.message : 'Unknown error',
      timestamp: createISOTimestamp(),
    } as ApiResponse);
  }
});

// GET /contacts/:id - Get single contact
router.get('/:id', (req: Request, res: Response) => {
  try {
    console.log('=== Get single contact endpoint called ===');
    const { id } = req.params;

    const contact = contacts.find((c) => c.id === id);

    if (!contact) {
      return res.status(404).json({
        success: false,
        error: 'Contact not found',
        timestamp: createISOTimestamp(),
      } as ApiResponse);
    }

    console.log(`✅ Contact ${id} retrieved successfully`);
    res.status(200).json(contact);
  } catch (error) {
    console.error('❌ Error in get single contact endpoint:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve contact',
      message: error instanceof Error ? error.message : 'Unknown error',
      timestamp: createISOTimestamp(),
    } as ApiResponse);
  }
});

// POST /contacts - Create new contact
router.post('/', (req: Request, res: Response) => {
  try {
    console.log('=== Create contact endpoint called ===');
    const contactData = req.body as ContactFormData;

    const validationErrors = validateContactData(contactData);
    if (validationErrors.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        message: validationErrors.join(', '),
        timestamp: createISOTimestamp(),
      } as ApiResponse);
    }

    const existingContact = contacts.find(
      (c) => c.email.toLowerCase() === contactData.email.toLowerCase(),
    );
    if (existingContact) {
      return res.status(409).json({
        success: false,
        error: 'Contact with this email already exists',
        timestamp: createISOTimestamp(),
      } as ApiResponse);
    }

    // Generate contact ID with error handling
    const contactId = generateContactId();

    const newContact: Contact = {
      id: contactId,
      firstName: contactData.firstName.trim(),
      lastName: contactData.lastName.trim(),
      email: contactData.email.toLowerCase().trim(),
      phone: contactData.phone.trim(),
      company: contactData.company?.trim() || undefined,
      message: contactData.message?.trim() || undefined,
      createdAt: createISOTimestamp(),
      updatedAt: createISOTimestamp(),
    };

    try {
      contacts.push(newContact);
    } catch (storageError) {
      console.error('❌ Error storing contact:', storageError);
      return res.status(500).json({
        success: false,
        error: 'Failed to store contact',
        message: 'Internal server error during contact storage',
        timestamp: createISOTimestamp(),
      } as ApiResponse);
    }

    console.log(`✅ Contact ${newContact.id} created successfully`);
    res.status(201).json(newContact);
  } catch (error) {
    console.error('❌ Error in create contact endpoint:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create contact',
      message: error instanceof Error ? error.message : 'Unknown error',
      timestamp: createISOTimestamp(),
    } as ApiResponse);
  }
});

// PUT /contacts/:id - Update contact
router.put('/:id', (req: Request, res: Response) => {
  try {
    console.log('=== Update contact endpoint called ===');
    const { id } = req.params;
    const updateData = req.body as Partial<ContactFormData>;

    const contactIndex = contacts.findIndex((c) => c.id === id);
    if (contactIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'Contact not found',
        timestamp: createISOTimestamp(),
      } as ApiResponse);
    }

    const validationErrors = validateContactData(updateData);
    if (validationErrors.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        message: validationErrors.join(', '),
        timestamp: createISOTimestamp(),
      } as ApiResponse);
    }

    if (updateData.email) {
      const existingContact = contacts.find(
        (c) => c.id !== id && c.email.toLowerCase() === updateData.email!.toLowerCase(),
      );
      if (existingContact) {
        return res.status(409).json({
          success: false,
          error: 'Contact with this email already exists',
          timestamp: createISOTimestamp(),
        } as ApiResponse);
      }
    }

    const updatedContact: Contact = {
      ...contacts[contactIndex],
      ...updateData,
      email: updateData.email
        ? updateData.email.toLowerCase().trim()
        : contacts[contactIndex].email,
      updatedAt: createISOTimestamp(),
    };

    contacts[contactIndex] = updatedContact;

    console.log(`✅ Contact ${id} updated successfully`);
    res.status(200).json(updatedContact);
  } catch (error) {
    console.error('❌ Error in update contact endpoint:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update contact',
      message: error instanceof Error ? error.message : 'Unknown error',
      timestamp: createISOTimestamp(),
    } as ApiResponse);
  }
});

// DELETE /contacts/:id - Delete contact
router.delete('/:id', (req: Request, res: Response) => {
  try {
    console.log('=== Delete contact endpoint called ===');
    const { id } = req.params;

    const contactIndex = contacts.findIndex((c) => c.id === id);
    if (contactIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'Contact not found',
        timestamp: createISOTimestamp(),
      } as ApiResponse);
    }

    const deletedContact = contacts[contactIndex];
    contacts.splice(contactIndex, 1);

    console.log(`✅ Contact ${id} deleted successfully`);
    res.status(200).json(deletedContact);
  } catch (error) {
    console.error('❌ Error in delete contact endpoint:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete contact',
      message: error instanceof Error ? error.message : 'Unknown error',
      timestamp: createISOTimestamp(),
    } as ApiResponse);
  }
});

export default router;

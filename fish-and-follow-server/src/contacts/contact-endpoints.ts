import { Router, Request, Response } from 'express';
import { tempContacts } from './temp-contacts-data';
import { Contact, advancedSearchContacts, searchContacts } from './search-utils';

const router = Router();

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
    id: '101',
    first_name: 'John',
    last_name: 'Doe',
    email: 'john.doe@example.com',
    phone_number: '+1-555-123-4567',
    campus: 'Main Campus',
    major: 'Computer Science',
    year: 'senior',
    is_interested: true,
    gender: 'male',
    follow_up_status: 1,
    createdAt: '2025-01-15T10:30:00Z',
    updatedAt: '2025-01-15T10:30:00Z',
  },
  {
    id: '102',
    first_name: 'Jane',
    last_name: 'Smith',
    email: 'jane.smith@example.com',
    phone_number: '+1-555-987-6543',
    campus: 'North Campus',
    major: 'Business Administration',
    year: 'junior',
    is_interested: true,
    gender: 'female',
    follow_up_status: 2,
    createdAt: '2025-01-14T14:20:00Z',
    updatedAt: '2025-01-14T14:20:00Z',
  },
  {
    id: '103',
    first_name: 'Michael',
    last_name: 'Johnson',
    email: 'm.johnson@company.com',
    phone_number: '+1-555-456-7890',
    campus: 'South Campus',
    major: 'Engineering',
    year: 'sophomore',
    is_interested: false,
    gender: 'male',
    follow_up_status: 1,
    createdAt: '2025-01-13T09:15:00Z',
    updatedAt: '2025-01-13T09:15:00Z',
  },
  // Add temporary contacts for testing
  ...tempContacts,
];

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

// Helper function to filter contact fields based on requested fields
const filterContactFields = (contact: Contact, fields?: string[]): Partial<Contact> => {
  if (!fields || fields.length === 0) {
    // Default fields for lightweight response
    return {
      id: contact.id,
      first_name: contact.first_name,
      last_name: contact.last_name,
    };
  }

  const filteredContact: Partial<Contact> = {};
  fields.forEach((field) => {
    if (field in contact) {
      (filteredContact as Record<string, unknown>)[field] = (
        contact as unknown as Record<string, unknown>
      )[field];
    }
  });

  return filteredContact;
};

// GET /contacts - Get all contacts with fuzzy search capability
router.get('/', (req: Request, res: Response) => {
  try {
    console.log('=== Get contacts endpoint called ===');
    const { search = '', fuzzy = 'true', threshold = '0.6', limit = '50', fields } = req.query;

    const searchThreshold = Math.max(0.1, Math.min(1, parseFloat(threshold as string) || 0.6));
    const maxResults = Math.max(1, Math.min(100, parseInt(limit as string) || 50));
    const useFuzzy = fuzzy === 'true';

    // Parse requested fields
    const requestedFields =
      typeof fields === 'string' ? fields.split(',').map((f) => f.trim()) : undefined;

    let searchResults;

    if (search && typeof search === 'string' && search.trim()) {
      const searchQuery = search;
      console.log(
        `🔍 Using ${useFuzzy ? 'fuzzy' : 'exact'} search for: "${searchQuery}" with threshold: ${searchThreshold}`,
      );

      if (useFuzzy) {
        // Use advanced search for detailed results with scoring
        searchResults = advancedSearchContacts(contacts, searchQuery, searchThreshold, maxResults);
      } else {
        // Use simple search but format as search results
        const simpleResults = searchContacts(contacts, searchQuery);
        searchResults = simpleResults.slice(0, maxResults).map((contact) => ({
          contact,
          score: 1.0, // Perfect match for exact search
          matchedFields: ['exact_match'],
          fieldScores: { exact_match: 1.0 },
        }));
      }
    } else {
      // No search query - return all contacts as perfect matches, sorted by creation date
      const sortedContacts = [...contacts]
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, maxResults);

      searchResults = sortedContacts.map((contact) => ({
        contact,
        score: 1.0,
        matchedFields: ['all'],
        fieldScores: { all: 1.0 },
      }));
    }

    console.log(`✅ Found ${searchResults.length} matches out of ${contacts.length} contacts`);

    // Consistent fuzzy search response format
    const response = {
      success: true,
      results: searchResults.map((result) => ({
        contact: filterContactFields(result.contact, requestedFields),
        score: Math.round(result.score * 100) / 100,
        matchedFields: result.matchedFields,
        fieldScores: Object.fromEntries(
          Object.entries(result.fieldScores || {}).map(([field, score]) => [
            field,
            typeof score === 'number' ? Math.round(score * 100) / 100 : 0,
          ]),
        ),
      })),
      query: search || null,
      fuzzySearch: useFuzzy,
      threshold: searchThreshold,
      total: searchResults.length,
      totalContacts: contacts.length,
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

// GET /contacts/fields - Get available contact fields for template parameter mapping
router.get('/fields', (req: Request, res: Response) => {
  try {
    console.log('=== Get contact fields endpoint called ===');

    // Define available fields with human-readable labels
    const availableFields = [
      { key: 'first_name', label: 'First Name', type: 'string' },
      { key: 'last_name', label: 'Last Name', type: 'string' },
      { key: 'email', label: 'Email', type: 'string' },
      { key: 'phone_number', label: 'Phone Number', type: 'string' },
      { key: 'campus', label: 'Campus', type: 'string' },
      { key: 'major', label: 'Major', type: 'string' },
      { key: 'year', label: 'Year', type: 'string' },
      { key: 'gender', label: 'Gender', type: 'string' },
      { key: 'follow_up_status', label: 'Follow-up Status', type: 'number' },
      { key: 'is_interested', label: 'Is Interested', type: 'boolean' },
    ];

    res.status(200).json({
      success: true,
      fields: availableFields,
      timestamp: createISOTimestamp(),
    } as ApiResponse);
  } catch (error) {
    console.error('❌ Error in get contact fields endpoint:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve contact fields',
      message: error instanceof Error ? error.message : 'Unknown error',
      timestamp: createISOTimestamp(),
    } as ApiResponse);
  }
});

// Export function to get contacts by IDs (for use by WhatsApp endpoints)
export const getContactsByIds = (contactIds: string[]) => {
  return contactIds
    .map((id) => contacts.find((contact) => contact.id === id))
    .filter((contact): contact is Contact => contact !== undefined);
};

export default router;

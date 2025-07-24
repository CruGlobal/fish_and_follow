/**
 * Search utilities for contact fuzzy matching using Levenshtein distance
 */

// Contact interface for search operations
export interface Contact {
  id: string;
  first_name: string;
  last_name: string;
  phone_number: string;
  email: string;
  campus: string;
  major: string;
  year: 'freshman' | 'sophomore' | 'junior' | 'senior' | 'graduate';
  is_interested: boolean;
  gender: 'male' | 'female' | 'non-binary' | 'prefer-not-to-say';
  follow_up_status: number;
  createdAt: string;
  updatedAt: string;
}

// Helper function to get full name from contact
export const getContactName = (contact: Contact): string => {
  return `${contact.first_name} ${contact.last_name}`;
};

// Search result interface with scoring details
export interface SearchResult {
  contact: Contact;
  score: number;
  matchedFields: string[];
  fieldScores?: Record<string, number>;
}

// Field configuration for weighted search
export interface SearchField {
  field: string;
  value: string;
  weight: number;
}

/**
 * Calculate Levenshtein distance between two strings
 * @param str1 First string
 * @param str2 Second string
 * @returns The edit distance between the strings
 */
export const levenshteinDistance = (str1: string, str2: string): number => {
  const matrix: number[][] = [];

  // Initialize matrix
  for (let i = 0; i <= str2.length; i++) {
    matrix[i] = [];
    for (let j = 0; j <= str1.length; j++) {
      matrix[i][j] = 0;
    }
  }

  // Initialize first row and column
  for (let i = 0; i <= str1.length; i++) {
    matrix[0][i] = i;
  }

  for (let j = 0; j <= str2.length; j++) {
    matrix[j][0] = j;
  }

  // Fill the matrix
  for (let j = 1; j <= str2.length; j++) {
    for (let i = 1; i <= str1.length; i++) {
      const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
      matrix[j][i] = Math.min(
        matrix[j][i - 1] + 1, // deletion
        matrix[j - 1][i] + 1, // insertion
        matrix[j - 1][i - 1] + indicator, // substitution
      );
    }
  }

  return matrix[str2.length][str1.length];
};

/**
 * Calculate similarity score between two strings (0-1, where 1 is perfect match)
 * @param str1 First string
 * @param str2 Second string
 * @returns Similarity score between 0 and 1
 */
export const calculateSimilarity = (str1: string, str2: string): number => {
  const maxLength = Math.max(str1.length, str2.length);
  if (maxLength === 0) return 1;

  const distance = levenshteinDistance(str1.toLowerCase(), str2.toLowerCase());
  return (maxLength - distance) / maxLength;
};

/**
 * Search contacts using fuzzy matching with Levenshtein distance
 * @param contactList Array of contacts to search
 * @param query Search query string
 * @param threshold Minimum similarity threshold (0-1)
 * @returns Array of contacts matching the search criteria
 */
export const searchContactsWithFuzzy = (
  contactList: Contact[],
  query: string,
  threshold: number = 0.6,
): Contact[] => {
  if (!query.trim()) return contactList;

  const searchTerm = query.toLowerCase().trim();
  const results: SearchResult[] = [];

  contactList.forEach((contact) => {
    const searchableFields = [
      { field: 'name', value: getContactName(contact) },
      { field: 'first_name', value: contact.first_name },
      { field: 'last_name', value: contact.last_name },
      { field: 'email', value: contact.email },
      { field: 'phone_number', value: contact.phone_number },
      { field: 'campus', value: contact.campus },
      { field: 'major', value: contact.major },
      { field: 'year', value: contact.year },
      { field: 'gender', value: contact.gender },
    ];

    let bestScore = 0;
    const matchedFields: string[] = [];

    searchableFields.forEach(({ field, value }) => {
      const fieldValue = value.toLowerCase();

      // Exact substring match gets highest priority
      if (fieldValue.includes(searchTerm)) {
        bestScore = Math.max(bestScore, 1);
        matchedFields.push(field);
        return;
      }

      // Fuzzy matching for individual words
      const words = fieldValue.split(/\s+/).filter((word) => word.length > 0);
      const queryWords = searchTerm.split(/\s+/).filter((word) => word.length > 0);

      queryWords.forEach((queryWord) => {
        words.forEach((word) => {
          const similarity = calculateSimilarity(queryWord, word);
          if (similarity >= threshold) {
            bestScore = Math.max(bestScore, similarity * 0.8); // Slightly lower than exact match
            if (!matchedFields.includes(field)) {
              matchedFields.push(field);
            }
          }
        });
      });

      // Full field fuzzy matching for shorter queries
      if (searchTerm.length >= 3 && fieldValue.length <= 50) {
        const similarity = calculateSimilarity(searchTerm, fieldValue);
        if (similarity >= threshold) {
          bestScore = Math.max(bestScore, similarity * 0.7);
          if (!matchedFields.includes(field)) {
            matchedFields.push(field);
          }
        }
      }
    });

    if (bestScore >= threshold) {
      results.push({
        contact,
        score: bestScore,
        matchedFields,
      });
    }
  });

  // Sort by score (descending) and return contacts
  return results.sort((a, b) => b.score - a.score).map((result) => result.contact);
};

/**
 * Advanced search with detailed scoring and field weights
 * @param contactList Array of contacts to search
 * @param query Search query string
 * @param threshold Minimum similarity threshold (0-1)
 * @param maxResults Maximum number of results to return
 * @returns Array of search results with detailed scoring
 */
export const advancedSearchContacts = (
  contactList: Contact[],
  query: string,
  threshold: number = 0.6,
  maxResults: number = 50,
): SearchResult[] => {
  if (!query.trim()) return [];

  const searchResults: SearchResult[] = [];
  const searchTerm = query.toLowerCase().trim();

  contactList.forEach((contact) => {
    const searchableFields: SearchField[] = [
      { field: 'name', value: getContactName(contact), weight: 1.2 },
      { field: 'first_name', value: contact.first_name, weight: 1.0 },
      { field: 'last_name', value: contact.last_name, weight: 1.0 },
      { field: 'email', value: contact.email, weight: 0.9 },
      { field: 'phone_number', value: contact.phone_number, weight: 0.8 },
      { field: 'campus', value: contact.campus, weight: 0.7 },
      { field: 'major', value: contact.major, weight: 0.8 },
      { field: 'year', value: contact.year, weight: 0.6 },
      { field: 'gender', value: contact.gender, weight: 0.5 },
    ];

    let bestScore = 0;
    const matchedFields: string[] = [];
    const fieldScores: Record<string, number> = {};

    searchableFields.forEach(({ field, value, weight }) => {
      const fieldValue = value.toLowerCase();
      let fieldScore = 0;

      // Check for exact prefix match (highest priority)
      if (fieldValue.startsWith(searchTerm)) {
        fieldScore = 1.2 * weight; // Boost score for prefix matches
      }
      // Check for exact substring match
      else if (fieldValue.includes(searchTerm)) {
        // Check if it's a word boundary match for better scoring
        const wordBoundaryRegex = new RegExp(
          `\\b${searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`,
          'i',
        );
        if (wordBoundaryRegex.test(fieldValue)) {
          fieldScore = 1.1 * weight; // Boost for word boundary matches
        } else {
          fieldScore = 1.0 * weight; // Regular substring match
        }
      } else {
        // Fuzzy matching for individual words
        const words = fieldValue.split(/\s+/).filter((word) => word.length > 0);
        const queryWords = searchTerm.split(/\s+/).filter((word) => word.length > 0);

        let wordScore = 0;
        queryWords.forEach((queryWord) => {
          words.forEach((word) => {
            // Check for prefix match in individual words
            if (word.startsWith(queryWord)) {
              wordScore = Math.max(wordScore, 1.1); // Boost for word prefix matches
            } else {
              const similarity = calculateSimilarity(queryWord, word);
              if (similarity >= threshold) {
                wordScore = Math.max(wordScore, similarity);
              }
            }
          });
        });

        // Full field fuzzy matching for shorter queries
        if (searchTerm.length >= 3 && fieldValue.length <= 50) {
          const fullSimilarity = calculateSimilarity(searchTerm, fieldValue);
          if (fullSimilarity >= threshold) {
            wordScore = Math.max(wordScore, fullSimilarity * 0.8);
          }
        }

        fieldScore = wordScore * weight;
      }

      if (fieldScore >= threshold * weight) {
        bestScore = Math.max(bestScore, fieldScore);
        matchedFields.push(field);
        fieldScores[field] = fieldScore;
      }
    });

    if (bestScore >= threshold) {
      searchResults.push({
        contact,
        score: bestScore,
        matchedFields,
        fieldScores,
      });
    }
  });

  // Sort by score with prefix matches prioritized, then by score, then limit results
  return searchResults
    .sort((a, b) => {
      // First, prioritize contacts with prefix matches
      const aHasPrefix = hasAnyPrefixMatch(a.contact, query);
      const bHasPrefix = hasAnyPrefixMatch(b.contact, query);
      
      if (aHasPrefix && !bHasPrefix) return -1;
      if (!aHasPrefix && bHasPrefix) return 1;
      
      // Then sort by score (descending)
      return b.score - a.score;
    })
    .slice(0, maxResults);
};

/**
 * Legacy search function for backwards compatibility
 * @param contactList Array of contacts to search
 * @param query Search query string
 * @returns Array of contacts matching the search criteria
 */
export const searchContacts = (contactList: Contact[], query: string): Contact[] => {
  return searchContactsWithFuzzy(contactList, query, 0.6);
};

/**
 * Check if contact has any fields that start with the search query
 * @param contact Contact to check
 * @param query Search query
 * @returns Boolean indicating if any field starts with the query
 */
const hasAnyPrefixMatch = (contact: Contact, query: string): boolean => {
  const searchTerm = query.toLowerCase().trim();
  const searchableValues = [
    getContactName(contact),
    contact.first_name,
    contact.last_name,
    contact.email,
    contact.campus,
    contact.major,
  ];

  return searchableValues.some(
    (value) =>
      value.toLowerCase().startsWith(searchTerm) ||
      value
        .toLowerCase()
        .split(/\s+/)
        .some((word) => word.startsWith(searchTerm)),
  );
};

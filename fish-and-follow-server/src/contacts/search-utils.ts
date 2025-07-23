/**
 * Search utilities for contact fuzzy matching using Levenshtein distance
 */

// Contact interface for search operations
export interface Contact {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  company?: string;
  message?: string;
  createdAt: string;
  updatedAt: string;
}

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
      { field: 'firstName', value: contact.firstName },
      { field: 'lastName', value: contact.lastName },
      { field: 'email', value: contact.email },
      { field: 'phone', value: contact.phone },
      { field: 'company', value: contact.company || '' },
      { field: 'message', value: contact.message || '' },
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
      { field: 'firstName', value: contact.firstName, weight: 1.0 },
      { field: 'lastName', value: contact.lastName, weight: 1.0 },
      { field: 'email', value: contact.email, weight: 0.9 },
      { field: 'phone', value: contact.phone, weight: 0.8 },
      { field: 'company', value: contact.company || '', weight: 0.7 },
      { field: 'message', value: contact.message || '', weight: 0.5 },
    ];

    let bestScore = 0;
    const matchedFields: string[] = [];
    const fieldScores: Record<string, number> = {};

    searchableFields.forEach(({ field, value, weight }) => {
      const fieldValue = value.toLowerCase();
      let fieldScore = 0;

      // Exact substring match
      if (fieldValue.includes(searchTerm)) {
        fieldScore = 1.0 * weight;
      } else {
        // Fuzzy matching for individual words
        const words = fieldValue.split(/\s+/).filter((word) => word.length > 0);
        const queryWords = searchTerm.split(/\s+/).filter((word) => word.length > 0);

        let wordScore = 0;
        queryWords.forEach((queryWord) => {
          words.forEach((word) => {
            const similarity = calculateSimilarity(queryWord, word);
            if (similarity >= threshold) {
              wordScore = Math.max(wordScore, similarity);
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

  // Sort by score and limit results
  return searchResults.sort((a, b) => b.score - a.score).slice(0, maxResults);
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

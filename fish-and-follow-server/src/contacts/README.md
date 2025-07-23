# Contact Search Utilities

This module provides advanced fuzzy search functionality for contacts using Levenshtein distance algorithm.

## Features

- **Fuzzy Search**: Uses Levenshtein distance to find similar matches even with typos
- **Weighted Fields**: Different contact fields have different importance weights
- **Multiple Search Modes**: Exact substring matching, word-level fuzzy matching, and full-field fuzzy matching
- **Configurable Threshold**: Adjustable similarity threshold for more/less strict matching
- **Detailed Scoring**: Returns detailed match scores and field-level results

## Functions

### `levenshteinDistance(str1: string, str2: string): number`
Calculates the edit distance between two strings.

### `calculateSimilarity(str1: string, str2: string): number`
Returns a similarity score between 0 and 1, where 1 is a perfect match.

### `searchContactsWithFuzzy(contactList: Contact[], query: string, threshold?: number): Contact[]`
Basic fuzzy search that returns matching contacts.
- **threshold**: Default 0.6 (60% similarity required)

### `advancedSearchContacts(contactList: Contact[], query: string, threshold?: number, maxResults?: number): SearchResult[]`
Advanced search with detailed scoring and field weights.
- **threshold**: Default 0.6
- **maxResults**: Default 50

### `searchContacts(contactList: Contact[], query: string): Contact[]`
Legacy function for backwards compatibility.

## Field Weights

- **firstName**: 1.0 (highest priority)
- **lastName**: 1.0 (highest priority)
- **email**: 0.9
- **phone**: 0.8
- **company**: 0.7
- **message**: 0.5 (lowest priority)

## Search Strategies

1. **Exact Substring Match**: Direct string contains check (highest score)
2. **Word-level Fuzzy**: Splits query and field into words, matches individually
3. **Full-field Fuzzy**: Compares entire query to entire field (for short queries)

## Usage Examples

```typescript
import { searchContactsWithFuzzy, advancedSearchContacts } from './search-utils';

// Basic fuzzy search
const results = searchContactsWithFuzzy(contacts, 'john doe', 0.7);

// Advanced search with detailed results
const advancedResults = advancedSearchContacts(contacts, 'john', 0.6, 10);
```

## API Endpoints

### GET /contacts?search=query&fuzzy=true&threshold=0.6
Basic contact search with fuzzy matching.

### GET /contacts/search?q=query&threshold=0.6&limit=50
Advanced search with detailed scoring information.

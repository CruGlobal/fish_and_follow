import React, { useEffect, useState, useCallback } from 'react'
import DebouncedPaginatedSearch from '~/components/DebouncedPaginatedSearch'
import SelectedContactsBadges from '~/components/SelectedContactsBadges'
import TemplateSelector from '~/components/TemplateSelector';
import { apiService, type ContactSummary } from '~/lib/api';
import { Card, CardContent } from '~/components/ui/card';
import { ErrorAlert } from '~/components/ui/ErrorAlert';

// Updated interface to match ContactSummary from API
interface ContactItem {
  name: string;  // Full name (first_name + last_name)
  key: string;   // Contact ID
}

// Helper function to convert ContactSummary to ContactItem
const contactToItem = (contact: ContactSummary): ContactItem => ({
  name: `${contact.first_name} ${contact.last_name}`,
  key: contact.id,
});

export default function BulkMessaging() {
  const [items, setItems] = useState<ContactItem[]>([]);
  const [selectedContacts, setSelectedContacts] = useState<ContactItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load all contacts on component mount
  useEffect(() => {
    const loadContacts = async () => {
      try {
        setLoading(true);
        setError(null);
        const contacts = await apiService.getContacts();
        const contactItems = contacts.map(contactToItem);
        setItems(contactItems);
      } catch (err) {
        console.error('Failed to load contacts:', err);
        setError('Failed to load contacts');
      } finally {
        setLoading(false);
      }
    };

    loadContacts();
  }, []);

  const handleSearch = useCallback(async (query: string) => {
    try {
      setLoading(true);
      setError(null);
      console.log("Searching for:", query);
      
      const contacts = await apiService.searchContacts(query);
      const contactItems = contacts.map(contactToItem);
      console.log("Found contacts:", contactItems);
      setItems(contactItems);
    } catch (err) {
      console.error('Search failed:', err);
      setError('Search failed');
      setItems([]); // Clear items on error
    } finally {
      setLoading(false);
    }
  }, []);

  const handleContactSelect = useCallback((key: string) => {
    setSelectedContacts(prev => {
      // Check if contact is already selected
      if (prev.some(contact => contact.key === key)) {
        return prev; // No change if already selected
      }
      const selectedItem = items.find(item => item.key === key);
      if (selectedItem) {
        return [...prev, selectedItem];
      }
      return prev;
    });
  }, [items]);

  const handleRemoveContact = useCallback((key: string) => {
    setSelectedContacts(prev => prev.filter(contact => contact.key !== key));
  }, []);

  const handleClearAll = useCallback(() => {
    setSelectedContacts([]);
  }, []);


  return (
    <main className="max-w-md sm:max-w-lg md:max-w-2xl lg:max-w-4xl mx-auto p-4 sm:p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Bulk Messaging</h1>
        <p className="text-gray-600">Search and select contacts for bulk messaging</p>
      </div>

      {error && <ErrorAlert message={error} className="mb-4" />}

      <div className="mb-4">
        <SelectedContactsBadges
          selectedContacts={selectedContacts}
          onRemoveContact={handleRemoveContact}
          onClearAll={handleClearAll}
        />
      </div>

      <div className="mb-6">
        <DebouncedPaginatedSearch 
          items={items.map(({ key, name }) => [key, name])} 
          onSearch={handleSearch} 
          onSelect={handleContactSelect}
          selectedItems={selectedContacts.map(contact => contact.key)}
        />
      </div>
      
      {selectedContacts.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8 text-gray-500">
            <p>Please select contacts above to send template messages.</p>
          </CardContent>
        </Card>
      ) : (
        <TemplateSelector selectedContacts={selectedContacts} />
      )}
    </main>
  )
}
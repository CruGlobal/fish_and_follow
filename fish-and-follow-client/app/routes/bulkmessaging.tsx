import React, { useEffect, useState, useCallback } from 'react'
import DebouncedPaginatedSearch from '~/components/DebouncedPaginatedSearch'
import SelectedContactsBadges from '~/components/SelectedContactsBadges'
import TemplateSelector from '~/components/TemplateSelector';
import { apiService, type Contact } from '~/lib/api';

// Updated interface to match Contact from API
interface ContactItem {
  name: string;  // Full name (firstName + lastName)
  key: string;   // Contact ID
  email: string;
  phone: string;
  company?: string;
}

// Helper function to convert Contact to ContactItem
const contactToItem = (contact: Contact): ContactItem => ({
  name: `${contact.firstName} ${contact.lastName}`,
  key: contact.id,
  email: contact.email,
  phone: contact.phone,
  company: contact.company,
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

      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

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
      
      <TemplateSelector />
    </main>
  )
}
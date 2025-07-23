import React, { useEffect, useState, useCallback } from 'react'
import DebouncedPaginatedSearch from '~/components/DebouncedPaginatedSearch'
import SelectedContactsBadges from '~/components/SelectedContactsBadges'

// Items type interface
interface Item {
  name: string;
  key: string;
}

const allItems: Item[] = [
  { name: "John Doe", key: "john" },
  { name: "Jane Smith", key: "jane" },
  { name: "Bob Johnson", key: "bob" },
  { name: "Alice Brown", key: "alice" },
  { name: "Charlie Wilson", key: "charlie" },
  { name: "David Miller", key: "david" },
  { name: "Eva Davis", key: "eva" },
  { name: "Frank Garcia", key: "frank" },
];

export default function BulkMessaging() {

  const [items, setItems] = useState<Item[]>([]);
  const [selectedContacts, setSelectedContacts] = useState<Item[]>([]);

  const handleSearch = useCallback((query: string) => {
    // Simulate API call delay
    console.log("Searching for:", query);
    
    if (query === "") {
      setItems(allItems);
    } else {
      const filtered = allItems.filter(item => 
        item.name.toLowerCase().includes(query.toLowerCase())
      );
      console.log("Filtered items:", filtered);
      setItems(filtered);
    }
  }, [allItems]);

  const handleContactSelect = useCallback((key: string) => {
    setSelectedContacts(prev => {
      // Check if contact is already selected
      if (prev.some(contact => contact.key === key)) {
        return prev; // No change if already selected
      }
      const selectedItem = allItems.find(item => item.key === key);
      if (selectedItem) {
        return [...prev, selectedItem];
      }
      return prev;
    });
  }, []);

  const handleRemoveContact = useCallback((key: string) => {
    setSelectedContacts(prev => prev.filter(contact => contact.key !== key));
  }, []);

  const handleClearAll = useCallback(() => {
    setSelectedContacts([]);
  }, []);

  useEffect(() => {
    // Initialize with all items
    setItems(allItems);
  }, []);


  return (
    <main className="max-w-md sm:max-w-lg md:max-w-2xl lg:max-w-4xl mx-auto p-4 sm:p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Bulk Messaging</h1>
        <p className="text-gray-600">Search and select contacts for bulk messaging</p>
      </div>
      <ul>
        <SelectedContactsBadges
          selectedContacts={selectedContacts}
          onRemoveContact={handleRemoveContact}
          onClearAll={handleClearAll}
        />
      </ul>
      <DebouncedPaginatedSearch 
        items={items.map(({ key, name }) => [key, name])} 
        onSearch={handleSearch} 
        onSelect={handleContactSelect}
        selectedItems={selectedContacts.map(contact => contact.key)}
      />
      
      
    </main>
  )
}
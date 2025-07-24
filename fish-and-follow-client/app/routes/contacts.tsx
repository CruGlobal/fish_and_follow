import { useState } from "react";
import WhatsappLink from "~/components/WhatsappLink";
import type { Route } from "./+types/contacts";
import { useNavigate } from "react-router";

export function meta({ }: Route.MetaArgs) {
  return [
    { title: "Contacts Management - Fish and Follow" },
    { name: "description", content: "Manage all contacts" },
  ];
}

interface Contact {
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

// Mock data for demonstration
const mockContacts: Contact[] = [
  {
    id: "1",
    first_name: "John",
    last_name: "Doe",
    email: "john.doe@example.com",
    phone_number: "+1-555-123-4567",
    campus: "Main Campus",
    major: "Computer Science",
    year: "senior",
    is_interested: true,
    gender: "male",
    follow_up_status: 1,
    createdAt: "2025-01-15T10:30:00Z",
    updatedAt: "2025-01-15T10:30:00Z",
  },
  {
    id: "2",
    first_name: "Jane",
    last_name: "Smith",
    email: "jane.smith@example.com",
    phone_number: "+1-555-987-6543",
    campus: "North Campus",
    major: "Business Administration",
    year: "junior",
    is_interested: true,
    gender: "female",
    follow_up_status: 2,
    createdAt: "2025-01-14T14:20:00Z",
    updatedAt: "2025-01-14T14:20:00Z",
  },
];

export default function Contacts() {
  const navigate = useNavigate();
  const [contacts, setContacts] = useState<Contact[]>(mockContacts);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredContacts = contacts.filter(
    (contact) =>
      contact.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.campus.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.major.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDeleteContact = (id: string) => {
    if (confirm("Are you sure you want to delete this contact?")) {
      setContacts(contacts.filter((contact) => contact.id !== id));
      if (selectedContact?.id === id) {
        setSelectedContact(null);
      }
    }
  };

  const handleEditContact = (contact: Contact) => {
    setSelectedContact(contact);
    setIsEditMode(true);
  };

  const handleViewContact = (contact: Contact) => {
    setSelectedContact(contact);
    setIsEditMode(false);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Contacts</h1>
              <p className="mt-2 text-gray-600">
                Manage and view all submitted contacts
              </p>
            </div>
            <div className="flex space-x-4">
              <a
                href="/admin"
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                Admin Panel
              </a>
              <button
                onClick={() => navigate("/")}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700"
              >
                Logout
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Contacts List */}
          <div className="lg:col-span-2">
            <div className="bg-white shadow rounded-lg">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <h2 className="text-lg font-medium text-gray-900">
                    All Contacts ({filteredContacts.length})
                  </h2>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search contacts..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="block w-64 pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg
                        className="h-5 w-5 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                        />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
              <div className="divide-y divide-gray-200">
                {filteredContacts.map((contact) => (
                  <div
                    key={contact.id}
                    className={`px-6 py-4 hover:bg-gray-50 cursor-pointer ${selectedContact?.id === contact.id ? "bg-blue-50" : ""
                      }`}
                    onClick={() => handleViewContact(contact)}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center">
                          <h3 className="text-sm font-medium text-gray-900">
                            {contact.first_name} {contact.last_name}
                          </h3>
                          <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {contact.campus}
                          </span>
                          <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            {contact.major}
                          </span>
                        </div>
                        <p className="mt-1 text-sm text-gray-600">
                          {contact.email}
                        </p>
                        <p className="mt-1 text-sm text-gray-500">
                          {contact.phone_number}
                        </p>
                        <p className="mt-1 text-xs text-gray-400">
                          Created: {formatDate(contact.createdAt)}
                        </p>
                      </div>
                      <div className="flex gap-4 ml-4">
                        <WhatsappLink number="14169965733" message="hi there lol" className="w-32 bg-green-400 text-white"/>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditContact(contact);
                          }}
                          className="text-blue-600 hover:text-blue-900 text-sm font-medium"
                        >
                          Edit
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteContact(contact.id);
                          }}
                          className="text-red-600 hover:text-red-900 text-sm font-medium"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
                {filteredContacts.length === 0 && (
                  <div className="px-6 py-12 text-center">
                    <svg
                      className="mx-auto h-12 w-12 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                      />
                    </svg>
                    <h3 className="mt-4 text-sm font-medium text-gray-900">
                      No contacts found
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">
                      {searchTerm
                        ? "Try adjusting your search terms"
                        : "No contacts have been submitted yet"}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Contact Details */}
          <div className="lg:col-span-1">
            {selectedContact ? (
              <div className="bg-white shadow rounded-lg p-6">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-medium text-gray-900">
                    Contact Details
                  </h3>
                  <button
                    onClick={() => setSelectedContact(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>
                </div>

                {isEditMode ? (
                  <div className="space-y-4">
                    <p className="text-sm text-gray-500 mb-4">Edit mode - Contact editing form would go here</p>
                    <div className="flex space-x-3">
                      <button
                        onClick={() => setIsEditMode(false)}
                        className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-400"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => {
                          setIsEditMode(false);
                          // TODO: Implement save functionality
                        }}
                        className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700"
                      >
                        Save
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-500">Name</label>
                      <p className="mt-1 text-sm text-gray-900">
                        {selectedContact.first_name} {selectedContact.last_name}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500">Email</label>
                      <p className="mt-1 text-sm text-gray-900">{selectedContact.email}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500">Phone</label>
                      <p className="mt-1 text-sm text-gray-900">{selectedContact.phone_number}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500">Campus</label>
                      <p className="mt-1 text-sm text-gray-900">{selectedContact.campus}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500">Major</label>
                      <p className="mt-1 text-sm text-gray-900">{selectedContact.major}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500">Year</label>
                      <p className="mt-1 text-sm text-gray-900 capitalize">{selectedContact.year}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500">Interested</label>
                      <p className="mt-1 text-sm text-gray-900">{selectedContact.is_interested ? 'Yes' : 'No'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500">Gender</label>
                      <p className="mt-1 text-sm text-gray-900 capitalize">{selectedContact.gender}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500">Created</label>
                      <p className="mt-1 text-sm text-gray-900">
                        {formatDate(selectedContact.createdAt)}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500">Last Updated</label>
                      <p className="mt-1 text-sm text-gray-900">
                        {formatDate(selectedContact.updatedAt)}
                      </p>
                    </div>
                    <div className="pt-4 border-t border-gray-200">
                      <button
                        onClick={() => handleEditContact(selectedContact)}
                        className="w-full bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700"
                      >
                        Edit Contact
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-white shadow rounded-lg p-6">
                <div className="text-center text-gray-500">
                  <svg
                    className="mx-auto h-12 w-12 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                  <h3 className="mt-4 text-sm font-medium text-gray-900">
                    No contact selected
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Click on a contact to view details
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

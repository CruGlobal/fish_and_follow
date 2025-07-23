import { useState } from "react";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import type { Route } from "./+types/admin";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Admin Panel - Fish and Follow" },
    { name: "description", content: "Manage accounts and system settings" },
  ];
}

// NOTE: talk to person developing the database schema to ensure this interface definition matches
interface User {
  id: string;
  name: string;
  email: string;
  role: "admin" | "user";
  status: "active" | "inactive";
  lastLogin?: string;
  createdAt: string;  
}

interface SystemStats {
  totalContacts: number;
  totalUsers: number;
  activeUsers: number;
  newContactsThisWeek: number;
}

interface NewContact {
  fullName: string;
  email: string;
  phone?: string;
  organization?: string;
}

// Mock data
const mockUsers: User[] = [
  {
    id: "1",
    name: "Admin User",
    email: "admin@fishfollow.com",
    role: "admin",
    status: "active",
    lastLogin: "2025-01-15T09:30:00Z",
    createdAt: "2025-01-01T00:00:00Z",
  },
  {
    id: "2",
    name: "John Manager",
    email: "john@fishfollow.com",
    role: "user",
    status: "active",
    lastLogin: "2025-01-14T15:45:00Z",
    createdAt: "2025-01-05T00:00:00Z",
  },
  {
    id: "3",
    name: "Jane Smith",
    email: "jane@fishfollow.com",
    role: "user",
    status: "inactive",
    createdAt: "2025-01-10T00:00:00Z",
  },
];

const mockStats: SystemStats = {
  totalContacts: 47,
  totalUsers: 3,
  activeUsers: 2,
  newContactsThisWeek: 12,
};

export default function Admin() {
  const [users, setUsers] = useState<User[]>(mockUsers);
  const [stats] = useState<SystemStats>(mockStats);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showAddUser, setShowAddUser] = useState(false);
  const [showNewContact, setShowNewContact] = useState(false);
  const [newContact, setNewContact] = useState<NewContact>({
    fullName: "",
    email: "",
    phone: "",
    organization: ""
  });

  const handleToggleUserStatus = (userId: string) => {
    setUsers(users.map(user => 
      user.id === userId 
        ? { ...user, status: user.status === "active" ? "inactive" : "active" as const }
        : user
    ));
  };

  const handleDeleteUser = (userId: string) => {
    if (confirm("Are you sure you want to delete this user?")) {
      setUsers(users.filter(user => user.id !== userId));
      if (selectedUser?.id === userId) {
        setSelectedUser(null);
      }
    }
  };

  const handleNewContactChange = (field: keyof NewContact, value: string) => {
    setNewContact(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmitNewContact = (e: React.FormEvent) => {
    e.preventDefault();
    // Here you would typically send the data to your API
    console.log("New contact created:", newContact);
    alert(`Contact created successfully!\n\nName: ${newContact.fullName}\nEmail: ${newContact.email}`);
    
    // Reset form and close dialog
    setNewContact({ fullName: "", email: "", phone: "", organization: "" });
    setShowNewContact(false);
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
              <h1 className="text-3xl font-bold text-gray-900">Admin Panel</h1>
              <p className="mt-2 text-gray-600">
                Manage users, accounts, and system settings
              </p>
            </div>
            <div className="flex space-x-4">
              <Dialog open={showNewContact} onOpenChange={setShowNewContact}>
                <DialogTrigger asChild>
                  <Button 
                    variant="outline" 
                    className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200 text-blue-700 hover:from-blue-100 hover:to-indigo-100 hover:border-blue-300 transition-all duration-200 shadow-sm"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    New Contact
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[300px] max-h-[70vh] overflow-y-auto bg-blue-50 border-blue-200">
                  <DialogHeader className="pb-3 border-b border-blue-200">
                    <DialogTitle className="text-base font-semibold text-blue-900 flex items-center">
                      <div className="w-5 h-5 bg-blue-200 rounded-full flex items-center justify-center mr-2">
                        <svg className="w-3 h-3 text-blue-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                      Create New Contact
                    </DialogTitle>
                    <DialogDescription className="text-blue-700 mt-1 ml-7 text-xs">
                      Add a new contact to your database.
                    </DialogDescription>
                  </DialogHeader>
                  
                  <form onSubmit={handleSubmitNewContact} className="space-y-3 pt-3">
                    {/* Personal Information Section */}
                    <div className="space-y-2">
                      <h3 className="text-xs font-medium text-blue-800 border-l-2 border-blue-600 pl-2">
                        Personal Information
                      </h3>
                      
                      <div className="grid grid-cols-1 gap-2">
                        <div className="space-y-1">
                          <Label 
                            htmlFor="fullName" 
                            className="text-xs font-medium text-blue-800 flex items-center"
                          >
                            <svg className="w-3 h-3 mr-1 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                            Full Name *
                          </Label>
                          <Input
                            id="fullName"
                            value={newContact.fullName}
                            onChange={(e) => handleNewContactChange("fullName", e.target.value)}
                            placeholder="Enter full name"
                            className="text-xs h-8 transition-all duration-200 border-blue-300 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:border-blue-400"
                            required
                          />
                        </div>

                        <div className="space-y-1">
                          <Label 
                            htmlFor="email" 
                            className="text-xs font-medium text-blue-800 flex items-center"
                          >
                            <svg className="w-3 h-3 mr-1 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                            </svg>
                            Email Address *
                          </Label>
                          <Input
                            id="email"
                            type="email"
                            value={newContact.email}
                            onChange={(e) => handleNewContactChange("email", e.target.value)}
                            placeholder="john.doe@example.com"
                            className="text-xs h-8 transition-all duration-200 border-blue-300 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:border-blue-400"
                            required
                          />
                        </div>
                      </div>
                    </div>

                    {/* Contact Information Section */}
                    <div className="space-y-2">
                      <h3 className="text-xs font-medium text-blue-800 border-l-2 border-blue-600 pl-2">
                        Contact Information
                      </h3>
                      
                      <div className="grid grid-cols-1 gap-2">
                        <div className="space-y-1">
                          <Label 
                            htmlFor="phone" 
                            className="text-xs font-medium text-blue-800 flex items-center"
                          >
                            <svg className="w-3 h-3 mr-1 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                            </svg>
                            Phone Number
                          </Label>
                          <Input
                            id="phone"
                            type="tel"
                            value={newContact.phone}
                            onChange={(e) => handleNewContactChange("phone", e.target.value)}
                            placeholder="+1 (555) 123-4567"
                            className="text-xs h-8 transition-all duration-200 border-blue-300 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:border-blue-400"
                          />
                        </div>

                        <div className="space-y-1">
                          <Label 
                            htmlFor="organization" 
                            className="text-xs font-medium text-blue-800 flex items-center"
                          >
                            <svg className="w-3 h-3 mr-1 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                            </svg>
                            University/Organization
                          </Label>
                          <Input
                            id="organization"
                            value={newContact.organization}
                            onChange={(e) => handleNewContactChange("organization", e.target.value)}
                            placeholder="Enter university name"
                            className="text-xs h-8 transition-all duration-200 border-blue-300 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:border-blue-400"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Form Actions */}
                    <DialogFooter className="pt-3 border-t border-blue-200 flex-col sm:flex-row gap-2">
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => setShowNewContact(false)}
                        className="w-full sm:w-auto order-2 sm:order-1 text-xs h-8 transition-all duration-200 border-blue-300 text-blue-700 hover:bg-blue-50"
                      >
                        Cancel
                      </Button>
                      <Button 
                        type="submit"
                        className="w-full sm:w-auto order-1 sm:order-2 text-xs h-8 bg-blue-600 hover:bg-blue-700 transition-all duration-200 shadow-sm hover:shadow-md"
                      >
                        <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        Create Contact
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
              <a
                href="/contacts"
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                View Contacts
              </a>
              <button
                onClick={() => (window.location.href = "/")}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700"
              >
                Logout
              </button>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg
                    className="h-6 w-6 text-gray-400"
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
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Total Contacts
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {stats.totalContacts}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg
                    className="h-6 w-6 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
                    />
                  </svg>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Total Users
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {stats.totalUsers}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg
                    className="h-6 w-6 text-green-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Active Users
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {stats.activeUsers}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg
                    className="h-6 w-6 text-blue-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                    />
                  </svg>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      New This Week
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {stats.newContactsThisWeek}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Users List */}
          <div className="lg:col-span-2">
            <div className="bg-white shadow rounded-lg">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <h2 className="text-lg font-medium text-gray-900">
                    User Management
                  </h2>
                  <button
                    onClick={() => setShowAddUser(true)}
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                  >
                    Add User
                  </button>
                </div>
              </div>
              <div className="divide-y divide-gray-200">
                {users.map((user) => (
                  <div
                    key={user.id}
                    className={`px-6 py-4 hover:bg-gray-50 cursor-pointer ${
                      selectedUser?.id === user.id ? "bg-blue-50" : ""
                    }`}
                    onClick={() => setSelectedUser(user)}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center">
                          <h3 className="text-sm font-medium text-gray-900">
                            {user.name}
                          </h3>
                          <span
                            className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              user.role === "admin"
                                ? "bg-purple-100 text-purple-800"
                                : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {user.role}
                          </span>
                          <span
                            className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              user.status === "active"
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {user.status}
                          </span>
                        </div>
                        <p className="mt-1 text-sm text-gray-600">{user.email}</p>
                        <p className="mt-1 text-xs text-gray-400">
                          {user.lastLogin
                            ? `Last login: ${formatDate(user.lastLogin)}`
                            : "Never logged in"}
                        </p>
                      </div>
                      <div className="flex space-x-2 ml-4">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggleUserStatus(user.id);
                          }}
                          className={`text-sm font-medium ${
                            user.status === "active"
                              ? "text-red-600 hover:text-red-900"
                              : "text-green-600 hover:text-green-900"
                          }`}
                        >
                          {user.status === "active" ? "Deactivate" : "Activate"}
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteUser(user.id);
                          }}
                          className="text-red-600 hover:text-red-900 text-sm font-medium"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* User Details / Add User Form */}
          <div className="lg:col-span-1">
            {showAddUser ? (
              <div className="bg-white shadow rounded-lg p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Add New User</h3>
                  <button
                    onClick={() => setShowAddUser(false)}
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
                <form className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Name
                    </label>
                    <input
                      type="text"
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Email
                    </label>
                    <input
                      type="email"
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Role
                    </label>
                    <select className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm">
                      <option value="user">User</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                  <div className="flex space-x-3">
                    <button
                      type="button"
                      onClick={() => setShowAddUser(false)}
                      className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-400"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700"
                    >
                      Add User
                    </button>
                  </div>
                </form>
              </div>
            ) : selectedUser ? (
              <div className="bg-white shadow rounded-lg p-6">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-medium text-gray-900">User Details</h3>
                  <button
                    onClick={() => setSelectedUser(null)}
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
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Name</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedUser.name}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Email</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedUser.email}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Role</label>
                    <p className="mt-1 text-sm text-gray-900 capitalize">{selectedUser.role}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Status</label>
                    <p className="mt-1 text-sm text-gray-900 capitalize">{selectedUser.status}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Created</label>
                    <p className="mt-1 text-sm text-gray-900">
                      {formatDate(selectedUser.createdAt)}
                    </p>
                  </div>
                  {selectedUser.lastLogin && (
                    <div>
                      <label className="block text-sm font-medium text-gray-500">Last Login</label>
                      <p className="mt-1 text-sm text-gray-900">
                        {formatDate(selectedUser.lastLogin)}
                      </p>
                    </div>
                  )}
                </div>
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
                    No user selected
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Click on a user to view details
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

import { useState, useEffect } from "react";

// Types pour le système de rôles
export type UserRole = "admin" | "staff"; // Seulement 2 rôles maintenant

export interface Permission {
  id: string;
  name: string;
  description: string;
  category: string;
}

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
  isActive: boolean;
  permissions: string[]; // IDs des permissions
  lastLogin?: string;
  createdAt: string;
  updatedAt: string;
}

export interface NewUserData {
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
  permissions: string[]; // Permissions désactivées mais gardées pour compatibilité
}

// Permissions disponibles dans le système (COMMENTÉES - Permissions désactivées)
/*
export const availablePermissions: Permission[] = [
  // Gestion des contacts
  {
    id: "contacts.view",
    name: "View contacts",
    description: "View the contact list",
    category: "Contacts"
  },
  {
    id: "contacts.create",
    name: "Create contacts",
    description: "Add new contacts",
    category: "Contacts"
  },
  {
    id: "contacts.edit",
    name: "Edit contacts",
    description: "Edit contact information",
    category: "Contacts"
  },
  {
    id: "contacts.delete",
    name: "Delete contacts",
    description: "Delete contacts from the system",
    category: "Contacts"
  },
  {
    id: "contacts.import",
    name: "Import contacts",
    description: "Import from Google Sheets or CSV",
    category: "Contacts"
  },
  {
    id: "contacts.export",
    name: "Export contacts",
    description: "Export the contact list",
    category: "Contacts"
  },
  
  // Gestion des utilisateurs
  {
    id: "users.view",
    name: "View users",
    description: "View the user list",
    category: "Users"
  },
  {
    id: "users.create",
    name: "Create users",
    description: "Add new users",
    category: "Users"
  },
  {
    id: "users.edit",
    name: "Edit users",
    description: "Edit user information",
    category: "Users"
  },
  {
    id: "users.delete",
    name: "Delete users",
    description: "Delete users from the system",
    category: "Users"
  },
  {
    id: "users.roles",
    name: "Manage roles",
    description: "Assign and modify user roles",
    category: "Users"
  },
  {
    id: "users.permissions",
    name: "Manage permissions",
    description: "Assign specific permissions",
    category: "Users"
  },
  
  // Administration système
  {
    id: "admin.access",
    name: "Admin access",
    description: "Access administration panel",
    category: "Administration"
  },
  {
    id: "admin.settings",
    name: "System settings",
    description: "Modify system settings",
    category: "Administration"
  },
  {
    id: "admin.logs",
    name: "View logs",
    description: "View system logs",
    category: "Administration"
  },
  {
    id: "admin.backup",
    name: "Backups",
    description: "Manage system backups",
    category: "Administration"
  }
];
*/

// Ajout d'une version vide pour les permissions désactivées
export const availablePermissions: Permission[] = [];

// Rôles prédéfinis avec leurs permissions par défaut (COMMENTÉ - Permissions désactivées)
/*
export const rolePermissions: Record<UserRole, string[]> = {
  admin: [
    // Toutes les permissions
    "contacts.view", "contacts.create", "contacts.edit", "contacts.delete", "contacts.import", "contacts.export",
    "users.view", "users.create", "users.edit", "users.delete", "users.roles", "users.permissions",
    "admin.access", "admin.settings", "admin.logs", "admin.backup"
  ],
  staff: [
    // Gestion complète des contacts + vue des utilisateurs
    "contacts.view", "contacts.create", "contacts.edit", "contacts.delete", "contacts.import", "contacts.export",
    "users.view",
    "admin.access"
  ]
  // user: Rôle supprimé - seulement admin et staff maintenant
};
*/

// Version simplifiée sans permissions détaillées
export const rolePermissions: Record<UserRole, string[]> = {
  admin: [], // Permissions désactivées
  staff: []  // Permissions désactivées
};

// Options pour les dropdowns
export const roleOptions: { value: UserRole; label: string; description: string; color: string }[] = [
  { 
    value: "admin", 
    label: "Administrator", 
    description: "Full system access",
    color: "red"
  },
  { 
    value: "staff", 
    label: "Staff", 
    description: "Contact management and limited access",
    color: "blue"
  }
  // user: Rôle supprimé - seulement admin et staff maintenant
];

// Données mockées pour le développement
const mockUsers: User[] = [
  {
    id: "1",
    firstName: "Admin",
    lastName: "System",
    email: "admin@fishfollow.com",
    role: "admin",
    isActive: true,
    permissions: rolePermissions.admin,
    lastLogin: "2025-01-23T10:30:00Z",
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2025-01-23T10:30:00Z"
  },
  {
    id: "2",
    firstName: "Marie",
    lastName: "Dubois",
    email: "marie.dubois@fishfollow.com",
    role: "staff",
    isActive: true,
    permissions: [...rolePermissions.staff, "contacts.delete"], // Permission supplémentaire
    lastLogin: "2025-01-23T09:15:00Z",
    createdAt: "2024-06-15T00:00:00Z",
    updatedAt: "2025-01-23T09:15:00Z"
  },
  {
    id: "3",
    firstName: "Pierre",
    lastName: "Martin",
    email: "pierre.martin@fishfollow.com",
    role: "staff", // Changé de "user" à "staff"
    isActive: true,
    permissions: rolePermissions.staff, // Changé de user à staff
    lastLogin: "2025-01-22T16:45:00Z",
    createdAt: "2024-09-10T00:00:00Z",
    updatedAt: "2025-01-22T16:45:00Z"
  },
  {
    id: "4",
    firstName: "Sophie",
    lastName: "Laurent",
    email: "sophie.laurent@fishfollow.com",
    role: "staff",
    isActive: false,
    permissions: rolePermissions.staff,
    lastLogin: "2024-12-15T14:20:00Z",
    createdAt: "2024-03-20T00:00:00Z",
    updatedAt: "2024-12-20T10:00:00Z"
  }
];

export function useUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Initialisation des données
  useEffect(() => {
    const savedUsers = localStorage.getItem("users");
    if (savedUsers) {
      try {
        setUsers(JSON.parse(savedUsers));
      } catch (err) {
        console.error("Erreur lors du chargement des utilisateurs:", err);
        setUsers(mockUsers);
      }
    } else {
      setUsers(mockUsers);
    }
    setIsLoading(false);
  }, []);

  // Sauvegarde automatique
  useEffect(() => {
    if (users.length > 0) {
      localStorage.setItem("users", JSON.stringify(users));
    }
  }, [users]);

  const addUser = (userData: NewUserData) => {
    try {
      const newUser: User = {
        ...userData,
        id: crypto.randomUUID(),
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      setUsers(prev => [...prev, newUser]);
      setError(null);
      return { success: true, user: newUser };
    } catch (err) {
      setError("Échec de l'ajout de l'utilisateur");
      return { success: false, user: null };
    }
  };

  const updateUser = (id: string, updates: Partial<User>) => {
    try {
      setUsers(prev =>
        prev.map(user =>
          user.id === id
            ? { ...user, ...updates, updatedAt: new Date().toISOString() }
            : user
        )
      );
      setError(null);
      return { success: true };
    } catch (err) {
      setError("Échec de la mise à jour de l'utilisateur");
      return { success: false };
    }
  };

  const deleteUser = (id: string) => {
    try {
      setUsers(prev => prev.filter(user => user.id !== id));
      setError(null);
      return { success: true };
    } catch (err) {
      setError("Échec de la suppression de l'utilisateur");
      return { success: false };
    }
  };

  const toggleUserStatus = (id: string) => {
    return updateUser(id, { 
      isActive: !users.find(u => u.id === id)?.isActive 
    });
  };

  const updateUserRole = (id: string, role: UserRole) => {
    const defaultPermissions = rolePermissions[role];
    return updateUser(id, { 
      role, 
      permissions: defaultPermissions 
    });
  };

  // Fonction de mise à jour des permissions (COMMENTÉE - Permissions désactivées)
  // const updateUserPermissions = (id: string, permissions: string[]) => {
  //   return updateUser(id, { permissions });
  // };

  const clearError = () => setError(null);

  // Fonctions utilitaires
  const getUsersByRole = (role: UserRole) => users.filter(user => user.role === role);
  const getActiveUsers = () => users.filter(user => user.isActive);
  const getUserPermissions = (userId: string) => {
    const user = users.find(u => u.id === userId);
    return user?.permissions || [];
  };
  const hasPermission = (userId: string, permission: string) => {
    const userPermissions = getUserPermissions(userId);
    return userPermissions.includes(permission);
  };

  return {
    users,
    isLoading,
    error,
    addUser,
    updateUser,
    deleteUser,
    toggleUserStatus,
    updateUserRole,
    // updateUserPermissions, // Commenté - Permissions désactivées
    clearError,
    // Utilitaires
    getUsersByRole,
    getActiveUsers,
    getUserPermissions,
    hasPermission,
  };
}

// contexts/AuthContext.tsx
import React, { createContext, useContext, useEffect, useState } from 'react';
import { redirect } from 'react-router';

export interface IUser {
  id?: string
  displayName: string
  username: string
}

interface IAuthResponse {
  authenticated: boolean
  user: IUser
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: IUser | undefined;
  loading: boolean;
  login: () => void;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<IUser>();
  const [loading, setLoading] = useState(true);

  const checkAuth = async () => {
    setLoading(true);
    try {
      const response = await fetch('/auth/status', {
        credentials: 'include'
      });
      const data: IAuthResponse = await response.json();
      if (data.authenticated) {
        setIsAuthenticated(true);
        setUser({ username: data.user.username, displayName: data.user.displayName });
      } else {
        setIsAuthenticated(false);
        setUser({ username: '', displayName: '' });
      }
    } catch (error) {
      setIsAuthenticated(false);
      setUser({ username: '', displayName: '' });
    } finally {
      setLoading(false);
    }
  };

  const login = () => {
    window.location.href = '/signin';
  };

  const logout = async () => {
    try {
      await fetch('/signout', {
        method: 'POST',
        credentials: 'include'
      });
      setIsAuthenticated(false);
      setUser({ username: '', displayName: '' });
      redirect('/')
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  return (
    <AuthContext.Provider value={{
      isAuthenticated,
      user,
      loading,
      login,
      logout,
      checkAuth
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

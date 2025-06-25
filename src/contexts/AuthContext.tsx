
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type UserRole = 'admin' | 'user';

interface User {
  username: string;
  role: UserRole;
}

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => boolean;
  logout: () => void;
  isAuthenticated: boolean;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

// Hard-coded user credentials with roles
const VALID_USERS = [
  { username: 'admin', password: 'mb@834228', role: 'admin' as UserRole },
  { username: 'user', password: 'mb@834228', role: 'user' as UserRole },
  { username: 'checker', password: 'mb@834228', role: 'user' as UserRole }
];

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  // Check for existing auth on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('wiki_checker_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const login = (username: string, password: string): boolean => {
    const validUser = VALID_USERS.find(
      u => u.username === username && u.password === password
    );
    
    if (validUser) {
      const userData = { username: validUser.username, role: validUser.role };
      setUser(userData);
      localStorage.setItem('wiki_checker_user', JSON.stringify(userData));
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('wiki_checker_user');
    localStorage.removeItem('wiki_checker_webhook_url');
  };

  const isAuthenticated = !!user;
  const isAdmin = user?.role === 'admin';

  const value = {
    user,
    login,
    logout,
    isAuthenticated,
    isAdmin
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

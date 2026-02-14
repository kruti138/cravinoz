"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface User {
  id: string;
  name?: string;
  email?: string;
  role?: string;
  phone?: string;
}

interface AuthContextValue {
  user: User | null;
  token: string | null;
  login: (user: User, token: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    // initialize from localStorage
    try {
      const savedToken = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      const savedUser = typeof window !== 'undefined' ? localStorage.getItem('user') : null;
      if (savedToken) setToken(savedToken);
      if (savedUser) setUser(JSON.parse(savedUser));
    } catch (err) {
      console.error('Failed to read auth from storage', err);
    }
  }, []);

  const login = (u: User, t: string) => {
    setUser(u);
    setToken(t);
    try {
      localStorage.setItem('token', t);
      localStorage.setItem('user', JSON.stringify(u));
    } catch (err) {
      console.error('Failed to save auth to storage', err);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    try {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('cart');
    } catch (err) {
      console.error('Failed to clear storage on logout', err);
    }
    router.push('/');
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};

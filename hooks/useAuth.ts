import { useState, useEffect } from 'react';
import { login as authLogin, clearTokens as authLogout, 
         getStoredToken } from '../services/auth';
import { getMe } from '../services/api';
import type { User } from '../types/user';

export function useAuth() {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkStoredToken();
  }, []);

  async function checkStoredToken() {
    setIsLoading(true);
    try {
      const stored = await getStoredToken();
      if (stored) {
        setToken(stored);
        const me = await getMe(stored);
        setUser(me);
      }
    } catch {
      setToken(null);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }

  async function login() {
    setIsLoading(true);
    try {
      const success = await authLogin();
      if (success) {
        const stored = await getStoredToken();
        if (stored) {
          setToken(stored);
          const me = await getMe(stored);
          setUser(me);
        }
      }
    } finally {
      setIsLoading(false);
    }
  }

  async function logout() {
    await authLogout();
    setToken(null);
    setUser(null);
  }

  return { token, user, isLoading, login, logout };
}
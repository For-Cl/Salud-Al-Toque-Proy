import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { userService } from '../services/userService';
import type { UserDTO } from '../types';
import { storage } from '../utils/storage';

interface AuthContextType {
  token: string | null;
  user: UserDTO | null;
  isAuthenticated: boolean;
  role: string | null;
  loading: boolean;
  login: (token: string) => Promise<UserDTO>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<UserDTO | null>(null);
  const [loading, setLoading] = useState(true);

  // Restore token and cached user profile from SecureStore on startup
  useEffect(() => {
    let mounted = true;
    async function loadSession() {
      try {
        const savedToken = await storage.getToken();
        const savedProfile = await storage.getProfile();

        if (savedToken && mounted) {
          setToken(savedToken);
          if (savedProfile) {
            setUser(savedProfile);
          } else {
            // Resolve role from backend
            const resolved = await userService.resolveProfile(savedToken);
            if (mounted) {
              setUser(resolved);
              await storage.saveProfile(resolved);
            }
          }
        }
      } catch {
        // SecureStore error fallback
      } finally {
        if (mounted) setLoading(false);
      }
    }
    loadSession();
    return () => {
      mounted = false;
    };
  }, []);

  const login = useCallback(async (newToken: string): Promise<UserDTO> => {
    await storage.saveToken(newToken);
    setToken(newToken);
    try {
      const resolved = await userService.resolveProfile(newToken);
      setUser(resolved);
      await storage.saveProfile(resolved);
      return resolved;
    } catch {
      const fallback: UserDTO = {
        id: 0,
        name: 'Usuario',
        email: '',
        phone: '',
        role: 'PATIENT',
      };
      setUser(fallback);
      await storage.saveProfile(fallback);
      return fallback;
    }
  }, []);

  const logout = useCallback(async () => {
    await storage.deleteToken();
    await storage.deleteProfile();
    setToken(null);
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({
      token,
      user,
      isAuthenticated: !!token,
      role: user?.role ?? null,
      loading,
      login,
      logout,
    }),
    [token, user, loading, login, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

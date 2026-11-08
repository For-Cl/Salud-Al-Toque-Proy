import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { UserDTO } from '../types';
import { storage } from '../utils/storage';

interface AuthContextType {
  token: string | null;
  user: UserDTO | null;
  isAuthenticated: boolean;
  role: string | null;
  loading: boolean;
  login: (token: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

function parseJwt(token: string): UserDTO | null {
  try {
    const base64Url = token.split('.')[1];
    if (!base64Url) return null;
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    // Using standard atob polyfill or decodeURIComponent
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    const decoded = JSON.parse(jsonPayload);
    return {
      id: decoded.userId ?? decoded.sub ?? 0,
      name: decoded.name ?? '',
      email: decoded.sub ?? decoded.email ?? '',
      phone: decoded.phone ?? '',
      role: decoded.role ?? 'PATIENT',
    };
  } catch {
    return null;
  }
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<UserDTO | null>(null);
  const [loading, setLoading] = useState(true);

  // Restore token from SecureStore on startup
  useEffect(() => {
    let mounted = true;
    async function loadToken() {
      try {
        const savedToken = await storage.getToken();
        if (savedToken && mounted) {
          const parsed = parseJwt(savedToken);
          if (parsed) {
            setToken(savedToken);
            setUser(parsed);
          } else {
            await storage.deleteToken();
          }
        }
      } catch {
        // secure store unavailable or error
      } finally {
        if (mounted) setLoading(false);
      }
    }
    loadToken();
    return () => {
      mounted = false;
    };
  }, []);

  const login = useCallback(async (newToken: string) => {
    await storage.saveToken(newToken);
    setToken(newToken);
    setUser(parseJwt(newToken));
  }, []);

  const logout = useCallback(async () => {
    await storage.deleteToken();
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


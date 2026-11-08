import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { AuthState, UserDTO } from '../types';

interface AuthContextType extends AuthState {
  login: (token: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

function decodeToken(token: string): UserDTO | null {
  try {
    const payload = token.split('.')[1];
    const decoded = JSON.parse(atob(payload));
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

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('token'));
  const [user, setUser] = useState<UserDTO | null>(() => {
    const saved = localStorage.getItem('token');
    return saved ? decodeToken(saved) : null;
  });

  const login = useCallback((newToken: string) => {
    localStorage.setItem('token', newToken);
    setToken(newToken);
    setUser(decodeToken(newToken));
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  }, []);

  useEffect(() => {
    if (token) {
      const decoded = decodeToken(token);
      if (!decoded) {
        logout();
      }
    }
  }, [token, logout]);

  const value = useMemo<AuthContextType>(() => ({
    token,
    user,
    isAuthenticated: !!token,
    role: user?.role ?? null,
    login,
    logout,
  }), [token, user, login, logout]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}


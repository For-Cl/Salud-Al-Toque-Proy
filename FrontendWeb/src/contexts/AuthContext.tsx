import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { userService } from '../services/userService';
import type { AuthState, UserDTO } from '../types';

interface AuthContextType extends AuthState {
  resolving: boolean;
  login: (token: string) => Promise<UserDTO>;
  logout: () => void;
  updateUser: (updated: Partial<UserDTO>) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

function loadSavedProfile(): UserDTO | null {
  try {
    const raw = localStorage.getItem('user_profile');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('token'));
  const [user, setUser] = useState<UserDTO | null>(() => loadSavedProfile());
  const [resolving, setResolving] = useState(false);

  const login = useCallback(async (newToken: string): Promise<UserDTO> => {
    localStorage.setItem('token', newToken);
    setToken(newToken);
    setResolving(true);
    try {
      const resolved = await userService.resolveProfile(newToken);
      setUser(resolved);
      localStorage.setItem('user_profile', JSON.stringify(resolved));
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
      return fallback;
    } finally {
      setResolving(false);
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user_profile');
    setToken(null);
    setUser(null);
  }, []);

  const updateUser = useCallback((updated: Partial<UserDTO>) => {
    setUser((prev) => {
      if (!prev) return null;
      const next = { ...prev, ...updated };
      localStorage.setItem('user_profile', JSON.stringify(next));
      return next;
    });
  }, []);

  // Sync / verify role on mount if token is present
  useEffect(() => {
    if (token && !user) {
      setResolving(true);
      userService
        .resolveProfile(token)
        .then((resolved) => {
          setUser(resolved);
          localStorage.setItem('user_profile', JSON.stringify(resolved));
        })
        .catch(() => {
          logout();
        })
        .finally(() => {
          setResolving(false);
        });
    }
  }, [token, user, logout]);

  const value = useMemo<AuthContextType>(
    () => ({
      token,
      user,
      isAuthenticated: !!token,
      role: user?.role ?? null,
      resolving,
      login,
      logout,
      updateUser,
    }),
    [token, user, resolving, login, logout, updateUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

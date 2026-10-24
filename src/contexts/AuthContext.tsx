import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { ApiRole, ApiUser } from '../services/authService';
import { SESSION_EXPIRED_EVENT, TOKEN_KEY, USER_KEY, clearStoredSession } from '../services/apiClient';

export type UserRole = 'adoptante' | 'rescatista' | 'administrador';
export type User = { id: number; name: string; email: string; role: UserRole };

/** Lo que devuelven /auth/login y /auth/registro. */
type AuthSession = { token: string; usuario: ApiUser };

type AuthContextValue = {
  user: User | null;
  login: (session: AuthSession) => void;
  logout: () => void;
};

const ROLE_FROM_API: Record<ApiRole, UserRole> = {
  ADOPTANTE: 'adoptante',
  RESCATISTA: 'rescatista',
  ADMIN: 'administrador',
};

/** El token trae su vencimiento (exp, en segundos): si ya pasó, la sesión no sirve. */
function tokenExpired(token: string): boolean {
  try {
    const payload = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
    return typeof payload.exp === 'number' && payload.exp * 1000 <= Date.now();
  } catch {
    return true;
  }
}

function readStoredSession(): User | null {
  try {
    const token = localStorage.getItem(TOKEN_KEY);
    const raw = localStorage.getItem(USER_KEY);
    if (!token || !raw || tokenExpired(token)) {
      clearStoredSession();
      return null;
    }
    const stored = JSON.parse(raw) as User;
    // Una sesión sin id es de la versión de prueba anterior: se descarta
    if (typeof stored?.id !== 'number' || !stored.role) {
      clearStoredSession();
      return null;
    }
    return stored;
  } catch {
    return null;
  }
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(readStoredSession);

  const login = useCallback((session: AuthSession) => {
    const next: User = {
      id: session.usuario.id,
      name: session.usuario.nombre,
      email: session.usuario.correo,
      role: ROLE_FROM_API[session.usuario.rol] ?? 'adoptante',
    };
    try {
      localStorage.setItem(TOKEN_KEY, session.token);
      localStorage.setItem(USER_KEY, JSON.stringify(next));
    } catch {
      /* sin almacenamiento: la sesión dura solo hasta recargar */
    }
    setUser(next);
  }, []);

  const logout = useCallback(() => {
    clearStoredSession();
    setUser(null);
  }, []);

  // apiClient avisa cuando el servidor rechaza el token (venció o no es válido)
  useEffect(() => {
    const onExpired = () => setUser(null);
    window.addEventListener(SESSION_EXPIRED_EVENT, onExpired);
    return () => window.removeEventListener(SESSION_EXPIRED_EVENT, onExpired);
  }, []);

  const value = useMemo(() => ({ user, login, logout }), [user, login, logout]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth debe utilizarse dentro de AuthProvider');
  return context;
}
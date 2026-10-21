import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';

export type UserRole = 'adoptante' | 'rescatista' | 'administrador';
export type User = { name: string; role: UserRole; email?: string };

type AuthContextValue = {
  user: User | null;
  login: (role?: UserRole, email?: string) => void;
  logout: () => void;
};

const KEY = 'huellas-user';

/** PROVISIONAL: deduce el rol del correo, solo en desarrollo. Reemplazar por el login real. */
export function roleForTestEmail(email: string): UserRole {
  if (!import.meta.env.DEV) return 'adoptante';
  const value = email.trim().toLowerCase();
  if (value.startsWith('admin')) return 'administrador';
  if (value.startsWith('rescatista')) return 'rescatista';
  return 'adoptante';
}

function readStoredUser(): User | null {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as User) : null;
  } catch {
    return null;
  }
}

function storeUser(user: User | null) {
  try {
    if (user) localStorage.setItem(KEY, JSON.stringify(user));
    else localStorage.removeItem(KEY);
  } catch {
    /* sin almacenamiento: la sesión dura solo hasta recargar */
  }
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(readStoredUser);
  const value = useMemo(() => ({
    user,
    login: (role: UserRole = 'adoptante', email?: string) => {
      const next: User = { name: 'Usuario de prueba', role, email: email || undefined };
      storeUser(next);
      setUser(next);
    },
    logout: () => {
      storeUser(null);
      setUser(null);
    },
  }), [user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth debe utilizarse dentro de AuthProvider');
  return context;
}
import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';

export type UserRole = 'adoptante' | 'rescatista' | 'administrador';
export type User = { name: string; role: UserRole; email?: string };

type AuthContextValue = {
  user: User | null;
  login: (role?: UserRole, email?: string) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const value = useMemo(() => ({
    user,
    login: (role: UserRole = 'adoptante', email?: string) =>
        setUser({ name: 'Usuario de prueba', role, email }),
    logout: () => setUser(null),
  }), [user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth debe utilizarse dentro de AuthProvider');
  return context;
}
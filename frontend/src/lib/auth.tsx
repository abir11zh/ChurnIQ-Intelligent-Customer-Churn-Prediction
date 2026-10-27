import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { mockUsers } from "../data/foundation";
import { getRolePermissions, hasAnyPermission, hasPermission } from "./permissions";
import { clearAccessToken } from "../services/apiClient";
import * as authService from "../services/authService";
import type { Permission, Role, User } from "../types/domain";

export type { Permission, Role, User };
export type AuthUser = User;

type AuthContextValue = {
  user: User | null;
  role: Role | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  sessionExpired: boolean;
  login: (payload: authService.LoginRequest) => Promise<User>;
  register: (payload: authService.RegisterRequest) => Promise<User>;
  logout: () => void;
  signIn: (role?: Role) => void;
  signOut: () => void;
  refreshToken: () => Promise<void>;
  setRole: (role: Role) => void;
  can: (permission: Permission) => boolean;
  canAny: (permissions: Permission[]) => boolean;
  clearSessionExpired: () => void;
};

const STORAGE_KEY = "churniq:user";
const defaultUser = mockUsers[0];

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function readStoredUser() {
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as User;
  } catch {
    window.localStorage.removeItem(STORAGE_KEY);
    return null;
  }
}

function persistUser(user: User) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => readStoredUser());
  const [isLoading, setIsLoading] = useState(false);
  const [sessionExpired, setSessionExpired] = useState(false);

  useEffect(() => {
    const onSessionExpired = () => {
      clearAccessToken();
      setUser(null);
      setSessionExpired(true);
    };
    window.addEventListener("churniq:session-expired", onSessionExpired);
    return () => window.removeEventListener("churniq:session-expired", onSessionExpired);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      role: user?.role ?? null,
      isAuthenticated: Boolean(user),
      isLoading,
      sessionExpired,
      login: async (payload) => {
        setIsLoading(true);
        try {
          const nextUser = await authService.login(payload);
          persistUser(nextUser);
          setUser(nextUser);
          setSessionExpired(false);
          return nextUser;
        } finally {
          setIsLoading(false);
        }
      },
      register: async (payload) => {
        setIsLoading(true);
        try {
          const nextUser = await authService.register(payload);
          persistUser(nextUser);
          setUser(nextUser);
          setSessionExpired(false);
          return nextUser;
        } finally {
          setIsLoading(false);
        }
      },
      logout: () => {
        clearAccessToken();
        window.localStorage.removeItem(STORAGE_KEY);
        setUser(null);
      },
      signIn: (role = "Admin") => {
        const nextUser = { ...defaultUser, role, permissions: getRolePermissions(role), lastLogin: new Date().toISOString() };
        persistUser(nextUser);
        setUser(nextUser);
        setSessionExpired(false);
      },
      signOut: () => {
        clearAccessToken();
        window.localStorage.removeItem(STORAGE_KEY);
        setUser(null);
      },
      refreshToken: async () => {
        await authService.refreshToken();
      },
      setRole: (role) => {
        const nextUser = { ...(user ?? defaultUser), role, permissions: getRolePermissions(role) };
        persistUser(nextUser);
        setUser(nextUser);
      },
      can: (permission) => (user ? hasPermission(user.role, permission) : false),
      canAny: (permissions) => (user ? hasAnyPermission(user.role, permissions) : false),
      clearSessionExpired: () => setSessionExpired(false)
    }),
    [isLoading, sessionExpired, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return context;
}

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated, isLoading, sessionExpired } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <div className="grid min-h-screen place-items-center bg-white text-sm font-bold text-muted">Securing workspace...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to={sessionExpired ? "/auth/session-expired" : "/auth/login"} replace state={{ from: location.pathname }} />;
  }

  return <>{children}</>;
}

export function RoleGuard({ allowed, children, fallback = null }: { allowed: Role[]; children: ReactNode; fallback?: ReactNode }) {
  const { user } = useAuth();
  if (!user || !allowed.includes(user.role)) {
    return <>{fallback}</>;
  }
  return <>{children}</>;
}

export function PermissionGuard({
  permission,
  permissions,
  children,
  fallback
}: {
  permission?: Permission;
  permissions?: Permission[];
  children: ReactNode;
  fallback?: ReactNode;
}) {
  const { user } = useAuth();
  const allowed = Boolean(
    user &&
      ((permission && hasPermission(user.role, permission)) ||
        (permissions && hasAnyPermission(user.role, permissions)))
  );

  if (!allowed) {
    return fallback ? <>{fallback}</> : <Navigate to="/forbidden" replace />;
  }

  return <>{children}</>;
}

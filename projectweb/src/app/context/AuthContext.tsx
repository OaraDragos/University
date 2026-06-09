import * as React from "react";
import { loginUser, registerUser, verifyLoginCode } from "../services/authApi";
import type { AuthSession } from "../services/authApi";
import { apiRequest } from "../services/networkClient";
import { API_URLS } from "../services/config";

export type AuthUser = {
  id: string;
  username: string;
  email: string;
  roles: string[];
  permissions: string[];
};

type AuthContextValue = {
  user: AuthUser | null;
  isHydrated: boolean;
  login: (username: string, password: string) => Promise<AuthUser>;
  loginWithCode: (identifier: string, code: string) => Promise<AuthUser>;
  register: (username: string, email: string, password: string) => Promise<AuthUser>;
  logout: () => void;
  hasPermission: (permission: string) => boolean;
};

const AuthContext = React.createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<AuthUser | null>(null);
  const [session, setSession] = React.useState<AuthSession | null>(null);
  const [isHydrated, setIsHydrated] = React.useState(false);
  const lastActivityRef = React.useRef(Date.now());

  const saveSession = React.useCallback((nextSession: AuthSession) => {
    lastActivityRef.current = Date.now();
    setSession(nextSession);
    setUser(nextSession.user);
    localStorage.setItem("authSession", JSON.stringify(nextSession));
    localStorage.setItem("authToken", nextSession.token);
  }, []);

  React.useEffect(() => {
    try {
      const savedSession = localStorage.getItem("authSession");
      if (savedSession) {
        const parsed = JSON.parse(savedSession) as AuthSession;
        if (new Date(parsed.expiresAt).getTime() > Date.now()) {
          setSession(parsed);
          setUser(parsed.user);
          localStorage.setItem("authToken", parsed.token);
        } else {
          localStorage.removeItem("authSession");
          localStorage.removeItem("authToken");
          localStorage.removeItem("authUser");
        }
      }
    } catch (_error) {
      localStorage.removeItem("authSession");
      localStorage.removeItem("authToken");
      localStorage.removeItem("authUser");
    } finally {
      setIsHydrated(true);
    }
  }, []);

  const login = React.useCallback(async (username: string, password: string) => {
    const authenticatedSession = await loginUser({ username, password });
    saveSession(authenticatedSession);
    return authenticatedSession.user;
  }, [saveSession]);

  const loginWithCode = React.useCallback(async (identifier: string, code: string) => {
    const authenticatedSession = await verifyLoginCode(identifier, code);
    saveSession(authenticatedSession);
    return authenticatedSession.user;
  }, [saveSession]);

  const register = React.useCallback(async (username: string, email: string, password: string) => {
    const authenticatedSession = await registerUser({ username, email, password });
    saveSession(authenticatedSession);
    return authenticatedSession.user;
  }, [saveSession]);

  const logout = React.useCallback(() => {
    const token = localStorage.getItem("authToken");
    if (token) {
      void apiRequest(`${API_URLS.auth}/logout`, {
        method: "POST",
      });
    }

    setUser(null);
    setSession(null);
    localStorage.removeItem("authSession");
    localStorage.removeItem("authToken");
    localStorage.removeItem("authUser");
  }, []);

  React.useEffect(() => {
    if (!session) return;

    const markActivity = () => {
      lastActivityRef.current = Date.now();
    };
    const events = ["click", "keydown", "mousemove", "touchstart", "scroll"];
    events.forEach((eventName) => window.addEventListener(eventName, markActivity, { passive: true }));

    const interval = window.setInterval(() => {
      if (new Date(session.expiresAt).getTime() <= Date.now()) {
        logout();
        return;
      }

      if (Date.now() - lastActivityRef.current > session.inactivityTimeoutMs) {
        logout();
      }
    }, 15000);

    return () => {
      events.forEach((eventName) => window.removeEventListener(eventName, markActivity));
      window.clearInterval(interval);
    };
  }, [logout, session]);

  const hasPermission = React.useCallback(
    (permission: string) => Boolean(user?.permissions.includes(permission)),
    [user]
  );

  return (
    <AuthContext.Provider value={{ user, isHydrated, login, loginWithCode, register, logout, hasPermission }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

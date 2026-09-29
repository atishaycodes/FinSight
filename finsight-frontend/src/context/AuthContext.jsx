import {
  createContext, useContext, useState, useEffect,
  useCallback,
} from "react";
import { authApi } from "../api/index.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user,    setUser]    = useState(null);
  const [token,   setToken]   = useState(null);
  const [loading, setLoading] = useState(true);

  // Rehydrate from localStorage on mount
  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    const storedUser  = localStorage.getItem("user");
    if (storedToken && storedUser) {
      setToken(storedToken);
      try { setUser(JSON.parse(storedUser)); } catch { /* ignore */ }
    }
    setLoading(false);
  }, []);

  const persist = (u, t) => {
    setUser(u);
    setToken(t);
    localStorage.setItem("token", t);
    localStorage.setItem("user",  JSON.stringify(u));
  };

  const login = useCallback(async (email, password) => {
    const result = await authApi.login({ email, password });
    persist(result.user, result.token);
    return result;
  }, []);

  const register = useCallback(async (name, email, password) => {
    const result = await authApi.register({ name, email, password });
    persist(result.user, result.token);
    return result;
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  }, []);

  const updateUser = useCallback((u) => {
    setUser(u);
    localStorage.setItem("user", JSON.stringify(u));
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, token, loading, login, register, logout, setUser: updateUser }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}

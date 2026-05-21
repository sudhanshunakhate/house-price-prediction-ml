import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import * as api from "../services/api.js";

const AuthCtx = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);

  const logout = useCallback(() => {
    api.setAuthToken(null);
    setUser(null);
  }, []);

  const login = useCallback(async (email, password) => {
    const { access_token } = await api.login(email, password);
    api.setAuthToken(access_token);
    const u = await api.me();
    setUser(u);
    return u;
  }, []);

  const register = useCallback(
    async (payload) => {
      await api.register(payload);
      return login(payload.email, payload.password);
    },
    [login]
  );

  useEffect(() => {
    const t = api.loadStoredToken();
    if (!t) {
      setReady(true);
      return;
    }
    api
      .me()
      .then(setUser)
      .catch(() => {
        api.setAuthToken(null);
        setUser(null);
      })
      .finally(() => setReady(true));
  }, []);

  const value = useMemo(
    () => ({
      user,
      ready,
      login,
      register,
      logout,
    }),
    [user, ready, login, register, logout]
  );

  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;
}

export function useAuth() {
  const v = useContext(AuthCtx);
  if (!v) throw new Error("useAuth outside provider");
  return v;
}

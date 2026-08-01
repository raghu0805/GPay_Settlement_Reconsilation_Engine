import { createContext, useEffect, useState } from 'react';

const AUTH_KEY = 'dev-auth';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    if (typeof window === 'undefined') {
      return false;
    }

    return window.sessionStorage.getItem(AUTH_KEY) === 'true';
  });

  useEffect(() => {
    const syncAuthState = () => {
      setIsAuthenticated(window.sessionStorage.getItem(AUTH_KEY) === 'true');
    };

    const intervalId = window.setInterval(syncAuthState, 1000);
    window.addEventListener('focus', syncAuthState);
    window.addEventListener('storage', syncAuthState);
    document.addEventListener('visibilitychange', syncAuthState);

    return () => {
      window.clearInterval(intervalId);
      window.removeEventListener('focus', syncAuthState);
      window.removeEventListener('storage', syncAuthState);
      document.removeEventListener('visibilitychange', syncAuthState);
    };
  }, []);

  const login = () => {
    window.sessionStorage.setItem(AUTH_KEY, 'true');
    setIsAuthenticated(true);
  };

  const logout = () => {
    window.sessionStorage.removeItem(AUTH_KEY);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

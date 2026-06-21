import React, { createContext, useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { login as apiLogin } from '../api/client';
import { initSyncListeners } from '../offline/syncQueue';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const { i18n } = useTranslation();
  const [user, setUser] = useState(() => {
    const raw = localStorage.getItem('campusiq_user');
    return raw ? JSON.parse(raw) : null;
  });

  useEffect(() => {
    if (user) {
      initSyncListeners(() => localStorage.getItem('campusiq_token'));
      if (user.preferred_language) i18n.changeLanguage(user.preferred_language.toLowerCase());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  async function login(email, password) {
    const { token, user: loggedInUser } = await apiLogin(email, password);
    localStorage.setItem('campusiq_token', token);
    localStorage.setItem('campusiq_user', JSON.stringify(loggedInUser));
    setUser(loggedInUser);
    return loggedInUser;
  }

  function logout() {
    localStorage.removeItem('campusiq_token');
    localStorage.removeItem('campusiq_user');
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

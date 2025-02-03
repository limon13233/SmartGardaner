// AuthContext.js

import React, { createContext, useState, useEffect } from 'react';
import { getToken, removeToken } from './storage';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [userToken, setUserToken] = useState(null);

  useEffect(() => {
    const fetchToken = async () => {
      const token = await getToken();
      if (token) {
        setUserToken(token);
      }
    };

    fetchToken();
  }, []);

  const login = (token) => {
    setUserToken(token);
  };

  const logout = async () => {
    await removeToken();
    setUserToken(null);
  };

  return (
    <AuthContext.Provider value={{ userToken, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
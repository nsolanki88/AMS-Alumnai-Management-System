import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('ams_user');
    try {
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMe = async () => {
      const token = localStorage.getItem('ams_access_token');
      if (token) {
        try {
          const res = await api.get('/auth/me');
          if (res.data?.success) {
            setUser(res.data.data);
            localStorage.setItem('ams_user', JSON.stringify(res.data.data));
          }
        } catch (err) {
          console.error('Failed to restore session:', err);
        }
      }
      setLoading(false);
    };

    fetchMe();
  }, []);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    if (res.data?.success) {
      const { user: userData, accessToken, refreshToken } = res.data.data;
      setUser(userData);
      localStorage.setItem('ams_user', JSON.stringify(userData));
      localStorage.setItem('ams_access_token', accessToken);
      localStorage.setItem('ams_refresh_token', refreshToken);
      return userData;
    }
    throw new Error(res.data?.message || 'Login failed');
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('ams_user');
    localStorage.removeItem('ams_access_token');
    localStorage.removeItem('ams_refresh_token');
    window.location.href = '/login';
  };

  const refreshUser = async () => {
    try {
      const res = await api.get('/auth/me');
      if (res.data?.success) {
        setUser(res.data.data);
        localStorage.setItem('ams_user', JSON.stringify(res.data.data));
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <AuthContext.Provider value={{ user, setUser, login, logout, refreshUser, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

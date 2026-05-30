import React, { createContext, useState, useEffect, useContext } from 'react';
import { authService } from '../services/api.js';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('samagama_admin_token');
      if (!token) {
        setLoading(false);
        return;
      }
      
      try {
        const response = await authService.getMe();
        if (response.success) {
          setAdmin(response.data);
        } else {
          localStorage.removeItem('samagama_admin_token');
        }
      } catch (error) {
        console.error('Failed to verify session token:', error.message);
        localStorage.removeItem('samagama_admin_token');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const response = await authService.login(email, password);
      if (response.success && response.data.token) {
        localStorage.setItem('samagama_admin_token', response.data.token);
        setAdmin({
          _id: response.data._id,
          name: response.data.name,
          email: response.data.email,
          role: response.data.role
        });
        return { success: true };
      }
      return { success: false, message: 'Invalid credentials or token missing' };
    } catch (error) {
      const msg = error.response?.data?.message || 'Login failed. Please check your credentials.';
      return { success: false, message: msg };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('samagama_admin_token');
    setAdmin(null);
  };

  return (
    <AuthContext.Provider value={{ admin, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

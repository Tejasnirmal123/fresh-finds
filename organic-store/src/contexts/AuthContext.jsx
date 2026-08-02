import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { getAuthToken, getUserInfo, clearAuth } from '../services/api';
import { isTokenExpired, getTokenExpiry } from '../utils/jwt';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const expiryCheckInterval = useRef(null);

  useEffect(() => {
    // Check if user is already logged in
    const token = getAuthToken();
    const userInfo = getUserInfo();
    
    if (token && userInfo) {
      // Check if token is expired
      if (isTokenExpired(token)) {
        clearAuth();
        setUser(null);
      } else {
        setUser(userInfo);
        // Set up token expiry check
        setupTokenExpiryCheck(token);
      }
    }
    setLoading(false);
    
    // Cleanup interval on unmount
    return () => {
      if (expiryCheckInterval.current) {
        clearInterval(expiryCheckInterval.current);
      }
    };
  }, []);

  const setupTokenExpiryCheck = (token) => {
    // Clear existing interval
    if (expiryCheckInterval.current) {
      clearInterval(expiryCheckInterval.current);
    }
    
    // Check token expiry every 5 seconds
    expiryCheckInterval.current = setInterval(() => {
      const currentToken = getAuthToken();
      if (!currentToken || isTokenExpired(currentToken)) {
        // Token expired, logout user
        logout();
      }
    }, 5000); // Check every 5 seconds
  };

  const login = (userData) => {
    setUser(userData);
    const token = getAuthToken();
    if (token) {
      setupTokenExpiryCheck(token);
    }
  };

  const logout = () => {
    if (expiryCheckInterval.current) {
      clearInterval(expiryCheckInterval.current);
      expiryCheckInterval.current = null;
    }
    clearAuth();
    setUser(null);
  };

  const isAuthenticated = () => {
    const token = getAuthToken();
    if (!token || isTokenExpired(token)) {
      if (user) {
        // Token expired but user state still exists, logout
        logout();
      }
      return false;
    }
    return user !== null && token !== null;
  };

  const isAdmin = () => {
    return user?.role === 'ADMIN';
  };

  const value = {
    user,
    login,
    logout,
    isAuthenticated,
    isAdmin,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

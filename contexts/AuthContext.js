'use client';

import { createContext, useState, useEffect, useCallback } from 'react';
import api from '@/lib/api';
import { getStoredToken, getUserFromToken, isTokenExpired, shouldRefreshToken } from '@/lib/auth';

export const AuthContext = createContext({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
  login: async () => {},
  signup: async () => {},
  logout: async () => {},
  refreshUser: async () => {},
});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Initialize auth state from stored token
  const initializeAuth = useCallback(async () => {
    try {
      const token = getStoredToken();

      if (!token) {
        setIsLoading(false);
        return;
      }

      if (isTokenExpired(token)) {
        api.removeToken();
        setIsLoading(false);
        return;
      }

      // Get user from token
      const userData = getUserFromToken(token);
      setUser(userData);
      setIsAuthenticated(true);

      // Refresh token if needed
      if (shouldRefreshToken(token)) {
        try {
          const response = await api.auth.refresh();
          if (response.data.token) {
            api.setToken(response.data.token);
            const newUserData = getUserFromToken(response.data.token);
            setUser(newUserData);
          }
        } catch (error) {
          console.error('Token refresh failed:', error);
        }
      }
    } catch (error) {
      console.error('Auth initialization error:', error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  // Login function (platform-level for site owners)
  const login = async (credentials, isPlatform = true) => {
    try {
      setError(null);
      setIsLoading(true);

      // Use platform login for main Crown Bidder site, tenant login for tenant sites
      const response = isPlatform
        ? await api.auth.platformLogin(credentials)
        : await api.auth.login(credentials);
      const { user: userData, token } = response.data;

      api.setToken(token);
      setUser(userData);
      setIsAuthenticated(true);

      return { success: true, user: userData };
    } catch (error) {
      setError(error.message);
      return { success: false, error: error.message };
    } finally {
      setIsLoading(false);
    }
  };

  // Signup function for platform (creates site owner with admin role)
  const signup = async (userData, isPlatform = true) => {
    try {
      setError(null);
      setIsLoading(true);

      // Use platform signup to create site owner (admin role)
      // Use tenant signup to create regular user (bidder role)
      const response = isPlatform
        ? await api.auth.platformSignup(userData)
        : await api.auth.signup(userData);
      const { user: newUser, token } = response.data;

      api.setToken(token);
      setUser(newUser);
      setIsAuthenticated(true);

      return { success: true, user: newUser };
    } catch (error) {
      setError(error.message);
      return { success: false, error: error.message };
    } finally {
      setIsLoading(false);
    }
  };

  // Logout function
  const logout = async () => {
    try {
      await api.auth.logout();
      setUser(null);
      setIsAuthenticated(false);
      setError(null);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // Refresh user data
  const refreshUser = async () => {
    try {
      const response = await api.auth.me();
      setUser(response.data);
      return { success: true, user: response.data };
    } catch (error) {
      console.error('User refresh error:', error);
      return { success: false, error: error.message };
    }
  };

  const value = {
    user,
    isAuthenticated,
    isLoading,
    error,
    login,
    signup,
    logout,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

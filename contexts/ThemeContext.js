'use client';

import { createContext, useState, useEffect, useContext } from 'react';
import { SiteContext } from './SiteContext';
import { applyTheme } from '@/utils/theme';
import api from '@/lib/api';

export const ThemeContext = createContext({
  theme: null,
  themes: [],
  isLoading: true,
  error: null,
  selectTheme: () => {},
  loadThemes: async () => {},
});

export function ThemeProvider({ children }) {
  const { site, isTenantSite } = useContext(SiteContext);
  const [theme, setTheme] = useState(null);
  const [themes, setThemes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load themes for site
  const loadThemes = async () => {
    if (!site) {
      setIsLoading(false);
      return;
    }

    try {
      const response = await api.themes.list(site._id);
      setThemes(response.data);

      // Find and apply active theme
      const activeTheme = response.data.find(t => t.isActive);
      if (activeTheme) {
        setTheme(activeTheme);
        applyTheme(activeTheme);
      }
    } catch (error) {
      console.error('Theme loading error:', error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Load themes when site changes
  useEffect(() => {
    if (isTenantSite && site) {
      loadThemes();
    } else {
      setIsLoading(false);
    }
  }, [site, isTenantSite]);

  // Select theme
  const selectTheme = (newTheme) => {
    setTheme(newTheme);
    applyTheme(newTheme);
  };

  const value = {
    theme,
    themes,
    isLoading,
    error,
    selectTheme,
    loadThemes,
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

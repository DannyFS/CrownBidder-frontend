'use client';

import { createContext, useState, useEffect, useContext } from 'react';
import { SiteContext } from './SiteContext';
import api from '@/lib/api';

export const ThemeContext = createContext({
  theme: null,
  themes: [],
  isLoading: true,
  error: null,
  selectTheme: () => {},
  loadThemes: async () => {},
  applyTheme: () => {},
});

export function ThemeProvider({ children }) {
  const { site, isTenantSite, tenantData } = useContext(SiteContext);
  const [theme, setTheme] = useState(null);
  const [themes, setThemes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Apply theme to DOM
  const applyTheme = (themeData) => {
    if (!themeData) return;

    const root = document.documentElement;
    
    // Apply CSS custom properties
    if (themeData.primaryColor) {
      root.style.setProperty('--color-primary', themeData.primaryColor);
    }
    if (themeData.secondaryColor) {
      root.style.setProperty('--color-secondary', themeData.secondaryColor);
    }
    
    // Apply theme class
    const themeClass = `theme-${themeData.theme || 'classic-blue'}`;
    root.className = root.className.replace(/theme-\w+/g, '');
    root.classList.add(themeClass);
  };

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

  // Apply tenant theme from middleware data
  useEffect(() => {
    if (isTenantSite && tenantData?.settings) {
      const tenantTheme = {
        theme: tenantData.settings.theme,
        primaryColor: tenantData.settings.primaryColor,
        secondaryColor: tenantData.settings.secondaryColor,
        logoUrl: tenantData.settings.logoUrl
      };
      
      setTheme(tenantTheme);
      applyTheme(tenantTheme);
      setIsLoading(false);
    } else if (isTenantSite && site) {
      // Fallback: load themes from API
      loadThemes();
    } else {
      setIsLoading(false);
    }
  }, [site, isTenantSite, tenantData]);

  // Select theme (for admin/preview)
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
    applyTheme,
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

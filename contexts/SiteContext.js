'use client';

import { createContext, useState, useEffect, useCallback } from 'react';
import api from '@/lib/api';
import { getHostname, isMainDomain } from '@/utils/domain';

export const SiteContext = createContext({
  site: null,
  isLoading: true,
  error: null,
  isTenantSite: false,
  refreshSite: async () => {},
});

export function SiteProvider({ children }) {
  const [site, setSite] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isTenantSite, setIsTenantSite] = useState(false);

  // Resolve site from hostname
  const resolveSite = useCallback(async () => {
    try {
      const hostname = getHostname();

      // Check if it's the main platform domain
      if (isMainDomain()) {
        setIsTenantSite(false);
        setIsLoading(false);
        return;
      }

      // Resolve tenant site
      setIsTenantSite(true);
      const response = await api.sites.resolve(hostname);
      setSite(response.data);
    } catch (error) {
      console.error('Site resolution error:', error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    resolveSite();
  }, [resolveSite]);

  // Refresh site data
  const refreshSite = async () => {
    try {
      setError(null);
      await resolveSite();
    } catch (error) {
      setError(error.message);
    }
  };

  const value = {
    site,
    isLoading,
    error,
    isTenantSite,
    refreshSite,
  };

  return <SiteContext.Provider value={value}>{children}</SiteContext.Provider>;
}

'use client';

import { createContext, useState, useEffect, useCallback } from 'react';
import api from '@/lib/api';

export const SiteContext = createContext({
  site: null,
  isLoading: true,
  error: null,
  isTenantSite: false,
  tenantData: null,
  refreshSite: async () => {},
});

export function SiteProvider({ children }) {
  const [site, setSite] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isTenantSite, setIsTenantSite] = useState(false);
  const [tenantData, setTenantData] = useState(null);

  // Get tenant info from middleware headers (client-side approach)
  const resolveSite = useCallback(async () => {
    try {
      // Check if we have tenant headers (set by middleware)
      const tenantId = document?.querySelector('meta[name="x-tenant-id"]')?.content;
      const tenantName = document?.querySelector('meta[name="x-tenant-name"]')?.content;
      const tenantDomain = document?.querySelector('meta[name="x-tenant-domain"]')?.content;
      const tenantTheme = document?.querySelector('meta[name="x-tenant-theme"]')?.content;
      const tenantPrimaryColor = document?.querySelector('meta[name="x-tenant-primary-color"]')?.content;
      const tenantSecondaryColor = document?.querySelector('meta[name="x-tenant-secondary-color"]')?.content;
      const tenantLogo = document?.querySelector('meta[name="x-tenant-logo"]')?.content;

      if (tenantId) {
        // We're on a tenant site
        setIsTenantSite(true);
        
        const tenantInfo = {
          _id: tenantId,
          name: tenantName,
          customDomain: tenantDomain,
          settings: {
            theme: tenantTheme,
            primaryColor: tenantPrimaryColor,
            secondaryColor: tenantSecondaryColor,
            logoUrl: tenantLogo
          }
        };
        
        setSite(tenantInfo);
        setTenantData(tenantInfo);
      } else {
        // We're on the platform domain
        setIsTenantSite(false);

        // Try to detect from hostname as fallback
        const hostname = typeof window !== 'undefined' ? window.location.hostname : '';
        const platformDomains = ['localhost', 'crownbidder.com', 'app.crownbidder.com'];

        if (!platformDomains.some(domain => hostname.includes(domain))) {
          // This might be a tenant site, try to resolve
          try {
            // Extract subdomain from hostname
            let domainToResolve = hostname;

            // If it's a subdomain of crownbidder.com, extract just the subdomain part
            if (hostname.endsWith('.crownbidder.com')) {
              domainToResolve = hostname.replace('.crownbidder.com', '');
            }

            const response = await api.sites.resolve(domainToResolve);
            setSite(response.data.site);
            setIsTenantSite(true);
            setTenantData(response.data.site);
          } catch (resolveError) {
            console.error('Site resolution failed:', resolveError);
            setError('Site not found for this domain');
          }
        }
      }
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
      setIsLoading(true);
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
    tenantData,
    refreshSite,
  };

  return <SiteContext.Provider value={value}>{children}</SiteContext.Provider>;
}

export function useSite() {
  const context = useContext(SiteContext);
  if (!context) {
    throw new Error('useSite must be used within a SiteProvider');
  }
  return context;
}

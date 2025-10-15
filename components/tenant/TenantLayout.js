'use client';

import { useEffect, useMemo } from 'react';
import { SiteContext } from '@/contexts/SiteContext';
import { ThemeContext } from '@/contexts/ThemeContext';
import TenantHeader from './TenantHeader';
import TenantFooter from './TenantFooter';

export default function TenantLayout({ tenant, children }) {
  useEffect(() => {
    // Apply tenant-specific styles
    if (tenant?.settings) {
      const root = document.documentElement;

      if (tenant.settings.primaryColor) {
        root.style.setProperty('--primary-color', tenant.settings.primaryColor);
      }

      if (tenant.settings.secondaryColor) {
        root.style.setProperty('--secondary-color', tenant.settings.secondaryColor);
      }

      // Update page title
      document.title = tenant.name;

      // Update favicon if available
      if (tenant.settings.logoUrl) {
        const favicon = document.querySelector('link[rel="icon"]');
        if (favicon) {
          favicon.href = tenant.settings.logoUrl;
        }
      }
    }
  }, [tenant]);

  // Create SiteContext value
  const siteContextValue = useMemo(() => ({
    site: tenant,
    isLoading: false,
    error: null,
    isTenantSite: true,
    tenantData: tenant,
    refreshSite: async () => {},
  }), [tenant]);

  // Create ThemeContext value
  const themeContextValue = useMemo(() => ({
    theme: {
      theme: tenant?.settings?.theme || 'classic-blue',
      primaryColor: tenant?.settings?.primaryColor,
      secondaryColor: tenant?.settings?.secondaryColor,
      accentColor: tenant?.settings?.accentColor,
      colors: {
        primary: tenant?.settings?.primaryColor,
        secondary: tenant?.settings?.secondaryColor,
        accent: tenant?.settings?.accentColor,
      },
      logoUrl: tenant?.settings?.logoUrl,
    },
    themes: [],
    isLoading: false,
    error: null,
    selectTheme: () => {},
    loadThemes: async () => {},
    applyTheme: () => {},
  }), [tenant]);

  return (
    <SiteContext.Provider value={siteContextValue}>
      <ThemeContext.Provider value={themeContextValue}>
        <div className="min-h-screen flex flex-col">
          <TenantHeader tenant={tenant} />
          <main className="flex-1">
            {children}
          </main>
          <TenantFooter tenant={tenant} />
        </div>
      </ThemeContext.Provider>
    </SiteContext.Provider>
  );
}
'use client';

import { useEffect } from 'react';
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

  return (
    <div className="min-h-screen flex flex-col">
      <TenantHeader tenant={tenant} />
      <main className="flex-1">
        {children}
      </main>
      <TenantFooter tenant={tenant} />
    </div>
  );
}
'use client';

import { useContext } from 'react';
import { SiteContext } from '@/contexts/SiteContext';
import { ThemeContext } from '@/contexts/ThemeContext';
import TenantNavigation from '@/components/navigation/TenantNavigation';
import TenantFooter from '@/components/navigation/TenantFooter';

export default function TenantLayout({ children }) {
  const { site, isLoading, error, tenantData } = useContext(SiteContext);
  const { theme } = useContext(ThemeContext);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading site...</p>
        </div>
      </div>
    );
  }

  if (error || !site) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">
            Site Not Found
          </h2>
          <p className="text-gray-600 mb-4">
            {error || 'This domain is not configured for any auction site.'}
          </p>
          <a 
            href="https://crownbidder.com" 
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            Visit Crown Bidder
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Navigation */}
      <TenantNavigation site={site} theme={theme} />
      
      {/* Main Content */}
      <main className="flex-1">
        {children}
      </main>
      
      {/* Footer */}
      <TenantFooter site={site} theme={theme} />
    </div>
  );
}

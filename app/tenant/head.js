'use client';

import Head from 'next/head';
import { useContext } from 'react';
import { SiteContext } from '@/contexts/SiteContext';
import { ThemeContext } from '@/contexts/ThemeContext';

export default function TenantHead() {
  const { site, tenantData } = useContext(SiteContext);
  const { theme } = useContext(ThemeContext);

  // Get tenant data from either context or direct site data
  const siteData = tenantData || site;
  const themeData = theme || siteData?.settings;

  return (
    <Head>
      {/* Tenant Metadata */}
      {siteData?._id && (
        <meta name="x-tenant-id" content={siteData._id} />
      )}
      {siteData?.name && (
        <meta name="x-tenant-name" content={siteData.name} />
      )}
      {siteData?.customDomain && (
        <meta name="x-tenant-domain" content={siteData.customDomain} />
      )}
      {themeData?.theme && (
        <meta name="x-tenant-theme" content={themeData.theme} />
      )}
      {themeData?.primaryColor && (
        <meta name="x-tenant-primary-color" content={themeData.primaryColor} />
      )}
      {themeData?.secondaryColor && (
        <meta name="x-tenant-secondary-color" content={themeData.secondaryColor} />
      )}
      {themeData?.logoUrl && (
        <meta name="x-tenant-logo" content={themeData.logoUrl} />
      )}

      {/* Site Title and Description */}
      <title>{siteData?.name ? `${siteData.name} - Professional Auctions` : 'Auction Site'}</title>
      <meta 
        name="description" 
        content={siteData?.description || 'Professional live auction platform for collectors and enthusiasts'} 
      />

      {/* Theme Color for mobile browsers */}
      {themeData?.primaryColor && (
        <meta name="theme-color" content={themeData.primaryColor} />
      )}

      {/* Favicon - could be customized per tenant */}
      <link rel="icon" href="/favicon.ico" />
      
      {/* Open Graph Tags */}
      <meta property="og:title" content={siteData?.name || 'Auction Site'} />
      <meta property="og:description" content={siteData?.description || 'Professional live auction platform'} />
      <meta property="og:type" content="website" />
      {siteData?.customDomain && (
        <meta property="og:url" content={`https://${siteData.customDomain}`} />
      )}
      {themeData?.logoUrl && (
        <meta property="og:image" content={themeData.logoUrl} />
      )}

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={siteData?.name || 'Auction Site'} />
      <meta name="twitter:description" content={siteData?.description || 'Professional live auction platform'} />
      {themeData?.logoUrl && (
        <meta name="twitter:image" content={themeData.logoUrl} />
      )}
    </Head>
  );
}
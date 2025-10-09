'use client';

import { useEffect } from 'react';
import { useSite } from '@/hooks/useSite';
import { useTheme } from '@/hooks/useTheme';
import Link from 'next/link';

export default function TenantHomePage() {
  const { site, isLoading: siteLoading } = useSite();
  const { theme } = useTheme();

  if (siteLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!site) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Site Not Found</h1>
          <p className="text-gray-600">This auction site could not be found.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              {theme?.logoUrl && (
                <img src={theme.logoUrl} alt={site.name} className="h-10 w-10 object-contain" />
              )}
              <h1 className="text-2xl font-bold text-gray-900">{site.name}</h1>
            </div>
            <nav className="flex items-center space-x-6">
              <Link href="/auctions" className="text-gray-700 hover:text-primary">
                Auctions
              </Link>
              <Link href="/about" className="text-gray-700 hover:text-primary">
                About
              </Link>
              <Link href="/login" className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90">
                Sign In
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-b from-primary/10 to-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Welcome to {site.name}
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            {site.description || 'Professional live auction platform for collectors and enthusiasts'}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auctions" className="px-8 py-4 bg-primary text-white rounded-lg hover:bg-primary/90 text-lg font-semibold">
              View Auctions
            </Link>
            <Link href="/signup" className="px-8 py-4 bg-white border-2 border-gray-300 text-gray-900 rounded-lg hover:border-primary text-lg font-semibold">
              Register to Bid
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Auctions */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-3xl font-bold text-gray-900 mb-8">Featured Auctions</h2>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="h-48 bg-gray-200"></div>
            <div className="p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Coming Soon</h3>
              <p className="text-gray-600">Check back soon for upcoming auctions</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-white py-12 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-gray-600">
          <p>&copy; 2024 {site.name}. All rights reserved.</p>
          <p className="mt-2 text-sm">Powered by Crown Bidder</p>
        </div>
      </footer>
    </div>
  );
}

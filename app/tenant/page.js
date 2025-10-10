'use client';

import { useContext } from 'react';
import { SiteContext } from '@/contexts/SiteContext';
import { ThemeContext } from '@/contexts/ThemeContext';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';

export default function TenantHomePage() {
  const { site, isLoading: siteLoading } = useContext(SiteContext);
  const { theme } = useContext(ThemeContext);

  const primaryColor = theme?.primaryColor || '#1e40af';
  
  // This component is wrapped in TenantLayout which handles loading/error states
  // So we can assume site exists here

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section 
        className="relative py-20 lg:py-32 overflow-hidden"
        style={{
          background: `linear-gradient(135deg, ${primaryColor}10 0%, transparent 50%)`
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Welcome to {site?.name}
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto">
              {site?.description || 'Professional live auction platform for collectors and enthusiasts'}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/auctions">
                <Button 
                  size="lg"
                  className="text-lg px-8 py-4"
                  style={{
                    backgroundColor: primaryColor,
                    borderColor: primaryColor
                  }}
                >
                  View Current Auctions
                </Button>
              </Link>
              <Link href="/signup">
                <Button 
                  variant="outline" 
                  size="lg"
                  className="text-lg px-8 py-4"
                >
                  Register to Bid
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why Choose {site?.name}?
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Experience professional auction services with transparent bidding and expert curation.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div 
                className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
                style={{ backgroundColor: `${primaryColor}20` }}
              >
                <svg className="w-8 h-8" style={{ color: primaryColor }} fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Expert Curation</h3>
              <p className="text-gray-600">
                Every item is carefully selected and authenticated by our team of experts.
              </p>
            </div>

            <div className="text-center">
              <div 
                className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
                style={{ backgroundColor: `${primaryColor}20` }}
              >
                <svg className="w-8 h-8" style={{ color: primaryColor }} fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 1L21 8v13H3V8l9-7zm0 2.28L5 9v10h14V9l-7-5.72z"/>
                  <path d="M12 11c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Secure Bidding</h3>
              <p className="text-gray-600">
                Bid with confidence using our secure, transparent bidding platform.
              </p>
            </div>

            <div className="text-center">
              <div 
                className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
                style={{ backgroundColor: `${primaryColor}20` }}
              >
                <svg className="w-8 h-8" style={{ color: primaryColor }} fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Live Bidding</h3>
              <p className="text-gray-600">
                Participate in real-time auctions from anywhere in the world.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Auctions */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-gray-900">Featured Auctions</h2>
            <Link href="/auctions">
              <Button variant="outline">View All Auctions</Button>
            </Link>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Placeholder auction cards */}
            {[1, 2, 3].map((index) => (
              <div key={index} className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                <div className="h-48 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                  <div className="text-center text-gray-500">
                    <svg className="w-12 h-12 mx-auto mb-2" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                    </svg>
                    <p className="text-sm">Auction Coming Soon</p>
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Upcoming Auction #{index}
                  </h3>
                  <p className="text-gray-600 text-sm mb-4">
                    Check back soon for exciting new auction items and opportunities.
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Status: Upcoming</span>
                    <Button 
                      size="sm" 
                      variant="outline"
                      disabled
                    >
                      Coming Soon
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section 
        className="py-16"
        style={{
          background: `linear-gradient(135deg, ${primaryColor} 0%, ${primaryColor}dd 100%)`
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Start Bidding?
          </h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Join thousands of collectors and enthusiasts in our exciting auctions.
          </p>
          <Link href="/signup">
            <Button 
              size="lg" 
              variant="outline"
              className="bg-white text-gray-900 border-white hover:bg-gray-50 text-lg px-8 py-4"
            >
              Create Your Account
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}

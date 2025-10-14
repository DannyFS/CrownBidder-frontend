'use client';

import { useEffect, useState } from 'react';
import { notFound, useParams } from 'next/navigation';
import { headers } from 'next/headers';
import TenantLayout from '@/components/tenant/TenantLayout';

export default function SubdomainHomePage() {
  const params = useParams();
  const subdomain = params.subdomain;
  const [tenant, setTenant] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get tenant info from headers (set by middleware)
    const getTenantFromHeaders = () => {
      // In client component, we need to fetch tenant data
      const fetchTenant = async () => {
        try {
          const response = await fetch(`/api/sites/resolve?subdomain=${subdomain}`);
          if (!response.ok) {
            notFound();
          }
          const data = await response.json();
          setTenant(data.site);
        } catch (error) {
          console.error('Failed to load tenant:', error);
          notFound();
        } finally {
          setLoading(false);
        }
      };

      fetchTenant();
    };

    getTenantFromHeaders();
  }, [subdomain]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!tenant) {
    notFound();
  }

  return (
    <TenantLayout tenant={tenant}>
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
        {/* Hero Section */}
        <section className="relative py-20 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl font-bold text-gray-900 mb-6">
              Welcome to {tenant.name}
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              {tenant.description || 'Your premier destination for live auctions'}
            </p>
            <div className="space-x-4">
              <button 
                className="bg-blue-600 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-blue-700 transition"
                onClick={() => window.location.href = `/auctions`}
              >
                View Live Auctions
              </button>
              <button 
                className="border border-blue-600 text-blue-600 px-8 py-3 rounded-lg text-lg font-semibold hover:bg-blue-50 transition"
                onClick={() => window.location.href = `/register`}
              >
                Register to Bid
              </button>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16 px-4 bg-white">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
              Why Choose {tenant.name}?
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Live Bidding</h3>
                <p className="text-gray-600">
                  Participate in real-time auctions with instant bid updates and notifications.
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Secure Transactions</h3>
                <p className="text-gray-600">
                  Safe and secure payment processing with buyer protection guarantees.
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Quality Items</h3>
                <p className="text-gray-600">
                  Carefully curated selection of authenticated and high-quality items.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 px-4 bg-gray-50">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Ready to Start Bidding?
            </h2>
            <p className="text-xl text-gray-600 mb-8">
              Join thousands of satisfied bidders and discover amazing items at great prices.
            </p>
            <button 
              className="bg-blue-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-700 transition"
              onClick={() => window.location.href = `/register`}
            >
              Create Your Account Today
            </button>
          </div>
        </section>
      </div>
    </TenantLayout>
  );
}
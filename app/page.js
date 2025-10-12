'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import Link from 'next/link';

export default function HomePage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated && user) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, user, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center text-white font-bold text-xl">
              CB
            </div>
            <span className="text-2xl font-bold text-gray-900">Crown Bidder</span>
          </div>
          <nav className="flex items-center space-x-4">
            <Link href="/login" className="px-4 py-2 text-gray-700 hover:text-primary transition">
              Login
            </Link>
            <Link href="/create-site" className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition">
              Get Started
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
          Run Live Auctions
          <span className="block text-primary mt-2">Under Your Own Brand</span>
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          Create professional, branded live auction experiences under your own custom domain.
          Real-time bidding, automated payments, and comprehensive auction management.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/create-site" className="px-8 py-4 bg-primary text-white rounded-lg hover:bg-primary/90 transition text-lg font-semibold">
            Create Your Auction Site
          </Link>
          <Link href="/login" className="px-8 py-4 bg-white border-2 border-gray-300 text-gray-900 rounded-lg hover:border-primary hover:text-primary transition text-lg font-semibold">
            View Demo
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-20">
        <h2 className="text-3xl font-bold text-center mb-12">Everything You Need for Live Auctions</h2>
        <div className="grid md:grid-cols-3 gap-8">
          <FeatureCard
            icon="🎨"
            title="Custom Branding"
            description="Your own domain, logo, and theme. Create a unique auction experience that matches your brand."
          />
          <FeatureCard
            icon="⚡"
            title="Real-time Bidding"
            description="Live bidding with instant updates. No refresh needed. Your bidders stay engaged."
          />
          <FeatureCard
            icon="💳"
            title="Payment Processing"
            description="Integrated payment processing with automatic invoicing and receipt generation."
          />
          <FeatureCard
            icon="📊"
            title="Analytics Dashboard"
            description="Track auction performance, bidder engagement, and revenue in real-time."
          />
          <FeatureCard
            icon="🔒"
            title="Secure & Reliable"
            description="Enterprise-grade security with 99.9% uptime. Your auctions run smoothly."
          />
          <FeatureCard
            icon="🌐"
            title="Multi-tenant"
            description="Run multiple auction sites from one platform. Perfect for auction houses."
          />
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="bg-primary rounded-2xl p-12 text-center text-white">
          <h2 className="text-4xl font-bold mb-4">Ready to Start Your First Auction?</h2>
          <p className="text-xl mb-8 opacity-90">
            Get your custom auction site set up in minutes. No credit card required.
          </p>
          <Link href="/create-site" className="inline-block px-8 py-4 bg-white text-primary rounded-lg hover:bg-gray-100 transition text-lg font-semibold">
            Create Your Site Now
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-gray-50 py-12">
        <div className="container mx-auto px-4 text-center text-gray-600">
          <p>&copy; 2024 Crown Bidder. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description }) {
  return (
    <div className="bg-white p-6 rounded-xl border border-gray-200 hover:border-primary hover:shadow-lg transition">
      <div className="text-4xl mb-4">{icon}</div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
}

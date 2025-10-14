'use client';

import { useState } from 'react';
import Image from 'next/image';

export default function TenantHeader({ tenant }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navigation = [
    { name: 'Home', href: '/' },
    { name: 'Auctions', href: '/auctions' },
    { name: 'About', href: '/about' },
    { name: 'Contact', href: '/contact' },
  ];

  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <a href="/" className="flex items-center space-x-2">
              {tenant?.settings?.logoUrl ? (
                <Image
                  src={tenant.settings.logoUrl}
                  alt={`${tenant.name} logo`}
                  width={40}
                  height={40}
                  className="rounded"
                />
              ) : (
                <div 
                  className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-xl"
                  style={{ 
                    backgroundColor: tenant?.settings?.primaryColor || '#1e40af' 
                  }}
                >
                  {tenant?.name?.charAt(0)?.toUpperCase() || 'A'}
                </div>
              )}
              <span className="text-xl font-bold text-gray-900">
                {tenant?.name || 'Auction Site'}
              </span>
            </a>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8">
            {navigation.map((item) => (
              <a
                key={item.name}
                href={item.href}
                className="text-gray-700 hover:text-gray-900 px-3 py-2 text-sm font-medium transition"
                style={{
                  '--hover-color': tenant?.settings?.primaryColor || '#1e40af'
                }}
              >
                {item.name}
              </a>
            ))}
          </nav>

          {/* Auth Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            <a
              href="/login"
              className="text-gray-700 hover:text-gray-900 px-3 py-2 text-sm font-medium"
            >
              Sign In
            </a>
            <a
              href="/register"
              className="text-white px-4 py-2 rounded-md text-sm font-medium transition"
              style={{
                backgroundColor: tenant?.settings?.primaryColor || '#1e40af'
              }}
            >
              Register
            </a>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-400 hover:text-gray-500 focus:outline-none focus:text-gray-500 transition"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {isMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              {navigation.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  className="text-gray-700 hover:text-gray-900 block px-3 py-2 text-base font-medium"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.name}
                </a>
              ))}
              <div className="pt-4 pb-3 border-t border-gray-200">
                <div className="space-y-1">
                  <a
                    href="/login"
                    className="text-gray-700 hover:text-gray-900 block px-3 py-2 text-base font-medium"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Sign In
                  </a>
                  <a
                    href="/register"
                    className="text-white block px-3 py-2 text-base font-medium rounded-md"
                    style={{
                      backgroundColor: tenant?.settings?.primaryColor || '#1e40af'
                    }}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Register
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
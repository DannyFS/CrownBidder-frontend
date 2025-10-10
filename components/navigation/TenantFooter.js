'use client';

import Link from 'next/link';

export default function TenantFooter({ site, theme }) {
  const primaryColor = theme?.primaryColor || '#1e40af';
  const currentYear = new Date().getFullYear();

  const footerLinks = [
    { label: 'Privacy Policy', href: '/privacy' },
    { label: 'Terms of Service', href: '/terms' },
    { label: 'Contact', href: '/contact' },
  ];

  return (
    <footer className="bg-gray-50 border-t">
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Site Info */}
          <div className="col-span-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {site?.name || 'Auction House'}
            </h3>
            <p className="text-gray-600 text-sm leading-relaxed">
              {site?.description || 'Professional auction services for collectors and sellers.'}
            </p>
          </div>

          {/* Quick Links */}
          <div className="col-span-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Quick Links
            </h3>
            <ul className="space-y-2">
              <li>
                <Link href="/auctions" className="text-gray-600 hover:text-gray-900 text-sm transition-colors">
                  Current Auctions
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-gray-600 hover:text-gray-900 text-sm transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/signup" className="text-gray-600 hover:text-gray-900 text-sm transition-colors">
                  Register to Bid
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="col-span-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Contact Us
            </h3>
            <div className="space-y-2 text-sm text-gray-600">
              <p>Email: info@{site?.customDomain || 'example.com'}</p>
              <p>Phone: Available during auction hours</p>
              <div className="pt-2">
                <p className="text-xs text-gray-500">
                  Powered by{' '}
                  <a 
                    href="https://crownbidder.com" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="hover:underline"
                    style={{ color: primaryColor }}
                  >
                    Crown Bidder
                  </a>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm text-gray-500">
              © {currentYear} {site?.name || 'Auction House'}. All rights reserved.
            </p>
            
            <div className="mt-4 md:mt-0">
              <ul className="flex space-x-6">
                {footerLinks.map((link) => (
                  <li key={link.href}>
                    <Link 
                      href={link.href} 
                      className="text-sm text-gray-500 hover:text-gray-900 transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
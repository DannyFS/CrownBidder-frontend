'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useSite } from '@/contexts/SiteContext';
import Link from 'next/link';

const AdminTabs = [
  { id: 'website', label: 'Website', path: '/admin/website' },
  { id: 'company', label: 'Company', path: '/admin/company' },
  { id: 'auctions', label: 'Auctions', path: '/admin/auctions' },
  { id: 'emails', label: 'Emails', path: '/admin/emails' },
];

export default function AdminLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAuthenticated, isLoading } = useAuth();
  const { site } = useSite();

  // Check if user is admin
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login?redirect=/admin');
    } else if (!isLoading && user && user.role !== 'admin') {
      router.push('/');
    }
  }, [user, isAuthenticated, isLoading, router]);

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Don't render anything if not authenticated or not admin
  if (!isAuthenticated || !user || user.role !== 'admin') {
    return null;
  }

  const getActiveTab = () => {
    const path = pathname || '';
    if (path.includes('/admin/website')) return 'website';
    if (path.includes('/admin/company')) return 'company';
    if (path.includes('/admin/auctions')) return 'auctions';
    if (path.includes('/admin/emails')) return 'emails';
    return 'website'; // default
  };

  const activeTab = getActiveTab();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <h1 className="text-xl font-bold text-gray-900">
                {site?.name || 'Admin Portal'}
              </h1>
              <span className="text-sm text-gray-500 hidden sm:inline">
                Admin Dashboard
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                href="/"
                className="text-sm text-gray-600 hover:text-gray-900"
              >
                View Site
              </Link>
              <div className="text-sm text-gray-700">
                {user.firstName} {user.lastName}
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="flex space-x-8 -mb-px">
            {AdminTabs.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <Link
                  key={tab.id}
                  href={tab.path}
                  className={`
                    py-4 px-1 border-b-2 font-medium text-sm transition-colors
                    ${
                      isActive
                        ? 'border-blue-600 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }
                  `}
                >
                  {tab.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}

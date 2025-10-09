'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import Link from 'next/link';

export default function DashboardPage() {
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated && !isLoading) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center text-white font-bold text-xl">
              CB
            </div>
            <span className="text-2xl font-bold text-gray-900">Crown Bidder</span>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600">
              {user?.email}
            </span>
            <button
              onClick={handleLogout}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome, {user?.firstName || user?.email}!
          </h1>
          <p className="text-gray-600 mt-2">
            Manage your auction sites and events from this dashboard.
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Link href="/create-site" className="block p-6 bg-white rounded-lg border-2 border-dashed border-gray-300 hover:border-primary transition">
            <div className="text-center">
              <div className="text-4xl mb-2">➕</div>
              <h3 className="text-lg font-semibold text-gray-900">Create New Site</h3>
              <p className="text-sm text-gray-600 mt-1">
                Set up a new auction site with custom branding
              </p>
            </div>
          </Link>

          <Link href="/dashboard/auctions" className="block p-6 bg-white rounded-lg shadow hover:shadow-lg transition">
            <div className="text-center">
              <div className="text-4xl mb-2">🔨</div>
              <h3 className="text-lg font-semibold text-gray-900">Manage Auctions</h3>
              <p className="text-sm text-gray-600 mt-1">
                Create and manage your live auctions
              </p>
            </div>
          </Link>

          <Link href="/dashboard/sites" className="block p-6 bg-white rounded-lg shadow hover:shadow-lg transition">
            <div className="text-center">
              <div className="text-4xl mb-2">🏢</div>
              <h3 className="text-lg font-semibold text-gray-900">My Sites</h3>
              <p className="text-sm text-gray-600 mt-1">
                View and configure your auction sites
              </p>
            </div>
          </Link>
        </div>

        {/* Stats Overview */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Overview</h2>
          <div className="grid md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">0</div>
              <div className="text-sm text-gray-600 mt-1">Total Sites</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">0</div>
              <div className="text-sm text-gray-600 mt-1">Active Auctions</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">0</div>
              <div className="text-sm text-gray-600 mt-1">Total Bids</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">$0</div>
              <div className="text-sm text-gray-600 mt-1">Revenue</div>
            </div>
          </div>
        </div>

        {/* Getting Started */}
        <div className="mt-8 bg-blue-50 rounded-lg p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Getting Started</h2>
          <ul className="space-y-2">
            <li className="flex items-center text-gray-700">
              <span className="mr-2">✓</span>
              <span>Create your first auction site</span>
            </li>
            <li className="flex items-center text-gray-700">
              <span className="mr-2">✓</span>
              <span>Customize your site theme and branding</span>
            </li>
            <li className="flex items-center text-gray-700">
              <span className="mr-2">✓</span>
              <span>Set up your custom domain</span>
            </li>
            <li className="flex items-center text-gray-700">
              <span className="mr-2">✓</span>
              <span>Create your first live auction</span>
            </li>
            <li className="flex items-center text-gray-700">
              <span className="mr-2">✓</span>
              <span>Invite bidders to participate</span>
            </li>
          </ul>
        </div>
      </main>
    </div>
  );
}

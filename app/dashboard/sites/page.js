'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import api from '@/lib/api';
import { formatDate } from '@/utils/format';
import { DOMAIN_VERIFICATION_STATUS } from '@/lib/constants';

export default function SitesDashboardPage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [sites, setSites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isAuthenticated && !isLoading) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  useEffect(() => {
    if (isAuthenticated) {
      loadSites();
    }
  }, [isAuthenticated]);

  const loadSites = async () => {
    try {
      setLoading(true);
      const response = await api.sites.list();
      
      // Ensure we always have an array
      const sitesData = response?.data || response || [];
      const sitesArray = Array.isArray(sitesData) ? sitesData : [];
      
      // Debug log to see what we're getting from the API
      console.log('Sites API response structure:', response);
      console.log('Sites array:', sitesArray);
      
      setSites(sitesArray);
    } catch (error) {
      console.error('Failed to load sites:', error);
      setError('Failed to load sites. Please try again.');
      setSites([]); // Ensure sites is always an array even on error
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case DOMAIN_VERIFICATION_STATUS.VERIFIED:
        return 'text-green-600 bg-green-100';
      case DOMAIN_VERIFICATION_STATUS.PENDING:
        return 'text-yellow-600 bg-yellow-100';
      case DOMAIN_VERIFICATION_STATUS.ERROR:
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case DOMAIN_VERIFICATION_STATUS.VERIFIED:
        return 'Active';
      case DOMAIN_VERIFICATION_STATUS.PENDING:
        return 'Pending';
      case DOMAIN_VERIFICATION_STATUS.ERROR:
        return 'Error';
      default:
        return 'Unknown';
    }
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/dashboard" className="text-blue-600 hover:text-blue-700">
                ← Back to Dashboard
              </Link>
              <h1 className="text-2xl font-bold text-gray-900">My Sites</h1>
            </div>
            <Link href="/create-site">
              <Button>Create New Site</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading your sites...</p>
          </div>
        ) : !Array.isArray(sites) || sites.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🏢</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">No Sites Yet</h2>
            <p className="text-gray-600 mb-6">
              Create your first auction site to get started with Crown Bidder.
            </p>
            <Link href="/create-site">
              <Button>Create Your First Site</Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <p className="text-gray-600">
                {Array.isArray(sites) ? sites.length : 0} {Array.isArray(sites) && sites.length === 1 ? 'site' : 'sites'} found
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {Array.isArray(sites) && sites.map((site) => (
                <Card key={site._id} className="hover:shadow-lg transition-shadow">
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-900 truncate">
                        {site.name}
                      </h3>
                      <span className={`px-2 py-1 text-xs rounded-full font-medium ${getStatusColor(site.domainVerificationStatus)}`}>
                        {getStatusText(site.domainVerificationStatus)}
                      </span>
                    </div>

                    <div className="space-y-2 mb-4">
                      <div>
                        <p className="text-sm text-gray-600">Domain:</p>
                        <p className="text-sm font-medium text-gray-900">
                          {site.customDomain || (site.subdomain ? `${site.subdomain}.crownbidder.com` : 'Domain not configured')}
                        </p>
                      </div>
                      {site.description && (
                        <div>
                          <p className="text-sm text-gray-600">Description:</p>
                          <p className="text-sm text-gray-900">{site.description}</p>
                        </div>
                      )}
                      <div>
                        <p className="text-sm text-gray-600">Created:</p>
                        <p className="text-sm text-gray-900">{formatDate(site.createdAt)}</p>
                      </div>
                    </div>

                    <div className="flex flex-col space-y-2">
                      <Link href={`/site/${site._id}/dashboard`}>
                        <Button className="w-full" size="sm">
                          Manage Site
                        </Button>
                      </Link>
                      
                      <div className="flex space-x-2">
                        {site.domainVerificationStatus === DOMAIN_VERIFICATION_STATUS.VERIFIED ? (
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1"
                            onClick={() => window.open(`https://${site.customDomain || `${site.subdomain}.crownbidder.com`}`, '_blank')}
                          >
                            View Live
                          </Button>
                        ) : (
                          <Link href={`/site/${site._id}/verify-domain`} className="flex-1">
                            <Button variant="outline" size="sm" className="w-full">
                              Setup Domain
                            </Button>
                          </Link>
                        )}
                        
                        <Link href={`/site/${site._id}/auctions`} className="flex-1">
                          <Button variant="outline" size="sm" className="w-full">
                            Auctions
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
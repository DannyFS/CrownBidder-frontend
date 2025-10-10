'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import AuctionsList from '@/components/auctions/AuctionsList';
import DashboardStats from '@/components/dashboard/DashboardStats';
import api from '@/lib/api';

export default function SiteDashboardPage() {
  const { id: siteId } = useParams();
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  
  const [site, setSite] = useState(null);
  const [auctions, setAuctions] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Redirect if not authenticated or wrong user
  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login?redirect=' + encodeURIComponent(`/site/${siteId}/dashboard`));
      return;
    }

    if (user && user.siteId !== siteId) {
      router.push('/dashboard');
      return;
    }
  }, [isAuthenticated, user, siteId, router]);

  // Load site data and auctions
  useEffect(() => {
    if (!isAuthenticated || !siteId) return;

    const loadDashboard = async () => {
      try {
        setLoading(true);
        
        // Load site details, auctions, and stats in parallel
        const [siteResponse, auctionsResponse] = await Promise.all([
          api.sites.get(siteId),
          api.auctions.list({ siteId, limit: 10 })
        ]);

        setSite(siteResponse.data.site);
        setAuctions(auctionsResponse.data.auctions || []);
        setStats(siteResponse.data.site.stats || null);
        
      } catch (error) {
        setError(error.message);
        console.error('Dashboard load error:', error);
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, [isAuthenticated, siteId]);

  const handleCreateAuction = () => {
    router.push(`/site/${siteId}/auctions/create`);
  };

  const handleViewSite = () => {
    if (site?.customDomain) {
      window.open(`https://${site.customDomain}`, '_blank');
    }
  };

  const handleManageAuctions = () => {
    router.push(`/site/${siteId}/auctions`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error || !site) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md w-full mx-4">
          <div className="p-6 text-center">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">
              Unable to Load Dashboard
            </h2>
            <p className="text-gray-600 mb-4">
              {error || 'Site not found or you do not have access to it.'}
            </p>
            <Button onClick={() => router.push('/dashboard')}>
              Back to Sites
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{site.name}</h1>
              <p className="text-sm text-gray-600 mt-1">
                Auction site management dashboard
              </p>
            </div>
            <div className="flex items-center space-x-3">
              {site.domainVerificationStatus === 'verified' ? (
                <Button variant="outline" onClick={handleViewSite}>
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                  View Live Site
                </Button>
              ) : (
                <Button 
                  variant="outline" 
                  onClick={() => router.push(`/site/${siteId}/verify-domain`)}
                >
                  Complete Setup
                </Button>
              )}
              
              <Button onClick={handleCreateAuction}>
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Create Auction
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Site Status */}
        {site.domainVerificationStatus !== 'verified' && (
          <Card className="mb-8 border-yellow-200 bg-yellow-50">
            <div className="p-4">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-yellow-800">
                    Domain Setup Required
                  </h3>
                  <div className="mt-2 text-sm text-yellow-700">
                    <p>
                      Your domain <strong>{site.customDomain}</strong> needs to be verified before your site can go live.
                    </p>
                  </div>
                  <div className="mt-4">
                    <Button 
                      size="sm"
                      onClick={() => router.push(`/site/${siteId}/verify-domain`)}
                    >
                      Complete Domain Setup
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Dashboard Stats */}
        <DashboardStats site={site} stats={stats} />

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-900">Create Auction</h3>
                <p className="text-sm text-gray-500">Set up a new auction event</p>
              </div>
            </div>
            <div className="mt-4">
              <Button className="w-full" onClick={handleCreateAuction}>
                New Auction
              </Button>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-900">Manage Auctions</h3>
                <p className="text-sm text-gray-500">View and edit existing auctions</p>
              </div>
            </div>
            <div className="mt-4">
              <Button variant="outline" className="w-full" onClick={handleManageAuctions}>
                View All
              </Button>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-900">Site Settings</h3>
                <p className="text-sm text-gray-500">Customize your auction site</p>
              </div>
            </div>
            <div className="mt-4">
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => router.push(`/site/${siteId}/settings`)}
              >
                Settings
              </Button>
            </div>
          </Card>
        </div>

        {/* Recent Auctions */}
        <Card>
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-medium text-gray-900">Recent Auctions</h2>
              <Button variant="outline" onClick={handleManageAuctions}>
                View All
              </Button>
            </div>
            
            <AuctionsList 
              auctions={auctions}
              siteId={siteId}
              showActions={true}
              limit={5}
            />
          </div>
        </Card>
      </div>
    </div>
  );
}
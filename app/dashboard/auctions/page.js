'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import api from '@/lib/api';
import { formatDate, formatCurrency } from '@/utils/format';
import { AUCTION_STATUS } from '@/lib/constants';

export default function AuctionsDashboardPage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [auctions, setAuctions] = useState([]);
  const [sites, setSites] = useState([]);
  const [selectedSite, setSelectedSite] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isAuthenticated && !isLoading) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  useEffect(() => {
    if (isAuthenticated) {
      loadData();
    }
  }, [isAuthenticated]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Load sites first
      const sitesResponse = await api.sites.list();
      const sitesData = sitesResponse?.data || sitesResponse || [];
      const sitesList = Array.isArray(sitesData) ? sitesData : [];
      setSites(sitesList);
      
      // Load auctions for all sites
      if (sitesList.length > 0) {
        const allAuctions = [];
        
        for (const site of sitesList) {
          try {
            const auctionsResponse = await api.auctions.list(site._id);
            const auctionsData = auctionsResponse?.data || auctionsResponse || [];
            const siteAuctions = (Array.isArray(auctionsData) ? auctionsData : []).map(auction => ({
              ...auction,
              siteName: site.name,
              siteId: site._id
            }));
            allAuctions.push(...siteAuctions);
          } catch (error) {
            console.error(`Failed to load auctions for site ${site.name}:`, error);
          }
        }
        
        setAuctions(allAuctions);
      }
    } catch (error) {
      console.error('Failed to load data:', error);
      setError('Failed to load auctions. Please try again.');
      setSites([]);
      setAuctions([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case AUCTION_STATUS.LIVE:
        return 'text-green-600 bg-green-100';
      case AUCTION_STATUS.SCHEDULED:
        return 'text-blue-600 bg-blue-100';
      case AUCTION_STATUS.ENDED:
        return 'text-gray-600 bg-gray-100';
      case AUCTION_STATUS.DRAFT:
        return 'text-yellow-600 bg-yellow-100';
      case AUCTION_STATUS.PAUSED:
        return 'text-orange-600 bg-orange-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case AUCTION_STATUS.LIVE:
        return 'Live';
      case AUCTION_STATUS.SCHEDULED:
        return 'Scheduled';
      case AUCTION_STATUS.ENDED:
        return 'Ended';
      case AUCTION_STATUS.DRAFT:
        return 'Draft';
      case AUCTION_STATUS.PAUSED:
        return 'Paused';
      default:
        return status || 'Unknown';
    }
  };

  const filteredAuctions = selectedSite === 'all' 
    ? (Array.isArray(auctions) ? auctions : [])
    : (Array.isArray(auctions) ? auctions.filter(auction => auction.siteId === selectedSite) : []);

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
              <h1 className="text-2xl font-bold text-gray-900">My Auctions</h1>
            </div>
            {Array.isArray(sites) && sites.length > 0 && (
              <div className="flex items-center space-x-4">
                <select
                  value={selectedSite}
                  onChange={(e) => setSelectedSite(e.target.value)}
                  className="border border-gray-300 rounded-md px-3 py-2 text-sm"
                >
                  <option value="all">All Sites</option>
                  {Array.isArray(sites) && sites.map(site => (
                    <option key={site._id} value={site._id}>
                      {site.name}
                    </option>
                  ))}
                </select>
                {selectedSite !== 'all' && (
                  <Link href={`/site/${selectedSite}/auctions/create`}>
                    <Button>Create Auction</Button>
                  </Link>
                )}
              </div>
            )}
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
            <p className="mt-2 text-gray-600">Loading your auctions...</p>
          </div>
        ) : !Array.isArray(sites) || sites.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🏢</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">No Sites Found</h2>
            <p className="text-gray-600 mb-6">
              You need to create a site before you can manage auctions.
            </p>
            <Link href="/create-site">
              <Button>Create Your First Site</Button>
            </Link>
          </div>
        ) : filteredAuctions.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🔨</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">No Auctions Yet</h2>
            <p className="text-gray-600 mb-6">
              {selectedSite === 'all' 
                ? 'Create your first auction to get started.'
                : 'Create an auction for this site to get started.'
              }
            </p>
            {selectedSite !== 'all' ? (
              <Link href={`/site/${selectedSite}/auctions/create`}>
                <Button>Create Your First Auction</Button>
              </Link>
            ) : (
              <Link href="/dashboard/sites">
                <Button>Go to Sites</Button>
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <p className="text-gray-600">
                {Array.isArray(filteredAuctions) ? filteredAuctions.length : 0} {Array.isArray(filteredAuctions) && filteredAuctions.length === 1 ? 'auction' : 'auctions'} found
                {selectedSite !== 'all' && Array.isArray(sites) && (
                  <span className="ml-1">
                    for {sites.find(s => s._id === selectedSite)?.name}
                  </span>
                )}
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {Array.isArray(filteredAuctions) && filteredAuctions.map((auction) => (
                <Card key={auction._id} className="hover:shadow-lg transition-shadow">
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-900 truncate">
                        {auction.title}
                      </h3>
                      <span className={`px-2 py-1 text-xs rounded-full font-medium ${getStatusColor(auction.status)}`}>
                        {getStatusText(auction.status)}
                      </span>
                    </div>

                    <div className="space-y-2 mb-4">
                      <div>
                        <p className="text-sm text-gray-600">Site:</p>
                        <p className="text-sm font-medium text-gray-900">{auction.siteName}</p>
                      </div>
                      
                      {auction.description && (
                        <div>
                          <p className="text-sm text-gray-600">Description:</p>
                          <p className="text-sm text-gray-900 line-clamp-2">{auction.description}</p>
                        </div>
                      )}
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-600">Items:</p>
                          <p className="text-sm font-medium text-gray-900">
                            {auction.items?.length || 0}
                          </p>
                        </div>
                        
                        <div>
                          <p className="text-sm text-gray-600">Total Bids:</p>
                          <p className="text-sm font-medium text-gray-900">
                            {auction.totalBids || 0}
                          </p>
                        </div>
                      </div>

                      {auction.scheduledStartTime && (
                        <div>
                          <p className="text-sm text-gray-600">
                            {auction.status === AUCTION_STATUS.ENDED ? 'Ended:' : 
                             auction.status === AUCTION_STATUS.LIVE ? 'Started:' : 'Starts:'}
                          </p>
                          <p className="text-sm text-gray-900">
                            {formatDate(auction.scheduledStartTime)}
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col space-y-2">
                      <Link href={`/site/${auction.siteId}/auctions/${auction._id}`}>
                        <Button className="w-full" size="sm">
                          View Auction
                        </Button>
                      </Link>
                      
                      <div className="flex space-x-2">
                        {auction.status === AUCTION_STATUS.LIVE && (
                          <Link href={`/site/${auction.siteId}/auctions/${auction._id}/control`} className="flex-1">
                            <Button variant="outline" size="sm" className="w-full">
                              Control
                            </Button>
                          </Link>
                        )}
                        
                        <Link href={`/site/${auction.siteId}/auctions`} className="flex-1">
                          <Button variant="outline" size="sm" className="w-full">
                            All Auctions
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
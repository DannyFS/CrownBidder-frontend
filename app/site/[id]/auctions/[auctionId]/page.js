'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import api from '@/lib/api';
import { AUCTION_STATUS } from '@/lib/constants';
import { formatDate, formatCurrency } from '@/lib/utils';

const statusConfig = {
  [AUCTION_STATUS.DRAFT]: {
    label: 'Draft',
    color: 'bg-gray-100 text-gray-800',
    icon: '📝'
  },
  [AUCTION_STATUS.SCHEDULED]: {
    label: 'Scheduled',
    color: 'bg-blue-100 text-blue-800',
    icon: '📅'
  },
  [AUCTION_STATUS.LIVE]: {
    label: 'Live',
    color: 'bg-green-100 text-green-800',
    icon: '🔴'
  },
  [AUCTION_STATUS.ENDED]: {
    label: 'Ended',
    color: 'bg-gray-100 text-gray-800',
    icon: '✅'
  },
  [AUCTION_STATUS.PAUSED]: {
    label: 'Paused',
    color: 'bg-yellow-100 text-yellow-800',
    icon: '⏸️'
  },
};

export default function AuctionDetailsPage() {
  const { id: siteId, auctionId } = useParams();
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  
  const [auction, setAuction] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('details');

  // Redirect if not authenticated
  if (!isAuthenticated) {
    router.push('/login?redirect=' + encodeURIComponent(`/site/${siteId}/auctions/${auctionId}`));
    return null;
  }

  // Check if user has access to this site
  if (user && user.siteId !== siteId) {
    router.push('/dashboard');
    return null;
  }

  useEffect(() => {
    fetchAuction();
  }, [auctionId]);

  const fetchAuction = async () => {
    try {
      setLoading(true);
      const response = await api.auctions.getById(auctionId);
      setAuction(response.data);
    } catch (error) {
      console.error('Error fetching auction:', error);
      router.push(`/site/${siteId}/auctions`);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (newStatus) => {
    try {
      const response = await api.auctions.updateStatus(auctionId, newStatus);
      setAuction(prev => ({ ...prev, status: newStatus }));
    } catch (error) {
      console.error('Error updating auction status:', error);
    }
  };

  const getActionButtons = () => {
    if (!auction) return null;

    const buttons = [];

    // Edit button for drafts and scheduled auctions
    if ([AUCTION_STATUS.DRAFT, AUCTION_STATUS.SCHEDULED].includes(auction.status)) {
      buttons.push(
        <Button
          key="edit"
          variant="outline"
          onClick={() => router.push(`/site/${siteId}/auctions/${auctionId}/edit`)}
        >
          Edit Auction
        </Button>
      );
    }

    // Start button for scheduled auctions
    if (auction.status === AUCTION_STATUS.SCHEDULED) {
      buttons.push(
        <Button
          key="start"
          onClick={() => handleStatusChange(AUCTION_STATUS.LIVE)}
          className="bg-green-600 hover:bg-green-700"
        >
          Start Auction
        </Button>
      );
    }

    // Control panel for live auctions
    if (auction.status === AUCTION_STATUS.LIVE) {
      buttons.push(
        <Button
          key="control"
          onClick={() => router.push(`/site/${siteId}/auctions/${auctionId}/control`)}
          className="bg-red-600 hover:bg-red-700"
        >
          Control Live Auction
        </Button>
      );
      
      buttons.push(
        <Button
          key="pause"
          variant="outline"
          onClick={() => handleStatusChange(AUCTION_STATUS.PAUSED)}
        >
          Pause Auction
        </Button>
      );
    }

    // Resume button for paused auctions
    if (auction.status === AUCTION_STATUS.PAUSED) {
      buttons.push(
        <Button
          key="resume"
          onClick={() => handleStatusChange(AUCTION_STATUS.LIVE)}
          className="bg-green-600 hover:bg-green-700"
        >
          Resume Auction
        </Button>
      );
    }

    return buttons;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <div className="h-96 bg-gray-200 rounded mb-6"></div>
                <div className="h-64 bg-gray-200 rounded"></div>
              </div>
              <div className="lg:col-span-1">
                <div className="h-48 bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!auction) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Auction Not Found</h1>
            <Button onClick={() => router.push(`/site/${siteId}/auctions`)}>
              Back to Auctions
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const status = statusConfig[auction.status] || statusConfig[AUCTION_STATUS.DRAFT];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <nav className="flex items-center text-sm text-gray-500 mb-4">
            <button 
              onClick={() => router.push(`/site/${siteId}/dashboard`)}
              className="hover:text-gray-700"
            >
              Dashboard
            </button>
            <svg className="w-4 h-4 mx-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            <button 
              onClick={() => router.push(`/site/${siteId}/auctions`)}
              className="hover:text-gray-700"
            >
              Auctions
            </button>
            <svg className="w-4 h-4 mx-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            <span className="text-gray-900 font-medium">{auction.title}</span>
          </nav>
          
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-2">
                <h1 className="text-3xl font-bold text-gray-900">
                  {auction.title}
                </h1>
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${status.color}`}>
                  <span className="mr-1">{status.icon}</span>
                  {status.label}
                </span>
              </div>
              <p className="text-lg text-gray-600">{auction.description}</p>
            </div>
            
            <div className="flex flex-wrap gap-2 mt-4 sm:mt-0 sm:ml-4">
              {getActionButtons()}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Tabs */}
            <div className="border-b border-gray-200 mb-6">
              <nav className="-mb-px flex space-x-8">
                {[
                  { id: 'details', label: 'Details', count: null },
                  { id: 'items', label: 'Items', count: auction.items?.length || 0 },
                  { id: 'bids', label: 'Bids', count: auction.totalBids || 0 },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    {tab.label}
                    {tab.count !== null && (
                      <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
                        activeTab === tab.id
                          ? 'bg-blue-100 text-blue-600'
                          : 'bg-gray-100 text-gray-600'
                      }`}>
                        {tab.count}
                      </span>
                    )}
                  </button>
                ))}
              </nav>
            </div>

            {/* Tab Content */}
            <Card className="p-6">
              {activeTab === 'details' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Auction Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Category</dt>
                        <dd className="mt-1 text-sm text-gray-900">{auction.category}</dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Created</dt>
                        <dd className="mt-1 text-sm text-gray-900">{formatDate(auction.createdAt)}</dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Start Time</dt>
                        <dd className="mt-1 text-sm text-gray-900">
                          {auction.startTime ? formatDate(auction.startTime) : 'Not scheduled'}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-gray-500">End Time</dt>
                        <dd className="mt-1 text-sm text-gray-900">
                          {auction.endTime ? formatDate(auction.endTime) : 'Not scheduled'}
                        </dd>
                      </div>
                    </div>
                  </div>

                  {auction.settings && (
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-4">Bidding Settings</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <dt className="text-sm font-medium text-gray-500">Bid Increment</dt>
                          <dd className="mt-1 text-sm text-gray-900">
                            {formatCurrency(auction.settings.bidIncrement)}
                          </dd>
                        </div>
                        <div>
                          <dt className="text-sm font-medium text-gray-500">Registration Required</dt>
                          <dd className="mt-1 text-sm text-gray-900">
                            {auction.settings.requireRegistration ? 'Yes' : 'No'}
                          </dd>
                        </div>
                        <div>
                          <dt className="text-sm font-medium text-gray-500">Proxy Bidding</dt>
                          <dd className="mt-1 text-sm text-gray-900">
                            {auction.settings.allowProxyBidding ? 'Allowed' : 'Not Allowed'}
                          </dd>
                        </div>
                        <div>
                          <dt className="text-sm font-medium text-gray-500">Auto Extend</dt>
                          <dd className="mt-1 text-sm text-gray-900">
                            {auction.settings.autoExtend 
                              ? `${auction.settings.autoExtendMinutes} minutes`
                              : 'Disabled'
                            }
                          </dd>
                        </div>
                      </div>
                    </div>
                  )}

                  {auction.termsConditions && (
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-4">Terms & Conditions</h3>
                      <div className="bg-gray-50 rounded-md p-4">
                        <p className="text-sm text-gray-700 whitespace-pre-wrap">
                          {auction.termsConditions}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'items' && (
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-900">Auction Items</h3>
                  {auction.items && auction.items.length > 0 ? (
                    <div className="space-y-4">
                      {auction.items.map((item, index) => (
                        <div key={item._id} className="border border-gray-200 rounded-lg p-4">
                          <div className="flex items-start space-x-4">
                            <span className="flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-600 rounded-full text-sm font-medium">
                              {index + 1}
                            </span>
                            <div className="flex-1">
                              <h4 className="font-medium text-gray-900">{item.title}</h4>
                              {item.description && (
                                <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                              )}
                              <div className="flex items-center space-x-6 mt-2 text-sm">
                                <span className="text-green-600 font-medium">
                                  Starting: {formatCurrency(item.startingBid)}
                                </span>
                                {item.reservePrice && (
                                  <span className="text-orange-600 font-medium">
                                    Reserve: {formatCurrency(item.reservePrice)}
                                  </span>
                                )}
                                {item.condition && (
                                  <span className="text-gray-500">
                                    Condition: {item.condition}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-gray-500">No items added to this auction yet.</p>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'bids' && (
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-900">Bidding Activity</h3>
                  <div className="text-center py-8">
                    <p className="text-gray-500">Bidding history will appear here once the auction starts.</p>
                  </div>
                </div>
              )}
            </Card>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="space-y-6">
              {/* Quick Stats */}
              <Card className="p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Stats</h3>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Items</span>
                    <span className="font-medium">{auction.items?.length || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Bids</span>
                    <span className="font-medium">{auction.totalBids || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Starting Value</span>
                    <span className="font-medium text-green-600">
                      {formatCurrency(
                        auction.items?.reduce((sum, item) => sum + item.startingBid, 0) || 0
                      )}
                    </span>
                  </div>
                  {auction.currentHighestBid && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Current High</span>
                      <span className="font-medium text-green-600">
                        {formatCurrency(auction.currentHighestBid)}
                      </span>
                    </div>
                  )}
                </div>
              </Card>

              {/* Actions */}
              <Card className="p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Actions</h3>
                <div className="space-y-3">
                  <Button
                    variant="outline"
                    onClick={() => router.push(`/site/${siteId}/auctions`)}
                    className="w-full"
                  >
                    Back to All Auctions
                  </Button>
                  
                  {auction.status === AUCTION_STATUS.LIVE && (
                    <Button
                      onClick={() => router.push(`/site/${siteId}/auctions/${auctionId}/control`)}
                      className="w-full bg-red-600 hover:bg-red-700"
                    >
                      Live Control Panel
                    </Button>
                  )}
                  
                  {[AUCTION_STATUS.DRAFT, AUCTION_STATUS.SCHEDULED].includes(auction.status) && (
                    <>
                      <Button
                        variant="outline"
                        onClick={() => router.push(`/site/${siteId}/auctions/${auctionId}/edit`)}
                        className="w-full"
                      >
                        Edit Auction
                      </Button>
                      
                      {auction.status === AUCTION_STATUS.DRAFT && (
                        <Button
                          onClick={() => handleStatusChange(AUCTION_STATUS.SCHEDULED)}
                          className="w-full"
                        >
                          Schedule Auction
                        </Button>
                      )}
                    </>
                  )}
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
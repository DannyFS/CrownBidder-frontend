'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useSocket } from '@/contexts/SocketContext';
import { useAuth } from '@/hooks/useAuth';
import { useSite } from '@/contexts/SiteContext';
import { useTheme } from '@/contexts/ThemeContext';
import LiveBiddingInterface from '@/components/bidding/LiveBiddingInterface';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import api from '@/lib/api';
import { AUCTION_STATUS, SOCKET_EVENTS } from '@/lib/constants';
import { formatDate, formatCurrency } from '@/lib/utils';

export default function LiveAuctionPage() {
  const { auctionId } = useParams();
  const { user, isAuthenticated } = useAuth();
  const { site } = useSite();
  const { theme } = useTheme();
  const { socket, isConnected, addEventListener, joinAuction } = useSocket();
  
  const [auction, setAuction] = useState(null);
  const [currentItem, setCurrentItem] = useState(null);
  const [currentItemIndex, setCurrentItemIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isRegistered, setIsRegistered] = useState(false);
  const [auctionStats, setAuctionStats] = useState({
    totalBids: 0,
    activeBidders: 0,
    totalValue: 0,
  });

  useEffect(() => {
    fetchAuction();
  }, [auctionId]);

  useEffect(() => {
    if (auction && socket && isConnected) {
      joinAuction(auction._id);
      setupSocketListeners();
    }
  }, [auction, socket, isConnected]);

  useEffect(() => {
    if (auction && auction.items && auction.items.length > 0) {
      setCurrentItem(auction.items[currentItemIndex]);
    }
  }, [auction, currentItemIndex]);

  const fetchAuction = async () => {
    try {
      setLoading(true);
      const response = await api.auctions.getById(auctionId);
      setAuction(response.data);
      
      // Check if user is registered for this auction
      if (user && response.data.registeredBidders) {
        setIsRegistered(response.data.registeredBidders.includes(user.id));
      }
      
    } catch (error) {
      console.error('Error fetching auction:', error);
      setError('Failed to load auction');
    } finally {
      setLoading(false);
    }
  };

  const setupSocketListeners = () => {
    if (!socket) return;

    const cleanupFunctions = [
      addEventListener(SOCKET_EVENTS.AUCTION_STATUS_CHANGED, handleAuctionStatusChanged),
      addEventListener(SOCKET_EVENTS.AUCTION_ITEM_CHANGED, handleItemChanged),
      addEventListener(SOCKET_EVENTS.AUCTION_STARTED, handleAuctionStarted),
      addEventListener(SOCKET_EVENTS.AUCTION_ENDED, handleAuctionEnded),
      addEventListener(SOCKET_EVENTS.BID_PLACED, handleBidPlaced),
      addEventListener(SOCKET_EVENTS.ADMIN_SITE_STATS, handleStatsUpdate),
    ];

    return () => {
      cleanupFunctions.forEach(cleanup => cleanup());
    };
  };

  const handleAuctionStatusChanged = (data) => {
    if (data.auctionId === auction._id) {
      setAuction(prev => ({ ...prev, status: data.status }));
    }
  };

  const handleItemChanged = (data) => {
    if (data.auctionId === auction._id) {
      setCurrentItemIndex(data.itemIndex);
      setCurrentItem(data.item);
    }
  };

  const handleAuctionStarted = (data) => {
    if (data.auctionId === auction._id) {
      setAuction(prev => ({ ...prev, status: AUCTION_STATUS.LIVE }));
    }
  };

  const handleAuctionEnded = (data) => {
    if (data.auctionId === auction._id) {
      setAuction(prev => ({ ...prev, status: AUCTION_STATUS.ENDED }));
    }
  };

  const handleBidPlaced = (data) => {
    if (data.auctionId === auction._id) {
      setAuctionStats(prev => ({
        ...prev,
        totalBids: prev.totalBids + 1,
        totalValue: prev.totalValue + data.amount,
      }));
    }
  };

  const handleStatsUpdate = (data) => {
    if (data.auctionId === auction._id) {
      setAuctionStats(data.stats);
    }
  };

  const handleRegisterForAuction = async () => {
    try {
      await api.auctions.register(auctionId);
      setIsRegistered(true);
    } catch (error) {
      console.error('Error registering for auction:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <div className="h-96 bg-gray-200 rounded"></div>
              </div>
              <div className="lg:col-span-1">
                <div className="h-96 bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !auction) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              {error || 'Auction Not Found'}
            </h1>
            <p className="text-gray-600 mb-6">
              The auction you're looking for is not available.
            </p>
            <Button onClick={() => window.location.href = '/'}>
              Return to Homepage
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Registration Required Check
  if (auction.settings?.requireRegistration && !isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="p-8 text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Registration Required</h1>
            <p className="text-gray-600 mb-6">
              You must be registered and logged in to participate in this auction.
            </p>
            <div className="space-x-4">
              <Button onClick={() => window.location.href = '/login'}>
                Login
              </Button>
              <Button variant="outline" onClick={() => window.location.href = '/register'}>
                Register
              </Button>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  if (auction.settings?.requireRegistration && isAuthenticated && !isRegistered) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="p-8 text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Auction Registration</h1>
            <p className="text-gray-600 mb-6">
              You must register for this auction before you can participate in bidding.
            </p>
            <Button onClick={handleRegisterForAuction}>
              Register for Auction
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8" style={{ 
      backgroundColor: theme?.backgroundColor || '#f9fafb' 
    }}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Auction Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900" style={{
                color: theme?.textColor || '#111827'
              }}>
                {auction.title}
              </h1>
              <p className="text-lg text-gray-600 mt-2">
                {auction.description}
              </p>
            </div>
            
            <div className="text-right">
              <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                auction.status === AUCTION_STATUS.LIVE 
                  ? 'bg-red-100 text-red-800' 
                  : auction.status === AUCTION_STATUS.SCHEDULED
                  ? 'bg-blue-100 text-blue-800'
                  : 'bg-gray-100 text-gray-800'
              }`}>
                {auction.status === AUCTION_STATUS.LIVE && '🔴 LIVE'}
                {auction.status === AUCTION_STATUS.SCHEDULED && '📅 Scheduled'}
                {auction.status === AUCTION_STATUS.ENDED && '✅ Ended'}
                {auction.status === AUCTION_STATUS.PAUSED && '⏸️ Paused'}
              </div>
            </div>
          </div>

          {/* Auction Stats Bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Total Items', value: auction.items?.length || 0 },
              { label: 'Total Bids', value: auctionStats.totalBids },
              { label: 'Active Bidders', value: auctionStats.activeBidders },
              { label: 'Current Value', value: formatCurrency(auctionStats.totalValue) },
            ].map((stat, index) => (
              <div key={index} className="bg-white rounded-lg p-4 border border-gray-200">
                <div className="text-sm text-gray-500">{stat.label}</div>
                <div className="text-lg font-semibold text-gray-900">{stat.value}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Bidding Interface */}
          <div className="lg:col-span-2">
            <LiveBiddingInterface
              auction={auction}
              currentItem={currentItem}
              onBidPlaced={handleBidPlaced}
            />
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="space-y-6">
              {/* Connection Status */}
              <Card className="p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Connection</span>
                  <div className="flex items-center space-x-2">
                    <div className={`w-2 h-2 rounded-full ${
                      isConnected ? 'bg-green-500' : 'bg-red-500'
                    }`}></div>
                    <span className="text-sm text-gray-600">
                      {isConnected ? 'Connected' : 'Disconnected'}
                    </span>
                  </div>
                </div>
              </Card>

              {/* Auction Schedule */}
              <Card className="p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Auction Schedule</h3>
                <div className="space-y-3">
                  {auction.startTime && (
                    <div>
                      <div className="text-sm text-gray-500">Start Time</div>
                      <div className="text-sm font-medium text-gray-900">
                        {formatDate(auction.startTime)}
                      </div>
                    </div>
                  )}
                  {auction.endTime && (
                    <div>
                      <div className="text-sm text-gray-500">End Time</div>
                      <div className="text-sm font-medium text-gray-900">
                        {formatDate(auction.endTime)}
                      </div>
                    </div>
                  )}
                </div>
              </Card>

              {/* Auction Items List */}
              <Card className="p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Auction Items ({auction.items?.length || 0})
                </h3>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {auction.items?.map((item, index) => (
                    <div
                      key={item._id}
                      className={`p-3 rounded-md border ${
                        index === currentItemIndex
                          ? 'border-blue-300 bg-blue-50'
                          : 'border-gray-200 bg-white'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium text-sm text-gray-900">
                            {index + 1}. {item.title}
                          </div>
                          <div className="text-xs text-gray-500">
                            Starting: {formatCurrency(item.startingBid)}
                          </div>
                        </div>
                        {index === currentItemIndex && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            Current
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Terms & Conditions */}
              {auction.termsConditions && (
                <Card className="p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Terms & Conditions</h3>
                  <div className="text-sm text-gray-700 whitespace-pre-wrap max-h-48 overflow-y-auto">
                    {auction.termsConditions}
                  </div>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
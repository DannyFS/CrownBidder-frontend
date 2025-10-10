'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import api from '@/lib/api';
import { AUCTION_STATUS } from '@/lib/constants';
import { formatCurrency } from '@/lib/utils';

export default function AuctionControlPage() {
  const { id: siteId, auctionId } = useParams();
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  
  const [auction, setAuction] = useState(null);
  const [currentItem, setCurrentItem] = useState(null);
  const [currentItemIndex, setCurrentItemIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [bids, setBids] = useState([]);
  const [bidAmount, setBidAmount] = useState('');
  const [auctioneerNotes, setAuctioneerNotes] = useState('');

  // Redirect if not authenticated
  if (!isAuthenticated) {
    router.push('/login?redirect=' + encodeURIComponent(`/site/${siteId}/auctions/${auctionId}/control`));
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

  useEffect(() => {
    if (auction && auction.items && auction.items.length > 0) {
      setCurrentItem(auction.items[currentItemIndex]);
      setBidAmount(auction.items[currentItemIndex].startingBid.toString());
    }
  }, [auction, currentItemIndex]);

  const fetchAuction = async () => {
    try {
      setLoading(true);
      const response = await api.auctions.getById(auctionId);
      setAuction(response.data);
      
      // If auction is not live, redirect
      if (response.data.status !== AUCTION_STATUS.LIVE) {
        router.push(`/site/${siteId}/auctions/${auctionId}`);
        return;
      }
    } catch (error) {
      console.error('Error fetching auction:', error);
      router.push(`/site/${siteId}/auctions`);
    } finally {
      setLoading(false);
    }
  };

  const handleNextItem = () => {
    if (currentItemIndex < auction.items.length - 1) {
      setCurrentItemIndex(currentItemIndex + 1);
    }
  };

  const handlePreviousItem = () => {
    if (currentItemIndex > 0) {
      setCurrentItemIndex(currentItemIndex - 1);
    }
  };

  const handlePauseAuction = async () => {
    try {
      await api.auctions.updateStatus(auctionId, AUCTION_STATUS.PAUSED);
      setAuction(prev => ({ ...prev, status: AUCTION_STATUS.PAUSED }));
    } catch (error) {
      console.error('Error pausing auction:', error);
    }
  };

  const handleEndAuction = async () => {
    if (confirm('Are you sure you want to end this auction? This action cannot be undone.')) {
      try {
        await api.auctions.updateStatus(auctionId, AUCTION_STATUS.ENDED);
        router.push(`/site/${siteId}/auctions/${auctionId}`);
      } catch (error) {
        console.error('Error ending auction:', error);
      }
    }
  };

  const getNextBidAmount = () => {
    const increment = auction.settings?.bidIncrement || 5;
    const currentBid = parseFloat(bidAmount) || 0;
    return currentBid + increment;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white p-4">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-700 rounded w-1/3 mb-6"></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <div className="h-96 bg-gray-700 rounded"></div>
              </div>
              <div className="lg:col-span-1">
                <div className="h-96 bg-gray-700 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!auction || !currentItem) {
    return (
      <div className="min-h-screen bg-gray-900 text-white p-4">
        <div className="max-w-7xl mx-auto text-center py-12">
          <h1 className="text-2xl font-bold mb-4">Auction Not Available</h1>
          <Button onClick={() => router.push(`/site/${siteId}/auctions`)}>
            Back to Auctions
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="bg-red-600 p-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">🔴 LIVE AUCTION CONTROL</h1>
            <p className="text-red-100">{auction.title}</p>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <div className="text-sm text-red-100">Item {currentItemIndex + 1} of {auction.items.length}</div>
              <div className="text-lg font-semibold">{currentItem.title}</div>
            </div>
            
            <div className="flex space-x-2">
              <Button
                variant="outline"
                onClick={handlePauseAuction}
                className="bg-yellow-600 hover:bg-yellow-700 border-yellow-600"
              >
                ⏸️ Pause
              </Button>
              <Button
                variant="outline"
                onClick={handleEndAuction}
                className="bg-gray-600 hover:bg-gray-700 border-gray-600"
              >
                🛑 End Auction
              </Button>
              <Button
                variant="outline"
                onClick={() => router.push(`/site/${siteId}/auctions/${auctionId}`)}
                className="border-white text-white hover:bg-white hover:text-gray-900"
              >
                Exit Control
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Control Panel */}
          <div className="lg:col-span-2">
            {/* Current Item Display */}
            <Card className="p-6 mb-6 bg-gray-800 border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-white">Current Item</h2>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    onClick={handlePreviousItem}
                    disabled={currentItemIndex === 0}
                    className="border-gray-600 text-gray-300 hover:bg-gray-700"
                  >
                    ← Previous
                  </Button>
                  <span className="px-3 py-1 bg-blue-600 rounded text-sm">
                    {currentItemIndex + 1} / {auction.items.length}
                  </span>
                  <Button
                    variant="outline"
                    onClick={handleNextItem}
                    disabled={currentItemIndex === auction.items.length - 1}
                    className="border-gray-600 text-gray-300 hover:bg-gray-700"
                  >
                    Next →
                  </Button>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-xl font-semibold text-white mb-2">{currentItem.title}</h3>
                  {currentItem.description && (
                    <p className="text-gray-300 mb-4">{currentItem.description}</p>
                  )}
                  
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Starting Bid:</span>
                      <span className="text-green-400 font-semibold">
                        {formatCurrency(currentItem.startingBid)}
                      </span>
                    </div>
                    {currentItem.reservePrice && (
                      <div className="flex justify-between">
                        <span className="text-gray-400">Reserve:</span>
                        <span className="text-orange-400 font-semibold">
                          {formatCurrency(currentItem.reservePrice)}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-gray-400">Condition:</span>
                      <span className="text-white">{currentItem.condition || 'Not specified'}</span>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-700 rounded-lg p-4">
                  <h4 className="font-semibold text-white mb-2">Item Image</h4>
                  <div className="aspect-square bg-gray-600 rounded-lg flex items-center justify-center">
                    <span className="text-gray-400">No image uploaded</span>
                  </div>
                </div>
              </div>
            </Card>

            {/* Bidding Control */}
            <Card className="p-6 bg-gray-800 border-gray-700">
              <h3 className="text-xl font-semibold text-white mb-4">Bidding Control</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Current Bid Amount
                  </label>
                  <div className="flex space-x-2">
                    <input
                      type="number"
                      value={bidAmount}
                      onChange={(e) => setBidAmount(e.target.value)}
                      step="0.01"
                      className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <Button
                      onClick={() => setBidAmount(getNextBidAmount().toString())}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      +{auction.settings?.bidIncrement || 5}
                    </Button>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Quick Bid Actions
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <Button className="bg-blue-600 hover:bg-blue-700">
                      Accept Bid
                    </Button>
                    <Button className="bg-yellow-600 hover:bg-yellow-700">
                      Going Once
                    </Button>
                    <Button className="bg-orange-600 hover:bg-orange-700">
                      Going Twice
                    </Button>
                    <Button className="bg-green-600 hover:bg-green-700">
                      Sold!
                    </Button>
                  </div>
                </div>
              </div>
              
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Auctioneer Notes
                </label>
                <textarea
                  value={auctioneerNotes}
                  onChange={(e) => setAuctioneerNotes(e.target.value)}
                  placeholder="Notes for this item..."
                  rows={3}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            {/* Live Stats */}
            <Card className="p-6 mb-6 bg-gray-800 border-gray-700">
              <h3 className="text-lg font-semibold text-white mb-4">Live Stats</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-400">Connected Bidders:</span>
                  <span className="text-green-400 font-semibold">12</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Total Bids:</span>
                  <span className="text-white font-semibold">{auction.totalBids || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Items Sold:</span>
                  <span className="text-white font-semibold">{currentItemIndex}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Total Sales:</span>
                  <span className="text-green-400 font-semibold">
                    {formatCurrency(0)}
                  </span>
                </div>
              </div>
            </Card>

            {/* Recent Bids */}
            <Card className="p-6 mb-6 bg-gray-800 border-gray-700">
              <h3 className="text-lg font-semibold text-white mb-4">Recent Bids</h3>
              <div className="space-y-2">
                {bids.length > 0 ? (
                  bids.slice(0, 5).map((bid, index) => (
                    <div key={index} className="flex justify-between items-center p-2 bg-gray-700 rounded">
                      <span className="text-gray-300">Bidder #{bid.bidderId}</span>
                      <span className="text-green-400 font-semibold">
                        {formatCurrency(bid.amount)}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-400 text-center py-4">No bids yet</p>
                )}
              </div>
            </Card>

            {/* Connected Users */}
            <Card className="p-6 bg-gray-800 border-gray-700">
              <h3 className="text-lg font-semibold text-white mb-4">Connected Users</h3>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span className="text-gray-300">12 active bidders</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                  <span className="text-gray-300">3 observers</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                  <span className="text-gray-300">Real-time updates active</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useSocket } from '@/contexts/SocketContext';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import api from '@/lib/api';
import { AUCTION_STATUS, SOCKET_EVENTS } from '@/lib/constants';
import { formatCurrency } from '@/lib/utils';

export default function AuctionControlPage() {
  const { id: siteId, auctionId } = useParams();
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const {
    socket,
    isConnected,
    connectionError,
    addEventListener,
    joinAuction,
    startAuction,
    endAuction,
    pauseAuction,
    nextItem,
    broadcastMessage,
  } = useSocket();
  
  const [auction, setAuction] = useState(null);
  const [currentItem, setCurrentItem] = useState(null);
  const [currentItemIndex, setCurrentItemIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [realtimeBids, setRealtimeBids] = useState([]);
  const [bidAmount, setBidAmount] = useState('');
  const [auctioneerNotes, setAuctioneerNotes] = useState('');
  const [connectedUsers, setConnectedUsers] = useState({ bidders: 0, observers: 0 });
  const [auctionStats, setAuctionStats] = useState({
    totalBids: 0,
    totalValue: 0,
    currentHighBid: null,
  });
  const [broadcastMsg, setBroadcastMsg] = useState('');
  const [itemSoldFor, setItemSoldFor] = useState(null);

  const notesRef = useRef(null);

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
    if (auction && socket && isConnected) {
      joinAuction(auction._id);
      setupSocketListeners();
    }
  }, [auction, socket, isConnected]);

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

  const setupSocketListeners = () => {
    if (!socket) return;

    const cleanupFunctions = [
      addEventListener(SOCKET_EVENTS.BID_PLACED, handleBidPlaced),
      addEventListener(SOCKET_EVENTS.AUCTION_STATUS_CHANGED, handleStatusChanged),
      addEventListener(SOCKET_EVENTS.ADMIN_CONNECTED_USERS, handleConnectedUsersUpdate),
      addEventListener(SOCKET_EVENTS.AUCTION_STARTED, handleAuctionStarted),
      addEventListener(SOCKET_EVENTS.AUCTION_ENDED, handleAuctionEnded),
    ];

    return () => {
      cleanupFunctions.forEach(cleanup => cleanup());
    };
  };

  const handleBidPlaced = (data) => {
    if (data.auctionId === auction._id) {
      setRealtimeBids(prev => [data, ...prev.slice(0, 19)]); // Keep last 20 bids
      
      if (data.itemId === currentItem?._id) {
        setAuctionStats(prev => ({
          ...prev,
          currentHighBid: data,
          totalBids: prev.totalBids + 1,
          totalValue: prev.totalValue + data.amount,
        }));
        
        // Update bid amount to next increment
        const nextBid = data.amount + (auction.settings?.bidIncrement || 5);
        setBidAmount(nextBid.toString());
      }
    }
  };

  const handleStatusChanged = (data) => {
    if (data.auctionId === auction._id) {
      setAuction(prev => ({ ...prev, status: data.status }));
    }
  };

  const handleConnectedUsersUpdate = (data) => {
    setConnectedUsers(data);
  };

  const handleAuctionStarted = (data) => {
    if (data.auctionId === auction._id) {
      setAuction(prev => ({ ...prev, status: AUCTION_STATUS.LIVE }));
    }
  };

  const handleAuctionEnded = (data) => {
    if (data.auctionId === auction._id) {
      setAuction(prev => ({ ...prev, status: AUCTION_STATUS.ENDED }));
      router.push(`/site/${siteId}/auctions/${auctionId}`);
    }
  };

  const handleNextItem = () => {
    if (currentItemIndex < auction.items.length - 1) {
      const newIndex = currentItemIndex + 1;
      setCurrentItemIndex(newIndex);
      
      // Notify all connected users about item change
      if (socket && isConnected) {
        nextItem(auction._id, auction.items[newIndex]._id);
      }
    }
  };

  const handlePreviousItem = () => {
    if (currentItemIndex > 0) {
      const newIndex = currentItemIndex - 1;
      setCurrentItemIndex(newIndex);
      
      // Notify all connected users about item change
      if (socket && isConnected) {
        nextItem(auction._id, auction.items[newIndex]._id);
      }
    }
  };

  const handlePauseAuction = async () => {
    try {
      pauseAuction(auction._id);
      await api.auctions.updateStatus(auctionId, AUCTION_STATUS.PAUSED);
      setAuction(prev => ({ ...prev, status: AUCTION_STATUS.PAUSED }));
    } catch (error) {
      console.error('Error pausing auction:', error);
    }
  };

  const handleEndAuction = async () => {
    if (confirm('Are you sure you want to end this auction? This action cannot be undone.')) {
      try {
        endAuction(auction._id);
        await api.auctions.updateStatus(auctionId, AUCTION_STATUS.ENDED);
        router.push(`/site/${siteId}/auctions/${auctionId}`);
      } catch (error) {
        console.error('Error ending auction:', error);
      }
    }
  };

  const handleSoldItem = () => {
    const currentHighBid = auctionStats.currentHighBid;
    if (currentHighBid) {
      setItemSoldFor(currentHighBid.amount);
      
      // Add notes about the sale
      const saleNote = `Item ${currentItemIndex + 1} sold for ${formatCurrency(currentHighBid.amount)} to Bidder #${currentHighBid.bidderNumber || '***'}`;
      setAuctioneerNotes(prev => prev ? `${prev}\n${saleNote}` : saleNote);
      
      // Move to next item automatically after a brief delay
      setTimeout(() => {
        if (currentItemIndex < auction.items.length - 1) {
          handleNextItem();
          setItemSoldFor(null);
        }
      }, 2000);
    }
  };

  const handleBroadcast = () => {
    if (broadcastMsg.trim() && socket && isConnected) {
      broadcastMessage(auction._id, broadcastMsg.trim());
      setBroadcastMsg('');
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
            {!isConnected && (
              <p className="text-red-200 text-sm">
                ⚠️ Connection Issue: {connectionError || 'Reconnecting...'}
              </p>
            )}
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <div className="text-sm text-red-100">Item {currentItemIndex + 1} of {auction.items.length}</div>
              <div className="text-lg font-semibold">{currentItem.title}</div>
              {itemSoldFor && (
                <div className="text-green-200 font-bold">SOLD for {formatCurrency(itemSoldFor)}!</div>
              )}
            </div>
            
            <div className="flex space-x-2">
              <Button
                variant="outline"
                onClick={handlePauseAuction}
                className="bg-yellow-600 hover:bg-yellow-700 border-yellow-600"
                disabled={!isConnected}
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
                    disabled={currentItemIndex === 0 || !isConnected}
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
                    disabled={currentItemIndex === auction.items.length - 1 || !isConnected}
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
                      <span className="text-gray-400">Current High:</span>
                      <span className="text-green-400 font-semibold">
                        {auctionStats.currentHighBid ? 
                          formatCurrency(auctionStats.currentHighBid.amount) : 
                          'No bids'
                        }
                      </span>
                    </div>
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
              <h3 className="text-xl font-semibold text-white mb-4">Auctioneer Controls</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Current Bidding At
                  </label>
                  <div className="flex space-x-2">
                    <input
                      type="number"
                      value={bidAmount}
                      onChange={(e) => setBidAmount(e.target.value)}
                      step="0.01"
                      className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      disabled={!isConnected}
                    />
                    <Button
                      onClick={() => setBidAmount(getNextBidAmount().toString())}
                      className="bg-green-600 hover:bg-green-700"
                      disabled={!isConnected}
                    >
                      +{auction.settings?.bidIncrement || 5}
                    </Button>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Auction Actions
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <Button 
                      className="bg-blue-600 hover:bg-blue-700 text-sm"
                      disabled={!isConnected}
                    >
                      Going Once
                    </Button>
                    <Button 
                      className="bg-yellow-600 hover:bg-yellow-700 text-sm"
                      disabled={!isConnected}
                    >
                      Going Twice
                    </Button>
                    <Button 
                      onClick={handleSoldItem}
                      className="bg-green-600 hover:bg-green-700 text-sm"
                      disabled={!auctionStats.currentHighBid || !isConnected}
                    >
                      SOLD!
                    </Button>
                    <Button 
                      className="bg-gray-600 hover:bg-gray-700 text-sm"
                      disabled={!isConnected}
                    >
                      No Sale
                    </Button>
                  </div>
                </div>
              </div>
              
              {/* Broadcast Message */}
              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Broadcast to All Bidders
                </label>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={broadcastMsg}
                    onChange={(e) => setBroadcastMsg(e.target.value)}
                    placeholder="Type message to broadcast..."
                    className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={!isConnected}
                    onKeyPress={(e) => e.key === 'Enter' && handleBroadcast()}
                  />
                  <Button
                    onClick={handleBroadcast}
                    disabled={!broadcastMsg.trim() || !isConnected}
                    className="bg-purple-600 hover:bg-purple-700"
                  >
                    Broadcast
                  </Button>
                </div>
              </div>
              
              {/* Auctioneer Notes */}
              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Auctioneer Notes
                </label>
                <textarea
                  ref={notesRef}
                  value={auctioneerNotes}
                  onChange={(e) => setAuctioneerNotes(e.target.value)}
                  placeholder="Notes for this auction..."
                  rows={4}
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
                  <span className="text-gray-400">Connection:</span>
                  <span className={`font-semibold ${isConnected ? 'text-green-400' : 'text-red-400'}`}>
                    {isConnected ? 'Connected' : 'Disconnected'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Active Bidders:</span>
                  <span className="text-green-400 font-semibold">{connectedUsers.bidders}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Observers:</span>
                  <span className="text-blue-400 font-semibold">{connectedUsers.observers}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Total Bids:</span>
                  <span className="text-white font-semibold">{auctionStats.totalBids}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Items Completed:</span>
                  <span className="text-white font-semibold">{currentItemIndex}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Total Sales Value:</span>
                  <span className="text-green-400 font-semibold">
                    {formatCurrency(auctionStats.totalValue)}
                  </span>
                </div>
              </div>
            </Card>

            {/* Live Bids */}
            <Card className="p-6 bg-gray-800 border-gray-700">
              <h3 className="text-lg font-semibold text-white mb-4">Live Bids</h3>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {realtimeBids.length > 0 ? (
                  realtimeBids.map((bid, index) => (
                    <div key={`${bid.bidderId}-${bid.timestamp}`} className={`flex justify-between items-center p-2 rounded ${
                      index === 0 ? 'bg-green-700' : 'bg-gray-700'
                    }`}>
                      <div className="flex items-center space-x-2">
                        <span className={`w-2 h-2 rounded-full ${
                          index === 0 ? 'bg-green-400' : 'bg-gray-400'
                        }`}></span>
                        <span className="text-gray-300 text-sm">
                          Bidder #{bid.bidderNumber || '***'}
                        </span>
                        {index === 0 && (
                          <span className="text-xs bg-green-600 text-white px-2 py-0.5 rounded">
                            HIGH
                          </span>
                        )}
                      </div>
                      <div className="text-right">
                        <div className={`font-semibold ${
                          index === 0 ? 'text-green-400' : 'text-white'
                        }`}>
                          {formatCurrency(bid.amount)}
                        </div>
                        <div className="text-xs text-gray-500">
                          {new Date(bid.timestamp).toLocaleTimeString()}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-400 text-center py-4">No bids yet</p>
                )}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
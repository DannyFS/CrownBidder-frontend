'use client';

import { useState, useEffect, useRef } from 'react';
import { useSocket } from '@/contexts/SocketContext';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { SOCKET_EVENTS, AUCTION_STATUS } from '@/lib/constants';
import { formatCurrency } from '@/lib/utils';

export default function LiveBiddingInterface({ auction, currentItem, onBidPlaced }) {
  const { user } = useAuth();
  const {
    socket,
    isConnected,
    connectionError,
    placeBid,
    quickBid,
    addEventListener,
    joinAuction,
    leaveAuction
  } = useSocket();

  const [bidAmount, setBidAmount] = useState('');
  const [isSubmittingBid, setIsSubmittingBid] = useState(false);
  const [bidHistory, setBidHistory] = useState([]);
  const [currentHighBid, setCurrentHighBid] = useState(null);
  const [connectedBidders, setConnectedBidders] = useState(0);
  const [auctionStatus, setAuctionStatus] = useState(auction.status);
  const [bidError, setBidError] = useState(null);
  const [bidSuccess, setBidSuccess] = useState(null);
  const [timeRemaining, setTimeRemaining] = useState(null);
  const [isOutbid, setIsOutbid] = useState(false);

  const bidInputRef = useRef(null);
  const successTimeoutRef = useRef(null);
  const errorTimeoutRef = useRef(null);

  useEffect(() => {
    if (auction && socket && isConnected) {
      joinAuction(auction._id);
    }

    return () => {
      if (auction) {
        leaveAuction(auction._id);
      }
    };
  }, [auction, socket, isConnected]);

  useEffect(() => {
    if (!socket || !isConnected) return;

    // Set up event listeners
    const cleanupFunctions = [
      addEventListener(SOCKET_EVENTS.BID_PLACED, handleBidPlaced),
      addEventListener(SOCKET_EVENTS.BID_OUTBID, handleOutbid),
      addEventListener(SOCKET_EVENTS.AUCTION_STATUS_CHANGED, handleStatusChange),
      addEventListener(SOCKET_EVENTS.AUCTION_ITEM_CHANGED, handleItemChange),
      addEventListener(SOCKET_EVENTS.ADMIN_CONNECTED_USERS, handleConnectedUsers),
    ];

    return () => {
      cleanupFunctions.forEach(cleanup => cleanup());
    };
  }, [socket, isConnected]);

  useEffect(() => {
    if (currentItem) {
      const startingBid = currentHighBid ? 
        currentHighBid.amount + (auction.settings?.bidIncrement || 5) :
        currentItem.startingBid;
      setBidAmount(startingBid.toString());
    }
  }, [currentItem, currentHighBid, auction.settings]);

  // Calculate time remaining for auction
  useEffect(() => {
    if (!auction.endTime || auctionStatus !== AUCTION_STATUS.LIVE) return;

    const interval = setInterval(() => {
      const now = new Date().getTime();
      const end = new Date(auction.endTime).getTime();
      const remaining = end - now;

      if (remaining <= 0) {
        setTimeRemaining(null);
        setAuctionStatus(AUCTION_STATUS.ENDED);
      } else {
        setTimeRemaining(remaining);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [auction.endTime, auctionStatus]);

  const handleBidPlaced = (data) => {
    setBidHistory(prev => [data, ...prev.slice(0, 9)]); // Keep last 10 bids
    
    if (data.itemId === currentItem?._id) {
      setCurrentHighBid(data);
      
      // Update bid amount to next increment
      const nextBid = data.amount + (auction.settings?.bidIncrement || 5);
      setBidAmount(nextBid.toString());
    }

    if (onBidPlaced) {
      onBidPlaced(data);
    }
  };

  const handleOutbid = (data) => {
    if (data.previousBidderId === user?.id) {
      setIsOutbid(true);
      setTimeout(() => setIsOutbid(false), 5000);
    }
  };

  const handleStatusChange = (data) => {
    setAuctionStatus(data.status);
  };

  const handleItemChange = (data) => {
    setBidHistory([]); // Clear history for new item
    setCurrentHighBid(null);
    setBidError(null);
    setBidSuccess(null);
  };

  const handleConnectedUsers = (data) => {
    setConnectedBidders(data.bidders || 0);
  };

  const handleSubmitBid = async () => {
    if (!bidAmount || isSubmittingBid || !currentItem) return;

    const amount = parseFloat(bidAmount);
    if (isNaN(amount) || amount <= 0) {
      showError('Please enter a valid bid amount');
      return;
    }

    const minBid = currentHighBid ? 
      currentHighBid.amount + (auction.settings?.bidIncrement || 5) :
      currentItem.startingBid;

    if (amount < minBid) {
      showError(`Minimum bid is ${formatCurrency(minBid)}`);
      return;
    }

    setIsSubmittingBid(true);
    setBidError(null);

    try {
      const result = await placeBid(auction._id, currentItem._id, amount);
      showSuccess(`Bid placed successfully! ${formatCurrency(amount)}`);
      setBidAmount((amount + (auction.settings?.bidIncrement || 5)).toString());
    } catch (error) {
      showError(error.message || 'Failed to place bid');
    } finally {
      setIsSubmittingBid(false);
    }
  };

  const handleQuickBid = () => {
    if (!currentItem || isSubmittingBid) return;
    
    const currentBid = parseFloat(bidAmount);
    if (isNaN(currentBid)) return;

    quickBid(auction._id, currentItem._id);
    setIsSubmittingBid(true);
    
    // Quick bid will trigger normal bid flow
    setTimeout(() => setIsSubmittingBid(false), 2000);
  };

  const showError = (message) => {
    setBidError(message);
    if (errorTimeoutRef.current) clearTimeout(errorTimeoutRef.current);
    errorTimeoutRef.current = setTimeout(() => setBidError(null), 5000);
  };

  const showSuccess = (message) => {
    setBidSuccess(message);
    if (successTimeoutRef.current) clearTimeout(successTimeoutRef.current);
    successTimeoutRef.current = setTimeout(() => setBidSuccess(null), 3000);
  };

  const formatTimeRemaining = (ms) => {
    if (!ms) return null;
    
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    
    if (minutes > 0) {
      return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }
    return `${seconds}s`;
  };

  const getQuickBidAmount = () => {
    const current = parseFloat(bidAmount) || 0;
    return current;
  };

  if (!currentItem) {
    return (
      <Card className="p-6">
        <div className="text-center py-8">
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Active Item</h3>
          <p className="text-gray-600">Waiting for auction to begin...</p>
        </div>
      </Card>
    );
  }

  if (auctionStatus !== AUCTION_STATUS.LIVE) {
    return (
      <Card className="p-6">
        <div className="text-center py-8">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Auction Not Live</h3>
          <p className="text-gray-600">
            {auctionStatus === AUCTION_STATUS.SCHEDULED && 'Auction will begin shortly...'}
            {auctionStatus === AUCTION_STATUS.ENDED && 'Auction has ended'}
            {auctionStatus === AUCTION_STATUS.PAUSED && 'Auction is paused'}
          </p>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Connection Status */}
      {!isConnected && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Connection Lost</h3>
              <p className="text-sm text-red-700 mt-1">
                {connectionError || 'Attempting to reconnect to auction server...'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Outbid Alert */}
      {isOutbid && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">You've been outbid!</h3>
              <p className="text-sm text-yellow-700 mt-1">Place a new bid to regain the lead.</p>
            </div>
          </div>
        </div>
      )}

      {/* Success/Error Messages */}
      {bidSuccess && (
        <div className="bg-green-50 border border-green-200 rounded-md p-4">
          <p className="text-sm text-green-800">{bidSuccess}</p>
        </div>
      )}

      {bidError && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-sm text-red-800">{bidError}</p>
        </div>
      )}

      {/* Current Item Display */}
      <Card className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900">{currentItem.title}</h2>
            {currentItem.description && (
              <p className="text-gray-600 mt-1">{currentItem.description}</p>
            )}
          </div>
          
          {timeRemaining && (
            <div className="text-right">
              <div className="text-sm text-gray-500">Time Remaining</div>
              <div className={`text-lg font-bold ${timeRemaining < 60000 ? 'text-red-600' : 'text-gray-900'}`}>
                {formatTimeRemaining(timeRemaining)}
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div>
            <div className="text-sm text-gray-500">Starting Bid</div>
            <div className="text-lg font-semibold text-gray-900">
              {formatCurrency(currentItem.startingBid)}
            </div>
          </div>
          
          <div>
            <div className="text-sm text-gray-500">Current High Bid</div>
            <div className="text-lg font-semibold text-green-600">
              {currentHighBid ? formatCurrency(currentHighBid.amount) : 'No bids yet'}
            </div>
          </div>
          
          <div>
            <div className="text-sm text-gray-500">Active Bidders</div>
            <div className="text-lg font-semibold text-blue-600">
              {connectedBidders}
            </div>
          </div>
        </div>

        {/* Bidding Controls */}
        <div className="border-t pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <label htmlFor="bidAmount" className="block text-sm font-medium text-gray-700 mb-2">
                Your Bid Amount
              </label>
              <div className="flex">
                <span className="inline-flex items-center px-3 py-2 border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm rounded-l-md">
                  $
                </span>
                <input
                  ref={bidInputRef}
                  type="number"
                  id="bidAmount"
                  value={bidAmount}
                  onChange={(e) => setBidAmount(e.target.value)}
                  step="0.01"
                  min={currentHighBid ? currentHighBid.amount + (auction.settings?.bidIncrement || 5) : currentItem.startingBid}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-r-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  disabled={isSubmittingBid || !isConnected}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleSubmitBid();
                    }
                  }}
                />
              </div>
            </div>

            <div className="flex flex-col justify-end">
              <div className="flex space-x-2">
                <Button
                  onClick={handleQuickBid}
                  disabled={isSubmittingBid || !isConnected}
                  variant="outline"
                  className="bg-blue-50 border-blue-300 text-blue-700 hover:bg-blue-100"
                >
                  Quick Bid
                  <br />
                  <span className="text-xs">{formatCurrency(getQuickBidAmount())}</span>
                </Button>
                
                <Button
                  onClick={handleSubmitBid}
                  disabled={isSubmittingBid || !isConnected}
                  loading={isSubmittingBid}
                  className="bg-green-600 hover:bg-green-700 min-w-[100px]"
                >
                  {isSubmittingBid ? 'Bidding...' : 'Place Bid'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Recent Bids */}
      <Card className="p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Bids</h3>
        {bidHistory.length > 0 ? (
          <div className="space-y-2">
            {bidHistory.map((bid, index) => (
              <div key={`${bid.bidderId}-${bid.timestamp}`} className={`flex justify-between items-center p-3 rounded-md ${
                index === 0 ? 'bg-green-50 border border-green-200' : 'bg-gray-50'
              }`}>
                <div className="flex items-center space-x-3">
                  <span className={`w-2 h-2 rounded-full ${
                    bid.bidderId === user?.id ? 'bg-blue-500' : 'bg-gray-400'
                  }`}></span>
                  <span className="text-sm font-medium">
                    {bid.bidderId === user?.id ? 'You' : `Bidder #${bid.bidderNumber || '***'}`}
                  </span>
                  {index === 0 && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Leading
                    </span>
                  )}
                </div>
                <div className="text-right">
                  <div className={`font-semibold ${index === 0 ? 'text-green-600' : 'text-gray-900'}`}>
                    {formatCurrency(bid.amount)}
                  </div>
                  <div className="text-xs text-gray-500">
                    {new Date(bid.timestamp).toLocaleTimeString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6">
            <p className="text-gray-500">No bids placed yet. Be the first to bid!</p>
          </div>
        )}
      </Card>
    </div>
  );
}
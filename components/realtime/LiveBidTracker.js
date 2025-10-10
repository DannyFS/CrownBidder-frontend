'use client';

import { useState, useEffect } from 'react';
import { useSocket } from '@/contexts/SocketContext';
import { SOCKET_EVENTS } from '@/lib/constants';
import { formatCurrency } from '@/lib/utils';

export default function LiveBidTracker({ 
  auctionId, 
  itemId = null, 
  maxBids = 5,
  showBidderDetails = false,
  className = '',
  onNewBid
}) {
  const [bids, setBids] = useState([]);
  const [currentHighBid, setCurrentHighBid] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const { socket, addEventListener, joinAuction, leaveAuction } = useSocket();

  useEffect(() => {
    if (socket && auctionId) {
      setIsConnected(socket.connected);
      joinAuction(auctionId);
      
      const cleanupFunctions = [
        addEventListener(SOCKET_EVENTS.BID_PLACED, handleBidPlaced),
        addEventListener(SOCKET_EVENTS.AUCTION_ITEM_CHANGED, handleItemChanged),
        addEventListener('connect', () => setIsConnected(true)),
        addEventListener('disconnect', () => setIsConnected(false)),
      ];

      return () => {
        cleanupFunctions.forEach(cleanup => cleanup());
        leaveAuction(auctionId);
      };
    }
  }, [socket, auctionId]);

  const handleBidPlaced = (data) => {
    if (data.auctionId === auctionId) {
      // If we're tracking a specific item, only show bids for that item
      if (itemId && data.itemId !== itemId) {
        return;
      }

      setBids(prev => [data, ...prev.slice(0, maxBids - 1)]);
      setCurrentHighBid(data);
      
      if (onNewBid) {
        onNewBid(data);
      }
    }
  };

  const handleItemChanged = (data) => {
    if (data.auctionId === auctionId) {
      // Clear bids when item changes if we're tracking a specific item
      if (itemId) {
        setBids([]);
        setCurrentHighBid(null);
      }
    }
  };

  if (!auctionId) {
    return null;
  }

  return (
    <div className={`space-y-2 ${className}`}>
      {/* Connection Status */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-gray-900">Live Bids</h3>
        <div className="flex items-center space-x-1">
          <div className={`w-2 h-2 rounded-full ${
            isConnected ? 'bg-green-400' : 'bg-red-400'
          }`} />
          <span className="text-xs text-gray-500">
            {isConnected ? 'Live' : 'Offline'}
          </span>
        </div>
      </div>

      {/* Current High Bid */}
      {currentHighBid && (
        <div className="bg-green-50 border border-green-200 rounded-md p-3">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-green-900">Current High Bid</div>
              <div className="text-lg font-bold text-green-700">
                {formatCurrency(currentHighBid.amount)}
              </div>
            </div>
            <div className="text-right">
              {showBidderDetails && (
                <div className="text-sm text-green-700">
                  Bidder #{currentHighBid.bidderNumber || '***'}
                </div>
              )}
              <div className="text-xs text-green-600">
                {new Date(currentHighBid.timestamp).toLocaleTimeString()}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bid History */}
      <div className="space-y-1">
        {bids.length > 0 ? (
          bids.map((bid, index) => (
            <div
              key={`${bid.bidderId}-${bid.timestamp}`}
              className={`flex items-center justify-between p-2 rounded-md text-sm ${
                index === 0 
                  ? 'bg-blue-50 border border-blue-200' 
                  : 'bg-gray-50 border border-gray-200'
              }`}
            >
              <div className="flex items-center space-x-2">
                <span className={`w-1.5 h-1.5 rounded-full ${
                  index === 0 ? 'bg-blue-500' : 'bg-gray-400'
                }`} />
                <span className={`font-medium ${
                  index === 0 ? 'text-blue-900' : 'text-gray-700'
                }`}>
                  {formatCurrency(bid.amount)}
                </span>
                {index === 0 && (
                  <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                    Latest
                  </span>
                )}
              </div>
              
              <div className="text-right">
                {showBidderDetails && (
                  <div className="text-xs text-gray-600">
                    Bidder #{bid.bidderNumber || '***'}
                  </div>
                )}
                <div className="text-xs text-gray-500">
                  {new Date(bid.timestamp).toLocaleTimeString()}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-4">
            <p className="text-sm text-gray-500">No bids yet</p>
            {!isConnected && (
              <p className="text-xs text-red-500 mt-1">
                Disconnected - bids may not be visible
              </p>
            )}
          </div>
        )}
      </div>

      {/* Bid Count */}
      {bids.length > 0 && (
        <div className="text-center pt-2 border-t border-gray-200">
          <span className="text-xs text-gray-500">
            {bids.length === maxBids ? `Last ${maxBids}` : bids.length} bid{bids.length !== 1 ? 's' : ''}
            {itemId && ' for this item'}
          </span>
        </div>
      )}
    </div>
  );
}
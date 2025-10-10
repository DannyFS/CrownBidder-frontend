'use client';

import { useState, useEffect } from 'react';
import { useSocket } from '@/contexts/SocketContext';
import { SOCKET_EVENTS, AUCTION_STATUS } from '@/lib/constants';

const statusConfig = {
  [AUCTION_STATUS.DRAFT]: {
    label: 'Draft',
    color: 'bg-gray-100 text-gray-800',
    icon: '📝',
    pulse: false
  },
  [AUCTION_STATUS.SCHEDULED]: {
    label: 'Scheduled',
    color: 'bg-blue-100 text-blue-800',
    icon: '📅',
    pulse: false
  },
  [AUCTION_STATUS.LIVE]: {
    label: 'Live',
    color: 'bg-red-100 text-red-800',
    icon: '🔴',
    pulse: true
  },
  [AUCTION_STATUS.ENDED]: {
    label: 'Ended',
    color: 'bg-gray-100 text-gray-800',
    icon: '✅',
    pulse: false
  },
  [AUCTION_STATUS.PAUSED]: {
    label: 'Paused',
    color: 'bg-yellow-100 text-yellow-800',
    icon: '⏸️',
    pulse: true
  },
};

export default function AuctionStatusIndicator({ 
  auctionId, 
  initialStatus, 
  showLabel = true, 
  size = 'sm',
  onStatusChange 
}) {
  const [status, setStatus] = useState(initialStatus);
  const [isConnected, setIsConnected] = useState(false);
  const { socket, addEventListener, joinAuction, leaveAuction } = useSocket();

  useEffect(() => {
    if (socket && auctionId) {
      setIsConnected(socket.connected);
      joinAuction(auctionId);
      
      const cleanupFunctions = [
        addEventListener(SOCKET_EVENTS.AUCTION_STATUS_CHANGED, handleStatusChange),
        addEventListener(SOCKET_EVENTS.AUCTION_STARTED, handleAuctionStarted),
        addEventListener(SOCKET_EVENTS.AUCTION_ENDED, handleAuctionEnded),
        addEventListener('connect', () => setIsConnected(true)),
        addEventListener('disconnect', () => setIsConnected(false)),
      ];

      return () => {
        cleanupFunctions.forEach(cleanup => cleanup());
        leaveAuction(auctionId);
      };
    }
  }, [socket, auctionId]);

  const handleStatusChange = (data) => {
    if (data.auctionId === auctionId) {
      setStatus(data.status);
      if (onStatusChange) {
        onStatusChange(data.status);
      }
    }
  };

  const handleAuctionStarted = (data) => {
    if (data.auctionId === auctionId) {
      setStatus(AUCTION_STATUS.LIVE);
      if (onStatusChange) {
        onStatusChange(AUCTION_STATUS.LIVE);
      }
    }
  };

  const handleAuctionEnded = (data) => {
    if (data.auctionId === auctionId) {
      setStatus(AUCTION_STATUS.ENDED);
      if (onStatusChange) {
        onStatusChange(AUCTION_STATUS.ENDED);
      }
    }
  };

  const config = statusConfig[status] || statusConfig[AUCTION_STATUS.DRAFT];
  
  const sizeClasses = {
    xs: 'px-2 py-1 text-xs',
    sm: 'px-3 py-1 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  };

  return (
    <div className="relative inline-flex items-center">
      <span className={`inline-flex items-center rounded-full font-medium ${config.color} ${sizeClasses[size]} ${
        config.pulse ? 'animate-pulse' : ''
      }`}>
        <span className="mr-1">{config.icon}</span>
        {showLabel && config.label}
      </span>
      
      {/* Connection indicator - small dot */}
      {auctionId && (
        <span className={`absolute -top-1 -right-1 w-2 h-2 rounded-full ${
          isConnected ? 'bg-green-400' : 'bg-gray-400'
        }`} title={isConnected ? 'Real-time connected' : 'Disconnected'} />
      )}
    </div>
  );
}
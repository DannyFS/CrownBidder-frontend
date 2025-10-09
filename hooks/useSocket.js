'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { io } from 'socket.io-client';
import { SOCKET_URL, SOCKET_EVENTS } from '@/lib/constants';
import { useAuth } from './useAuth';

export function useSocket() {
  const { user } = useAuth();
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState(null);
  const socketRef = useRef(null);

  // Initialize socket connection
  useEffect(() => {
    if (!user) return;

    const token = localStorage.getItem('crown_bidder_token');
    if (!token) return;

    const socketInstance = io(SOCKET_URL, {
      auth: { token },
      transports: ['websocket', 'polling'],
    });

    socketInstance.on('connect', () => {
      console.log('Socket connected:', socketInstance.id);
      setIsConnected(true);
      setError(null);
    });

    socketInstance.on('disconnect', () => {
      console.log('Socket disconnected');
      setIsConnected(false);
    });

    socketInstance.on('error', (err) => {
      console.error('Socket error:', err);
      setError(err.message);
    });

    socketRef.current = socketInstance;
    setSocket(socketInstance);

    return () => {
      if (socketInstance) {
        socketInstance.disconnect();
      }
    };
  }, [user]);

  // Join site room
  const joinSite = useCallback((siteId) => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit(SOCKET_EVENTS.JOIN_SITE, { siteId });
    }
  }, [isConnected]);

  // Join auction room
  const joinAuction = useCallback((siteId, auctionId) => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit(SOCKET_EVENTS.JOIN_AUCTION, { siteId, auctionId });
    }
  }, [isConnected]);

  // Place bid
  const placeBid = useCallback((auctionId, itemIndex, amount) => {
    return new Promise((resolve, reject) => {
      if (!socketRef.current || !isConnected) {
        reject(new Error('Socket not connected'));
        return;
      }

      socketRef.current.emit(SOCKET_EVENTS.BID_PLACE, {
        auctionId,
        itemIndex,
        amount,
        bidType: 'online',
      });

      // Listen for confirmation or error
      const confirmHandler = (data) => {
        socketRef.current.off(SOCKET_EVENTS.BID_CONFIRMED, confirmHandler);
        socketRef.current.off(SOCKET_EVENTS.BID_ERROR, errorHandler);
        resolve(data);
      };

      const errorHandler = (error) => {
        socketRef.current.off(SOCKET_EVENTS.BID_CONFIRMED, confirmHandler);
        socketRef.current.off(SOCKET_EVENTS.BID_ERROR, errorHandler);
        reject(error);
      };

      socketRef.current.once(SOCKET_EVENTS.BID_CONFIRMED, confirmHandler);
      socketRef.current.once(SOCKET_EVENTS.BID_ERROR, errorHandler);
    });
  }, [isConnected]);

  // Subscribe to event
  const on = useCallback((event, handler) => {
    if (socketRef.current) {
      socketRef.current.on(event, handler);
    }
  }, []);

  // Unsubscribe from event
  const off = useCallback((event, handler) => {
    if (socketRef.current) {
      socketRef.current.off(event, handler);
    }
  }, []);

  // Emit event
  const emit = useCallback((event, data) => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit(event, data);
    }
  }, [isConnected]);

  return {
    socket,
    isConnected,
    error,
    joinSite,
    joinAuction,
    placeBid,
    on,
    off,
    emit,
  };
}

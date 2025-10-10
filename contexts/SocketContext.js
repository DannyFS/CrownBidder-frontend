'use client';

import { createContext, useContext, useEffect, useState, useRef } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from '@/hooks/useAuth';
import { SOCKET_URL, SOCKET_EVENTS } from '@/lib/constants';

const SocketContext = createContext();

export function SocketProvider({ children }) {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState(null);
  const [joinedRooms, setJoinedRooms] = useState(new Set());
  const { user, token } = useAuth();
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;

  useEffect(() => {
    if (user && token) {
      initializeSocket();
    } else {
      disconnectSocket();
    }

    return () => {
      disconnectSocket();
    };
  }, [user, token]);

  const initializeSocket = () => {
    try {
      const socketInstance = io(SOCKET_URL, {
        auth: {
          token,
          userId: user?.id,
          siteId: user?.siteId,
        },
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionAttempts: maxReconnectAttempts,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        timeout: 20000,
      });

      // Connection event handlers
      socketInstance.on('connect', () => {
        console.log('Socket connected:', socketInstance.id);
        setIsConnected(true);
        setConnectionError(null);
        reconnectAttempts.current = 0;
      });

      socketInstance.on('disconnect', (reason) => {
        console.log('Socket disconnected:', reason);
        setIsConnected(false);
        setJoinedRooms(new Set());
      });

      socketInstance.on('connect_error', (error) => {
        console.error('Socket connection error:', error);
        setConnectionError(error.message);
        reconnectAttempts.current += 1;
        
        if (reconnectAttempts.current >= maxReconnectAttempts) {
          setConnectionError('Unable to connect to auction server. Please refresh the page.');
        }
      });

      // Room join confirmations
      socketInstance.on(SOCKET_EVENTS.JOINED_SITE, (data) => {
        console.log('Joined site room:', data.siteId);
        setJoinedRooms(prev => new Set([...prev, `site:${data.siteId}`]));
      });

      socketInstance.on(SOCKET_EVENTS.JOINED_AUCTION, (data) => {
        console.log('Joined auction room:', data.auctionId);
        setJoinedRooms(prev => new Set([...prev, `auction:${data.auctionId}`]));
      });

      // Error handling
      socketInstance.on('error', (error) => {
        console.error('Socket error:', error);
        setConnectionError(error.message);
      });

      setSocket(socketInstance);
    } catch (error) {
      console.error('Failed to initialize socket:', error);
      setConnectionError('Failed to initialize connection');
    }
  };

  const disconnectSocket = () => {
    if (socket) {
      socket.disconnect();
      setSocket(null);
      setIsConnected(false);
      setJoinedRooms(new Set());
      setConnectionError(null);
    }
  };

  const joinSite = (siteId) => {
    if (socket && isConnected) {
      socket.emit(SOCKET_EVENTS.JOIN_SITE, { siteId });
    }
  };

  const joinAuction = (auctionId) => {
    if (socket && isConnected) {
      socket.emit(SOCKET_EVENTS.JOIN_AUCTION, { auctionId });
    }
  };

  const leaveSite = (siteId) => {
    if (socket && isConnected) {
      socket.emit('leave:site', { siteId });
      setJoinedRooms(prev => {
        const newSet = new Set(prev);
        newSet.delete(`site:${siteId}`);
        return newSet;
      });
    }
  };

  const leaveAuction = (auctionId) => {
    if (socket && isConnected) {
      socket.emit('leave:auction', { auctionId });
      setJoinedRooms(prev => {
        const newSet = new Set(prev);
        newSet.delete(`auction:${auctionId}`);
        return newSet;
      });
    }
  };

  const placeBid = (auctionId, itemId, bidAmount) => {
    if (socket && isConnected) {
      return new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error('Bid timeout - server did not respond'));
        }, 10000);

        socket.emit(SOCKET_EVENTS.BID_PLACE, {
          auctionId,
          itemId,
          bidAmount,
          timestamp: Date.now(),
        });

        // Listen for bid confirmation
        const handleBidConfirmed = (data) => {
          if (data.itemId === itemId) {
            clearTimeout(timeout);
            socket.off(SOCKET_EVENTS.BID_CONFIRMED, handleBidConfirmed);
            socket.off(SOCKET_EVENTS.BID_ERROR, handleBidError);
            resolve(data);
          }
        };

        const handleBidError = (data) => {
          if (data.itemId === itemId) {
            clearTimeout(timeout);
            socket.off(SOCKET_EVENTS.BID_CONFIRMED, handleBidConfirmed);
            socket.off(SOCKET_EVENTS.BID_ERROR, handleBidError);
            reject(new Error(data.message || 'Bid failed'));
          }
        };

        socket.on(SOCKET_EVENTS.BID_CONFIRMED, handleBidConfirmed);
        socket.on(SOCKET_EVENTS.BID_ERROR, handleBidError);
      });
    } else {
      return Promise.reject(new Error('Not connected to auction server'));
    }
  };

  const quickBid = (auctionId, itemId) => {
    if (socket && isConnected) {
      socket.emit(SOCKET_EVENTS.BID_QUICK, {
        auctionId,
        itemId,
        timestamp: Date.now(),
      });
    }
  };

  // Auctioneer controls
  const startAuction = (auctionId) => {
    if (socket && isConnected) {
      socket.emit(SOCKET_EVENTS.AUCTION_START, { auctionId });
    }
  };

  const endAuction = (auctionId) => {
    if (socket && isConnected) {
      socket.emit(SOCKET_EVENTS.AUCTION_END, { auctionId });
    }
  };

  const pauseAuction = (auctionId) => {
    if (socket && isConnected) {
      socket.emit(SOCKET_EVENTS.AUCTION_PAUSE, { auctionId });
    }
  };

  const nextItem = (auctionId, itemId) => {
    if (socket && isConnected) {
      socket.emit(SOCKET_EVENTS.AUCTION_NEXT_ITEM, { auctionId, itemId });
    }
  };

  const broadcastMessage = (auctionId, message) => {
    if (socket && isConnected) {
      socket.emit(SOCKET_EVENTS.ADMIN_BROADCAST, { auctionId, message });
    }
  };

  // Event listener management
  const addEventListener = (event, handler) => {
    if (socket) {
      socket.on(event, handler);
      return () => socket.off(event, handler);
    }
    return () => {};
  };

  const removeEventListener = (event, handler) => {
    if (socket) {
      socket.off(event, handler);
    }
  };

  const contextValue = {
    socket,
    isConnected,
    connectionError,
    joinedRooms: Array.from(joinedRooms),
    
    // Room management
    joinSite,
    joinAuction,
    leaveSite,
    leaveAuction,
    
    // Bidding
    placeBid,
    quickBid,
    
    // Auctioneer controls
    startAuction,
    endAuction,
    pauseAuction,
    nextItem,
    broadcastMessage,
    
    // Event management
    addEventListener,
    removeEventListener,
    
    // Connection management
    reconnect: initializeSocket,
    disconnect: disconnectSocket,
  };

  return (
    <SocketContext.Provider value={contextValue}>
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket() {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
}

export default SocketContext;
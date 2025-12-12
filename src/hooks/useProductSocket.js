import { useEffect, useRef } from 'react';
import { createSocketInstance } from '@/lib/socket';

/**
 * Custom hook to manage socket connection for product detail page
 * Handles join/leave product room, price updates, and bid history updates
 * 
 * @param {string} productId - Product ID to listen for
 * @param {function} onPriceUpdate - Callback when price updates (receives data object)
 * @param {function} onBidHistoryUpdate - Callback when bid history updates (receives bids array)
 * @param {function} onConnectionEstablished - Callback when socket connects
 * @param {function} onConnectionError - Callback on socket error
 */
export const useProductSocket = (
  productId,
  onPriceUpdate,
  onBidHistoryUpdate,
  onConnectionEstablished,
  onConnectionError
) => {
  const socketRef = useRef(null);
  const shouldJoinRef = useRef(true);

  useEffect(() => {
    if (!productId || !shouldJoinRef.current) return;

    // Create socket instance
    const socket = createSocketInstance(true);
    socketRef.current = socket;

    // Handle successful connection
    socket.on('connect', () => {
      console.log('✅ Socket connected:', socket.id);
      
      // Join product room
      socket.emit('join_product_room', { productId: parseInt(productId) });
      
      // Notify parent component
      if (onConnectionEstablished) {
        onConnectionEstablished();
      }
    });

    // Handle room join confirmation
    socket.on('room_joined', (data) => {
      console.log('Joined room:', data.room);
    });

    // Handle price detail updates
    socket.on('update_price_detail', (data) => {
      console.log('💰 Price update received:', data);
      
      if (onPriceUpdate) {
        onPriceUpdate(data);
      }
    });

    // Handle bid history updates
    socket.on('bid_history_update', (data) => {
      console.log('📋 Bid history update received:', data);
      
      if (onBidHistoryUpdate && data.bids) {
        onBidHistoryUpdate(data.bids);
      }
    });

    // Handle disconnect
    socket.on('disconnect', () => {
      console.log('❌ Socket disconnected');
    });

    // Handle reconnection
    socket.on('reconnect', () => {
      console.log('✅ Socket reconnected');
      
      // Re-join product room after reconnection
      socket.emit('join_product_room', { productId: parseInt(productId) });
    });

    // Handle reconnection attempt
    socket.io.on('reconnect_attempt', () => {
      console.log('🔄 Attempting to reconnect...');
    });

    // Handle errors
    socket.on('error', (error) => {
      console.error('⚠️ Socket error:', error);
      
      if (onConnectionError) {
        onConnectionError(error);
      }
    });

    socket.on('connect_error', (error) => {
      console.error('Connection error:', error);
      
      if (onConnectionError) {
        onConnectionError(error);
      }
    });

    // Cleanup on unmount
    return () => {
      if (socketRef.current) {
        // Leave product room before disconnecting
        socketRef.current.emit('leave_product_room', { 
          productId: parseInt(productId) 
        });
        
        // Disconnect socket
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [productId, onPriceUpdate, onBidHistoryUpdate, onConnectionEstablished, onConnectionError]);
};

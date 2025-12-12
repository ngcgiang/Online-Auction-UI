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
  const callbacksRef = useRef({
    onPriceUpdate,
    onBidHistoryUpdate,
    onConnectionEstablished,
    onConnectionError,
  });

  // Update callback refs when callbacks change (without causing re-render)
  useEffect(() => {
    callbacksRef.current = {
      onPriceUpdate,
      onBidHistoryUpdate,
      onConnectionEstablished,
      onConnectionError,
    };
  }, [onPriceUpdate, onBidHistoryUpdate, onConnectionEstablished, onConnectionError]);

  useEffect(() => {
    if (!productId) return;

    // Create socket instance
    const socket = createSocketInstance(true);
    socketRef.current = socket;

    // Handle successful connection
    socket.on('connect', () => {
      console.log('✅ Socket connected:', socket.id);
      
      // Join product room
      const parsedProductId = parseInt(productId);
      console.log('🚀 Joining product room:', parsedProductId);
      socket.emit('join_product_room', { productId: parsedProductId });
      
      // Notify parent component
      if (callbacksRef.current.onConnectionEstablished) {
        callbacksRef.current.onConnectionEstablished();
      }
    });

    // Handle room join confirmation
    socket.on('room_joined', (data) => {
      console.log('✅ Joined room successfully:', data.room);
    });

    // Handle price detail updates
    socket.on('update_price_detail', (data) => {
      console.log('💰 Real-time price update received:', data);
      
      if (callbacksRef.current.onPriceUpdate && data) {
        callbacksRef.current.onPriceUpdate(data);
      }
    });

    // Handle bid history updates - CRITICAL: Get bids from correct path
    socket.on('bid_history_update', (data) => {
      console.log('📋 Real-time bid history update received:', data);
      
      // Extract bids array - handle both nested and flat structures
      const bidsArray = Array.isArray(data) ? data : data?.bids;
      
      if (callbacksRef.current.onBidHistoryUpdate && Array.isArray(bidsArray)) {
        console.log(`  ✓ Updating with ${bidsArray.length} bids`);
        callbacksRef.current.onBidHistoryUpdate(bidsArray);
      } else {
        console.warn('⚠️ Invalid bid history data structure:', data);
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
      const parsedProductId = parseInt(productId);
      socket.emit('join_product_room', { productId: parsedProductId });
    });

    // Handle reconnection attempt
    socket.io.on('reconnect_attempt', () => {
      console.log('🔄 Attempting to reconnect...');
    });

    // Handle errors
    socket.on('error', (error) => {
      console.error('⚠️ Socket error:', error);
      
      if (callbacksRef.current.onConnectionError) {
        callbacksRef.current.onConnectionError(error);
      }
    });

    socket.on('connect_error', (error) => {
      console.error('⚠️ Connection error:', error);
      
      if (callbacksRef.current.onConnectionError) {
        callbacksRef.current.onConnectionError(error);
      }
    });

    // Cleanup on unmount
    return () => {
      if (socketRef.current) {
        console.log('🧹 Cleaning up socket connection');
        
        // Leave product room before disconnecting
        const parsedProductId = parseInt(productId);
        socketRef.current.emit('leave_product_room', { 
          productId: parsedProductId 
        });
        
        // Disconnect socket
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [productId]); // ← FIXED: Only depend on productId, not callbacks
};

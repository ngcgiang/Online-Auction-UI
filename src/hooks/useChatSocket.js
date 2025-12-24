import { useEffect, useRef, useCallback } from 'react';
import { createSocketInstance } from '@/lib/socket';

/**
 * Custom hook to manage socket connection for chat
 * Handles join/leave chat room and message sending/receiving
 * 
 * @param {number} productId - Product ID to open chat for
 * @param {function} onChatRoomJoined - Callback when room is joined (receives data with chatHistory)
 * @param {function} onNewMessage - Callback when new message arrives (receives message object)
 * @param {function} onError - Callback on socket error (receives error data)
 * @returns {object} Socket instance and utility functions
 */
export const useChatSocket = (
  productId,
  onChatRoomJoined,
  onNewMessage,
  onError
) => {
  const socketRef = useRef(null);
  const callbacksRef = useRef({
    onChatRoomJoined,
    onNewMessage,
    onError,
  });

  // Update callback refs when callbacks change
  useEffect(() => {
    callbacksRef.current = {
      onChatRoomJoined,
      onNewMessage,
      onError,
    };
  }, [onChatRoomJoined, onNewMessage, onError]);

  // Initialize socket connection and join chat room
  useEffect(() => {
    if (!productId) return;

    const socket = createSocketInstance(true);
    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('✅ Chat socket connected:', socket.id);
      // Join the chat room for this product
      socket.emit('join_chat_room', { productId });
    });

    socket.on('chat_room_joined', (data) => {
      console.log('💬 Joined chat room:', data);
      callbacksRef.current.onChatRoomJoined?.(data);
    });

    socket.on('new_message', (data) => {
      console.log('📨 New message received:', data);
      callbacksRef.current.onNewMessage?.(data);
    });

    socket.on('chat_error', (data) => {
      console.error('❌ Chat error:', data);
      callbacksRef.current.onError?.(data);
    });

    socket.on('chat_room_left', (data) => {
      console.log('👋 Left chat room:', data);
    });

    socket.on('disconnect', () => {
      console.log('❌ Chat socket disconnected');
    });

    socket.on('connect_error', (error) => {
      console.error('❌ Socket connection error:', error);
      callbacksRef.current.onError?.({
        error: 'Connection error: ' + error.message,
        requiresLogin: false
      });
    });

    return () => {
      if (socket && socket.connected) {
        socket.emit('leave_chat_room', { productId });
        socket.disconnect();
      }
    };
  }, [productId]);

  // Send message via socket
  const sendMessage = useCallback((content) => {
    if (!socketRef.current?.connected) {
      console.error('Socket is not connected');
      return false;
    }

    if (!productId || !content?.trim()) {
      console.error('Invalid message or product ID');
      return false;
    }

    socketRef.current.emit('send_message', {
      productId,
      content: content.trim()
    });

    return true;
  }, [productId]);

  return {
    socket: socketRef.current,
    sendMessage,
    isConnected: socketRef.current?.connected ?? false
  };
};

export default useChatSocket;

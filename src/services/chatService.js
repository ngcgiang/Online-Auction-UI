import apiClient from '@/lib/axios';

/**
 * Chat Service
 * Handles all chat-related API calls
 */

/**
 * Get list of all chat rooms for the current user
 * @returns {Promise} Response with array of chat rooms
 */
export const getChatRooms = async () => {
  try {
    const response = await apiClient.get('/api/chat/rooms');
    return response;
  } catch (error) {
    console.error('Error fetching chat rooms:', error);
    throw error;
  }
};

/**
 * Get chat history for a specific product
 * @param {number} productId - The product ID to fetch chat history for
 * @param {number} limit - Optional limit for number of messages (default: 50)
 * @returns {Promise} Response with chat history and product info
 */
export const getChatHistory = async (productId, limit = 50) => {
  try {
    const response = await apiClient.get(`/api/chat/${productId}/history`, {
      params: {
        limit: limit
      }
    });
    return response;
  } catch (error) {
    console.error(`Error fetching chat history for product ${productId}:`, error);
    throw error;
  }
};

export default {
  getChatRooms,
  getChatHistory
};

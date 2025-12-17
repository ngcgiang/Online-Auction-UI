import apiClient from '@/lib/axios';

/**
 * Watch List Service
 * Handles all watch list-related API calls
 */

// Get watch list for a specific user
export const getWatchListByUserId = async (userId) => {
  return apiClient.get(`/api/watchlist/${userId}`);
};

// Add a product to user's watch list
export const addToWatchList = async (userId, productId) => {
  return apiClient.post(`/api/watchlist/add`, {
    user_id: userId,
    product_id: productId,
  });
}

// Remove a product from user's watch list
export const removeFromWatchList = async (userId, productId) => {
  return apiClient.delete(`/api/watchlist/remove`, {
    data: { user_id: userId, product_id: productId },
  });
}
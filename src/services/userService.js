import apiClient from '@/lib/axios';
/**
 * User Service
 * Handles all user-related API calls
 */
// Get user profile by user ID
export const getUserProfile = async () => {
  return apiClient.get(`/api/users/profile`);
}

// Request user upgrade to seller
export const requestUserUpgrade = async () => {
  return apiClient.post(`/api/seller/request-upgrade`);
}

export const updateUserProfile = async (data) => {
  return apiClient.patch(`/api/users/update-info`, data);
}

export const changeUserPassword = async (data) => {
  return apiClient.patch(`/api/users/change-password`, data);
}

export const getUserRatings = async () => {
  return apiClient.get(`/api/users/ratings`);
}

export const getWatchList = async () => {
  return apiClient.get(`/api/users/watchlist`);
}

export const getBiddedProducts = async () => {
  return apiClient.get(`/api/users/bidded-product`);
}

export const getWonProducts = async () => {
  return apiClient.get(`/api/users/won-products`);
}

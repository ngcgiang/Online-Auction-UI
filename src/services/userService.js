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
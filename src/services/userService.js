import apiClient from '@/lib/axios';
/**
 * User Service
 * Handles all user-related API calls
 */
// Get user profile by user ID
export const getUserProfile = async () => {
  return apiClient.get(`/api/users/profile`);
}
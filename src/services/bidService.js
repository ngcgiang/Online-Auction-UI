import apiClient from '@/lib/axios';

/**
 * Get bids history for a specific product
 */
export const getBidsByProductId = async (productId) => {
  return apiClient.get(`/api/bids/history/${productId}`);
};
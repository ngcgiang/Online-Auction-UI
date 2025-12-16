import apiClient from '@/lib/axios';

/**
 * Get bids history for a specific product
 */
export const getBidsByProductId = async (productId) => {
  return apiClient.get(`/api/bids/history/${productId}`);
};

/**
 * Place a new bid on a product
 */
export const placeBid = async (productId, amount) => {
  return apiClient.post(`/api/bids`, {
    productId,
    amount,
  });
}
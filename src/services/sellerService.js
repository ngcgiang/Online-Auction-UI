import apiClient from '@/lib/axios';
/*
* Seller Service
* Handles all seller-related API calls
*/

// Get bidders for a specific product
export const getBiddersByProductId = async (productId) => {
  return apiClient.get(`/api/seller/products/${productId}/bidders`);
}

// Refuse a bidder from a specific product
export const refuseBidder = async (productId, bidderId) => {
  return apiClient.post(`/api/products/${productId}/refuse-bidder`, { bidder_id: bidderId });
}
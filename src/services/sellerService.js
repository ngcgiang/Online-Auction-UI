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

// Get refused bidders for a specific product
export const getRefusedBiddersByProductId = async (productId) => {
  return apiClient.get(`/api/seller/products/${productId}/refused-bidders`);
}

// Get products active for a specific seller
export const getProductsBySellerId = async () => {
  return apiClient.get(`/api/seller/products`);
}

// Get expired products for a specific seller
export const getExpiredProductsBySellerId = async () => {
  return apiClient.get(`/api/seller/products/ended`);
}
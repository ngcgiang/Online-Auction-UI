import apiClient from '../lib/axios';
//* Order Service
// Handles all order-related API calls
const API_BASE_URL = '/api/orders';

/** Get order status by product ID 
 * @param {number} productId - ID of the product
 * @returns {Promise<Object>} Order status
 */
export const getOrderStatusByProductId = async (productId) => {
  return apiClient.get(`${API_BASE_URL}/status/${productId}`);
}
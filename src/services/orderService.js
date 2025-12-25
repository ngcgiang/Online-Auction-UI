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

/** Cancel order by product ID
 * @param {number} productId - ID of the product
 * @returns {Promise<Object>} Cancellation response
 */
export const cancelOrderByProductId = async (productId) => {
  return apiClient.post(`${API_BASE_URL}/cancel/`, 
    { product_id: productId }
  );
}

/** Mark shipped by product ID
 * @param {number} productId - ID of the product
 * 
 */
export const markShippedByProductId = async (productId) => {
  return apiClient.put(`${API_BASE_URL}/shipped/`,
    { product_id: productId }
  );
}

/** Mark delivered by product ID
 * @param {number} productId - ID of the product
 * 
 */
export const markDeliveredByProductId = async (productId) => {
  return apiClient.put(`${API_BASE_URL}/delivered/`,
    { product_id: productId }
  );
}
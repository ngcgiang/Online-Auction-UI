import apiClient from '@/lib/axios';
/**
 * QnA Service
 * Handles all QnA-related API calls
 */

// Get QnA for a specific product
export const getQnAByProductId = async (productId) => {
  return apiClient.get(`/api/qna/${productId}`);
}

// Submit a new question for a product
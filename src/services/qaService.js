import apiClient from '@/lib/axios';
/**
 * QnA Service
 * Handles all QnA-related API calls
 */

// Get QnA for a specific product
export const getQnAByProductId = async (productId) => {
  return apiClient.get(`/api/qa/${productId}`);
}

export const postComment = async (questionData) => {
  return apiClient.post('/api/qa/', questionData);
}

// Submit a new question for a product
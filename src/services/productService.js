import apiClient from '@/lib/axios';

/**
 * Product Service
 * Handles all product-related API calls
 */

// Search products with filters and pagination
export const searchProducts = async (params = {}) => {
  const queryParams = new URLSearchParams();
  
  if (params.keyword) queryParams.append('keyword', params.keyword);
  if (params.category) queryParams.append('category', params.category);
  if (params.page) queryParams.append('page', params.page);
  if (params.pageSize) queryParams.append('pageSize', params.pageSize);
  if (params.sortBy) queryParams.append('sortBy', params.sortBy);
  if (params.newMinutes) queryParams.append('newMinutes', params.newMinutes);
  
  return apiClient.get(`/api/products/search?${queryParams.toString()}`);
};

// Get products by category
export const getProductsByCategory = async (params = {}) => {
  const queryParams = new URLSearchParams();
  if (params.category) queryParams.append('category', params.category);
  if (params.page) queryParams.append('page', params.page);
  if (params.pageSize) queryParams.append('pageSize', params.pageSize);
  return apiClient.get(`/api/products?${queryParams.toString()}`);
};

// Get top value products (highest price)
export const getTopValueProducts = async () => {
  return apiClient.get('/api/products/top-value');
};

// Get top products with least time left (ending soon)
export const getTopLeastTimeLeft = async () => {
  return apiClient.get('/api/products/top-least-time-left');
};

// Get top most bidded products
export const getTopMostBidded = async () => {
  return apiClient.get('/api/products/top-most-bidded');
};

// Get product by ID (basic info)
export const getProductById = async (productId) => {
  return apiClient.get(`/api/products/${productId}`);
};

// Get product details (full info with seller, winner, images, etc.)
export const getProductDetails = async (productId) => {
  return apiClient.get(`/api/products/${productId}/details`);
};

// Create new product (requires seller role)
export const createProduct = async (productData) => {
  return apiClient.post('/api/products', productData);
};

// Append product description (seller only)
export const appendProductDescription = async (productId, content) => {
  return apiClient.post(`/api/products/${productId}/updates`, { content });
};

// Get product questions and answers
export const getProductQnA = async (productId) => {
  return apiClient.get(`/api/qa/${productId}`);
};

// Get 5 related products based on category
export const getRelatedProducts = async (productId) => {
    return apiClient.get(`/api/products/related/${productId}`);
};

/**
 * Utility function to format product data from API response
 */
export const formatProductData = (product) => {
  return {
    id: product.product_id,
    name: product.product_name,
    currentPrice: product.current_price,
    startPrice: product.start_price,
    buyNowPrice: product.buy_now_price,
    startTime: product.start_time,
    endTime: product.end_time,
    categoryId: product.category_id,
    sellerId: product.seller_id,
    winnerId: product.winner_id,
    status: product.status,
    bidCount: product.bid_count || 0,
    isNew: product.is_new || false,
    createdAt: product.created_at,
    updatedAt: product.updated_at,
  };
};

/**
 * Calculate time remaining for product
 */
export const calculateTimeRemaining = (endTime) => {
  const now = new Date();
  const end = new Date(endTime);
  const diff = end - now;
  
  if (diff <= 0) {
    return { text: 'Đã kết thúc', isEnded: true };
  }
  
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  
  if (days > 0) {
    return { text: `${days} ngày ${hours} giờ`, isEnded: false };
  } else if (hours > 0) {
    return { text: `${hours} giờ ${minutes} phút`, isEnded: false };
  } else {
    return { text: `${minutes} phút`, isEnded: false };
  }
};

/**
 * Format price to VND currency
 */
export const formatPrice = (price) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(price);
};

/**
 * Count product status from product list
 * @param {Array} products - Array of product objects
 * @returns {Object} - { expired, sold, active }
 */
export const countProductStatus = (products = []) => {
  const statusCount = { expired: 0, sold: 0, active: 0 };
  products.forEach((p) => {
    // Chuẩn hóa status về chữ thường và loại bỏ dấu cách
    const status = (p.status || '').toString().trim().toLowerCase();
    if (['expired', 'het_han', 'hết hạn', 'da_het_han', 'đã hết hạn'].includes(status)) {
      statusCount.expired++;
    } else if (['sold', 'da_ban', 'đã bán'].includes(status)) {
      statusCount.sold++;
    } else if (['active', 'dang_hoat_dong', 'đang hoạt động'].includes(status)) {
      statusCount.active++;
    }
  });
  return statusCount;
};
import apiClient from '@/lib/axios';

/**
 * Product Service
 * Handles all product-related API calls
 */

// Get all products with optional pagination
export const getAllProducts = async (page = 1, pageSize = 10) => {
  const queryParams = new URLSearchParams();
  queryParams.append('page', page);
  queryParams.append('pageSize', pageSize);
  return apiClient.get(`/api/products?${queryParams.toString()}`);
};

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
// export const createProduct... (tên hàm của bạn)
export const createProduct = async (formData) => {
  // Tham số thứ 3 của axios.post là config object
  return apiClient.post('/api/products', formData, {
    headers: {
      // QUAN TRỌNG: Dòng này sẽ ghi đè 'application/json' mặc định
      'Content-Type': 'multipart/form-data', 
    },
  });
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
    permission: product.permission,
    bidCount: product.bidCount || 0,
    isNew: product.isNew || false,
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

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

/**
 * Fetch products from API with pagination
 * @param {number} page - Current page number (default: 1)
 * @param {number} pageSize - Number of items per page (default: 12)
 * @returns {Promise<Object>} Response object with structure:
 * {
 *   data: Product[],
 *   pagination: {
 *     currentPage: number,
 *     pageSize: number,
 *     totalItems: number,
 *     totalPages: number,
 *     hasNextPage: boolean,
 *     hasPrevPage: boolean
 *   }
 * }
 */
export const fetchProducts = async (page = 1, pageSize = 12) => {
  try {
    const response = await fetch(
      `${BASE_URL}/api/products?page=${page}&pageSize=${pageSize}`
    );
    if (!response.ok) {
      throw new Error('Failed to fetch products');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching products:', error);
    throw error;
  }
};

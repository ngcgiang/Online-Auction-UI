import apiClient from '@/lib/axios';

/**
 * Category Service
 * Handles all category-related API calls
 */

// Get all categories
export const getCategories = async () => {
  return apiClient.get('/api/categories');
};

/**
 * Organize flat category list into hierarchical structure
 */
export const organizeCategoriesHierarchy = (categories) => {
  if (!Array.isArray(categories)) return [];
  
  const categoryMap = new Map();
  const roots = [];

  // First pass: create map of all categories
  categories.forEach(cat => {
    categoryMap.set(cat.category_id, { ...cat, children: [] });
  });

  // Second pass: build hierarchy
  categories.forEach(cat => {
    if (cat.parent_id === null) {
      roots.push(categoryMap.get(cat.category_id));
    } else {
      const parent = categoryMap.get(cat.parent_id);
      if (parent) {
        parent.children.push(categoryMap.get(cat.category_id));
      }
    }
  });

  return roots;
};

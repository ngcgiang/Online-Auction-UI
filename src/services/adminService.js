import apiClient from '@/lib/axios';
/**
 * Admin Service
 * Handles all admin-related API calls
 * /
 * 
 * Approve upgrade request for a user
 */
export const approveUserUpgrade = async (userId) => {
  return apiClient.post(`/api/admin/approve-upgrade`, { userId });
}

/** Get all upgrade requests */
export const getUpgradeRequests = async () => {
  return apiClient.get(`/api/admin/pending-requests`);
}

/** Reject upgrade request for a user
 */
export const rejectUserUpgrade = async (userId) => {
  return apiClient.post(`/api/admin/reject-upgrade`, { userId });
}

/** Get all users */
export const getAllUsers = async () => {
  return apiClient.get(`/api/admin/get-all-users`);
}

/** Create new category */
export const createNewCategory = async (categoryData) => {
    return apiClient.post(`/api/admin/new-category`, categoryData);
}

/** Delete category */
export const deleteCategory = async (categoryId) => {
    return apiClient.delete(`/api/admin/delete-category/${categoryId}`);
}

/** Delete user */
export const deleteUser = async (userId) => {
    return apiClient.delete(`/api/admin/delete-user/${userId}`);
}

/** Delete product */
export const deleteProduct = async (productId) => {
    return apiClient.delete(`/api/admin/delete-product/${productId}`);
}

/** Get total income */
export const getTotalIncome = async () => {
    return apiClient.get(`/api/admin/total-income`);
}

/** Get new users */
export const getNewUsers = async () => {
    return apiClient.get(`/api/admin/new-users`);
}

/** Get total orders */
export const getTotalOrders = async () => {
    return apiClient.get(`/api/admin/total-orders`);
}

/** Get monthly income */
export const getMonthlyIncome = async () => {
    return apiClient.get(`/api/admin/monthly-income`);
}
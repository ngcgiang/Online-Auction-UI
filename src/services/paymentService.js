import apiClient from '../lib/axios';

const API_BASE_URL = '/api/payments';

/**
 * Step 1: Tạo Payment Intent
 * @param {Object} paymentData - Thông tin thanh toán
 * @returns {Promise<Object>} clientSecret và paymentIntentId
 */
export const createPaymentIntent = async (paymentData) => {
  try {
    const response = await apiClient.post(
      `${API_BASE_URL}/create-payment-intent`,
      {
        productId: paymentData.productId,
        totalAmount: paymentData.totalAmount, // VND
        shippingAddress: paymentData.shippingAddress,
        paymentMethod: 'Stripe',
      }
    );

    if (response.success) {
      return response.data; // { clientSecret, paymentIntentId, orderId, ... }
    } else {
      throw new Error(response.error || 'Failed to create payment intent');
    }
  } catch (error) {
    console.error('Error creating payment intent:', error);
    throw error;
  }
};

/**
 * Step 2: Xác Nhận Thanh Toán
 * @param {string} paymentIntentId - ID của Stripe PaymentIntent
 * @returns {Promise<Object>} Trạng thái thanh toán
 */
export const confirmPayment = async (paymentIntentId) => {
  try {
    const response = await apiClient.post(
      `${API_BASE_URL}/confirm-payment`,
      {
        paymentIntentId: paymentIntentId,
      }
    );

    if (response.success) {
      return response.data;
    } else {
      throw new Error(response.error || 'Payment confirmation failed');
    }
  } catch (error) {
    console.error('Error confirming payment:', error);
    throw error;
  }
};

/**
 * Kiểm tra trạng thái thanh toán
 * @param {string} paymentIntentId - ID của Stripe PaymentIntent
 * @returns {Promise<Object>} Payment status
 */
export const getPaymentStatus = async (paymentIntentId) => {
  try {
    const response = await apiClient.get(
      `${API_BASE_URL}/${paymentIntentId}`
    );

    return response.data;
  } catch (error) {
    console.error('Error getting payment status:', error);
    throw error;
  }
};

/**
 * Hoàn tiền (chỉ seller)
 * @param {string} paymentIntentId - ID của Stripe PaymentIntent
 * @param {number} orderId - Order ID
 * @returns {Promise<Object>} Refund details
 */
export const refundPayment = async (paymentIntentId, orderId) => {
  try {
    const response = await apiClient.post(
      `${API_BASE_URL}/refund`,
      {
        paymentIntentId: paymentIntentId,
        orderId: orderId,
      }
    );

    if (response.success) {
      return response.data;
    } else {
      throw new Error(response.error || 'Refund failed');
    }
  } catch (error) {
    console.error('Error refunding payment:', error);
    throw error;
  }
};

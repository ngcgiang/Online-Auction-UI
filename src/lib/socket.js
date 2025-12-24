import io from 'socket.io-client';

// Get the backend URL from environment or use default
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3000';

/**
 * Create socket instance with proper configuration
 * @param {boolean} withAuth - Include JWT token in auth
 * @returns {Socket} Socket instance
 */
export const createSocketInstance = (withAuth = true) => {
  const socketConfig = {
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    reconnectionAttempts: 5,
  };

  // Add authentication if token exists
  if (withAuth) {
    const token = localStorage.getItem('access_token');
    if (token) {
      socketConfig.auth = {
        token: token,
      };
    }
  }

  return io(SOCKET_URL, socketConfig);
};

/**
 * Format price to Vietnamese currency format
 * @param {number} amount - Amount to format
 * @returns {string} Formatted price (e.g., "5.000.000 ₫")
 */
export const formatPriceVND = (amount) => {
  if (!amount || isNaN(amount)) return '0 ₫';
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(amount);
};

/**
 * Format date to Vietnamese locale
 * @param {string} dateString - Date string to format
 * @returns {string} Formatted date
 */
export const formatDateVN = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleString('vi-VN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
};

/**
 * Get time remaining from end time
 * @param {string} endTime - End time string
 * @returns {object} Time remaining object with days, hours, minutes, seconds
 */
export const getTimeRemaining = (endTime) => {
  const now = new Date();
  const end = new Date(endTime);
  const diffMs = end - now;

  if (diffMs <= 0) {
    return { expired: true };
  }

  return {
    expired: false,
    days: Math.floor(diffMs / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
    minutes: Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60)),
    seconds: Math.floor((diffMs % (1000 * 60)) / 1000),
  };
};

/**
 * Format time remaining for display
 * @param {string} endTime - End time string
 * @returns {string} Formatted time remaining
 */
export const formatTimeRemaining = (endTime) => {
  const time = getTimeRemaining(endTime);

  if (time.expired) {
    return 'Đã kết thúc';
  }

  // If more than 3 days, show "X ngày Y giờ"
  if (time.days >= 3) {
    return `${time.days} ngày ${time.hours} giờ`;
  }

  // Otherwise show HH:MM:SS format
  const hh = String(time.hours).padStart(2, '0');
  const mm = String(time.minutes).padStart(2, '0');
  const ss = String(time.seconds).padStart(2, '0');
  return `${hh}:${mm}:${ss}`;
};

/**
 * Calculate time ago from date string
 * @param {string} dateString - Date string to calculate from
 * @returns {string} Time ago text (e.g., "5 phút trước")
 */
export const getTimeAgo = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Vừa xong';
  if (diffMins < 60) return `${diffMins} phút trước`;
  if (diffHours < 24) return `${diffHours} giờ trước`;
  if (diffDays < 30) return `${diffDays} ngày trước`;
  return formatDateVN(dateString);
};

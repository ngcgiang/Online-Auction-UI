import apiClient from '@/lib/axios';
/**
 * Auth Service
 * Handles all authentication-related API calls
 */
// User login
export const login = async (credentials) => {
  return apiClient.post('/api/auth/login', credentials);
};

export const loginWithGoogle = async (idToken) => {
  return apiClient.post('/api/auth/google-login', { idToken });
}

// User registration
export const register = async (userInfo) => {
  return apiClient.post('/api/auth/register', userInfo);
};

// Verify user email
export const verifyEmail = async (email, otpCode) => {
  return apiClient.post('/api/auth/verify', { 
    email: email, 
    otpCode: otpCode 
  });
};

// Resend verification email
export const resendVerificationEmail = async (email) => {
  return apiClient.patch('/api/auth/resend-otp', { email });
};

// Refresh auth token
export const refreshToken = async () => {
  console.log("Refreshing token...");
  return apiClient.post('/api/auth/refresh-token');
};

// User logout
export const logout = async () => {
  return apiClient.post('/api/auth/logout');
};



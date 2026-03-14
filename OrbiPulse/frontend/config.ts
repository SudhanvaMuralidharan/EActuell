/**
 * OrbiPulse API Configuration
 */
export const API_CONFIG = {
  BASE_URL: 'http://localhost:8000/api',
  TIMEOUT: 10000,
  USE_MOCK_API: false, // Set to false when backend is ready
};

export const AUTH_ENDPOINTS = {
  SEND_OTP: '/auth/send-otp',
  VERIFY_OTP: '/auth/verify-otp',
};

export const FARMER_ENDPOINTS = {
  PROFILE: '/farmers/profile',
};

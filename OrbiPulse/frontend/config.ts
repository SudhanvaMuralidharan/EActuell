/**
 * OrbiPulse API Configuration
 */
export const API_CONFIG = {
  BASE_URL: 'http://localhost:8000/api',
  TIMEOUT: 10000,
  USE_MOCK_API: true, // Backend doesn't have OTP endpoints, use mock auth
};

export const AUTH_ENDPOINTS = {
  SEND_OTP: '/auth/send-otp',
  VERIFY_OTP: '/auth/verify-otp',
};

export const FARMER_ENDPOINTS = {
  PROFILE: '/farmers/profile',
};

/**
 * OrbiPulse API Configuration
 */
export const API_CONFIG = {
  BASE_URL: 'https://api.orbipulse.com/v1', // Replace with actual API endpoint
  TIMEOUT: 10000,
  USE_MOCK_API: true, // Set to false when backend is ready
};

export const AUTH_ENDPOINTS = {
  SEND_OTP: '/auth/send-otp',
  VERIFY_OTP: '/auth/verify-otp',
};

export const FARMER_ENDPOINTS = {
  PROFILE: '/farmers/profile',
};

import { API_CONFIG, AUTH_ENDPOINTS, FARMER_ENDPOINTS } from '../config';

export interface User {
  id: string;
  phone: string;
  name?: string;
  profileImage?: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

/**
 * Authentication Service Layer
 */
const authService = {
  /**
   * Send OTP to the provided phone number
   */
  sendOtp: async (phone: string): Promise<boolean> => {
    if (API_CONFIG.USE_MOCK_API) {
      console.log(`[MOCK] Sending OTP to ${phone}`);
      await new Promise(resolve => setTimeout(resolve, 1000));
      return true;
    }
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}${AUTH_ENDPOINTS.SEND_OTP}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone }),
      });
      
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to send OTP');
      
      return true;
    } catch (error) {
      console.error('Send OTP Error:', error);
      throw error;
    }
  },

  /**
   * Verify OTP and return user session
   */
  verifyOtp: async (phone: string, otp: string): Promise<AuthResponse> => {
    if (API_CONFIG.USE_MOCK_API) {
      console.log(`[MOCK] Verifying OTP ${otp} for ${phone}`);
      await new Promise(resolve => setTimeout(resolve, 1500));
      // Demo Purpose: Accept any OTP
      return {
        token: 'mock-jwt-token',
        user: { id: 'u1', phone, name: '' }
      };
    }
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}${AUTH_ENDPOINTS.VERIFY_OTP}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, otp }),
      });
      
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'OTP Verification failed');
      
      return data as AuthResponse;
    } catch (error) {
      console.error('Verify OTP Error:', error);
      throw error;
    }
  },

  /**
   * Update farmer profile details
   */
  updateProfile: async (
    token: string, 
    phone: string, 
    name: string, 
    profileImageBase64?: string
  ): Promise<User> => {
    if (API_CONFIG.USE_MOCK_API) {
      console.log(`[MOCK] Updating profile for ${phone}`);
      await new Promise(resolve => setTimeout(resolve, 1000));
      return { id: 'u1', phone, name, profileImage: profileImageBase64 };
    }
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}${FARMER_ENDPOINTS.PROFILE}`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ phone, name, profile_image: profileImageBase64 }),
      });
      
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Profile update failed');
      
      return data as User;
    } catch (error) {
      console.error('Profile Update Error:', error);
      throw error;
    }
  }
};

export default authService;

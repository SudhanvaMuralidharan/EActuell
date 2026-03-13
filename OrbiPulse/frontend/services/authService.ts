import { API_URL } from '../config';

export interface SendOtpRequest {
  phone: string;
}

export interface VerifyOtpRequest {
  phone: string;
  otp: string;
}

export interface FarmerProfileRequest {
  phone: string;
  name: string;
  profile_image?: string;
}

export interface AuthResponse {
  success: boolean;
  token?: string;
  user?: {
    id: string;
    phone: string;
    name: string;
    profile_image?: string;
  };
  message?: string;
}

/**
 * Send OTP to phone number
 */
export async function sendOtp(phone: string): Promise<AuthResponse> {
  try {
    const response = await fetch(`${API_URL}/auth/send-otp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ phone }),
    });

    if (!response.ok) {
      throw new Error('Failed to send OTP');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Send OTP Error:', error);
    throw error;
  }
}

/**
 * Verify OTP code
 */
export async function verifyOtp(
  phone: string,
  otp: string
): Promise<AuthResponse> {
  try {
    const response = await fetch(`${API_URL}/auth/verify-otp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ phone, otp }),
    });

    if (!response.ok) {
      throw new Error('Invalid OTP');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Verify OTP Error:', error);
    throw error;
  }
}

/**
 * Submit farmer profile
 */
export async function submitFarmerProfile(
  phone: string,
  name: string,
  profileImage?: string
): Promise<AuthResponse> {
  try {
    const response = await fetch(`${API_URL}/farmers/profile`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        phone,
        name,
        ...(profileImage && { profile_image: profileImage }),
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to create profile');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Submit Profile Error:', error);
    throw error;
  }
}

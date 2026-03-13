import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import authService, { User } from '../services/authService';

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

interface AuthContextType extends AuthState {
  login: (phone: string, otp: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUserProfile: (name: string, profileImage?: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_STORAGE_KEY = '@OrbiPulse:AuthData';

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AuthState>({
    user: null,
    token: null,
    isLoading: true,
    isAuthenticated: false,
  });

  // Load session on mount
  useEffect(() => {
    const loadStorageData = async () => {
      try {
        const storageData = await AsyncStorage.getItem(AUTH_STORAGE_KEY);
        console.log('[AUTH] Storage Data:', storageData);
        if (storageData) {
          const { user, token } = JSON.parse(storageData);
          if (user && token) {
            setState({
              user,
              token,
              isLoading: false,
              isAuthenticated: true,
            });
          } else {
            console.log('[AUTH] Stale/Invalid session found, clearing...');
            await AsyncStorage.removeItem(AUTH_STORAGE_KEY);
            setState(prev => ({ ...prev, isLoading: false }));
          }
        } else {
          setState(prev => ({ ...prev, isLoading: false }));
        }
      } catch (e) {
        console.error('Failed to load auth data from storage', e);
        setState(prev => ({ ...prev, isLoading: false }));
      }
    };

    loadStorageData();
  }, []);

  const login = async (phone: string, otp: string) => {
    setState(prev => ({ ...prev, isLoading: true }));
    try {
      const response = await authService.verifyOtp(phone, otp);
      const { user, token } = response;
      
      await AsyncStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({ user, token }));
      
      setState({
        user,
        token,
        isLoading: false,
        isAuthenticated: true,
      });
    } catch (error) {
      setState(prev => ({ ...prev, isLoading: false }));
      throw error;
    }
  };

  const logout = async () => {
    await AsyncStorage.removeItem(AUTH_STORAGE_KEY);
    setState({
      user: null,
      token: null,
      isLoading: false,
      isAuthenticated: false,
    });
  };

  const updateUserProfile = async (name: string, profileImage?: string) => {
    if (!state.user || !state.token) return;
    
    setState(prev => ({ ...prev, isLoading: true }));
    try {
      const updatedUser = await authService.updateProfile(
        state.token,
        state.user.phone,
        name,
        profileImage
      );
      
      const newData = { user: updatedUser, token: state.token };
      await AsyncStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(newData));
      
      setState(prev => ({
        ...prev,
        user: updatedUser,
        isLoading: false,
      }));
    } catch (error) {
      setState(prev => ({ ...prev, isLoading: false }));
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ ...state, login, logout, updateUserProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

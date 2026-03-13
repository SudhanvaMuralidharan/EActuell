import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface FarmerProfile {
  id: string;
  phone: string;
  name: string;
  profile_image?: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  farmer: FarmerProfile | null;
  phoneNumber: string;
  setPhoneNumber: (phone: string) => void;
  login: (farmer: FarmerProfile) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [farmer, setFarmer] = useState<FarmerProfile | null>(null);
  const [phoneNumber, setPhoneNumber] = useState('');

  const login = (farmer: FarmerProfile) => {
    setFarmer(farmer);
    setIsAuthenticated(true);
  };

  const logout = () => {
    setFarmer(null);
    setIsAuthenticated(false);
    setPhoneNumber('');
  };

  const value = {
    isAuthenticated,
    farmer,
    phoneNumber,
    setPhoneNumber,
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

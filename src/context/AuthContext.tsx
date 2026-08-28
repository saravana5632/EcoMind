import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { UserProfile, UserRole } from '../types';
import { api } from '../services/api';
import { useToast } from './ToastContext';

interface AuthContextType {
  user: UserProfile | null;
  token: string | null;
  role: UserRole | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string, role?: UserRole) => Promise<boolean>;
  registerFarmer: (data: any) => Promise<boolean>;
  registerLandlord: (data: any) => Promise<boolean>;
  logout: () => void;
  quickDemoLogin: (role: UserRole) => Promise<void>;
  updateLocation: (coords: {
    latitude: number;
    longitude: number;
    address?: string;
    village?: string;
    district?: string;
    state?: string;
    pincode?: string;
  }) => Promise<boolean>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<boolean>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('landlink_token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const toast = useToast();

  const role = user?.role || null;
  const isAuthenticated = Boolean(user && token);

  const refreshProfile = useCallback(async () => {
    if (!localStorage.getItem('landlink_token')) {
      setUser(null);
      setIsLoading(false);
      return;
    }
    try {
      const res = await api.getMe();
      if (res.success && res.data) {
        setUser(res.data);
      } else {
        localStorage.removeItem('landlink_token');
        setToken(null);
        setUser(null);
      }
    } catch (err) {
      console.warn('Failed to load user profile on boot:', err);
      localStorage.removeItem('landlink_token');
      setToken(null);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshProfile();
  }, [refreshProfile]);

  const login = async (email: string, password: string, selectedRole?: UserRole): Promise<boolean> => {
    setIsLoading(true);
    try {
      const res = await api.login({ email, password, role: selectedRole });
      if (res.success && res.data) {
        localStorage.setItem('landlink_token', res.data.token);
        setToken(res.data.token);
        setUser(res.data.user);
        toast.success(`Welcome, ${res.data.user.name}!`, `Logged in as ${res.data.user.role}.`);
        return true;
      }
      return false;
    } catch (err: any) {
      toast.error('Login Failed', err.message || 'Please check your credentials.');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const registerFarmer = async (formData: any): Promise<boolean> => {
    setIsLoading(true);
    try {
      const res = await api.registerFarmer(formData);
      if (res.success && res.data) {
        localStorage.setItem('landlink_token', res.data.token);
        setToken(res.data.token);
        setUser(res.data.user);
        toast.success('Farmer Account Created!', 'Welcome to LandLink. Discover nearby agricultural lands.');
        return true;
      }
      return false;
    } catch (err: any) {
      toast.error('Farmer Registration Failed', err.message || 'Could not complete registration.');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const registerLandlord = async (formData: any): Promise<boolean> => {
    setIsLoading(true);
    try {
      const res = await api.registerLandlord(formData);
      if (res.success && res.data) {
        localStorage.setItem('landlink_token', res.data.token);
        setToken(res.data.token);
        setUser(res.data.user);
        toast.success('Landlord Account Created!', 'You can now list and manage your agricultural lands.');
        return true;
      }
      return false;
    } catch (err: any) {
      toast.error('Landlord Registration Failed', err.message || 'Could not complete registration.');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('landlink_token');
    setToken(null);
    setUser(null);
    toast.info('Logged Out', 'You have been logged out securely.');
  };

  const quickDemoLogin = async (targetRole: UserRole) => {
    const creds: Record<UserRole, { email: string; pass: string }> = {
      FARMER: { email: 'farmer@landlink.com', pass: 'farmer123' },
      LANDLORD: { email: 'landlord@landlink.com', pass: 'landlord123' },
      ADMIN: { email: 'admin@landlink.com', pass: 'admin123' },
    };

    const target = creds[targetRole];
    await login(target.email, target.pass, targetRole);
  };

  const updateLocation = async (coords: {
    latitude: number;
    longitude: number;
    address?: string;
    village?: string;
    district?: string;
    state?: string;
    pincode?: string;
  }): Promise<boolean> => {
    try {
      const res = await api.updateLocation(coords);
      if (res.success && res.data) {
        setUser(res.data);
        toast.success('Location Updated', `20 KM search radius centered on ${res.data.location.district || 'new coordinates'}.`);
        return true;
      }
      return false;
    } catch (err: any) {
      toast.error('Location Update Failed', err.message);
      return false;
    }
  };

  const updateProfile = async (updates: Partial<UserProfile>): Promise<boolean> => {
    try {
      const res = await api.updateProfile(updates);
      if (res.success && res.data) {
        setUser(res.data);
        toast.success('Profile Saved', 'Your account details have been updated.');
        return true;
      }
      return false;
    } catch (err: any) {
      toast.error('Profile Update Failed', err.message);
      return false;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        role,
        isAuthenticated,
        isLoading,
        login,
        registerFarmer,
        registerLandlord,
        logout,
        quickDemoLogin,
        updateLocation,
        updateProfile,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

import React, { createContext, useContext, useEffect, useState } from 'react';
import { StaffUser, UserRole } from '../types';
import { apiRequest } from '../lib/api';

interface AuthContextType {
  currentUser: StaffUser | null;
  firebaseUser: null; // Maintained for backward compatibility with existing components
  isAuthenticated: boolean;
  isLoading: boolean;
  role: UserRole | null;
  login: (email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ success: boolean; error?: string }>;
  changePassword: (newPassword: string, currentPassword?: string) => Promise<{ success: boolean; error?: string }>;
  refreshUser: () => Promise<void>;
  isOwner: boolean;
  isManager: boolean;
  isTechnician: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const LOCAL_STORAGE_AUTH_KEY = 'mrh_auth_user';
const LOCAL_STORAGE_TOKEN_KEY = 'mrh_auth_token';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<StaffUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadUser() {
      try {
        const storedUser = localStorage.getItem(LOCAL_STORAGE_AUTH_KEY);
        const storedToken = localStorage.getItem(LOCAL_STORAGE_TOKEN_KEY);

        if (storedUser && storedToken) {
          try {
            // Verify session with server
            const user = await apiRequest<StaffUser>('/auth/me');
            setCurrentUser(user);
            localStorage.setItem(LOCAL_STORAGE_AUTH_KEY, JSON.stringify(user));
          } catch {
            // Session expired or invalid
            localStorage.removeItem(LOCAL_STORAGE_AUTH_KEY);
            localStorage.removeItem(LOCAL_STORAGE_TOKEN_KEY);
            setCurrentUser(null);
          }
        } else {
          setCurrentUser(null);
        }
      } catch (err) {
        console.warn('Error reading stored auth session:', err);
        setCurrentUser(null);
      } finally {
        setIsLoading(false);
      }
    }

    loadUser();
  }, []);

  const login = async (email: string, pass: string): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    try {
      const res = await apiRequest<{ success: boolean; user: StaffUser; token?: string; error?: string }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password: pass }),
      });

      if (res.success && res.user && res.token) {
        setCurrentUser(res.user);
        localStorage.setItem(LOCAL_STORAGE_AUTH_KEY, JSON.stringify(res.user));
        localStorage.setItem(LOCAL_STORAGE_TOKEN_KEY, res.token);
        setIsLoading(false);
        return { success: true };
      } else {
        setIsLoading(false);
        return { success: false, error: res.error || 'Invalid email or password.' };
      }
    } catch (err: any) {
      setIsLoading(false);
      return { success: false, error: err.message || 'Login failed. Please verify credentials.' };
    }
  };

  const logout = async () => {
    try {
      localStorage.removeItem(LOCAL_STORAGE_AUTH_KEY);
      localStorage.removeItem(LOCAL_STORAGE_TOKEN_KEY);
      setCurrentUser(null);
    } catch (err) {
      console.error('Error logging out:', err);
    }
  };

  const refreshUser = async () => {
    try {
      const user = await apiRequest<StaffUser>('/auth/me');
      setCurrentUser(user);
      localStorage.setItem(LOCAL_STORAGE_AUTH_KEY, JSON.stringify(user));
    } catch (err) {
      console.warn('Error refreshing current user:', err);
    }
  };

  const resetPassword = async (email: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await apiRequest<{ success: boolean; message?: string; error?: string }>('/auth/reset-password', {
        method: 'POST',
        body: JSON.stringify({ email }),
      });
      if (res.success) {
        return { success: true };
      }
      return { success: false, error: res.error || 'Failed to reset password.' };
    } catch (err: any) {
      return { success: false, error: err.message || 'Failed to send password reset.' };
    }
  };

  const changePassword = async (newPassword: string, currentPassword?: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await apiRequest<{ success: boolean; message?: string; error?: string }>('/auth/change-password', {
        method: 'POST',
        body: JSON.stringify({ newPassword, currentPassword }),
      });
      if (res.success) {
        return { success: true };
      }
      return { success: false, error: res.error || 'Failed to change password.' };
    } catch (err: any) {
      return { success: false, error: err.message || 'Failed to change password.' };
    }
  };

  const role = currentUser?.role || null;
  const isOwner = role === 'owner';
  const isManager = role === 'manager' || role === 'owner';
  const isTechnician = role === 'technician' || role === 'manager' || role === 'owner';

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        firebaseUser: null,
        isAuthenticated: !!currentUser,
        isLoading,
        role,
        login,
        logout,
        resetPassword,
        changePassword,
        refreshUser,
        isOwner,
        isManager,
        isTechnician,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import type { User, InternProfile, RegistrationFormData } from '@/types';
import { authService } from '@/services/authService';
import { getAuthToken } from '@/services/api';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  register: (data: Partial<RegistrationFormData>) => Promise<boolean>;
  updateRegistrationStep: (step: 1 | 2 | 3 | 'complete') => void;
  updateProfile: (profile: Partial<InternProfile>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Restore session on mount
  useEffect(() => {
    const restoreSession = async () => {
      const token = getAuthToken();
      if (token) {
        const profile = await authService.getProfile();
        if (profile) {
          setUser(profile);
        }
      }
      setIsLoading(false);
    };
    restoreSession();
  }, []);

  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    const result = await authService.login(email, password);
    if (result.success && result.user) {
      setUser(result.user);
      return true;
    }
    return false;
  }, []);

  const logout = useCallback(async () => {
    await authService.logout();
    setUser(null);
  }, []);

  const register = useCallback(async (data: Partial<RegistrationFormData>): Promise<boolean> => {
    const result = await authService.register(data);
    if (result.success && result.user) {
      setUser(result.user);
      return true;
    }
    return false;
  }, []);

  const updateRegistrationStep = useCallback(async (step: 1 | 2 | 3 | 'complete') => {
    await authService.updateRegistrationStep(step);
    setUser((prev) => (prev ? { ...prev, registrationStep: step } : null));
  }, []);

  const updateProfile = useCallback(async (profile: Partial<InternProfile>) => {
    const result = await authService.updateProfile(profile);
    if (result.success && result.user) {
      setUser(result.user);
    } else {
      // Optimistic update
      setUser((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          profile: { ...prev.profile, ...profile } as InternProfile,
        };
      });
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
        register,
        updateRegistrationStep,
        updateProfile,
      }}
    >
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

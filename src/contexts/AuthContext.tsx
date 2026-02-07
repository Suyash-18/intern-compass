import React, { createContext, useContext, useState, useCallback } from 'react';
import type { User, InternProfile, RegistrationFormData } from '@/types';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  register: (data: Partial<RegistrationFormData>) => Promise<boolean>;
  updateRegistrationStep: (step: 1 | 2 | 3 | 'complete') => void;
  updateProfile: (profile: Partial<InternProfile>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock users for demo
const mockUsers: { email: string; password: string; role: 'intern' | 'admin' }[] = [
  { email: 'admin@prima.com', password: 'admin123', role: 'admin' },
  { email: 'intern@prima.com', password: 'intern123', role: 'intern' },
];

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 500));

    const foundUser = mockUsers.find(
      (u) => u.email === email && u.password === password
    );

    if (foundUser) {
      setUser({
        id: crypto.randomUUID(),
        email: foundUser.email,
        role: foundUser.role,
        registrationStep: foundUser.role === 'admin' ? 'complete' : 1,
      });
      return true;
    }
    return false;
  }, []);

  const logout = useCallback(() => {
    setUser(null);
  }, []);

  const register = useCallback(async (data: Partial<RegistrationFormData>): Promise<boolean> => {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 500));

    if (!user) {
      // Create new user on step 1
      setUser({
        id: crypto.randomUUID(),
        email: data.email || '',
        role: 'intern',
        registrationStep: 2,
        profile: {
          name: data.name || '',
          email: data.email || '',
          mobile: data.mobile || '',
          dob: '',
          address: '',
          skills: [],
          domain: '',
          collegeName: '',
          degree: '',
          branch: '',
          yearOfPassing: '',
        },
      });
    }
    return true;
  }, [user]);

  const updateRegistrationStep = useCallback((step: 1 | 2 | 3 | 'complete') => {
    setUser((prev) => (prev ? { ...prev, registrationStep: step } : null));
  }, []);

  const updateProfile = useCallback((profile: Partial<InternProfile>) => {
    setUser((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        profile: {
          ...prev.profile,
          ...profile,
        } as InternProfile,
      };
    });
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
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

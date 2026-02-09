/**
 * Authentication Service
 * 
 * Handles all authentication-related API calls.
 * Uses mock data when USE_MOCK_DATA is true.
 * 
 * API Endpoints Used:
 * - POST /auth/login - User login
 * - POST /auth/logout - User logout
 * - POST /auth/register - New user registration
 * - GET /users/profile - Get user profile
 * - PUT /users/profile - Update user profile
 * - PATCH /users/registration-step - Update registration step
 */

import { apiService, USE_MOCK_DATA, setAuthToken, removeAuthToken } from './api';
import { API_ENDPOINTS } from '@/utils/apiEndpoints';
import type { User, InternProfile, RegistrationFormData } from '@/types';

// Mock users for development
const mockUsers: { email: string; password: string; role: 'intern' | 'admin' }[] = [
  { email: 'admin@prima.com', password: 'admin123', role: 'admin' },
  { email: 'intern@prima.com', password: 'intern123', role: 'intern' },
];

// API Response Types
interface LoginResponse {
  user: User;
  token: string;
}

interface RegisterResponse {
  user: User;
  token: string;
}

interface ProfileResponse {
  user: User;
}

/**
 * Authentication Service
 */
export const authService = {
  /**
   * Login user
   * POST /auth/login
   * 
   * Request: { email: string, password: string }
   * Response: { user: User, token: string }
   */
  async login(email: string, password: string): Promise<{ success: boolean; user?: User }> {
    if (USE_MOCK_DATA) {
      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 500));

      const foundUser = mockUsers.find(
        (u) => u.email === email && u.password === password
      );

      if (foundUser) {
        const user: User = {
          id: crypto.randomUUID(),
          email: foundUser.email,
          role: foundUser.role,
          registrationStep: foundUser.role === 'admin' ? 'complete' : 1,
        };
        return { success: true, user };
      }
      return { success: false };
    }

    try {
      const response = await apiService.post<LoginResponse>(
        API_ENDPOINTS.AUTH.LOGIN,
        { email, password },
        false
      );
      setAuthToken(response.token);
      return { success: true, user: response.user };
    } catch {
      return { success: false };
    }
  },

  /**
   * Logout user
   * POST /auth/logout
   */
  async logout(): Promise<void> {
    if (USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 200));
      removeAuthToken();
      return;
    }

    try {
      await apiService.post(API_ENDPOINTS.AUTH.LOGOUT);
    } finally {
      removeAuthToken();
    }
  },

  /**
   * Register new user (Step 1)
   * POST /auth/register
   * 
   * Request: Partial<RegistrationFormData>
   * Response: { user: User, token: string }
   */
  async register(data: Partial<RegistrationFormData>): Promise<{ success: boolean; user?: User }> {
    if (USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 500));
      
      const user: User = {
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
      };
      return { success: true, user };
    }

    try {
      const response = await apiService.post<RegisterResponse>(
        API_ENDPOINTS.AUTH.REGISTER,
        data,
        false
      );
      setAuthToken(response.token);
      return { success: true, user: response.user };
    } catch {
      return { success: false };
    }
  },

  /**
   * Get current user profile
   * GET /users/profile
   * 
   * Response: { user: User }
   */
  async getProfile(): Promise<User | null> {
    if (USE_MOCK_DATA) {
      return null;
    }

    try {
      const response = await apiService.get<ProfileResponse>(API_ENDPOINTS.USERS.PROFILE);
      return response.user;
    } catch {
      return null;
    }
  },

  /**
   * Update user profile
   * PUT /users/profile
   * 
   * Request: Partial<InternProfile>
   * Response: { user: User }
   */
  async updateProfile(profile: Partial<InternProfile>): Promise<{ success: boolean; user?: User }> {
    if (USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 300));
      return { success: true };
    }

    try {
      const response = await apiService.put<ProfileResponse>(
        API_ENDPOINTS.USERS.UPDATE_PROFILE,
        profile
      );
      return { success: true, user: response.user };
    } catch {
      return { success: false };
    }
  },

  /**
   * Update registration step
   * PATCH /users/registration-step
   * 
   * Request: { step: 1 | 2 | 3 | 'complete' }
   * Response: { user: User }
   */
  async updateRegistrationStep(step: 1 | 2 | 3 | 'complete'): Promise<boolean> {
    if (USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 200));
      return true;
    }

    try {
      await apiService.patch(API_ENDPOINTS.USERS.UPDATE_REGISTRATION_STEP, { step });
      return true;
    } catch {
      return false;
    }
  },
};

export default authService;

/**
 * API Endpoints Configuration
 * 
 * This file contains all API endpoint definitions for the Prima Interns application.
 * Update BASE_URL when connecting to your backend server.
 * 
 * Usage: Import endpoints and use with apiService
 * Example: apiService.get(API_ENDPOINTS.AUTH.LOGIN)
 */

// Base URL for API - Update this when connecting to backend
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

// API Version
export const API_VERSION = 'v1';

// Full base path
export const API_BASE = `${API_BASE_URL}/${API_VERSION}`;

/**
 * API Endpoints organized by feature module
 */
export const API_ENDPOINTS = {
  // Authentication endpoints
  AUTH: {
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    REGISTER: '/auth/register',
    REFRESH_TOKEN: '/auth/refresh-token',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
    VERIFY_EMAIL: '/auth/verify-email',
  },

  // User/Profile endpoints
  USERS: {
    PROFILE: '/users/profile',
    UPDATE_PROFILE: '/users/profile',
    UPDATE_REGISTRATION_STEP: '/users/registration-step',
    UPLOAD_AVATAR: '/users/avatar',
  },

  // Intern management endpoints (Admin)
  INTERNS: {
    LIST: '/interns',
    GET_BY_ID: (id: string) => `/interns/${id}`,
    UPDATE: (id: string) => `/interns/${id}`,
    DELETE: (id: string) => `/interns/${id}`,
    EXPORT_CSV: '/interns/export/csv',
    EXPORT_EXCEL: '/interns/export/excel',
    SEARCH: '/interns/search',
  },

  // Task management endpoints
  TASKS: {
    LIST: '/tasks',
    GET_BY_ID: (id: string) => `/tasks/${id}`,
    CREATE: '/tasks',
    UPDATE: (id: string) => `/tasks/${id}`,
    DELETE: (id: string) => `/tasks/${id}`,
    SUBMIT: (id: string) => `/tasks/${id}/submit`,
    REVIEW: (id: string) => `/tasks/${id}/review`,
    UPLOAD_ATTACHMENT: (id: string) => `/tasks/${id}/attachments`,
    DELETE_ATTACHMENT: (taskId: string, attachmentId: string) => 
      `/tasks/${taskId}/attachments/${attachmentId}`,
    DOWNLOAD_ATTACHMENT: (taskId: string, attachmentId: string) => 
      `/tasks/${taskId}/attachments/${attachmentId}/download`,
  },

  // Dashboard/Analytics endpoints
  DASHBOARD: {
    INTERN_STATS: '/dashboard/intern-stats',
    ADMIN_STATS: '/dashboard/admin-stats',
    PROGRESS_OVERVIEW: '/dashboard/progress',
  },
} as const;

/**
 * HTTP Methods
 */
export const HTTP_METHODS = {
  GET: 'GET',
  POST: 'POST',
  PUT: 'PUT',
  PATCH: 'PATCH',
  DELETE: 'DELETE',
} as const;

/**
 * API Response Status Codes
 */
export const STATUS_CODES = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_ERROR: 500,
} as const;

/**
 * Type exports for type safety
 */
export type ApiEndpoint = string | ((id: string) => string) | ((id1: string, id2: string) => string);

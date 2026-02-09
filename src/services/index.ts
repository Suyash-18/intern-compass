/**
 * Services Index
 * 
 * Central export for all API services.
 * Import services from this file for cleaner imports.
 * 
 * Example:
 * import { authService, taskService, internService } from '@/services';
 */

export { apiService, USE_MOCK_DATA, getAuthToken, setAuthToken, removeAuthToken, ApiError } from './api';
export { authService } from './authService';
export { internService } from './internService';
export { taskService } from './taskService';
export { mockInterns, mockTasks } from './mockData';

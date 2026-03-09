import { apiService, USE_MOCK_DATA } from './api';
import { API_ENDPOINTS } from '@/utils/apiEndpoints';

interface DashboardStats {
  totalInterns: number;
  totalTasks: number;
  completedTasks: number;
  pendingTasks: number;
  inProgressTasks: number;
  rejectedTasks: number;
  approvalRate: number;
  overallProgress: number;
  domainDistribution: Record<string, number>;
}

export const dashboardService = {
  async getAdminStats(): Promise<DashboardStats | null> {
    if (USE_MOCK_DATA) return null;
    try {
      return await apiService.get<DashboardStats>(API_ENDPOINTS.DASHBOARD.ADMIN_STATS);
    } catch {
      console.error('Failed to fetch admin stats');
      return null;
    }
  },

  async getInternStats(): Promise<{ tasks: import('@/types').Task[] } | null> {
    if (USE_MOCK_DATA) return null;
    try {
      return await apiService.get(API_ENDPOINTS.DASHBOARD.INTERN_STATS);
    } catch {
      console.error('Failed to fetch intern stats');
      return null;
    }
  },
};

export default dashboardService;

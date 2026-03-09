import { apiService, USE_MOCK_DATA } from './api';
import { API_ENDPOINTS } from '@/utils/apiEndpoints';

interface NotificationPreferences {
  emailNotifications: boolean;
  taskReminders: boolean;
  reviewUpdates: boolean;
}

export const settingsService = {
  async changePassword(currentPassword: string, newPassword: string): Promise<boolean> {
    if (USE_MOCK_DATA) {
      await new Promise((r) => setTimeout(r, 500));
      return true;
    }
    try {
      await apiService.post(API_ENDPOINTS.SETTINGS.CHANGE_PASSWORD, { currentPassword, newPassword });
      return true;
    } catch {
      return false;
    }
  },

  async updateNotifications(prefs: NotificationPreferences): Promise<boolean> {
    if (USE_MOCK_DATA) {
      await new Promise((r) => setTimeout(r, 300));
      return true;
    }
    try {
      await apiService.put(API_ENDPOINTS.SETTINGS.NOTIFICATIONS, prefs);
      return true;
    } catch {
      return false;
    }
  },
};

export default settingsService;

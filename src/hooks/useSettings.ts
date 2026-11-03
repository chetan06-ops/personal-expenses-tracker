import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../database/db';
import { UserSettings } from '../types';
import { showToast } from './useToast';

const DEFAULT_SETTINGS: UserSettings = {
  currency: 'INR',
  currencySymbol: '₹',
  enable3D: true,
  performanceMode: 'high',
  monthlyOverallBudget: 2500000, // ₹25,000 in paise
};

export function useSettings() {
  const record = useLiveQuery(() => db.settings.get('userSettings'), []);
  const settings: UserSettings = record ? record.value : DEFAULT_SETTINGS;

  const updateSettings = async (updates: Partial<UserSettings>) => {
    try {
      const merged = { ...settings, ...updates };
      await db.settings.put({
        key: 'userSettings',
        value: merged,
      });
      showToast({
        type: 'success',
        title: 'Settings Saved',
        description: 'Preferences updated successfully.',
      });
    } catch (err: any) {
      showToast({
        type: 'error',
        title: 'Settings Error',
        description: err.message,
      });
    }
  };

  return {
    settings,
    updateSettings,
  };
}

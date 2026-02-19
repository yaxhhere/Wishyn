import AsyncStorage from '@react-native-async-storage/async-storage';
import { Wish } from 'types';

const WISHES_KEY = '@wishlist_wishes';
const CURRENCY_KEY = '@wishlist_currency';
const EXPORT_FORMAT_KEY = '@wishlist_export_format';
const THEME_KEY = '@wishlist_theme';

export const storageService = {
  // Wishes
  async saveWishes(wishes: Wish[]): Promise<void> {
    try {
      await AsyncStorage.setItem(WISHES_KEY, JSON.stringify(wishes));
    } catch (error) {
      console.error('Error saving wishes:', error);
    }
  },

  async loadWishes(): Promise<Wish[]> {
    try {
      const data = await AsyncStorage.getItem(WISHES_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error loading wishes:', error);
      return [];
    }
  },

  async clearWishes(): Promise<void> {
    try {
      await AsyncStorage.removeItem(WISHES_KEY);
    } catch (error) {
      console.error('Error clearing wishes:', error);
    }
  },

  // Currency
  async getCurrency(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(CURRENCY_KEY);
    } catch (error) {
      console.error('Error getting currency:', error);
      return null;
    }
  },

  async saveCurrency(currency: string): Promise<void> {
    try {
      await AsyncStorage.setItem(CURRENCY_KEY, currency);
    } catch (error) {
      console.error('Error saving currency:', error);
    }
  },

  // Export Format
  async getExportFormat(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(EXPORT_FORMAT_KEY);
    } catch (error) {
      console.error('Error getting export format:', error);
      return null;
    }
  },

  async saveExportFormat(format: string): Promise<void> {
    try {
      await AsyncStorage.setItem(EXPORT_FORMAT_KEY, format);
    } catch (error) {
      console.error('Error saving export format:', error);
    }
  },

  // Theme
  async getTheme(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(THEME_KEY);
    } catch (error) {
      console.error('Error getting theme:', error);
      return null;
    }
  },

  async saveTheme(theme: string): Promise<void> {
    try {
      await AsyncStorage.setItem(THEME_KEY, theme);
    } catch (error) {
      console.error('Error saving theme:', error);
    }
  },

  // Clear all data
  async clearAllData(): Promise<void> {
    try {
      await AsyncStorage.multiRemove([WISHES_KEY, CURRENCY_KEY, EXPORT_FORMAT_KEY, THEME_KEY]);
    } catch (error) {
      console.error('Error clearing all data:', error);
    }
  },
};

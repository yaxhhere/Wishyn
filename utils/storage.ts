import AsyncStorage from '@react-native-async-storage/async-storage';
import { Wish } from 'types';

const WISHES_KEY = '@wishlist_wishes';

export const storageService = {
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
};

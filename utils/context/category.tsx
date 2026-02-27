import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type Category = string;

type CategoryContextType = {
  categories: Category[];
  addCategory: (name: string) => Promise<void>;
  deleteCategory: (name: string) => Promise<void>;
  renameCategory: (oldName: string, newName: string) => Promise<void>;
  ensureValidCategory: (category?: string | null) => string;
};

const CATEGORY_STORAGE_KEY = '@wish_categories';
const WISHES_STORAGE_KEY = '@wishlist_wishes';

const DEFAULT_CATEGORIES: Category[] = ['Unspecified', 'Electronics', 'Books'];

export const NON_DELETABLE_CATEGORY = 'Unspecified';

const CategoryContext = createContext<CategoryContextType | null>(null);

export const CategoryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [categories, setCategories] = useState<Category[]>(DEFAULT_CATEGORIES);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const stored = await AsyncStorage.getItem(CATEGORY_STORAGE_KEY);

      if (stored) {
        const parsed = JSON.parse(stored);

        // Always ensure "Unspecified" exists and is first
        const cleaned = [
          NON_DELETABLE_CATEGORY,
          ...parsed.filter((c: string) => c !== NON_DELETABLE_CATEGORY),
        ];

        setCategories(cleaned);
      } else {
        await AsyncStorage.setItem(CATEGORY_STORAGE_KEY, JSON.stringify(DEFAULT_CATEGORIES));
      }
    } catch (e) {
      console.warn('Failed to load categories');
    }
  };

  const saveCategories = async (newCategories: Category[]) => {
    setCategories(newCategories);
    await AsyncStorage.setItem(CATEGORY_STORAGE_KEY, JSON.stringify(newCategories));
  };

  /* ─── CRUD ─────────────────────────────────────────────── */

  const addCategory = async (name: string) => {
    const trimmed = name.trim();
    if (!trimmed) return;

    const exists = categories.some((cat) => cat.toLowerCase() === trimmed.toLowerCase());
    if (exists) return;

    const updated = [...categories, trimmed];
    await saveCategories(updated);
  };

  /** Delete a category and cascade: all wishes using it → "Unspecified" */
  const deleteCategory = async (name: string) => {
    if (name === NON_DELETABLE_CATEGORY) return;

    // 1. Update categories list
    const updatedCategories = categories.filter((c) => c !== name);
    await saveCategories(updatedCategories);

    // 2. Cascade: reset wishes with deleted category → "Unspecified"
    try {
      const stored = await AsyncStorage.getItem(WISHES_STORAGE_KEY);
      if (stored) {
        const wishes = JSON.parse(stored);
        const updatedWishes = wishes.map((w: any) =>
          w.category === name ? { ...w, category: NON_DELETABLE_CATEGORY } : w
        );
        await AsyncStorage.setItem(WISHES_STORAGE_KEY, JSON.stringify(updatedWishes));
      }
    } catch (e) {
      console.warn('Failed to cascade delete category into wishes', e);
    }
  };

  /** Rename a category and cascade: all wishes using oldName → newName */
  const renameCategory = async (oldName: string, newName: string) => {
    const trimmed = newName.trim();
    if (!trimmed) return;
    if (oldName === NON_DELETABLE_CATEGORY) return;

    const alreadyExists = categories.some(
      (cat) => cat.toLowerCase() === trimmed.toLowerCase() && cat !== oldName
    );
    if (alreadyExists) return;

    // 1. Update categories list
    const updatedCategories = categories.map((c) => (c === oldName ? trimmed : c));
    await saveCategories(updatedCategories);

    // 2. Cascade: update wishes with oldName → newName
    try {
      const stored = await AsyncStorage.getItem(WISHES_STORAGE_KEY);
      if (stored) {
        const wishes = JSON.parse(stored);
        const updatedWishes = wishes.map((w: any) =>
          w.category === oldName ? { ...w, category: trimmed } : w
        );
        await AsyncStorage.setItem(WISHES_STORAGE_KEY, JSON.stringify(updatedWishes));
      }
    } catch (e) {
      console.warn('Failed to cascade rename category into wishes', e);
    }
  };

  /** Always return a valid category (falls back to "Unspecified") */
  const ensureValidCategory = (category?: string | null): string => {
    if (!category) return NON_DELETABLE_CATEGORY;
    return categories.includes(category) ? category : NON_DELETABLE_CATEGORY;
  };

  return (
    <CategoryContext.Provider
      value={{
        categories,
        addCategory,
        deleteCategory,
        renameCategory,
        ensureValidCategory,
      }}>
      {children}
    </CategoryContext.Provider>
  );
};

export const useCategories = () => {
  const ctx = useContext(CategoryContext);
  if (!ctx) throw new Error('useCategories must be used within CategoryProvider');
  return ctx;
};

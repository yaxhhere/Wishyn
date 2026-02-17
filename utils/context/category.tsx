import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type Category = string;

type CategoryContextType = {
  categories: Category[];
  addCategory: (name: string) => Promise<void>;
  removeCategory: (name: string) => Promise<void>;
  ensureValidCategory: (category?: string | null) => string;
  updateCategory: (oldName: string, newName: string) => Promise<void>;
};

const CATEGORY_STORAGE_KEY = '@wish_categories';

const DEFAULT_CATEGORIES: Category[] = ['Unspecified', 'Electronics', 'Books'];

const NON_DELETABLE_CATEGORY = 'Unspecified';

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

  const addCategory = async (name: string) => {
    const trimmed = name.trim();
    if (!trimmed) return;

    const exists = categories.some((cat) => cat.toLowerCase() === trimmed.toLowerCase());

    if (exists) return;

    const updated = [...categories, trimmed];
    await saveCategories(updated);
  };

  const removeCategory = async (name: string) => {
    if (name === NON_DELETABLE_CATEGORY) return;

    const updated = categories.filter((c) => c !== name);

    await saveCategories(updated);
  };

  // ✅ Always return a valid category
  const ensureValidCategory = (category?: string | null): string => {
    if (!category) return NON_DELETABLE_CATEGORY;

    const exists = categories.includes(category);
    return exists ? category : NON_DELETABLE_CATEGORY;
  };
  const updateCategory = async (oldName: string, newName: string) => {
    const trimmed = newName.trim();
    if (!trimmed) return;

    if (oldName === 'Unspecified') return; // protect

    const exists = categories.some((cat) => cat.toLowerCase() === trimmed.toLowerCase());

    if (exists) return;

    const updated = categories.map((c) => (c === oldName ? trimmed : c));

    await saveCategories(updated);
  };

  return (
    <CategoryContext.Provider
      value={{
        categories,
        addCategory,
        removeCategory,
        ensureValidCategory,
        updateCategory,
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

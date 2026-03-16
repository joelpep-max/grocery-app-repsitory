import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { CartSummary, Category, ItemFilters } from '@grocery-app/shared';

function generateSessionId(): string {
  return `session_${Date.now()}_${Math.random().toString(36).slice(2)}`;
}

interface AppState {
  sessionId: string;
  cart: CartSummary | null;
  cartLoading: boolean;
  categories: Category[];
  filters: ItemFilters;
  selectedCategory: string | null;
  searchQuery: string;

  setCart: (cart: CartSummary | null) => void;
  setCartLoading: (loading: boolean) => void;
  setCategories: (categories: Category[]) => void;
  setFilters: (filters: ItemFilters) => void;
  setSelectedCategory: (id: string | null) => void;
  setSearchQuery: (query: string) => void;
  clearFilters: () => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      sessionId: generateSessionId(),
      cart: null,
      cartLoading: false,
      categories: [],
      filters: {},
      selectedCategory: null,
      searchQuery: '',

      setCart: (cart) => set({ cart }),
      setCartLoading: (cartLoading) => set({ cartLoading }),
      setCategories: (categories) => set({ categories }),
      setFilters: (filters) => set({ filters }),
      setSelectedCategory: (id) =>
        set({ selectedCategory: id, filters: id ? { category_id: id } : {} }),
      setSearchQuery: (query) => set({ searchQuery: query }),
      clearFilters: () =>
        set({ selectedCategory: null, searchQuery: '', filters: {} }),
    }),
    {
      name: 'grocery-app-mobile-state',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ sessionId: state.sessionId }),
    }
  )
);

"use client";

import { create } from "zustand";
import { persist, createJSONStorage, type StateStorage } from "zustand/middleware";
import { CartItem, Product } from "@/types";

// В Safari на iOS localStorage может бросать исключение (режим "Заблокировать
// все cookie", приватные вкладки, некоторые встроенные браузеры в мессенджерах).
// Без этой обёртки такое исключение падает прямо во время рендера Header
// (который есть на каждой странице) и роняет всё приложение белым экраном.
// Здесь мы отлавливаем ошибку и тихо откатываемся к памяти на время сессии —
// корзина просто не сохранится между визитами, но сайт не сломается.
let safeStorageInstance: StateStorage | null = null;

function getSafeStorage(): StateStorage {
  if (safeStorageInstance) return safeStorageInstance;

  const memoryFallback: Record<string, string> = {};
  let useMemory = false;

  const testLocalStorage = () => {
    try {
      const testKey = "__dm_storage_test__";
      window.localStorage.setItem(testKey, "1");
      window.localStorage.removeItem(testKey);
      return true;
    } catch {
      return false;
    }
  };

  if (typeof window === "undefined" || !testLocalStorage()) {
    useMemory = true;
  }

  safeStorageInstance = {
    getItem: (name) => {
      try {
        if (useMemory) return memoryFallback[name] ?? null;
        return window.localStorage.getItem(name);
      } catch {
        useMemory = true;
        return memoryFallback[name] ?? null;
      }
    },
    setItem: (name, value) => {
      try {
        if (useMemory) {
          memoryFallback[name] = value;
          return;
        }
        window.localStorage.setItem(name, value);
      } catch {
        useMemory = true;
        memoryFallback[name] = value;
      }
    },
    removeItem: (name) => {
      try {
        if (useMemory) {
          delete memoryFallback[name];
          return;
        }
        window.localStorage.removeItem(name);
      } catch {
        delete memoryFallback[name];
      }
    },
  };

  return safeStorageInstance;
}

interface CartState {
  items: CartItem[];
  addItem: (product: Product) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  getTotal: () => number;
  getItemsCount: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (product: Product) => {
        set((state) => {
          const existing = state.items.find(
            (item) => item.product.id === product.id
          );
          if (existing) {
            return {
              items: state.items.map((item) =>
                item.product.id === product.id
                  ? { ...item, quantity: item.quantity + 1 }
                  : item
              ),
            };
          }
          return { items: [...state.items, { product, quantity: 1 }] };
        });
      },

      removeItem: (productId: string) => {
        set((state) => ({
          items: state.items.filter((item) => item.product.id !== productId),
        }));
      },

      updateQuantity: (productId: string, quantity: number) => {
        if (quantity <= 0) {
          get().removeItem(productId);
          return;
        }
        set((state) => ({
          items: state.items.map((item) =>
            item.product.id === productId ? { ...item, quantity } : item
          ),
        }));
      },

      clearCart: () => set({ items: [] }),

      getTotal: () => {
        return get().items.reduce(
          (sum, item) => sum + item.product.price * item.quantity,
          0
        );
      },

      getItemsCount: () => {
        return get().items.reduce((sum, item) => sum + item.quantity, 0);
      },
    }),
    {
      name: "dolina-moloka-cart",
      storage: createJSONStorage(() => getSafeStorage()),
    }
  )
);

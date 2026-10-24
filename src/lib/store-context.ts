import { createContext, useContext } from 'react';
import type { AppState, IDebt } from './types';

// 全局状态上下文与 hook（与 Provider 拆分，避免一个文件同时导出组件和非组件）。

export interface StoreValue {
  state: AppState;
  setBudget: (n: number) => void;
  addDebt: (d: Omit<IDebt, 'id'>) => void;
  updateDebt: (id: string, patch: Partial<IDebt>) => void;
  removeDebt: (id: string) => void;
  updateIncomeItem: (id: string, amount: number) => void;
  updateFixedItem: (id: string, amount: number) => void;
  updateLivingItem: (id: string, amount: number) => void;
}

export const StoreContext = createContext<StoreValue | null>(null);

export function useStore(): StoreValue {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore 必须在 StoreProvider 内使用');
  return ctx;
}

import { useEffect, useState, type ReactNode } from 'react';
import { StoreContext, type StoreValue } from './store-context';
import type { AppState } from './types';
import { sampleState } from './sample';
import { uid } from './algorithm';

// v2：收入 / 固定支出 / 弹性生活改为固定子类目台账，旧版缓存结构不符时回落示例。
const KEY = 'forest-debt-desktop:state-v2';

function isValidState(raw: unknown): raw is AppState {
  const s = raw as AppState;
  return (
    !!s &&
    Array.isArray(s.debts) &&
    Array.isArray(s.incomeItems) &&
    Array.isArray(s.fixedItems) &&
    Array.isArray(s.livingItems)
  );
}

function loadState(): AppState {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const parsed: unknown = JSON.parse(raw);
      if (isValidState(parsed)) return parsed;
    }
  } catch {
    /* 隐私模式或数据损坏时回落到示例 */
  }
  return sampleState;
}

export default function StoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>(loadState);

  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(state));
    } catch {
      /* 存储不可用时静默降级，不影响当前会话 */
    }
  }, [state]);

  const value: StoreValue = {
    state,
    setBudget: (n) => setState((s) => ({ ...s, budget: n })),
    addDebt: (d) =>
      setState((s) => ({ ...s, debts: [...s.debts, { ...d, id: uid() }] })),
    updateDebt: (id, patch) =>
      setState((s) => ({
        ...s,
        debts: s.debts.map((x) => (x.id === id ? { ...x, ...patch } : x)),
      })),
    removeDebt: (id) =>
      setState((s) => ({ ...s, debts: s.debts.filter((x) => x.id !== id) })),
    updateIncomeItem: (id, amount) =>
      setState((s) => ({
        ...s,
        incomeItems: s.incomeItems.map((x) =>
          x.id === id ? { ...x, amount } : x,
        ),
      })),
    updateFixedItem: (id, amount) =>
      setState((s) => ({
        ...s,
        fixedItems: s.fixedItems.map((x) =>
          x.id === id ? { ...x, amount } : x,
        ),
      })),
    updateLivingItem: (id, amount) =>
      setState((s) => ({
        ...s,
        livingItems: s.livingItems.map((x) =>
          x.id === id ? { ...x, amount } : x,
        ),
      })),
  };

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

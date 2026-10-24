import type { IDebt } from './types';

// 利率优先（雪崩法）按月还款计划。
// 规则：每月每笔至少偿还当月利息（防利滚利）；利息满足后，剩余预算按利率从高到低
//       依次偿还本金，先结清最高息负债，结清后剩余本金自动滚向下一笔高息负债。

export interface PlanRow {
  id: string;
  name: string;
  rate: number;
  pay: number;
  interest: number;
  principal: number;
  balance: number;
}

export interface PlanMonth {
  month: number;
  label: string;
  rows: PlanRow[];
  totalPaid: number;
  totalInterest: number;
}

export interface PlanResult {
  months: PlanMonth[];
  totalMonths: number;
  totalInterest: number;
  totalPaid: number;
  totalBalance: number;
  // id -> 首次结清（余额归零）的月份序号；未结清不写入
  payoffMap: Record<string, number>;
}

interface ActiveDebt {
  id: string;
  name: string;
  balance: number;
  annualRate: number;
}

export function buildPlan(debts: IDebt[], budget: number): PlanResult {
  const active: ActiveDebt[] = (debts || [])
    .map((d) => ({
      id: d.id,
      name: d.name,
      balance: Number(d.balance) || 0,
      annualRate: Number(d.annualRate) || 0,
    }))
    .filter((d) => d.balance > 0);

  const empty: PlanResult = {
    months: [],
    totalMonths: 0,
    totalInterest: 0,
    totalPaid: 0,
    totalBalance: active.reduce((s, d) => s + d.balance, 0),
    payoffMap: {},
  };

  if (active.length === 0 || !(budget > 0)) return empty;

  const months: PlanMonth[] = [];
  const payoffMap: Record<string, number> = {};
  let totalInterest = 0;
  let month = 0;
  const now = new Date();

  while (active.some((d) => d.balance > 0.005) && month < 600) {
    month++;
    const date = new Date(now.getFullYear(), now.getMonth() + month, 1);
    const label = `${date.getFullYear()}年${date.getMonth() + 1}月`;

    // 当月利息
    const rows = active.map((d) => ({
      id: d.id,
      name: d.name,
      rate: d.annualRate,
      interest: d.balance * (d.annualRate / 100 / 12),
      balance: d.balance,
    }));

    let remaining = budget;
    const alloc: Record<string, { pay: number; interest: number; principal: number }> = {};
    const sorted = [...rows].sort((a, b) => b.rate - a.rate);

    // 第一轮：每笔至少偿还当月利息，高利率优先满足
    for (const r of sorted) {
      if (remaining <= 0) break;
      const need = Math.min(r.interest, r.balance + r.interest);
      const pay = Math.min(need, remaining);
      alloc[r.id] = { pay, interest: Math.min(pay, r.interest), principal: 0 };
      remaining -= pay;
    }

    // 第二轮：剩余本金按利率从高到低依次偿还，结清后自动滚向下一笔
    for (const r of sorted) {
      if (remaining <= 0) break;
      if (r.balance <= 0.005) continue;
      const cur = alloc[r.id] || { pay: 0, interest: 0, principal: 0 };
      const principal = Math.min(remaining, r.balance);
      cur.pay += principal;
      cur.principal += principal;
      remaining -= principal;
      alloc[r.id] = cur;
    }

    // 应用还款、更新余额，记录结清月份
    let monthInterest = 0;
    for (const d of active) {
      const a = alloc[d.id];
      if (!a) continue;
      d.balance = d.balance + a.interest - a.pay;
      if (d.balance < 0.005) d.balance = 0;
      totalInterest += a.interest;
      monthInterest += a.interest;
      if (d.balance === 0 && !payoffMap[d.id]) payoffMap[d.id] = month;
    }

    const monthRows: PlanRow[] = active.map((d) => {
      const a = alloc[d.id] || { pay: 0, interest: 0, principal: 0 };
      return {
        id: d.id,
        name: d.name,
        rate: d.annualRate,
        pay: Math.round(a.pay * 100) / 100,
        interest: Math.round(a.interest * 100) / 100,
        principal: Math.round(a.principal * 100) / 100,
        balance: Math.round(d.balance * 100) / 100,
      };
    });

    const totalPaid = Math.round(monthRows.reduce((s, r) => s + r.pay, 0) * 100) / 100;
    months.push({
      month,
      label,
      rows: monthRows,
      totalPaid,
      totalInterest: Math.round(monthInterest * 100) / 100,
    });
  }

  const totalPaid = Math.round(months.reduce((s, x) => s + x.totalPaid, 0) * 100) / 100;
  return {
    months,
    totalMonths: months.length,
    totalInterest: Math.round(totalInterest * 100) / 100,
    totalPaid,
    totalBalance: active.reduce((s, d) => s + d.balance, 0),
    payoffMap,
  };
}

export function uid(): string {
  return 'd' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

// 金额格式化：千分位、两位小数（可选）
export function fmtMoney(n: number, withCents = false): string {
  const v = Number(n) || 0;
  return v.toLocaleString('zh-CN', {
    minimumFractionDigits: withCents ? 2 : 0,
    maximumFractionDigits: withCents ? 2 : 0,
  });
}

import type { ICategoryItem } from './types';

// 月度现金流预算测算（简化口径）：
// 月收入 − 固定支出 = 可还结余；再减每月还债额度 = 可花生活费额度；
// 弹性生活支出（聚餐、充值、油费等）从额度里安排，额度减弹性计划 = 剩余缓冲；
// 生活费额度按整月 4 周、月均 30 天拆成每周、每天可花上限。
// 参考单人基础生活开销（不含房租，房租计入固定支出）给出档位提示。

export type BudgetStatus =
  | 'ok'
  | 'tight'
  | 'noLiving'
  | 'deficitDebt'
  | 'overFlexible';
export type LivingLevel = 'none' | 'below' | 'normal' | 'above';

// 单人不含房租的基础生活参考区间（伙食、交通、日用、通讯、弹性零花，市场经验参考）
export const SJZ_BASIC_MONTHLY = 1200; // 偏紧下限
export const SJZ_COMFORT_MONTHLY = 1800; // 正常参考上限
export const SJZ_NOTE =
  '参考普通城市单人基础生活约 ¥1,200–1,800/月（不含房租，房租请填进固定支出），为市场经验参考，非官方统计。';

export interface BudgetResult {
  income: number; // 月收入合计
  fixedExpense: number; // 固定支出合计（房租等刚性支出）
  flexibleExpense: number; // 弹性生活支出合计（聚餐、油费等）
  surplus: number; // 收入 − 固定支出（可用于还债与生活的结余）
  debtBudget: number; // 每月还债额度
  living: number; // 可花生活费额度（可负）
  buffer: number; // 额度 − 弹性计划（可负，负数表示弹性超支）
  weekly: number; // 每周可花
  daily: number; // 每天可花
  status: BudgetStatus;
  livingLevel: LivingLevel;
}

const WEEKS_PER_MONTH = 4;
const DAYS_PER_MONTH = 30;

function sumItems(items: ICategoryItem[]): number {
  return items.reduce((s, x) => s + (Number(x.amount) || 0), 0);
}

export function calcBudget(
  incomeItems: ICategoryItem[],
  fixedItems: ICategoryItem[],
  livingItems: ICategoryItem[],
  debtBudget: number,
): BudgetResult {
  const income = sumItems(incomeItems);
  const fixedExpense = sumItems(fixedItems);
  const flexibleExpense = sumItems(livingItems);
  const surplus = income - fixedExpense;
  const living = surplus - debtBudget;
  const buffer = living - flexibleExpense;

  let status: BudgetStatus = 'ok';
  if (debtBudget > surplus + 0.01) {
    status = 'deficitDebt';
  } else if (living <= 0.01) {
    status = 'noLiving';
  } else if (buffer < -0.01) {
    status = 'overFlexible';
  } else if (living < SJZ_BASIC_MONTHLY) {
    status = 'tight';
  }

  let livingLevel: LivingLevel = 'none';
  if (living > 0.01) {
    if (living < SJZ_BASIC_MONTHLY) livingLevel = 'below';
    else if (living <= SJZ_COMFORT_MONTHLY) livingLevel = 'normal';
    else livingLevel = 'above';
  }

  const weekly = living / WEEKS_PER_MONTH;
  const daily = living / DAYS_PER_MONTH;

  return {
    income,
    fixedExpense,
    flexibleExpense,
    surplus,
    debtBudget,
    living,
    buffer,
    weekly,
    daily,
    status,
    livingLevel,
  };
}

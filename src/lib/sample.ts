import type { AppState, IDebt, ICategoryItem } from './types';

// 七平台预设示例数据：金额/利率均为参考占位，正式使用时在页面改成本人真实账单。
// 利率为公开参考口径，实际以本人 APP 账单为准，页面内可直接修改。

export const sampleDebts: IDebt[] = [
  {
    id: 'debt-cmb',
    name: '招商信用卡',
    emoji: '💳',
    icon: 'card',
    tier: 'hi',
    balance: 12500,
    annualRate: 18.25,
    minPayment: 1250,
    dueDay: '每月15号',
    note: '循环信用参考年化18.25%，以账单为准',
  },
  {
    id: 'debt-citic',
    name: '中信信用卡',
    emoji: '🏦',
    icon: 'bank',
    tier: 'hi',
    balance: 9300,
    annualRate: 18.25,
    minPayment: 930,
    dueDay: '每月20号',
    note: '日息万五，参考年化18.25%，以账单为准',
  },
  {
    id: 'debt-huabei',
    name: '花呗',
    emoji: '🐜',
    icon: 'coin',
    tier: 'hi',
    balance: 6800,
    annualRate: 18.25,
    minPayment: 680,
    dueDay: '每月10号',
    note: '参考年化18.25%，以账单为准',
  },
  {
    id: 'debt-baitiao',
    name: '京东白条',
    emoji: '🐶',
    icon: 'cart',
    tier: 'mid',
    balance: 5600,
    annualRate: 14.6,
    minPayment: 560,
    dueDay: '每月25号',
    note: '分期参考年化约14.6%，以账单为准',
  },
  {
    id: 'debt-douyin',
    name: '抖音月付',
    emoji: '🎵',
    icon: 'music',
    tier: 'mid',
    balance: 2400,
    annualRate: 15,
    minPayment: 240,
    dueDay: '每月6号',
    note: '参考年化约15%，以账单为准',
  },
  {
    id: 'debt-wechat',
    name: '微信分付',
    emoji: '💬',
    icon: 'chat',
    tier: 'mid',
    balance: 3200,
    annualRate: 14.6,
    minPayment: 320,
    dueDay: '每月8号',
    note: '日息0.04%，参考年化14.6%，以账单为准',
  },
  {
    id: 'debt-friend',
    name: '朋友借款',
    emoji: '🤝',
    icon: 'heart',
    tier: 'zero',
    balance: 8000,
    annualRate: 0,
    minPayment: 800,
    dueDay: '无固定期限',
    note: '无息借款，按双方约定偿还',
  },
];

// 以下收入 / 固定支出 / 弹性生活金额均为示例占位，填入本人真实账单后自动重算。
const sampleIncomeItems: ICategoryItem[] = [
  { id: 'inc-fixed', label: '固定月收入', emoji: '💰', amount: 6000 },
  { id: 'inc-side', label: '其他副业收入', emoji: '📈', amount: 0 },
];

const sampleFixedItems: ICategoryItem[] = [
  { id: 'fixed-rent', label: '房租', emoji: '🏠', amount: 1000 },
  { id: 'fixed-utility', label: '水电', emoji: '💡', amount: 150 },
  { id: 'fixed-pet', label: '宠物', emoji: '🐱', amount: 200 },
  { id: 'fixed-food', label: '吃饭', emoji: '🍚', amount: 500 },
  { id: 'fixed-smoke', label: '香烟', emoji: '🚬', amount: 200 },
  { id: 'fixed-gym', label: '健身', emoji: '💪', amount: 150 },
];

const sampleLivingItems: ICategoryItem[] = [
  { id: 'live-dinner', label: '聚餐', emoji: '🍻', amount: 100 },
  { id: 'live-credit', label: '充值', emoji: '📱', amount: 50 },
  { id: 'live-fuel', label: '油费', emoji: '⛽', amount: 200 },
  { id: 'live-clothes', label: '衣服', emoji: '👕', amount: 80 },
  { id: 'live-online', label: '网购', emoji: '🛒', amount: 120 },
  { id: 'live-parking', label: '停车', emoji: '🅿️', amount: 50 },
  { id: 'live-other', label: '其他', emoji: '📦', amount: 100 },
];

export const sampleState: AppState = {
  debts: sampleDebts,
  budget: 3000,
  incomeItems: sampleIncomeItems,
  fixedItems: sampleFixedItems,
  livingItems: sampleLivingItems,
};

// 三大类固定子类目定义：收入、固定支出、可花生活费（弹性）。
// 类目名与顺序在此维护；页面只渲染这些固定项，金额由用户填写。

export interface CategoryDef {
  id: string;
  label: string;
  emoji: string;
}

// 月收入细分
export const INCOME_CATEGORIES: CategoryDef[] = [
  { id: 'inc-fixed', label: '固定月收入', emoji: '💰' },
  { id: 'inc-side', label: '其他副业收入', emoji: '📈' },
];

// 固定支出细分（刚性开销）
export const FIXED_CATEGORIES: CategoryDef[] = [
  { id: 'fixed-rent', label: '房租', emoji: '🏠' },
  { id: 'fixed-utility', label: '水电', emoji: '💡' },
  { id: 'fixed-pet', label: '宠物', emoji: '🐱' },
  { id: 'fixed-food', label: '吃饭', emoji: '🍚' },
  { id: 'fixed-smoke', label: '香烟', emoji: '🚬' },
  { id: 'fixed-gym', label: '健身', emoji: '💪' },
];

// 可花生活费细分（弹性开销）
export const LIVING_CATEGORIES: CategoryDef[] = [
  { id: 'live-dinner', label: '聚餐', emoji: '🍻' },
  { id: 'live-credit', label: '充值', emoji: '📱' },
  { id: 'live-fuel', label: '油费', emoji: '⛽' },
  { id: 'live-clothes', label: '衣服', emoji: '👕' },
  { id: 'live-online', label: '网购', emoji: '🛒' },
  { id: 'live-parking', label: '停车', emoji: '🅿️' },
  { id: 'live-other', label: '其他', emoji: '📦' },
];

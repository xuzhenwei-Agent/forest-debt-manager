// EXPORTS: IDebt{id,name,emoji,icon,tier,balance,annualRate,minPayment,dueDay,note},
//          ICategoryItem{id,label,emoji,amount}, AppState, Tier, IconKind
// 业务实体类型集中在此，跨文件复用。

export type Tier = 'hi' | 'mid' | 'zero';

export type IconKind =
  | 'card'   // 银行卡（信用卡）
  | 'bank'   // 银行
  | 'coin'   // 金币（花呗）
  | 'cart'   // 购物车（白条）
  | 'music'  // 音符（抖音月付）
  | 'chat'   // 气泡（微信分付）
  | 'heart'; // 心形（朋友借款）

export interface IDebt {
  id: string;
  name: string;
  emoji: string;
  icon: IconKind;
  tier: Tier;
  balance: number;       // 当前欠款（元）
  annualRate: number;    // 年利率（%，参考值，以本人账单为准、可修改）
  minPayment: number;    // 每月最低还款（元）
  dueDay: string;        // 还款日（文本，如“每月15号”）
  note: string;          // 利率口径备注
  colorMain?: string;    // 用户自定义主色（#RRGGBB）；缺省回退平台默认配色
}

// 收入 / 固定支出 / 弹性生活支出的固定子类目台账项
export interface ICategoryItem {
  id: string;
  label: string;
  emoji: string;
  amount: number;
}

export interface AppState {
  debts: IDebt[];
  budget: number; // 每月可用于还债的预算（元）
  incomeItems: ICategoryItem[]; // 月收入细分：固定月收入、其他副业收入
  fixedItems: ICategoryItem[]; // 固定支出细分：房租、水电、宠物、吃饭、香烟、健身
  livingItems: ICategoryItem[]; // 可花生活费细分：聚餐、充值、油费、衣服、网购、停车、其他
}

// 负债平台与收支类目的配色工具。
// 平台：用户自定义主色优先，缺省回退七平台默认配色，再回退森林绿；浅底由主色按透明度派生。
// 收入 / 固定支出 / 弹性生活三组类目使用固定主题色。
// 负债平台页、还款计划页、预算规划页、收入账本页共用本表，保证同一对象在各页颜色一致。

export interface PlatformColor {
  main: string;
  soft: string;
}

interface PlatformRef {
  id: string;
  name: string;
  colorMain?: string;
}

const DEFAULT_COLOR: PlatformColor = { main: '#2E5E3A', soft: '#E2EBDB' };

const COLOR_BY_ID: Record<string, PlatformColor> = {
  'debt-cmb': { main: '#C0705A', soft: '#F6E3DF' }, // 招商信用卡 · 赤陶红
  'debt-citic': { main: '#C08A4E', soft: '#F3E9D2' }, // 中信信用卡 · 暖橙棕
  'debt-huabei': { main: '#D9A441', soft: '#F7EDD6' }, // 花呗 · 琥珀黄
  'debt-baitiao': { main: '#2E5E3A', soft: '#E2EBDB' }, // 京东白条 · 深森林绿
  'debt-douyin': { main: '#4E8A9E', soft: '#E1EEF2' }, // 抖音月付 · 青蓝
  'debt-wechat': { main: '#3F8F5E', soft: '#E4F0E8' }, // 微信分付 · 松绿
  'debt-friend': { main: '#7A7296', soft: '#ECE9F1' }, // 朋友借款 · 柔紫灰
};

const COLOR_BY_NAME: Record<string, PlatformColor> = {
  招商信用卡: { main: '#C0705A', soft: '#F6E3DF' },
  中信信用卡: { main: '#C08A4E', soft: '#F3E9D2' },
  花呗: { main: '#D9A441', soft: '#F7EDD6' },
  京东白条: { main: '#2E5E3A', soft: '#E2EBDB' },
  抖音月付: { main: '#4E8A9E', soft: '#E1EEF2' },
  微信分付: { main: '#3F8F5E', soft: '#E4F0E8' },
  朋友借款: { main: '#7A7296', soft: '#ECE9F1' },
};

function parseHex(hex: string): [number, number, number] | null {
  let h = hex.replace('#', '').trim();
  if (/^[0-9a-fA-F]{3}$/.test(h))
    h = h.split('').map((c) => c + c).join('');
  if (!/^[0-9a-fA-F]{6}$/.test(h)) return null;
  const n = parseInt(h, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

// #RRGGBB / #RGB 转 rgba(...,alpha)；非法输入回退森林绿。
export function hexAlpha(hex: string, alpha: number): string {
  const rgb = parseHex(hex);
  if (!rgb) return `rgba(46, 94, 58, ${alpha})`;
  return `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, ${alpha})`;
}

export function isValidHex(hex: string): boolean {
  return parseHex(hex) !== null;
}

// 解析平台配色：自定义主色 > 默认表 > 森林绿；自定义主色的浅底按 12% 透明度派生。
export function platformColor(ref: PlatformRef): PlatformColor {
  if (ref.colorMain && isValidHex(ref.colorMain)) {
    return { main: ref.colorMain, soft: hexAlpha(ref.colorMain, 0.12) };
  }
  return COLOR_BY_ID[ref.id] ?? COLOR_BY_NAME[ref.name] ?? DEFAULT_COLOR;
}

// 弹窗可选预设色板（柔和大地 / 森林系，白底上可读）。
export const PRESET_COLORS: string[] = [
  '#2E5E3A', // 深森林绿
  '#3F8F5E', // 松绿
  '#4E8A5B', // 草绿
  '#8FBF8E', // 浅绿
  '#4E8A9E', // 青蓝
  '#3A6EA5', // 蓝
  '#7A7296', // 柔紫
  '#C0705A', // 赤陶红
  '#C08A4E', // 暖橙
  '#D9A441', // 琥珀黄
  '#8A6D5B', // 棕
  '#5B6470', // 灰蓝
];

// 收支三组类目固定主题色。
export type CategoryKey = 'income' | 'fixed' | 'living';

export const CATEGORY_THEME: Record<CategoryKey, PlatformColor> = {
  income: { main: '#3F8F5E', soft: 'rgba(63, 143, 94, 0.10)' },
  fixed: { main: '#C0705A', soft: 'rgba(192, 112, 90, 0.10)' },
  living: { main: '#2E5E3A', soft: 'rgba(46, 94, 58, 0.10)' },
};

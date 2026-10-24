import type { Tier } from './types';

// 梯队色系：高息赤陶、中息暖金、无息森林绿。独立文件，便于跨组件复用。
export const TIER_META: Record<Tier, { bg: string; fg: string; label: string }> = {
  hi: { bg: '#F6E3DF', fg: '#C0705A', label: '高息优先' },
  mid: { bg: '#F3E9D2', fg: '#C08A4E', label: '中息' },
  zero: { bg: '#E2EBDB', fg: '#3F8F5E', label: '无息' },
};

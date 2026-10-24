// 月份换算：从当前月份起算 n 个月后的年月标签。

export function addMonths(n: number): Date {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth() + n, 1);
}

export function monthLabel(n: number): string {
  const d = addMonths(n);
  return `${d.getFullYear()}年${d.getMonth() + 1}月`;
}

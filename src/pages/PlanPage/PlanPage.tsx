import { useMemo } from 'react';
import { CalendarClock, Sprout, Flag } from 'lucide-react';
import { useStore } from '@/lib/store-context';
import { buildPlan, fmtMoney } from '@/lib/algorithm';
import { monthLabel } from '@/lib/date';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import { platformColor } from '@/lib/platform-color';

export default function PlanPage() {
  const { state } = useStore();

  const plan = useMemo(
    () => buildPlan(state.debts, state.budget),
    [state.debts, state.budget],
  );

  const totalPrincipal = state.debts.reduce((s, d) => s + (Number(d.balance) || 0), 0);
  const settledCount = Object.keys(plan.payoffMap).length;
  const overallPct =
    state.debts.length > 0 ? Math.round((settledCount / state.debts.length) * 100) : 0;

  const payoffList = Object.entries(plan.payoffMap)
    .map(([id, month]) => {
      const debt = state.debts.find((d) => d.id === id);
      return debt ? { debt, month } : null;
    })
    .filter((x): x is { debt: (typeof state.debts)[number]; month: number } => x !== null)
    .sort((a, b) => a.month - b.month);

  const previewMonths = plan.months.slice(0, 6);

  const findDebt = (id: string) => state.debts.find((x) => x.id === id);
  const colorOf = (id: string) => {
    const d = findDebt(id);
    return d ? platformColor(d) : undefined;
  };
  const emojiOf = (id: string) => findDebt(id)?.emoji ?? '';

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-serif text-2xl font-bold text-foreground">还款计划</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          按利率优先（雪崩法）测算每月还款分配，先结清高息负债，整体利息最少。
        </p>
      </div>

      {/* 汇总三卡 */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="text-sm text-muted-foreground">每月可还预算</div>
          <div className="mt-1.5 font-serif text-2xl font-bold text-foreground">
            ¥{fmtMoney(state.budget)}
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="text-sm text-muted-foreground">预计总利息</div>
          <div className="mt-1.5 font-serif text-2xl font-bold text-destructive">
            ¥{fmtMoney(plan.totalInterest)}
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="text-sm text-muted-foreground">累计需还（本金+利息）</div>
          <div className="mt-1.5 font-serif text-2xl font-bold text-foreground">
            ¥{fmtMoney(plan.totalPaid)}
          </div>
        </div>
      </div>

      {/* 整体上岸进度（方案测算，非实际还款进度） */}
      <div className="rounded-xl border border-border bg-card p-5">
        <div className="mb-2 flex items-center justify-between">
          <span className="font-medium text-foreground">整体上岸进度（方案测算）</span>
          <span className="text-sm text-muted-foreground">
            {plan.totalMonths > 0
              ? `共 ${plan.totalMonths} 个月 · 约 ${monthLabel(plan.totalMonths)} 全部结清`
              : '暂无在还负债'}
          </span>
        </div>
        <Progress value={overallPct} className="h-2.5" />
        <div className="mt-2 text-xs text-muted-foreground">
          方案覆盖 {settledCount}/{state.debts.length} 笔 · 期初本金 ¥{fmtMoney(totalPrincipal)} · 预计总利息 ¥
          {fmtMoney(plan.totalInterest)}（仅为测算，尚未开始实际还款）
        </div>
      </div>

      {/* 逐月分配表 */}
      <section className="flex flex-col gap-4">
        <h2 className="flex items-center gap-2 font-serif text-lg font-semibold">
          <CalendarClock size={18} className="text-primary" />
          逐月还款分配
        </h2>

        {previewMonths.length === 0 ? (
          <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-border bg-card py-16 text-center">
            <Sprout size={32} className="text-leaf" />
            <p className="text-sm text-muted-foreground">
              请先在「负债平台」填写欠款并设置每月预算。
            </p>
          </div>
        ) : (
          previewMonths.map((m) => (
            <div key={m.month} className="rounded-xl border border-border bg-card p-5">
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <span className="font-semibold text-foreground">
                  第 {m.month} 个月 · {m.label}
                </span>
                <span className="text-sm text-muted-foreground">
                  当月还款 ¥{fmtMoney(m.totalPaid)} · 其中利息 ¥{fmtMoney(m.totalInterest)}
                </span>
              </div>
              <div className="min-w-0 overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="whitespace-nowrap">平台</TableHead>
                      <TableHead className="whitespace-nowrap text-right">年利率</TableHead>
                      <TableHead className="whitespace-nowrap text-right">当月还款</TableHead>
                      <TableHead className="whitespace-nowrap text-right">其中利息</TableHead>
                      <TableHead className="whitespace-nowrap text-right">其中本金</TableHead>
                      <TableHead className="whitespace-nowrap text-right">月末余额</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {m.rows.map((r) => {
                      const pc = colorOf(r.id);
                      return (
                      <TableRow key={r.id} style={{ backgroundColor: pc?.soft }}>
                        <TableCell>
                          <span className="flex items-center gap-2">
                            <span
                              className="size-3 shrink-0 rounded-full"
                              style={{ backgroundColor: pc?.main }}
                            />
                            <span className="block max-w-[160px] truncate">
                              {emojiOf(r.id)} {r.name}
                            </span>
                          </span>
                        </TableCell>
                        <TableCell className="text-right">{r.rate}%</TableCell>
                        <TableCell className="text-right">¥{fmtMoney(r.pay)}</TableCell>
                        <TableCell className="text-right text-destructive">
                          ¥{fmtMoney(r.interest)}
                        </TableCell>
                        <TableCell className="text-right text-success">
                          ¥{fmtMoney(r.principal)}
                        </TableCell>
                        <TableCell className="text-right text-muted-foreground">
                          ¥{fmtMoney(r.balance)}
                        </TableCell>
                      </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </div>
          ))
        )}

        {plan.months.length > previewMonths.length && (
          <p className="text-xs text-muted-foreground">
            仅展示前 {previewMonths.length} 个月，后续月份按同一规则顺延测算。
          </p>
        )}
      </section>

      {/* 逐笔还清节点 */}
      {payoffList.length > 0 && (
        <section className="flex flex-col gap-4">
          <h2 className="flex items-center gap-2 font-serif text-lg font-semibold">
            <Flag size={18} className="text-primary" />
            逐笔还清节点
          </h2>
          <div className="rounded-xl border border-border bg-card p-5">
            <ol className="relative ml-2 flex flex-col gap-5 border-l border-border pl-6">
              {payoffList.map(({ debt, month }) => {
                const pc = platformColor(debt);
                return (
                <li key={debt.id} className="relative">
                  <span
                    className="absolute -left-[31px] top-1 size-3 rounded-full"
                    style={{ backgroundColor: pc.main }}
                  />
                  <div className="flex flex-wrap items-baseline gap-x-2">
                    <span className="font-semibold text-foreground">
                      {debt.emoji} {debt.name}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      第 {month} 个月 · 约 {monthLabel(month)} 结清
                    </span>
                  </div>
                </li>
                );
              })}
            </ol>
          </div>
        </section>
      )}
    </div>
  );
}
import { useMemo, useState } from 'react';
import { Plus, Pencil, Trash2, Sprout, Lightbulb } from 'lucide-react';
import { useStore } from '@/lib/store-context';
import { buildPlan, fmtMoney } from '@/lib/algorithm';
import { monthLabel } from '@/lib/date';
import type { IDebt } from '@/lib/types';
import PlatformIcon from '@/components/PlatformIcon';
import { TIER_META } from '@/lib/tier-meta';
import { platformColor } from '@/lib/platform-color';
import DebtFormDialog from '@/components/DebtFormDialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

export default function DebtsPage() {
  const { state, setBudget, addDebt, updateDebt, removeDebt } = useStore();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<IDebt | null>(null);
  const [nonce, setNonce] = useState(0);

  const plan = useMemo(
    () => buildPlan(state.debts, state.budget),
    [state.debts, state.budget],
  );

  const totalBalance = state.debts.reduce((s, d) => s + (Number(d.balance) || 0), 0);

  const openAdd = () => {
    setEditing(null);
    setNonce((n) => n + 1);
    setOpen(true);
  };

  const openEdit = (d: IDebt) => {
    setEditing(d);
    setNonce((n) => n + 1);
    setOpen(true);
  };

  const handleSubmit = (values: Omit<IDebt, 'id'>) => {
    if (editing) {
      updateDebt(editing.id, values);
      toast.success('已更新负债');
    } else {
      addDebt(values);
      toast.success('已添加负债');
    }
  };

  const handleRemove = (d: IDebt) => {
    if (window.confirm(`确定删除「${d.name}」吗？此操作不可恢复。`)) {
      removeDebt(d.id);
      toast.success('已删除负债');
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* 页头 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-2xl font-bold text-foreground">负债平台</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            填写各平台当前欠款、利率与最低还款，系统按利率优先安排每月还款。
          </p>
        </div>
        <Button onClick={openAdd} className="gap-1.5">
          <Plus size={16} />
          添加负债
        </Button>
      </div>

      {/* 规则提示 */}
      <div className="flex items-start gap-3 rounded-xl border border-border bg-card p-4">
        <Lightbulb className="mt-0.5 shrink-0 text-primary" size={18} />
        <p className="text-sm leading-relaxed text-muted-foreground">
          <span className="font-medium text-foreground">利率优先（雪崩法）：</span>
          每月预算先保证各笔负债的当月利息，剩余本金优先偿还利率最高的一笔；结清后自动转向下一笔高息负债，整体利息最少。
        </p>
      </div>

      {/* 总览三卡 */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="text-sm text-muted-foreground">总欠款</div>
          <div className="mt-1.5 font-serif text-2xl font-bold text-destructive">
            ¥{fmtMoney(totalBalance)}
          </div>
          <div className="mt-1 text-xs text-muted-foreground">共 {state.debts.length} 笔负债</div>
        </div>

        <div className="rounded-xl border border-border bg-card p-5">
          <div className="text-sm text-muted-foreground">每月可还预算（元）</div>
          <div className="mt-2 flex items-center gap-2">
            <Input
              type="number"
              min={0}
              className="h-9 max-w-[140px]"
              value={state.budget}
              onChange={(e) => setBudget(Number(e.target.value) || 0)}
            />
          </div>
          <div className="mt-1 text-xs text-muted-foreground">在「收入账本」里可按结余自动测算</div>
        </div>

        <div className="rounded-xl border border-border bg-card p-5">
          <div className="text-sm text-muted-foreground">预计整体还清</div>
          <div className="mt-1.5 font-serif text-2xl font-bold text-success">
            {plan.totalMonths > 0 ? `${plan.totalMonths} 个月` : '—'}
          </div>
          <div className="mt-1 text-xs text-muted-foreground">
            {plan.totalMonths > 0 ? `约 ${monthLabel(plan.totalMonths)} 全部上岸 🌱` : '暂无在还负债'}
          </div>
        </div>
      </div>

      {/* 负债卡片列表 */}
      {state.debts.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-border bg-card py-16 text-center">
          <Sprout size={32} className="text-leaf" />
          <p className="text-sm text-muted-foreground">还没有负债记录，点上方「添加负债」开始规划。</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {state.debts.map((d) => {
            const meta = TIER_META[d.tier];
            const pc = platformColor(d);
            const payoff = plan.payoffMap[d.id];
            const settled = Number(d.balance) <= 0;
            const pct =
              !settled && payoff && plan.totalMonths > 0
                ? Math.round((payoff / plan.totalMonths) * 100)
                : settled
                  ? 100
                  : 0;
            return (
              <div
                key={d.id}
                className="rounded-xl border border-border p-5 border-l-4"
                style={{ borderLeftColor: pc.main, backgroundColor: pc.soft }}
              >
                <div className="flex items-start gap-4">
                  <PlatformIcon icon={d.icon} tier={d.tier} color={pc} />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-lg font-semibold text-foreground">
                        {d.emoji} {d.name}
                      </span>
                      <Badge
                        style={{ backgroundColor: meta.bg, color: meta.fg }}
                        className="border-0"
                      >
                        {meta.label}
                      </Badge>
                    </div>
                    <div className="mt-0.5 text-xs text-muted-foreground">{d.note}</div>

                    <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
                      <div>
                        <div className="text-xs text-muted-foreground">当前欠款</div>
                        <div className="mt-0.5 font-semibold text-foreground">
                          ¥{fmtMoney(d.balance)}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground">年利率</div>
                        <div className="mt-0.5 font-semibold" style={{ color: meta.fg }}>
                          {d.annualRate}%
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground">每月最低还款</div>
                        <div className="mt-0.5 font-semibold text-foreground">
                          ¥{fmtMoney(d.minPayment)}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground">还款日</div>
                        <div className="mt-0.5 font-semibold text-foreground">{d.dueDay}</div>
                      </div>
                    </div>

                    {/* 预计还清时限 */}
                    <div className="mt-4">
                      <div className="mb-1.5 flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">预计还清时限</span>
                        <span className="font-medium text-foreground">
                          {settled
                            ? '已结清 🌿'
                            : payoff
                              ? `第 ${payoff} 个月 · 约 ${monthLabel(payoff)} 还清`
                              : '待纳入计划'}
                        </span>
                      </div>
                      <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{ width: `${pct}%`, backgroundColor: pc.main }}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex shrink-0 flex-col gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-1"
                      onClick={() => openEdit(d)}
                    >
                      <Pencil size={14} />
                      编辑
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="gap-1 text-destructive hover:text-destructive"
                      onClick={() => handleRemove(d)}
                    >
                      <Trash2 size={14} />
                      删除
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <DebtFormDialog
        key={nonce}
        open={open}
        onOpenChange={setOpen}
        initial={editing}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
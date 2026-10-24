import { TrendingUp, Home, Coffee, PiggyBank, Check } from 'lucide-react';
import { useStore } from '@/lib/store-context';
import { fmtMoney } from '@/lib/algorithm';
import type { ICategoryItem } from '@/lib/types';
import { CATEGORY_THEME, type PlatformColor } from '@/lib/platform-color';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

interface EntryCardProps {
  title: string;
  icon: React.ReactNode;
  theme: PlatformColor;
  items: ICategoryItem[];
  total: number;
  onUpdate: (id: string, amount: number) => void;
}

function EntryCard({ title, icon, theme, items, total, onUpdate }: EntryCardProps) {
  return (
    <div
      className="rounded-xl border border-border p-5"
      style={{ backgroundColor: theme.soft }}
    >
      <div className="mb-3 flex items-center gap-2">
        <span style={{ color: theme.main }}>{icon}</span>
        <h2 className="font-serif text-lg font-semibold">{title}</h2>
        <span
          className="ml-auto font-serif font-bold"
          style={{ color: theme.main }}
        >
          ¥{fmtMoney(total)}
        </span>
      </div>
      <ul className="flex flex-col gap-2">
        {items.map((e) => (
          <li
            key={e.id}
            className="flex items-center gap-2 rounded-lg bg-white/55 px-3 py-2"
          >
            <span className="text-base leading-none">{e.emoji}</span>
            <span className="whitespace-nowrap text-sm text-foreground">{e.label}</span>
            <Input
              type="number"
              min={0}
              className="ml-auto h-8 w-20"
              value={e.amount}
              onChange={(ev) => onUpdate(e.id, Number(ev.target.value) || 0)}
            />
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function IncomePage() {
  const {
    state,
    setBudget,
    updateIncomeItem,
    updateFixedItem,
    updateLivingItem,
  } = useStore();

  const incomeTotal = state.incomeItems.reduce((s, x) => s + (Number(x.amount) || 0), 0);
  const fixedTotal = state.fixedItems.reduce((s, x) => s + (Number(x.amount) || 0), 0);
  const flexibleTotal = state.livingItems.reduce(
    (s, x) => s + (Number(x.amount) || 0),
    0,
  );
  const surplus = incomeTotal - fixedTotal;

  const adoptSurplus = () => {
    setBudget(Math.max(0, surplus));
    toast.success('已把可还结余填入每月还款预算');
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-serif text-2xl font-bold text-foreground">收入账本</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          记录每月收入、固定支出和弹性生活开销，自动算出可用于还债的结余。
        </p>
      </div>

      {/* 汇总三卡 */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="text-sm text-muted-foreground">本月收入</div>
          <div className="mt-1.5 font-serif text-2xl font-bold text-success">
            ¥{fmtMoney(incomeTotal)}
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="text-sm text-muted-foreground">固定支出</div>
          <div className="mt-1.5 font-serif text-2xl font-bold text-destructive">
            ¥{fmtMoney(fixedTotal)}
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="text-sm text-muted-foreground">可还结余（收入 − 固定支出）</div>
          <div
            className="mt-1.5 font-serif text-2xl font-bold"
            style={{ color: surplus >= 0 ? 'var(--success)' : 'var(--destructive)' }}
          >
            ¥{fmtMoney(surplus)}
          </div>
          <div className="mt-2 flex items-center gap-2">
            <span className="text-xs text-muted-foreground">
              当前还款预算 ¥{fmtMoney(state.budget)}
            </span>
            {surplus > 0 && (
              <Button variant="outline" size="sm" className="gap-1" onClick={adoptSurplus}>
                <Check size={14} />
                采用结余为预算
              </Button>
            )}
          </div>
        </div>
      </div>

      {surplus < 0 && (
        <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
          固定支出已超过收入，建议先压缩刚性支出，再安排还款，避免借新还旧。
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <EntryCard
          title="月收入"
          icon={<TrendingUp size={18} />}
          theme={CATEGORY_THEME.income}
          items={state.incomeItems}
          total={incomeTotal}
          onUpdate={updateIncomeItem}
        />
        <EntryCard
          title="固定支出"
          icon={<Home size={18} />}
          theme={CATEGORY_THEME.fixed}
          items={state.fixedItems}
          total={fixedTotal}
          onUpdate={updateFixedItem}
        />
        <EntryCard
          title="弹性生活"
          icon={<Coffee size={18} />}
          theme={CATEGORY_THEME.living}
          items={state.livingItems}
          total={flexibleTotal}
          onUpdate={updateLivingItem}
        />
      </div>

      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <PiggyBank size={14} />
        结余仅为本机记录参考，实际请结合本人当月工资条与账单填写；弹性开销是否超支，以「预算规划」页的缓冲为准。
      </div>
    </div>
  );
}
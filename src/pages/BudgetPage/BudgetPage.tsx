import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  PieChart,
  CalendarDays,
  Coffee,
  ShieldCheck,
  AlertCircle,
  Wallet,
  ArrowRight,
  Scale,
  Home,
  TrendingUp,
  type LucideIcon,
} from 'lucide-react';
import { useStore } from '@/lib/store-context';
import {
  calcBudget,
  SJZ_BASIC_MONTHLY,
  SJZ_COMFORT_MONTHLY,
  SJZ_NOTE,
  type BudgetStatus,
  type LivingLevel,
} from '@/lib/budget';
import { buildPlan, fmtMoney } from '@/lib/algorithm';
import { monthLabel } from '@/lib/date';
import { platformColor, CATEGORY_THEME, type PlatformColor } from '@/lib/platform-color';
import type { ICategoryItem } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

const STATUS_META: Record<
  BudgetStatus,
  { title: string; desc: string; icon: LucideIcon; badgeClass: string }
> = {
  ok: {
    title: '现金流健康',
    desc: '收入覆盖固定支出、还债和生活费，按规划执行即可稳步上岸。',
    icon: ShieldCheck,
    badgeClass: 'border-success/30 bg-success/10 text-success',
  },
  tight: {
    title: '生活费偏紧',
    desc: '生活费额度低于基础生活参考，注意压缩弹性开销，别影响基本生活。',
    icon: AlertCircle,
    badgeClass: 'border-warning/30 bg-warning/10 text-warning',
  },
  noLiving: {
    title: '已无生活费空间',
    desc: '收入扣完固定支出和还债后生活费为 0，请先下调还债额或增加收入。',
    icon: AlertCircle,
    badgeClass: 'border-destructive/30 bg-destructive/10 text-destructive',
  },
  deficitDebt: {
    title: '还债超出结余',
    desc: '每月还债已超过收入减固定支出的结余，长期会借新还旧，请先下调还债额。',
    icon: AlertCircle,
    badgeClass: 'border-destructive/30 bg-destructive/10 text-destructive',
  },
  overFlexible: {
    title: '弹性支出超支',
    desc: '弹性生活开销已超过可花生活费额度，需要压缩聚餐、网购等弹性开销，或下调还债额、增加收入。',
    icon: AlertCircle,
    badgeClass: 'border-destructive/30 bg-destructive/10 text-destructive',
  },
};

const LEVEL_META: Record<LivingLevel, { text: string; className: string }> = {
  none: { text: '当前没有可花生活费', className: 'text-destructive' },
  below: {
    text: `低于基础生活参考 ¥${fmtMoney(SJZ_BASIC_MONTHLY)}/月，弹性开销从紧`,
    className: 'text-warning',
  },
  normal: {
    text: `处于基础生活参考区间 ¥${fmtMoney(SJZ_BASIC_MONTHLY)}–${fmtMoney(SJZ_COMFORT_MONTHLY)}/月`,
    className: 'text-success',
  },
  above: {
    text: '高于参考区间，结余可优先存应急金或加速还债',
    className: 'text-foreground',
  },
};

interface Segment {
  key: 'fixedExpense' | 'debtBudget' | 'living';
  label: string;
  color: string;
  amount: number;
}

interface CategoryCardProps {
  title: string;
  icon: LucideIcon;
  theme: PlatformColor;
  items: ICategoryItem[];
  total: number;
  base: number;
  onUpdate: (id: string, amount: number) => void;
  showRatio?: boolean;
  footer?: React.ReactNode;
}

function CategoryCard({
  title,
  icon: Icon,
  theme,
  items,
  total,
  base,
  onUpdate,
  showRatio = true,
  footer,
}: CategoryCardProps) {
  const pct = base > 0 ? (total / base) * 100 : 0;
  return (
    <div
      className="flex flex-col rounded-xl border border-border p-5"
      style={{ backgroundColor: theme.soft }}
    >
      <div className="mb-3 flex items-center gap-2">
        <Icon size={18} style={{ color: theme.main }} />
        <h2 className="font-serif text-lg font-semibold">{title}</h2>
      </div>
      <ul className="flex flex-col gap-2">
        {items.map((it) => (
          <li
            key={it.id}
            className="flex items-center gap-2 rounded-lg bg-white/55 px-3 py-2"
          >
            <span className="text-base leading-none">{it.emoji}</span>
            <span className="whitespace-nowrap text-sm text-foreground">{it.label}</span>
            <Input
              type="number"
              min={0}
              className="ml-auto h-8 w-20"
              value={it.amount}
              onChange={(ev) => onUpdate(it.id, Number(ev.target.value) || 0)}
            />
          </li>
        ))}
      </ul>
      <div className="mt-3 flex items-center justify-between border-t border-border px-1 pt-2.5">
        <span className="text-sm text-muted-foreground">
          {showRatio ? `合计 · 占收入 ${pct.toFixed(0)}%` : '合计'}
        </span>
        <span className="font-serif font-bold" style={{ color: theme.main }}>
          ¥{fmtMoney(total)}
        </span>
      </div>
      {footer}
    </div>
  );
}

export default function BudgetPage() {
  const { state, setBudget, updateIncomeItem, updateFixedItem, updateLivingItem } =
    useStore();

  const b = useMemo(
    () =>
      calcBudget(
        state.incomeItems,
        state.fixedItems,
        state.livingItems,
        state.budget,
      ),
    [state.incomeItems, state.fixedItems, state.livingItems, state.budget],
  );

  const plan = useMemo(
    () => buildPlan(state.debts, state.budget),
    [state.debts, state.budget],
  );

  const meta = STATUS_META[b.status];
  const StatusIcon = meta.icon;
  const level = LEVEL_META[b.livingLevel];

  const segments: Segment[] = [
    { key: 'fixedExpense', label: '固定支出', color: '#C0705A', amount: b.fixedExpense },
    { key: 'debtBudget', label: '每月还债', color: '#2E5E3A', amount: b.debtBudget },
    { key: 'living', label: '生活费', color: '#8FBF8E', amount: Math.max(0, b.living) },
  ];

  const R = 72;
  const C = 2 * Math.PI * R;
  const incomeBase = Math.max(b.income, 0.01);
  let runningOffset = 0;
  const arcs = segments
    .filter((s) => s.amount > 0.01)
    .map((s) => {
      const frac = Math.min(1, s.amount / incomeBase);
      const dash = frac * C;
      const arc = { ...s, frac, dash, start: runningOffset };
      runningOffset += dash;
      return arc;
    });

  const firstMonth = plan.months[0];
  const emojiOf = (id: string) => state.debts.find((d) => d.id === id)?.emoji ?? '';
  const colorOf = (id: string) => {
    const d = state.debts.find((x) => x.id === id);
    return d ? platformColor(d) : undefined;
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-serif text-2xl font-bold text-foreground">预算规划</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          填好收入、固定支出、弹性生活和还债额度，自动算出每周、每天最多能花多少钱。
        </p>
      </div>

      {/* 还债额度控制 */}
      <div className="rounded-xl border border-border bg-card p-5">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <Wallet size={18} className="text-primary" />
            <Label htmlFor="budget-debt" className="text-muted-foreground">
              每月还债额度（元）
            </Label>
          </div>
          <Input
            id="budget-debt"
            type="number"
            min={0}
            className="h-10 max-w-[180px]"
            value={state.budget}
            onChange={(e) => setBudget(Number(e.target.value) || 0)}
          />
          <p className="text-xs text-muted-foreground">
            各平台还款额由系统按利率优先自动分配；下方收入、支出明细可直接填写。
          </p>
        </div>
      </div>

      {/* 月度现金流四卡：状态并入「可花生活费」卡 */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="text-sm text-muted-foreground">月收入</div>
          <div className="mt-1.5 font-serif text-xl font-bold text-success">
            ¥{fmtMoney(b.income)}
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="text-sm text-muted-foreground">固定支出</div>
          <div className="mt-1.5 font-serif text-xl font-bold text-destructive">
            ¥{fmtMoney(b.fixedExpense)}
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="text-sm text-muted-foreground">每月还债</div>
          <div className="mt-1.5 font-serif text-xl font-bold text-primary">
            ¥{fmtMoney(b.debtBudget)}
          </div>
        </div>
        <div className="flex flex-col gap-2 rounded-xl border border-border bg-card p-5">
          <div className="flex items-center justify-between gap-2">
            <span className="text-sm text-muted-foreground">可花生活费</span>
            <Badge variant="outline" className={meta.badgeClass}>
              <StatusIcon size={12} className="mr-1" />
              {meta.title}
            </Badge>
          </div>
          <div
            className={`font-serif text-xl font-bold ${
              b.living > 0 ? 'text-foreground' : 'text-muted-foreground'
            }`}
          >
            ¥{fmtMoney(b.living)}
          </div>
          <p className="text-xs leading-relaxed text-muted-foreground">{meta.desc}</p>
        </div>
      </div>

      {/* 每周 / 每天上限 */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-border bg-card p-6">
          <div className="flex items-center gap-2 text-muted-foreground">
            <CalendarDays size={18} />
            <span className="text-sm">每周最多花</span>
          </div>
          <div className="mt-2 font-serif text-3xl font-bold text-primary">
            ¥{fmtMoney(b.weekly)}
          </div>
          <p className={`mt-1 text-xs ${level.className}`}>按整月 4 周分摊，{level.text}</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-6">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Coffee size={18} />
            <span className="text-sm">每天最多花</span>
          </div>
          <div className="mt-2 font-serif text-3xl font-bold text-primary">
            ¥{fmtMoney(b.daily)}
          </div>
          <p className={`mt-1 text-xs ${level.className}`}>按月均 30 天折算，当天超支从后面几天补回。</p>
        </div>
      </div>

      {/* 三组细分明细：收入 / 固定支出 / 可花生活费 */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <CategoryCard
          title="月收入"
          icon={TrendingUp}
          theme={CATEGORY_THEME.income}
          items={state.incomeItems}
          total={b.income}
          base={b.income || 1}
          onUpdate={updateIncomeItem}
          showRatio={false}
        />
        <CategoryCard
          title="固定支出"
          icon={Home}
          theme={CATEGORY_THEME.fixed}
          items={state.fixedItems}
          total={b.fixedExpense}
          base={b.income || 1}
          onUpdate={updateFixedItem}
        />
        <CategoryCard
          title="可花生活费"
          icon={Coffee}
          theme={CATEGORY_THEME.living}
          items={state.livingItems}
          total={b.flexibleExpense}
          base={b.income || 1}
          onUpdate={updateLivingItem}
          footer={
            <div className="mt-2 rounded-lg bg-white/55 px-3 py-2 text-xs leading-relaxed text-muted-foreground">
              生活费额度 ¥{fmtMoney(b.living)} · 弹性计划 ¥{fmtMoney(b.flexibleExpense)} ·
              缓冲{' '}
              <span
                className={`font-semibold ${
                  b.buffer < 0 ? 'text-destructive' : 'text-success'
                }`}
              >
                ¥{fmtMoney(b.buffer)}
              </span>
            </div>
          }
        />
      </div>

      {/* 每月收入去向：环形饼图 */}
      <section className="rounded-xl border border-border bg-card p-5">
        <h2 className="flex items-center gap-2 font-serif text-lg font-semibold">
          <PieChart size={18} className="text-primary" />
          每月收入去向
        </h2>

        {b.income <= 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">
            请先填写月收入。
          </p>
        ) : (
          <div className="mt-4 grid grid-cols-1 items-center gap-6 sm:grid-cols-[220px_1fr]">
            <div className="mx-auto">
              <svg width="200" height="200" viewBox="0 0 200 200">
                <g transform="rotate(-90 100 100)">
                  <circle
                    cx="100"
                    cy="100"
                    r={R}
                    fill="none"
                    stroke="var(--secondary)"
                    strokeWidth="34"
                  />
                  {arcs.map((a) => (
                    <circle
                      key={a.key}
                      cx="100"
                      cy="100"
                      r={R}
                      fill="none"
                      stroke={a.color}
                      strokeWidth="34"
                      strokeDasharray={`${a.dash} ${C - a.dash}`}
                      strokeDashoffset={-a.start}
                    />
                  ))}
                </g>
                <text
                  x="100"
                  y="92"
                  textAnchor="middle"
                  className="fill-muted-foreground"
                  fontSize="12"
                >
                  月收入
                </text>
                <text
                  x="100"
                  y="116"
                  textAnchor="middle"
                  className="fill-foreground font-serif"
                  fontSize="18"
                  fontWeight="700"
                >
                  ¥{fmtMoney(b.income)}
                </text>
              </svg>
            </div>

            <ul className="flex flex-col gap-3">
              {segments.map((s) => {
                const pct = b.income > 0 ? (s.amount / b.income) * 100 : 0;
                return (
                  <li key={s.key} className="flex items-center gap-3">
                    <span
                      className="size-3.5 shrink-0 rounded-full"
                      style={{ backgroundColor: s.color }}
                    />
                    <span className="w-20 text-sm text-foreground">{s.label}</span>
                    <span className="flex-1 font-semibold">¥{fmtMoney(s.amount)}</span>
                    <span className="w-14 text-right text-sm text-muted-foreground">
                      {pct.toFixed(0)}%
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </section>

      {/* 各平台本月还款 */}
      <section className="flex flex-col gap-4">
        <h2 className="flex items-center gap-2 font-serif text-lg font-semibold">
          <Scale size={18} className="text-primary" />
          本月各平台还款分配
        </h2>

        {!firstMonth ? (
          <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-border bg-card py-12 text-center">
            <Coffee size={28} className="text-leaf" />
            <p className="text-sm text-muted-foreground">
              请先在「负债平台」填写欠款并设置每月还债额度。
            </p>
          </div>
        ) : (
          <div className="rounded-xl border border-border bg-card p-5">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <span className="font-semibold text-foreground">
                第 1 个月 · {firstMonth.label}
              </span>
              <span className="text-sm text-muted-foreground">
                当月还款 ¥{fmtMoney(firstMonth.totalPaid)} · 其中利息 ¥
                {fmtMoney(firstMonth.totalInterest)}
              </span>
            </div>
            <div className="min-w-0 overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="whitespace-nowrap">平台</TableHead>
                    <TableHead className="whitespace-nowrap text-right">年利率</TableHead>
                    <TableHead className="whitespace-nowrap text-right">本月还款</TableHead>
                    <TableHead className="whitespace-nowrap text-right">其中利息</TableHead>
                    <TableHead className="whitespace-nowrap text-right">其中本金</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {firstMonth.rows.map((r) => {
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
                    </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </div>
        )}
      </section>

      {/* 基础生活参考对照 */}
      <section className="rounded-xl border border-border bg-card p-5">
        <h2 className="flex items-center gap-2 font-serif text-lg font-semibold">
          <Scale size={18} className="text-primary" />
          基础生活参考对照
        </h2>
        <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="rounded-lg bg-secondary/60 p-4">
            <div className="text-xs text-muted-foreground">基础参考下限</div>
            <div className="mt-1 font-serif text-lg font-bold text-foreground">
              ¥{fmtMoney(SJZ_BASIC_MONTHLY)}/月
            </div>
          </div>
          <div className="rounded-lg bg-secondary/60 p-4">
            <div className="text-xs text-muted-foreground">正常参考上限</div>
            <div className="mt-1 font-serif text-lg font-bold text-foreground">
              ¥{fmtMoney(SJZ_COMFORT_MONTHLY)}/月
            </div>
          </div>
          <div className="rounded-lg bg-secondary/60 p-4">
            <div className="text-xs text-muted-foreground">你的生活费额度</div>
            <div className="mt-1 font-serif text-lg font-bold text-primary">
              ¥{fmtMoney(b.living)}/月
            </div>
          </div>
        </div>
        <p className="mt-3 text-xs leading-relaxed text-muted-foreground">{SJZ_NOTE}</p>
      </section>

      {/* 上岸联动 */}
      <section className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-border bg-card p-5">
        <div>
          <h2 className="font-serif text-lg font-semibold">按此预算的上岸进度</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {plan.totalMonths > 0
              ? `每月还 ¥${fmtMoney(b.debtBudget)}，预计 ${plan.totalMonths} 个月 · 约 ${monthLabel(
                  plan.totalMonths,
                )} 全部结清，预计总利息 ¥${fmtMoney(plan.totalInterest)}。`
              : '当前没有在还负债，或每月还债额度为 0。'}
          </p>
        </div>
        <Link to="/plan">
          <Button variant="outline" className="gap-1.5">
            查看还款计划
            <ArrowRight size={16} />
          </Button>
        </Link>
      </section>
    </div>
  );
}
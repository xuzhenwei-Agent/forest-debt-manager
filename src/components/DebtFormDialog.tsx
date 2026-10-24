import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { IDebt, IconKind, Tier } from '@/lib/types';
import { PRESET_COLORS } from '@/lib/platform-color';

interface DebtFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initial: IDebt | null;
  onSubmit: (values: Omit<IDebt, 'id'>) => void;
}

const ICON_OPTIONS: { value: IconKind; label: string }[] = [
  { value: 'card', label: '信用卡' },
  { value: 'bank', label: '银行卡 / 银行' },
  { value: 'coin', label: '金币（花呗类）' },
  { value: 'cart', label: '购物车（白条类）' },
  { value: 'music', label: '音符（月付类）' },
  { value: 'chat', label: '气泡（微信类）' },
  { value: 'heart', label: '心形（朋友借款）' },
];

const TIER_OPTIONS: { value: Tier; label: string }[] = [
  { value: 'hi', label: '高息优先' },
  { value: 'mid', label: '中息' },
  { value: 'zero', label: '无息' },
];

interface FormState {
  name: string;
  emoji: string;
  icon: IconKind;
  tier: Tier;
  balance: string;
  annualRate: string;
  minPayment: string;
  dueDay: string;
  note: string;
  colorMain: string;
}

const EMPTY: FormState = {
  name: '',
  emoji: '💳',
  icon: 'card',
  tier: 'hi',
  balance: '',
  annualRate: '',
  minPayment: '',
  dueDay: '',
  note: '',
  colorMain: '',
};

function fromInitial(initial: IDebt | null): FormState {
  if (!initial) return EMPTY;
  return {
    name: initial.name,
    emoji: initial.emoji,
    icon: initial.icon,
    tier: initial.tier,
    balance: String(initial.balance),
    annualRate: String(initial.annualRate),
    minPayment: String(initial.minPayment),
    dueDay: initial.dueDay,
    note: initial.note,
    colorMain: initial.colorMain ?? '',
  };
}

export default function DebtFormDialog({
  open,
  onOpenChange,
  initial,
  onSubmit,
}: DebtFormDialogProps) {
  const [form, setForm] = useState<FormState>(() => fromInitial(initial));

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onSubmit({
      name: form.name.trim() || '未命名负债',
      emoji: form.emoji.trim() || '💳',
      icon: form.icon,
      tier: form.tier,
      balance: Number(form.balance) || 0,
      annualRate: Number(form.annualRate) || 0,
      minPayment: Number(form.minPayment) || 0,
      dueDay: form.dueDay.trim() || '无固定期限',
      note: form.note.trim(),
      colorMain: form.colorMain || undefined,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>{initial ? '编辑负债' : '添加负债'}</DialogTitle>
          <DialogDescription>
            利率为公开参考口径，实际以本人 APP 账单为准，可在下方直接修改。
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="grid gap-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-1.5">
              <Label htmlFor="debt-name">平台 / 名称</Label>
              <Input
                id="debt-name"
                value={form.name}
                onChange={(e) => set('name', e.target.value)}
                placeholder="如：招商信用卡"
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="debt-emoji">表情</Label>
              <Input
                id="debt-emoji"
                value={form.emoji}
                onChange={(e) => set('emoji', e.target.value)}
                placeholder="💳"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-1.5">
              <Label>图标类别</Label>
              <Select
                value={form.icon}
                onValueChange={(v) => set('icon', v as IconKind)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ICON_OPTIONS.map((o) => (
                    <SelectItem key={o.value} value={o.value}>
                      {o.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-1.5">
              <Label>梯队</Label>
              <Select
                value={form.tier}
                onValueChange={(v) => set('tier', v as Tier)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TIER_OPTIONS.map((o) => (
                    <SelectItem key={o.value} value={o.value}>
                      {o.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-1.5">
            <Label>卡片颜色</Label>
            <div className="flex flex-wrap items-center gap-2.5">
              {PRESET_COLORS.map((c) => (
                <button
                  type="button"
                  key={c}
                  onClick={() => set('colorMain', c)}
                  aria-label={`选择颜色 ${c}`}
                  className={`size-7 rounded-full border-2 transition-transform ${
                    form.colorMain === c
                      ? 'scale-110 border-foreground'
                      : 'border-white/80 hover:scale-105'
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
              <label className="flex cursor-pointer items-center gap-2 text-xs text-muted-foreground">
                <input
                  type="color"
                  value={form.colorMain || '#2E5E3A'}
                  onChange={(e) => set('colorMain', e.target.value)}
                  className="size-7 cursor-pointer rounded-full border-0 bg-transparent p-0"
                />
                自定义
              </label>
              {form.colorMain && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => set('colorMain', '')}
                >
                  恢复默认色
                </Button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="grid gap-1.5">
              <Label htmlFor="debt-balance">当前欠款（元）</Label>
              <Input
                id="debt-balance"
                type="number"
                min={0}
                value={form.balance}
                onChange={(e) => set('balance', e.target.value)}
                placeholder="0"
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="debt-rate">年利率（%）</Label>
              <Input
                id="debt-rate"
                type="number"
                min={0}
                step="0.01"
                value={form.annualRate}
                onChange={(e) => set('annualRate', e.target.value)}
                placeholder="18.25"
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="debt-min">每月最低还款（元）</Label>
              <Input
                id="debt-min"
                type="number"
                min={0}
                value={form.minPayment}
                onChange={(e) => set('minPayment', e.target.value)}
                placeholder="0"
              />
            </div>
          </div>

          <div className="grid gap-1.5">
            <Label htmlFor="debt-due">还款日</Label>
            <Input
              id="debt-due"
              value={form.dueDay}
              onChange={(e) => set('dueDay', e.target.value)}
              placeholder="如：每月15号"
            />
          </div>

          <div className="grid gap-1.5">
            <Label htmlFor="debt-note">备注（利率口径等）</Label>
            <Input
              id="debt-note"
              value={form.note}
              onChange={(e) => set('note', e.target.value)}
              placeholder="选填"
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              取消
            </Button>
            <Button type="submit">保存</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

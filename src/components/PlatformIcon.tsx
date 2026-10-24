import {
  CreditCard,
  Landmark,
  Coins,
  ShoppingCart,
  Music,
  MessageCircle,
  Heart,
  type LucideIcon,
} from 'lucide-react';
import type { IconKind, Tier } from '@/lib/types';
import { TIER_META } from '@/lib/tier-meta';
import type { PlatformColor } from '@/lib/platform-color';

const ICONS: Record<IconKind, LucideIcon> = {
  card: CreditCard,
  bank: Landmark,
  coin: Coins,
  cart: ShoppingCart,
  music: Music,
  chat: MessageCircle,
  heart: Heart,
};

interface PlatformIconProps {
  icon: IconKind;
  tier: Tier;
  size?: number;
  color?: PlatformColor;
}

export default function PlatformIcon({ icon, tier, size = 46, color }: PlatformIconProps) {
  const Icon = ICONS[icon];
  const bg = color?.main ?? TIER_META[tier].fg;
  const fg = '#FFFFFF';
  return (
    <div
      style={{ width: size, height: size, backgroundColor: bg, color: fg }}
      className="flex shrink-0 items-center justify-center rounded-full"
    >
      <Icon size={Math.round(size * 0.44)} strokeWidth={2} />
    </div>
  );
}

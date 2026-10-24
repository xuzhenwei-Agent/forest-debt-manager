import { NavLink, Outlet } from 'react-router-dom';
import {
  Sprout,
  Wallet,
  Calendar,
  PiggyBank,
  Target,
  type LucideIcon,
} from 'lucide-react';
import { Toaster } from '@/components/ui/sonner';

interface NavItem {
  path: string;
  label: string;
  icon: LucideIcon;
  end?: boolean;
}

const NAV: NavItem[] = [
  { path: '/', label: '负债平台', icon: Wallet, end: true },
  { path: '/plan', label: '还款计划', icon: Calendar },
  { path: '/budget', label: '预算规划', icon: Target },
  { path: '/income', label: '收入账本', icon: PiggyBank },
];

export const Layout = () => {
  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <aside className="flex w-60 shrink-0 flex-col bg-sidebar text-sidebar-foreground">
        <div className="flex items-center gap-2.5 px-5 py-6">
          <Sprout className="text-sidebar-primary" size={28} />
          <div>
            <div className="font-serif text-lg font-bold leading-tight">森林还债管家</div>
            <div className="text-xs opacity-80">一步步上岸 🌱</div>
          </div>
        </div>

        <nav className="flex flex-col gap-1 px-3">
          {NAV.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.end}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                      : 'text-sidebar-foreground/85 hover:bg-sidebar-accent/40'
                  }`
                }
              >
                <Icon size={18} />
                {item.label}
              </NavLink>
            );
          })}
        </nav>

        <div className="mt-auto px-5 py-5 text-xs leading-relaxed opacity-70">
          自用记账 · 数据仅存本机
          <br />
          换浏览器 / 重装会清空
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto w-full max-w-5xl px-6 py-6">
          <Outlet />
        </div>
      </main>
      <Toaster />
    </div>
  );
};

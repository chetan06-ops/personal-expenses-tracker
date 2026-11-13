import React from 'react';
import {
  LayoutDashboard,
  Receipt,
  PiggyBank,
  BarChart3,
  FolderTree,
  Settings,
  Plus,
  GraduationCap,
} from 'lucide-react';
import { Button } from '../ui/Button';
import { cn } from '../../utils/cn';

export type NavTab = 'dashboard' | 'transactions' | 'budgets' | 'reports' | 'categories' | 'settings';

interface SidebarProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  onOpenQuickAdd: () => void;
  onOpenAcademicModal: () => void;
  budgetAlertCount?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  onOpenQuickAdd,
  onOpenAcademicModal,
  budgetAlertCount = 0,
}) => {
  const navItems: Array<{ tab: NavTab; label: string; icon: React.ReactNode; badge?: number }> = [
    { tab: 'dashboard', label: 'Overview', icon: <LayoutDashboard className="w-4 h-4" /> },
    { tab: 'transactions', label: 'Transactions', icon: <Receipt className="w-4 h-4" /> },
    {
      tab: 'budgets',
      label: 'Budgets',
      icon: <PiggyBank className="w-4 h-4" />,
      badge: budgetAlertCount > 0 ? budgetAlertCount : undefined,
    },
    { tab: 'reports', label: 'Reports & Insights', icon: <BarChart3 className="w-4 h-4" /> },
    { tab: 'categories', label: 'Categories', icon: <FolderTree className="w-4 h-4" /> },
    { tab: 'settings', label: 'Settings & Data', icon: <Settings className="w-4 h-4" /> },
  ];

  return (
    <aside
      aria-label="Primary Sidebar Navigation"
      className="hidden lg:flex flex-col w-64 bg-[#090E18] border-r border-white/[0.06] p-4 shrink-0 sticky top-0 h-screen"
    >
      {/* Brand Header */}
      <div className="flex items-center gap-3 px-2 py-2 pb-5 border-b border-white/[0.06]">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-400 to-sky-600 flex items-center justify-center shadow-sm shadow-cyan-500/20 text-slate-950 font-black text-base shrink-0">
          ₹
        </div>
        <div className="min-w-0">
          <h1 className="font-bold text-sm tracking-tight text-white flex items-center gap-1.5">
            <span className="truncate">Expenses Tracker</span>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-md bg-cyan-500/10 text-cyan-300 border border-cyan-500/25 shrink-0">
              V2
            </span>
          </h1>
          <p className="text-[11px] text-slate-400 font-medium truncate">Personal Finance OS</p>
        </div>
      </div>

      {/* Quick Add Action */}
      <div className="my-4">
        <Button
          variant="primary"
          size="md"
          className="w-full justify-between px-3.5"
          leftIcon={<Plus className="w-4 h-4" />}
          onClick={onOpenQuickAdd}
        >
          <span>New Transaction</span>
          <kbd className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-950/25 text-slate-950/80 border border-slate-950/20">
            N
          </kbd>
        </Button>
      </div>

      {/* Navigation Items */}
      <nav className="space-y-1 flex-1 overflow-y-auto pr-0.5" aria-label="Main Menu">
        <p className="text-[10px] font-mono uppercase tracking-widest text-slate-500 px-3 mb-2">
          Workspace
        </p>
        {navItems.map((item) => {
          const isActive = currentTab === item.tab;
          return (
            <button
              key={item.tab}
              type="button"
              onClick={() => onSelectTab(item.tab)}
              aria-current={isActive ? 'page' : undefined}
              className={cn(
                'w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400',
                isActive
                  ? 'bg-cyan-500/10 text-cyan-300 border border-cyan-500/25 font-semibold'
                  : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/50 border border-transparent'
              )}
            >
              <span className="flex items-center gap-3 min-w-0">
                <span className={isActive ? 'text-cyan-400' : 'text-slate-400'}>
                  {item.icon}
                </span>
                <span className="truncate">{item.label}</span>
              </span>
              {item.badge !== undefined && (
                <span
                  className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 tabular-nums"
                  title={`${item.badge} budget alert(s)`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Academic Attribution & Local-First Indicator */}
      <div className="pt-4 mt-4 border-t border-white/[0.06] space-y-2.5">
        <button
          type="button"
          onClick={onOpenAcademicModal}
          className="w-full text-left p-3 rounded-xl bg-slate-900/70 hover:bg-slate-800/80 border border-white/[0.06] hover:border-cyan-500/25 transition group cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
        >
          <div className="flex items-center gap-2 text-xs font-semibold text-cyan-300 mb-1">
            <GraduationCap className="w-4 h-4 text-cyan-400 shrink-0" />
            <span>MM(DU) Mullana</span>
          </div>
          <p className="text-[11px] text-slate-300 font-medium truncate">
            BCA-308 • Dr. Bharti Sharma
          </p>
          <p className="text-[10px] text-slate-500 mt-0.5 truncate">
            Abhijeet • Aanchal • Ankit
          </p>
        </button>

        <div className="flex items-center justify-between text-[10px] text-slate-500 px-1.5 font-mono">
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" aria-hidden="true" />
            IndexedDB Local-First
          </span>
          <span>v2.0</span>
        </div>
      </div>
    </aside>
  );
};

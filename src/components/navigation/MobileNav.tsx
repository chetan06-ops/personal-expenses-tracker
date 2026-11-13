import React, { useEffect } from 'react';
import { NavTab } from './Sidebar';
import {
  LayoutDashboard,
  Receipt,
  PiggyBank,
  BarChart3,
  FolderTree,
  Settings,
  X,
  Plus,
  GraduationCap,
} from 'lucide-react';
import { Button } from '../ui/Button';
import { cn } from '../../utils/cn';

interface MobileNavProps {
  isOpen: boolean;
  onClose: () => void;
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  onOpenQuickAdd: () => void;
  onOpenAcademicModal: () => void;
  budgetAlertCount?: number;
}

export const MobileNav: React.FC<MobileNavProps> = ({
  isOpen,
  onClose,
  currentTab,
  onSelectTab,
  onOpenQuickAdd,
  onOpenAcademicModal,
  budgetAlertCount = 0,
}) => {
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

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
    <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label="Mobile Navigation">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/75 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer */}
      <div className="relative w-72 max-w-[82vw] h-full bg-[#090E18] border-r border-white/10 p-4 flex flex-col justify-between shadow-elevated">
        <div>
          <div className="flex items-center justify-between pb-4 border-b border-white/[0.06]">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-400 to-sky-600 flex items-center justify-center font-black text-slate-950">
                ₹
              </div>
              <div>
                <span className="font-bold text-sm text-white block leading-tight">
                  Expenses Tracker
                </span>
                <span className="text-[10px] text-slate-400">Personal Finance OS</span>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close navigation menu"
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="my-4">
            <Button
              variant="primary"
              size="sm"
              className="w-full justify-center"
              leftIcon={<Plus className="w-4 h-4" />}
              onClick={() => {
                onClose();
                onOpenQuickAdd();
              }}
            >
              New Transaction
            </Button>
          </div>

          <nav className="space-y-1">
            {navItems.map((item) => {
              const isActive = currentTab === item.tab;
              return (
                <button
                  key={item.tab}
                  type="button"
                  onClick={() => {
                    onSelectTab(item.tab);
                    onClose();
                  }}
                  aria-current={isActive ? 'page' : undefined}
                  className={cn(
                    'w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition',
                    isActive
                      ? 'bg-cyan-500/10 text-cyan-300 border border-cyan-500/25 font-semibold'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/60 border border-transparent'
                  )}
                >
                  <span className="flex items-center gap-3">
                    <span className={isActive ? 'text-cyan-400' : 'text-slate-400'}>
                      {item.icon}
                    </span>
                    <span>{item.label}</span>
                  </span>
                  {item.badge !== undefined && (
                    <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="pt-4 border-t border-white/[0.06] space-y-2">
          <Button
            variant="glass"
            size="sm"
            className="w-full text-xs justify-start"
            leftIcon={<GraduationCap className="w-4 h-4 text-cyan-400" />}
            onClick={() => {
              onClose();
              onOpenAcademicModal();
            }}
          >
            MM(DU) Mullana Details
          </Button>
          <div className="text-[10px] text-slate-500 font-mono text-center">
            BCA-308 • Local-First IndexedDB
          </div>
        </div>
      </div>
    </div>
  );
};

import React from 'react';
import { NavTab } from './Sidebar';
import {
  LayoutDashboard,
  Receipt,
  PiggyBank,
  BarChart3,
  Plus,
} from 'lucide-react';
import { cn } from '../../utils/cn';

interface MobileBottomBarProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  onOpenQuickAdd: () => void;
  budgetAlertCount?: number;
}

export const MobileBottomBar: React.FC<MobileBottomBarProps> = ({
  currentTab,
  onSelectTab,
  onOpenQuickAdd,
  budgetAlertCount = 0,
}) => {
  return (
    <nav
      aria-label="Mobile Quick Navigation"
      className="lg:hidden fixed bottom-0 inset-x-0 z-30 bg-[#090E18]/95 backdrop-blur-md border-t border-white/[0.08] px-2 py-1.5 flex items-center justify-around"
    >
      <button
        type="button"
        onClick={() => onSelectTab('dashboard')}
        aria-current={currentTab === 'dashboard' ? 'page' : undefined}
        className={cn(
          'flex flex-col items-center justify-center gap-0.5 py-1 px-3 rounded-xl text-[10px] font-medium transition',
          currentTab === 'dashboard' ? 'text-cyan-300' : 'text-slate-400 hover:text-slate-200'
        )}
      >
        <LayoutDashboard className="w-4 h-4" />
        <span>Overview</span>
      </button>

      <button
        type="button"
        onClick={() => onSelectTab('transactions')}
        aria-current={currentTab === 'transactions' ? 'page' : undefined}
        className={cn(
          'flex flex-col items-center justify-center gap-0.5 py-1 px-3 rounded-xl text-[10px] font-medium transition',
          currentTab === 'transactions' ? 'text-cyan-300' : 'text-slate-400 hover:text-slate-200'
        )}
      >
        <Receipt className="w-4 h-4" />
        <span>Ledger</span>
      </button>

      <button
        type="button"
        onClick={onOpenQuickAdd}
        aria-label="Add Transaction"
        className="w-11 h-11 -mt-4 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 flex items-center justify-center shadow-lg shadow-cyan-500/25 border border-cyan-300/60 active:scale-95 transition"
      >
        <Plus className="w-5 h-5" />
      </button>

      <button
        type="button"
        onClick={() => onSelectTab('budgets')}
        aria-current={currentTab === 'budgets' ? 'page' : undefined}
        className={cn(
          'relative flex flex-col items-center justify-center gap-0.5 py-1 px-3 rounded-xl text-[10px] font-medium transition',
          currentTab === 'budgets' ? 'text-cyan-300' : 'text-slate-400 hover:text-slate-200'
        )}
      >
        <div className="relative">
          <PiggyBank className="w-4 h-4" />
          {budgetAlertCount > 0 && (
            <span className="absolute -top-1 -right-1.5 w-2 h-2 rounded-full bg-amber-400" />
          )}
        </div>
        <span>Budgets</span>
      </button>

      <button
        type="button"
        onClick={() => onSelectTab('reports')}
        aria-current={currentTab === 'reports' ? 'page' : undefined}
        className={cn(
          'flex flex-col items-center justify-center gap-0.5 py-1 px-3 rounded-xl text-[10px] font-medium transition',
          currentTab === 'reports' ? 'text-cyan-300' : 'text-slate-400 hover:text-slate-200'
        )}
      >
        <BarChart3 className="w-4 h-4" />
        <span>Reports</span>
      </button>
    </nav>
  );
};

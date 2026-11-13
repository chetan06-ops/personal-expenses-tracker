import React from 'react';
import { Button } from '../ui/Button';
import { NavTab } from './Sidebar';
import { Plus, GraduationCap, Menu } from 'lucide-react';

interface HeaderProps {
  currentTab: NavTab;
  onOpenQuickAdd: () => void;
  onOpenAcademicModal: () => void;
  onToggleMobileMenu: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onOpenQuickAdd,
  onOpenAcademicModal,
  onToggleMobileMenu,
}) => {
  const titles: Record<NavTab, { title: string; subtitle: string }> = {
    dashboard: {
      title: 'Financial Overview',
      subtitle: 'Cash flow summary, budget pacing, insights, and interactive 3D orbit.',
    },
    transactions: {
      title: 'Transactions Ledger',
      subtitle: 'Search, filter, sort, and manage your income and expense entries.',
    },
    budgets: {
      title: 'Budget Intelligence',
      subtitle: 'Configure monthly spending limits and monitor threshold alerts.',
    },
    reports: {
      title: 'Reports & Analytics',
      subtitle: 'Daily spending velocity, category share rankings, and monthly cash flows.',
    },
    categories: {
      title: 'Category Manager',
      subtitle: 'Customize expense and income categories with icons and color tags.',
    },
    settings: {
      title: 'Settings & Data',
      subtitle: 'Configure 3D preferences, CSV import/export, and local JSON backups.',
    },
  };

  const current = titles[currentTab] || { title: 'Expenses Tracker', subtitle: '' };

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between gap-3 px-4 sm:px-6 lg:px-8 py-3.5 bg-[#070B12]/85 backdrop-blur-md border-b border-white/[0.06]">
      <div className="flex items-center gap-3 min-w-0">
        <button
          type="button"
          onClick={onToggleMobileMenu}
          className="lg:hidden p-2 rounded-xl text-slate-300 hover:text-white bg-slate-900/80 hover:bg-slate-800 border border-slate-700/70 transition shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
          aria-label="Toggle Navigation Menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="min-w-0">
          <h2 className="text-base sm:text-lg font-bold tracking-tight text-white truncate">
            {current.title}
          </h2>
          <p className="hidden sm:block text-xs text-slate-400 mt-0.5 truncate">
            {current.subtitle}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <Button
          variant="glass"
          size="sm"
          className="text-xs"
          leftIcon={<GraduationCap className="w-3.5 h-3.5 text-cyan-400" />}
          onClick={onOpenAcademicModal}
          title="View University Project Information"
        >
          <span className="hidden md:inline">BCA-308 Info</span>
          <span className="md:hidden">Info</span>
        </Button>

        <Button
          variant="primary"
          size="sm"
          leftIcon={<Plus className="w-4 h-4" />}
          onClick={onOpenQuickAdd}
        >
          <span className="hidden sm:inline">Add Transaction</span>
          <span className="sm:hidden">Add</span>
        </Button>
      </div>
    </header>
  );
};

import React from 'react';
import { Button } from '../ui/Button';
import { NavTab } from './Sidebar';
import { Plus, GraduationCap, Menu, ShieldCheck } from 'lucide-react';

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
      title: 'Financial Dashboard',
      subtitle: 'Real-time overview of your cash flows, savings rate, and 3D Financial Orbit.',
    },
    transactions: {
      title: 'Transaction Management',
      subtitle: 'Record, review, edit, filter, and search your income and expense logs.',
    },
    budgets: {
      title: 'Budget Intelligence',
      subtitle: 'Set monthly limits, track category thresholds, and prevent overspending.',
    },
    reports: {
      title: 'Reports & Analytics',
      subtitle: 'Deep dive into spending distributions, monthly trends, and cash flow comparisons.',
    },
    categories: {
      title: 'Category Manager',
      subtitle: 'Organize transaction classification with default and custom categories.',
    },
    settings: {
      title: 'Settings & Data Management',
      subtitle: 'Export CSV, backup/restore JSON, load academic test data, and configure preferences.',
    },
  };

  const current = titles[currentTab] || { title: 'Personal Expenses Tracker', subtitle: '' };

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between px-5 sm:px-8 py-4 bg-[#0B0F19]/80 backdrop-blur-xl border-b border-slate-800/80">
      <div className="flex items-center gap-3">
        {/* Mobile Hamburger Button */}
        <button
          onClick={onToggleMobileMenu}
          className="lg:hidden p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-700 transition"
          aria-label="Toggle Navigation Menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          <h2 className="text-lg sm:text-xl font-extrabold tracking-tight text-white flex items-center gap-2">
            <span>{current.title}</span>
          </h2>
          <p className="hidden sm:block text-xs text-slate-400 mt-0.5">
            {current.subtitle}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        {/* Academic Project Info Badge Button */}
        <Button
          variant="glass"
          size="sm"
          className="text-xs"
          leftIcon={<GraduationCap className="w-4 h-4 text-cyan-400" />}
          onClick={onOpenAcademicModal}
          title="View University Project Information"
        >
          <span className="hidden md:inline">BCA-308 Details</span>
          <span className="md:hidden">Info</span>
        </Button>

        {/* Quick Add Button */}
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

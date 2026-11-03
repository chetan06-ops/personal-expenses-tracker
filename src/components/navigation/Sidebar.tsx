import React from 'react';
import {
  LayoutDashboard,
  Receipt,
  PiggyBank,
  BarChart3,
  FolderTree,
  Settings,
  PlusCircle,
  GraduationCap,
  Sparkles,
} from 'lucide-react';
import { Button } from '../ui/Button';

export type NavTab = 'dashboard' | 'transactions' | 'budgets' | 'reports' | 'categories' | 'settings';

interface SidebarProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  onOpenQuickAdd: () => void;
  onOpenAcademicModal: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  onOpenQuickAdd,
  onOpenAcademicModal,
}) => {
  const navItems: Array<{ tab: NavTab; label: string; icon: React.ReactNode }> = [
    { tab: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
    { tab: 'transactions', label: 'Transactions', icon: <Receipt className="w-4 h-4" /> },
    { tab: 'budgets', label: 'Budgets', icon: <PiggyBank className="w-4 h-4" /> },
    { tab: 'reports', label: 'Reports & Analytics', icon: <BarChart3 className="w-4 h-4" /> },
    { tab: 'categories', label: 'Categories', icon: <FolderTree className="w-4 h-4" /> },
    { tab: 'settings', label: 'Settings & Backup', icon: <Settings className="w-4 h-4" /> },
  ];

  return (
    <aside className="hidden lg:flex flex-col w-64 bg-[#070A12]/95 border-r border-slate-800/80 p-5 shrink-0 min-h-screen">
      {/* Brand Header */}
      <div className="flex items-center gap-3 pb-6 border-b border-white/5">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20 text-white font-black text-lg">
          ₹
        </div>
        <div>
          <h1 className="font-extrabold text-sm tracking-tight text-white flex items-center gap-1.5">
            <span>Expenses Tracker</span>
            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
              3D
            </span>
          </h1>
          <p className="text-[11px] text-slate-400 font-medium">BCA Project-I (BCA-308)</p>
        </div>
      </div>

      {/* Quick Add Action */}
      <div className="my-5">
        <Button
          variant="primary"
          size="md"
          className="w-full justify-center shadow-md shadow-cyan-500/15"
          leftIcon={<PlusCircle className="w-4 h-4" />}
          onClick={onOpenQuickAdd}
        >
          Add Transaction
        </Button>
      </div>

      {/* Navigation Items */}
      <nav className="space-y-1 flex-1">
        <p className="text-[10px] font-mono uppercase tracking-wider text-slate-500 px-3 mb-2">
          Navigation
        </p>
        {navItems.map((item) => {
          const isActive = currentTab === item.tab;
          return (
            <button
              key={item.tab}
              onClick={() => onSelectTab(item.tab)}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
                isActive
                  ? 'bg-gradient-to-r from-cyan-500/15 to-transparent text-cyan-300 border-l-2 border-cyan-400 font-semibold'
                  : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/50'
              }`}
            >
              <span className={isActive ? 'text-cyan-400' : 'text-slate-400'}>
                {item.icon}
              </span>
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Academic University Badge */}
      <div className="pt-4 border-t border-white/5 space-y-2">
        <button
          onClick={onOpenAcademicModal}
          className="w-full text-left p-3 rounded-xl bg-slate-900/80 hover:bg-slate-800/80 border border-slate-800 transition group cursor-pointer"
        >
          <div className="flex items-center gap-2 text-xs font-semibold text-cyan-400 mb-1">
            <GraduationCap className="w-4 h-4 text-cyan-400 group-hover:rotate-12 transition-transform" />
            <span>MM(DU) Mullana</span>
          </div>
          <p className="text-[11px] text-slate-300 font-medium truncate">
            Guide: Dr. Bharti Sharma
          </p>
          <p className="text-[10px] text-slate-500 mt-0.5">
            Abhijeet • Aanchal • Ankit
          </p>
        </button>

        <div className="flex items-center justify-between text-[10px] text-slate-500 px-1 pt-1 font-mono">
          <span className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />
            IndexedDB Local-First
          </span>
          <span>v1.0</span>
        </div>
      </div>
    </aside>
  );
};

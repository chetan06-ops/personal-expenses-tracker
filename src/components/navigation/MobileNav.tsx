import React from 'react';
import { NavTab } from './Sidebar';
import {
  LayoutDashboard,
  Receipt,
  PiggyBank,
  BarChart3,
  FolderTree,
  Settings,
  X,
  PlusCircle,
  GraduationCap,
} from 'lucide-react';
import { Button } from '../ui/Button';

interface MobileNavProps {
  isOpen: boolean;
  onClose: () => void;
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  onOpenQuickAdd: () => void;
  onOpenAcademicModal: () => void;
}

export const MobileNav: React.FC<MobileNavProps> = ({
  isOpen,
  onClose,
  currentTab,
  onSelectTab,
  onOpenQuickAdd,
  onOpenAcademicModal,
}) => {
  if (!isOpen) return null;

  const navItems: Array<{ tab: NavTab; label: string; icon: React.ReactNode }> = [
    { tab: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
    { tab: 'transactions', label: 'Transactions', icon: <Receipt className="w-5 h-5" /> },
    { tab: 'budgets', label: 'Budgets', icon: <PiggyBank className="w-5 h-5" /> },
    { tab: 'reports', label: 'Reports & Analytics', icon: <BarChart3 className="w-5 h-5" /> },
    { tab: 'categories', label: 'Categories', icon: <FolderTree className="w-5 h-5" /> },
    { tab: 'settings', label: 'Settings & Backup', icon: <Settings className="w-5 h-5" /> },
  ];

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="relative w-72 max-w-[80vw] h-full bg-[#070A12] border-r border-slate-800 p-5 flex flex-col justify-between shadow-2xl animate-in slide-in-from-left duration-200">
        <div>
          {/* Header */}
          <div className="flex items-center justify-between pb-5 border-b border-white/10">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center font-bold text-white">
                ₹
              </div>
              <span className="font-bold text-sm text-white">Expenses Tracker</span>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Quick Add */}
          <div className="my-4">
            <Button
              variant="primary"
              size="sm"
              className="w-full justify-center"
              leftIcon={<PlusCircle className="w-4 h-4" />}
              onClick={() => {
                onClose();
                onOpenQuickAdd();
              }}
            >
              Add Transaction
            </Button>
          </div>

          {/* Links */}
          <nav className="space-y-1">
            {navItems.map((item) => {
              const isActive = currentTab === item.tab;
              return (
                <button
                  key={item.tab}
                  onClick={() => {
                    onSelectTab(item.tab);
                    onClose();
                  }}
                  className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm font-medium transition ${
                    isActive
                      ? 'bg-cyan-500/15 text-cyan-300 border-l-2 border-cyan-400'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
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
        </div>

        {/* Academic link */}
        <div className="pt-4 border-t border-white/10 space-y-2">
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
            BCA-308 • Session 2025–2028
          </div>
        </div>
      </div>
    </div>
  );
};

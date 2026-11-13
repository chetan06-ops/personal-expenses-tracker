import React, { useState, useEffect, useMemo } from 'react';
import { Sidebar, NavTab } from '../components/navigation/Sidebar';
import { Header } from '../components/navigation/Header';
import { MobileNav } from '../components/navigation/MobileNav';
import { MobileBottomBar } from '../components/navigation/MobileBottomBar';
import { AcademicModal } from '../components/navigation/AcademicModal';
import { ToastContainer } from '../components/ui/ToastContainer';
import { TransactionModal } from '../components/forms/TransactionModal';
import { DashboardPage } from '../features/dashboard/DashboardPage';
import { TransactionsPage } from '../features/transactions/TransactionsPage';
import { BudgetsPage } from '../features/budgets/BudgetsPage';
import { ReportsPage } from '../features/reports/ReportsPage';
import { CategoriesPage } from '../features/categories/CategoriesPage';
import { SettingsPage } from '../features/settings/SettingsPage';
import { initializeDatabase, db } from '../database/db';
import { seedAcademicData } from '../database/seed';
import { useTransactions } from '../hooks/useTransactions';
import { useBudgets } from '../hooks/useBudgets';
import { calculateBudgetStatus } from '../services/calculations/financialCalculations';
import { getMonthKey } from '../utils/date';
import { Transaction } from '../types';

export const App: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<NavTab>('dashboard');
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [isAcademicModalOpen, setIsAcademicModalOpen] = useState(false);
  const [isDbReady, setIsDbReady] = useState(false);
  const [txCategoryPreset, setTxCategoryPreset] = useState<string | undefined>(undefined);

  // Global Transaction Modal (Add / Edit)
  const [isTxModalOpen, setIsTxModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);

  const { allTransactions, addTransaction, updateTransaction } = useTransactions();
  const currentMonthKey = getMonthKey();
  const { budgets } = useBudgets(currentMonthKey);

  // Initialize DB safely without ever overwriting existing user data or re-seeding after intentional reset
  useEffect(() => {
    let active = true;
    async function init() {
      try {
        await initializeDatabase();
        const count = await db.transactions.count();
        const seedFlag = await db.settings.get('seedInitialized');

        if (count === 0 && !seedFlag?.value) {
          await seedAcademicData();
        } else if (count > 0 && !seedFlag?.value) {
          await db.settings.put({ key: 'seedInitialized', value: true });
        }
      } finally {
        if (active) setIsDbReady(true);
      }
    }
    init();
    return () => {
      active = false;
    };
  }, []);

  // Keyboard shortcut: press 'n' outside text inputs/modals to quick-add a transaction
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (isTxModalOpen || isAcademicModalOpen || isMobileNavOpen) return;
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.tagName === 'SELECT' ||
          target.isContentEditable)
      ) {
        return;
      }
      if (e.key.toLowerCase() === 'n') {
        e.preventDefault();
        setEditingTransaction(null);
        setIsTxModalOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isTxModalOpen, isAcademicModalOpen, isMobileNavOpen]);

  // Compute current-month budget alert count for navigation indicators
  const budgetAlertCount = useMemo(() => {
    if (budgets.length === 0) return 0;
    const monthExpenses = allTransactions.filter(
      (tx) => tx.type === 'expense' && tx.date.startsWith(currentMonthKey)
    );
    const totalSpent = monthExpenses.reduce((sum, tx) => sum + tx.amount, 0);
    const byCategory = new Map<string, number>();
    for (const tx of monthExpenses) {
      byCategory.set(tx.category, (byCategory.get(tx.category) || 0) + tx.amount);
    }

    let alerts = 0;
    for (const b of budgets) {
      const spent = b.category === 'TOTAL' ? totalSpent : byCategory.get(b.category) || 0;
      const status = calculateBudgetStatus(b.limit, spent);
      if (status.isOverBudget || status.isNearLimit) {
        alerts++;
      }
    }
    return alerts;
  }, [budgets, allTransactions, currentMonthKey]);

  const handleOpenAddModal = () => {
    setEditingTransaction(null);
    setIsTxModalOpen(true);
  };

  const handleEditTransaction = (tx: Transaction) => {
    setEditingTransaction(tx);
    setIsTxModalOpen(true);
  };

  const handleNavigateToTransactions = (categoryFilter?: string) => {
    setTxCategoryPreset(categoryFilter);
    setCurrentTab('transactions');
  };

  const handleTransactionSubmit = async (data: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (editingTransaction) {
      await updateTransaction(editingTransaction.id, data);
    } else {
      await addTransaction(data);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#070B12] bg-ambient-canvas text-slate-100 selection:bg-cyan-500/25 selection:text-cyan-200">
      {/* Desktop Sidebar Navigation */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={(tab) => {
          if (tab !== 'transactions') setTxCategoryPreset(undefined);
          setCurrentTab(tab);
        }}
        onOpenQuickAdd={handleOpenAddModal}
        onOpenAcademicModal={() => setIsAcademicModalOpen(true)}
        budgetAlertCount={budgetAlertCount}
      />

      {/* Mobile Drawer Navigation */}
      <MobileNav
        isOpen={isMobileNavOpen}
        onClose={() => setIsMobileNavOpen(false)}
        currentTab={currentTab}
        onSelectTab={(tab) => {
          if (tab !== 'transactions') setTxCategoryPreset(undefined);
          setCurrentTab(tab);
        }}
        onOpenQuickAdd={handleOpenAddModal}
        onOpenAcademicModal={() => setIsAcademicModalOpen(true)}
        budgetAlertCount={budgetAlertCount}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        <Header
          currentTab={currentTab}
          onOpenQuickAdd={handleOpenAddModal}
          onOpenAcademicModal={() => setIsAcademicModalOpen(true)}
          onToggleMobileMenu={() => setIsMobileNavOpen(true)}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 pb-24 lg:pb-12">
          {!isDbReady ? (
            <div className="max-w-7xl mx-auto space-y-6 animate-pulse">
              <div className="h-14 rounded-2xl bg-slate-900/80 border border-white/[0.06]" />
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[0, 1, 2, 3].map((i) => (
                  <div key={i} className="h-28 rounded-2xl bg-slate-900/80 border border-white/[0.06]" />
                ))}
              </div>
              <div className="h-80 rounded-2xl bg-slate-900/80 border border-white/[0.06]" />
            </div>
          ) : (
            <>
              {currentTab === 'dashboard' && (
                <DashboardPage
                  onOpenAddModal={handleOpenAddModal}
                  onNavigateToTransactions={handleNavigateToTransactions}
                  onNavigateToBudgets={() => setCurrentTab('budgets')}
                  onNavigateToReports={() => setCurrentTab('reports')}
                  onEditTransaction={handleEditTransaction}
                />
              )}

              {currentTab === 'transactions' && (
                <TransactionsPage
                  onOpenAddModal={handleOpenAddModal}
                  onEditTransaction={handleEditTransaction}
                  initialCategoryFilter={txCategoryPreset}
                  onClearCategoryPreset={() => setTxCategoryPreset(undefined)}
                />
              )}

              {currentTab === 'budgets' && <BudgetsPage />}

              {currentTab === 'reports' && <ReportsPage />}

              {currentTab === 'categories' && <CategoriesPage />}

              {currentTab === 'settings' && <SettingsPage />}
            </>
          )}
        </main>
      </div>

      {/* Persistent Mobile Bottom Navigation */}
      <MobileBottomBar
        currentTab={currentTab}
        onSelectTab={(tab) => {
          if (tab !== 'transactions') setTxCategoryPreset(undefined);
          setCurrentTab(tab);
        }}
        onOpenQuickAdd={handleOpenAddModal}
        budgetAlertCount={budgetAlertCount}
      />

      {/* Global Transaction Modal (Add / Edit) */}
      <TransactionModal
        isOpen={isTxModalOpen}
        onClose={() => setIsTxModalOpen(false)}
        onSubmit={handleTransactionSubmit}
        initialData={editingTransaction}
      />

      {/* Academic Project Info Modal */}
      <AcademicModal
        isOpen={isAcademicModalOpen}
        onClose={() => setIsAcademicModalOpen(false)}
      />

      {/* Global Reactive Notification Toasts */}
      <ToastContainer />
    </div>
  );
};

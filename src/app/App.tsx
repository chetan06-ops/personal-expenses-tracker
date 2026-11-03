import React, { useState, useEffect } from 'react';
import { Sidebar, NavTab } from '../components/navigation/Sidebar';
import { Header } from '../components/navigation/Header';
import { MobileNav } from '../components/navigation/MobileNav';
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
import { Transaction } from '../types';

export const App: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<NavTab>('dashboard');
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [isAcademicModalOpen, setIsAcademicModalOpen] = useState(false);

  // Global Transaction Modal (Add / Edit)
  const [isTxModalOpen, setIsTxModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);

  const { addTransaction, updateTransaction } = useTransactions();

  // Initialize DB and seed demo data on initial launch if completely empty
  useEffect(() => {
    async function init() {
      await initializeDatabase();
      const count = await db.transactions.count();
      if (count === 0) {
        // Automatically seed academic test dataset on first load for instant rich experience
        await seedAcademicData();
      }
    }
    init();
  }, []);

  const handleOpenAddModal = () => {
    setEditingTransaction(null);
    setIsTxModalOpen(true);
  };

  const handleEditTransaction = (tx: Transaction) => {
    setEditingTransaction(tx);
    setIsTxModalOpen(true);
  };

  const handleTransactionSubmit = async (data: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (editingTransaction) {
      await updateTransaction(editingTransaction.id, data);
    } else {
      await addTransaction(data);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#0B0F19] text-slate-100 bg-grid-pattern selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Desktop Sidebar Navigation */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        onOpenQuickAdd={handleOpenAddModal}
        onOpenAcademicModal={() => setIsAcademicModalOpen(true)}
      />

      {/* Mobile Drawer Navigation */}
      <MobileNav
        isOpen={isMobileNavOpen}
        onClose={() => setIsMobileNavOpen(false)}
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        onOpenQuickAdd={handleOpenAddModal}
        onOpenAcademicModal={() => setIsAcademicModalOpen(true)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        <Header
          currentTab={currentTab}
          onOpenQuickAdd={handleOpenAddModal}
          onOpenAcademicModal={() => setIsAcademicModalOpen(true)}
          onToggleMobileMenu={() => setIsMobileNavOpen(true)}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          {currentTab === 'dashboard' && (
            <DashboardPage
              onOpenAddModal={handleOpenAddModal}
              onNavigateToTransactions={() => setCurrentTab('transactions')}
              onNavigateToBudgets={() => setCurrentTab('budgets')}
              onEditTransaction={handleEditTransaction}
            />
          )}

          {currentTab === 'transactions' && (
            <TransactionsPage
              onOpenAddModal={handleOpenAddModal}
              onEditTransaction={handleEditTransaction}
            />
          )}

          {currentTab === 'budgets' && <BudgetsPage />}

          {currentTab === 'reports' && <ReportsPage />}

          {currentTab === 'categories' && <CategoriesPage />}

          {currentTab === 'settings' && <SettingsPage />}
        </main>
      </div>

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

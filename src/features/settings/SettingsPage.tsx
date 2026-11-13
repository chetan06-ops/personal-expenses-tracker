import React, { useState, useRef, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { Modal } from '../../components/ui/Modal';
import { useSettings } from '../../hooks/useSettings';
import { useTransactions } from '../../hooks/useTransactions';
import { useBudgets } from '../../hooks/useBudgets';
import { useCategories } from '../../hooks/useCategories';
import { showToast } from '../../hooks/useToast';
import { seedAcademicData } from '../../database/seed';
import { db } from '../../database/db';
import { generateTransactionsCsv, downloadCsvFile } from '../../services/export/csvExport';
import { createFullApplicationBackup, downloadJsonBackup } from '../../services/export/jsonBackup';
import { parseAndValidateCsv, CsvImportResult } from '../../services/import/csvImport';
import { restoreApplicationBackup, RestoreResult } from '../../services/import/jsonRestore';
import { paiseToRupees, rupeesToPaise } from '../../utils/currency';
import { formatDisplayDate } from '../../utils/date';
import {
  Download,
  Upload,
  Database,
  Trash2,
  RefreshCw,
  GraduationCap,
  Sparkles,
  FileSpreadsheet,
  FileCode,
  HardDrive,
} from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const { settings, updateSettings } = useSettings();
  const { allTransactions } = useTransactions();
  const { budgets } = useBudgets();
  const { categories } = useCategories();

  const [monthlyLimitInput, setMonthlyLimitInput] = useState<string>(
    paiseToRupees(settings.monthlyOverallBudget || 2500000).toString()
  );

  // Sync input when Dexie settings load asynchronously
  useEffect(() => {
    if (settings.monthlyOverallBudget) {
      setMonthlyLimitInput(paiseToRupees(settings.monthlyOverallBudget).toString());
    }
  }, [settings.monthlyOverallBudget]);

  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);
  const [isSeedConfirmOpen, setIsSeedConfirmOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // CSV Import State
  const csvFileInputRef = useRef<HTMLInputElement>(null);
  const [csvResultModal, setCsvResultModal] = useState<CsvImportResult | null>(null);

  // JSON Restore State
  const jsonFileInputRef = useRef<HTMLInputElement>(null);
  const [pendingRestoreData, setPendingRestoreData] = useState<any | null>(null);
  const [restoreMode, setRestoreMode] = useState<'replace' | 'merge'>('replace');

  const handleSaveBudgetLimit = async () => {
    const clean = monthlyLimitInput.trim().replace(/,/g, '');
    const num = parseFloat(clean);
    if (isNaN(num) || num <= 0) {
      showToast({
        type: 'error',
        title: 'Invalid Limit',
        description: 'Please enter a valid positive amount for the default monthly budget.',
      });
      return;
    }
    await updateSettings({ monthlyOverallBudget: rupeesToPaise(num) });
  };

  const handleExportCsv = () => {
    const csv = generateTransactionsCsv(allTransactions);
    downloadCsvFile(csv, 'all-personal-expenses.csv');
    showToast({
      type: 'success',
      title: 'CSV Export Generated',
      description: `Exported ${allTransactions.length} transaction record(s) with formula injection defense.`,
    });
  };

  const handleCsvFileSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const result = parseAndValidateCsv(text, allTransactions, true);

      if (result.importedTransactions.length > 0) {
        await db.transactions.bulkAdd(result.importedTransactions);
      }

      setCsvResultModal(result);
      showToast({
        type: result.errorCount > 0 ? 'warning' : 'success',
        title: 'CSV Import Completed',
        description: `Imported ${result.importedCount} record(s), skipped ${result.skippedDuplicatesCount} duplicate(s), ${result.errorCount} error(s).`,
      });
    } catch (err: any) {
      showToast({
        type: 'error',
        title: 'CSV Import Failed',
        description: err.message,
      });
    } finally {
      if (csvFileInputRef.current) csvFileInputRef.current.value = '';
    }
  };

  const handleExportJson = async () => {
    try {
      const backup = await createFullApplicationBackup();
      downloadJsonBackup(backup);
      await db.settings.put({
        key: 'userSettings',
        value: { ...settings, lastBackupDate: new Date().toISOString() },
      });
      showToast({
        type: 'success',
        title: 'JSON Backup Created',
        description: 'Full database snapshot exported successfully.',
      });
    } catch (err: any) {
      showToast({
        type: 'error',
        title: 'Backup Failed',
        description: err.message,
      });
    }
  };

  const handleJsonFileSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const parsed = JSON.parse(text);
      setPendingRestoreData(parsed);
    } catch {
      showToast({
        type: 'error',
        title: 'Invalid JSON File',
        description: 'The selected file is not valid JSON.',
      });
    } finally {
      if (jsonFileInputRef.current) jsonFileInputRef.current.value = '';
    }
  };

  const handleConfirmRestore = async () => {
    if (!pendingRestoreData) return;
    try {
      setIsProcessing(true);
      const res: RestoreResult = await restoreApplicationBackup(pendingRestoreData, restoreMode);
      await db.settings.put({ key: 'seedInitialized', value: true });
      setPendingRestoreData(null);
      showToast({
        type: 'success',
        title: 'Data Restored Successfully',
        description: res.message,
      });
    } catch (err: any) {
      showToast({
        type: 'error',
        title: 'Restore Failed',
        description: err.message,
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleLoadAcademicData = async () => {
    try {
      setIsProcessing(true);
      await seedAcademicData();
      setIsSeedConfirmOpen(false);
      showToast({
        type: 'success',
        title: 'Academic Data Loaded',
        description: 'Loaded reference dataset from BCA-308 Project Report Table 7.3.',
      });
    } catch (err: any) {
      showToast({
        type: 'error',
        title: 'Seed Error',
        description: err.message,
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleResetDatabase = async () => {
    try {
      setIsProcessing(true);
      await db.transactions.clear();
      await db.budgets.clear();
      await db.settings.put({ key: 'seedInitialized', value: true });
      setIsResetConfirmOpen(false);
      showToast({
        type: 'info',
        title: 'Database Cleared',
        description: 'All transactions and custom budgets have been removed.',
      });
    } catch (err: any) {
      showToast({
        type: 'error',
        title: 'Reset Error',
        description: err.message,
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const customCategoryCount = categories.filter((c) => c.isCustom).length;

  return (
    <div className="space-y-5 max-w-7xl mx-auto">
      {/* Database Status Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Card className="p-4">
          <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
            Stored Transactions
          </p>
          <p className="text-lg font-bold font-mono text-white tabular-nums mt-1">
            {allTransactions.length}
          </p>
        </Card>
        <Card className="p-4">
          <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
            Categories
          </p>
          <p className="text-lg font-bold font-mono text-cyan-300 tabular-nums mt-1">
            {categories.length}{' '}
            <span className="text-xs font-sans font-normal text-slate-500">
              ({customCategoryCount} custom)
            </span>
          </p>
        </Card>
        <Card className="p-4">
          <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
            Current Month Caps
          </p>
          <p className="text-lg font-bold font-mono text-white tabular-nums mt-1">
            {budgets.length}
          </p>
        </Card>
        <Card className="p-4">
          <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
            Last JSON Backup
          </p>
          <p className="text-sm font-semibold font-mono text-slate-200 tabular-nums mt-1.5 truncate">
            {settings.lastBackupDate
              ? formatDisplayDate(settings.lastBackupDate)
              : 'Not yet backed up'}
          </p>
        </Card>
      </div>

      {/* Visual & 3D Orbit Preferences */}
      <Card>
        <CardHeader>
          <div>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span>Visual & 3D Experience</span>
            </CardTitle>
            <CardDescription>
              Configure interactive 3D Financial Orbit rendering and hardware performance profile.
            </CardDescription>
          </div>
        </CardHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center justify-between gap-4 p-4 rounded-xl bg-[#090E18] border border-white/[0.06]">
            <div>
              <p className="text-xs font-semibold text-slate-100">3D Financial Orbit</p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Render interactive WebGL scene on dashboard (2D fallback when disabled)
              </p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={settings.enable3D}
              aria-label="Toggle 3D Financial Orbit"
              onClick={() => updateSettings({ enable3D: !settings.enable3D })}
              className={`w-12 h-6 rounded-full transition-colors p-0.5 border shrink-0 flex items-center ${
                settings.enable3D
                  ? 'bg-cyan-500 border-cyan-400 justify-end'
                  : 'bg-slate-800 border-slate-700 justify-start'
              }`}
            >
              <span className="w-5 h-5 rounded-full bg-white shadow-sm" />
            </button>
          </div>

          <div className="p-4 rounded-xl bg-[#090E18] border border-white/[0.06] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold text-slate-100">Hardware Profile</p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Adjust 3D particle density for battery or GPU
              </p>
            </div>
            <div className="sm:w-52">
              <Select
                aria-label="3D Hardware Profile"
                value={settings.performanceMode}
                onChange={(e) => updateSettings({ performanceMode: e.target.value as any })}
              >
                <option value="high">High (350 Particles)</option>
                <option value="medium">Medium (200 Particles)</option>
                <option value="low">Low (100 Particles)</option>
              </Select>
            </div>
          </div>
        </div>
      </Card>

      {/* Financial Limits Preference */}
      <Card>
        <CardHeader>
          <div>
            <CardTitle>Default Financial Controls</CardTitle>
            <CardDescription>
              Currency precision and fallback monthly spending warning limit.
            </CardDescription>
          </div>
        </CardHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <span className="block text-xs font-medium text-slate-300 mb-1.5">
              Default Currency & Precision
            </span>
            <div className="h-10 px-3.5 rounded-xl bg-[#090E18] border border-white/[0.08] flex items-center justify-between text-xs text-slate-200">
              <span className="font-semibold">Indian Rupee (INR — ₹)</span>
              <span className="font-mono text-cyan-300">Integer Paise</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1.5">
              All values are stored in integer minor units (paise) to prevent floating-point drift.
            </p>
          </div>

          <div>
            <label
              htmlFor="default-monthly-cap"
              className="block text-xs font-medium text-slate-300 mb-1.5"
            >
              Default Monthly Spending Cap (INR)
            </label>
            <div className="flex gap-2 items-start">
              <Input
                id="default-monthly-cap"
                type="number"
                step="0.01"
                min="1"
                value={monthlyLimitInput}
                onChange={(e) => setMonthlyLimitInput(e.target.value)}
                leftAddon={<span className="font-mono text-cyan-400 font-bold">₹</span>}
                className="font-mono tabular-nums"
              />
              <Button
                variant="secondary"
                size="md"
                onClick={handleSaveBudgetLimit}
                className="shrink-0"
              >
                Save
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Data Backup & Portability */}
      <Card>
        <CardHeader>
          <div>
            <CardTitle className="flex items-center gap-2">
              <Database className="w-4 h-4 text-cyan-400" />
              <span>Data Portability & Local Backups</span>
            </CardTitle>
            <CardDescription>
              Export sanitized spreadsheets or create full IndexedDB JSON snapshots.
            </CardDescription>
          </div>
        </CardHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-[#090E18] border border-white/[0.06] space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-100">
              <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
              <span>CSV Spreadsheet Data</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Export all transactions to CSV with formula injection protection, or import rows with automatic deduplication.
            </p>
            <div className="flex flex-wrap gap-2 pt-1">
              <Button
                variant="outline"
                size="sm"
                leftIcon={<Download className="w-3.5 h-3.5" />}
                onClick={handleExportCsv}
              >
                Export CSV
              </Button>
              <input
                ref={csvFileInputRef}
                type="file"
                accept=".csv"
                className="hidden"
                onChange={handleCsvFileSelected}
              />
              <Button
                variant="secondary"
                size="sm"
                leftIcon={<Upload className="w-3.5 h-3.5" />}
                onClick={() => csvFileInputRef.current?.click()}
              >
                Import CSV
              </Button>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-[#090E18] border border-white/[0.06] space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-100">
              <FileCode className="w-4 h-4 text-cyan-400" />
              <span>Full Database JSON Backup</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Export complete local state (transactions, custom categories, budgets, settings) or restore from a JSON file.
            </p>
            <div className="flex flex-wrap gap-2 pt-1">
              <Button
                variant="outline"
                size="sm"
                leftIcon={<Download className="w-3.5 h-3.5" />}
                onClick={handleExportJson}
              >
                Export JSON
              </Button>
              <input
                ref={jsonFileInputRef}
                type="file"
                accept=".json"
                className="hidden"
                onChange={handleJsonFileSelected}
              />
              <Button
                variant="secondary"
                size="sm"
                leftIcon={<Upload className="w-3.5 h-3.5" />}
                onClick={() => jsonFileInputRef.current?.click()}
              >
                Restore JSON
              </Button>
            </div>
          </div>
        </div>

        <div className="mt-4 p-3.5 rounded-xl bg-[#090E18] border border-white/[0.05] flex items-start gap-3">
          <HardDrive className="w-4 h-4 text-cyan-400 mt-0.5 shrink-0" />
          <p className="text-xs text-slate-400 leading-relaxed">
            <span className="font-semibold text-slate-200">Local-First Privacy: </span>
            All financial records remain strictly inside your browser IndexedDB storage. No external servers or cloud APIs are used. Download periodic JSON backups to safeguard against browser data resets.
          </p>
        </div>
      </Card>

      {/* Academic Demonstration Actions */}
      <Card>
        <CardHeader>
          <div>
            <CardTitle className="flex items-center gap-2">
              <GraduationCap className="w-4 h-4 text-cyan-400" />
              <span>Academic Demonstration Tools</span>
            </CardTitle>
            <CardDescription>
              Load the BCA-308 reference dataset or clear transaction/budget records for fresh testing.
            </CardDescription>
          </div>
        </CardHeader>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-[#090E18] border border-white/[0.06] flex flex-col justify-between gap-3">
            <div>
              <p className="text-xs font-bold text-slate-100">Load Academic Test Data</p>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Loads the reference dataset from Table 7.3 of the project report (Allowance ₹15,000, Education ₹2,500, Food ₹1,200, Travel ₹500) without removing existing entries.
              </p>
            </div>
            <div>
              <Button
                variant="primary"
                size="sm"
                leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
                onClick={() => setIsSeedConfirmOpen(true)}
              >
                Load Test Dataset
              </Button>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-[#090E18] border border-rose-500/15 flex flex-col justify-between gap-3">
            <div>
              <p className="text-xs font-bold text-rose-300">Reset Transactions & Budgets</p>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Permanently deletes all saved transactions and budgets in IndexedDB so you can start with a blank ledger.
              </p>
            </div>
            <div>
              <Button
                variant="danger"
                size="sm"
                leftIcon={<Trash2 className="w-3.5 h-3.5" />}
                onClick={() => setIsResetConfirmOpen(true)}
              >
                Reset Database
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* CSV Import Results Modal */}
      {csvResultModal && (
        <Modal
          isOpen={!!csvResultModal}
          onClose={() => setCsvResultModal(null)}
          title="CSV Import Summary"
          description="Detailed breakdown of the spreadsheet import results"
          maxWidth="md"
        >
          <div className="space-y-3 text-xs">
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                <p className="text-[10px] text-slate-400">Imported</p>
                <p className="text-base font-bold font-mono text-emerald-400 tabular-nums">
                  {csvResultModal.importedCount}
                </p>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700">
                <p className="text-[10px] text-slate-400">Duplicates</p>
                <p className="text-base font-bold font-mono text-slate-300 tabular-nums">
                  {csvResultModal.skippedDuplicatesCount}
                </p>
              </div>
              <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20">
                <p className="text-[10px] text-slate-400">Errors</p>
                <p className="text-base font-bold font-mono text-rose-400 tabular-nums">
                  {csvResultModal.errorCount}
                </p>
              </div>
            </div>

            {csvResultModal.errors.length > 0 && (
              <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-500/30 max-h-36 overflow-y-auto space-y-1 text-rose-300">
                <p className="font-semibold text-rose-200">Error Details:</p>
                {csvResultModal.errors.map((err, i) => (
                  <p key={i}>• {err}</p>
                ))}
              </div>
            )}

            <div className="flex justify-end pt-2">
              <Button variant="secondary" size="sm" onClick={() => setCsvResultModal(null)}>
                Done
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* JSON Restore Confirmation Modal */}
      {pendingRestoreData && (
        <Modal
          isOpen={!!pendingRestoreData}
          onClose={() => setPendingRestoreData(null)}
          title="Confirm JSON Database Restore"
          description="Review backup contents and choose a restore strategy."
          maxWidth="md"
        >
          <div className="space-y-4 text-xs">
            <div className="p-3.5 rounded-xl bg-[#090E18] border border-white/[0.06] space-y-1.5 font-mono tabular-nums">
              <p className="text-slate-300">
                <span className="text-slate-500 font-sans">Export Date:</span>{' '}
                {pendingRestoreData.exportedAt || 'Unknown'}
              </p>
              <p className="text-slate-300">
                <span className="text-slate-500 font-sans">Transactions:</span>{' '}
                {pendingRestoreData.transactions?.length || 0}
              </p>
              <p className="text-slate-300">
                <span className="text-slate-500 font-sans">Categories:</span>{' '}
                {pendingRestoreData.categories?.length || 0}
              </p>
              <p className="text-slate-300">
                <span className="text-slate-500 font-sans">Budgets:</span>{' '}
                {pendingRestoreData.budgets?.length || 0}
              </p>
            </div>

            <div>
              <span className="block font-semibold text-slate-300 mb-1.5">
                Restore Strategy:
              </span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setRestoreMode('replace')}
                  className={`p-3 rounded-xl border text-left transition ${
                    restoreMode === 'replace'
                      ? 'border-cyan-500/60 bg-cyan-500/10 text-white'
                      : 'border-white/[0.08] bg-[#090E18] text-slate-400'
                  }`}
                >
                  <p className="font-bold">Replace Everything</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Clears current tables and restores backup.
                  </p>
                </button>
                <button
                  type="button"
                  onClick={() => setRestoreMode('merge')}
                  className={`p-3 rounded-xl border text-left transition ${
                    restoreMode === 'merge'
                      ? 'border-cyan-500/60 bg-cyan-500/10 text-white'
                      : 'border-white/[0.08] bg-[#090E18] text-slate-400'
                  }`}
                >
                  <p className="font-bold">Merge with Existing</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Preserves current data and adds new IDs.
                  </p>
                </button>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-white/[0.06]">
              <Button variant="ghost" size="sm" onClick={() => setPendingRestoreData(null)}>
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleConfirmRestore}
                isLoading={isProcessing}
              >
                Restore Data
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Academic Test Seed Confirmation */}
      <ConfirmDialog
        isOpen={isSeedConfirmOpen}
        onClose={() => setIsSeedConfirmOpen(false)}
        onConfirm={handleLoadAcademicData}
        title="Load Academic Test Dataset"
        message="This will add or restore the reference test transactions and budgets from Table 7.3 of the BCA-308 project report without overwriting your custom entries. Continue?"
        confirmText="Load Dataset"
        variant="primary"
        isLoading={isProcessing}
      />

      {/* Reset Confirmation */}
      <ConfirmDialog
        isOpen={isResetConfirmOpen}
        onClose={() => setIsResetConfirmOpen(false)}
        onConfirm={handleResetDatabase}
        title="Reset All Financial Data"
        message="Are you sure you want to permanently delete all recorded transactions and custom budgets? This action cannot be undone."
        confirmText="Reset All Data"
        variant="danger"
        isLoading={isProcessing}
      />
    </div>
  );
};

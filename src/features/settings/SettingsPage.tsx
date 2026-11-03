import React, { useState, useRef } from 'react';
import { Card, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { Modal } from '../../components/ui/Modal';
import { Badge } from '../../components/ui/Badge';
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
import { formatINR, paiseToRupees, rupeesToPaise } from '../../utils/currency';
import {
  Settings,
  Download,
  Upload,
  Database,
  Trash2,
  RefreshCw,
  ShieldCheck,
  GraduationCap,
  Sparkles,
  AlertTriangle,
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

  // Handle Monthly Budget Limit Update
  const handleSaveBudgetLimit = async () => {
    const num = parseFloat(monthlyLimitInput);
    if (isNaN(num) || num <= 0) {
      showToast({
        type: 'error',
        title: 'Invalid Limit',
        description: 'Please enter a valid positive number for monthly budget.',
      });
      return;
    }
    await updateSettings({ monthlyOverallBudget: rupeesToPaise(num) });
  };

  // CSV Export
  const handleExportCsv = () => {
    const csv = generateTransactionsCsv(allTransactions);
    downloadCsvFile(csv, 'all-personal-expenses.csv');
    showToast({
      type: 'success',
      title: 'CSV Export Generated',
      description: `Exported ${allTransactions.length} transaction records with formula injection protection.`,
    });
  };

  // CSV Import Trigger
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
        description: `Imported ${result.importedCount} records (${result.skippedDuplicatesCount} duplicates skipped, ${result.errorCount} errors).`,
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

  // Full JSON Backup
  const handleExportJson = async () => {
    try {
      const backup = await createFullApplicationBackup();
      downloadJsonBackup(backup);
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

  // JSON Restore Trigger
  const handleJsonFileSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const parsed = JSON.parse(text);
      setPendingRestoreData(parsed);
    } catch (err: any) {
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

  // Academic Test Data Seed
  const handleLoadAcademicData = async () => {
    try {
      setIsProcessing(true);
      await seedAcademicData();
      setIsSeedConfirmOpen(false);
      showToast({
        type: 'success',
        title: 'Academic Data Loaded',
        description: 'Loaded reference test dataset from Project Report Table 7.3.',
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

  // Reset Database
  const handleResetDatabase = async () => {
    try {
      setIsProcessing(true);
      await db.transactions.clear();
      await db.budgets.clear();
      setIsResetConfirmOpen(false);
      showToast({
        type: 'info',
        title: 'Database Reset',
        description: 'All transactions and custom budgets have been cleared.',
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

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Visual & 3D Orbit Preferences */}
      <Card className="p-5">
        <CardHeader>
          <div>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-cyan-400" />
              <span>Visual & 3D Experience</span>
            </CardTitle>
            <CardDescription>
              Configure interactive 3D Financial Orbit rendering and hardware optimization.
            </CardDescription>
          </div>
        </CardHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-900/60 border border-slate-800">
            <div>
              <p className="text-xs font-semibold text-slate-200">3D Financial Orbit</p>
              <p className="text-[11px] text-slate-400">
                Render interactive 3D WebGL scene on dashboard
              </p>
            </div>
            <button
              onClick={() => updateSettings({ enable3D: !settings.enable3D })}
              className={`w-12 h-6 rounded-full transition-colors p-0.5 border ${
                settings.enable3D
                  ? 'bg-cyan-500 border-cyan-400 justify-end'
                  : 'bg-slate-800 border-slate-700 justify-start'
              } flex items-center`}
            >
              <span className="w-5 h-5 rounded-full bg-white shadow-md" />
            </button>
          </div>

          <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-900/60 border border-slate-800">
            <div>
              <p className="text-xs font-semibold text-slate-200">Hardware Profile</p>
              <p className="text-[11px] text-slate-400">Adjust particle count and fidelity</p>
            </div>
            <select
              value={settings.performanceMode}
              onChange={(e) => updateSettings({ performanceMode: e.target.value as any })}
              className="bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-slate-200 focus:outline-none"
            >
              <option value="high">High (350 Particles)</option>
              <option value="medium">Medium (200 Particles)</option>
              <option value="low">Low (100 Particles)</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Financial Limits Preference */}
      <Card className="p-5">
        <CardHeader>
          <div>
            <CardTitle>Default Financial Controls</CardTitle>
            <CardDescription>
              Set currency and default monthly expense warning threshold.
            </CardDescription>
          </div>
        </CardHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Default Currency
            </label>
            <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between text-xs text-slate-200">
              <span className="font-semibold">Indian Rupee (INR — ₹)</span>
              <span className="font-mono text-cyan-400">Paise Precision</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Amounts are stored in integer minor units (paise) to prevent floating-point inaccuracy.
            </p>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Default Monthly Spending Cap (INR)
            </label>
            <div className="flex gap-2">
              <Input
                type="number"
                value={monthlyLimitInput}
                onChange={(e) => setMonthlyLimitInput(e.target.value)}
                leftAddon={<span className="font-mono text-cyan-400 font-bold">₹</span>}
              />
              <Button variant="secondary" size="sm" onClick={handleSaveBudgetLimit}>
                Save
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Data Backup & Portability */}
      <Card className="p-5">
        <CardHeader>
          <div>
            <CardTitle className="flex items-center gap-2">
              <Database className="w-5 h-5 text-cyan-400" />
              <span>Data Portability & Local Backups</span>
            </CardTitle>
            <CardDescription>
              Export and restore transactions and database snapshots safely.
            </CardDescription>
          </div>
        </CardHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          {/* CSV Section */}
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-200">
              <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
              <span>CSV Spreadsheet Data</span>
            </div>
            <p className="text-xs text-slate-400">
              Export transactions to CSV with formula injection defense, or import spreadsheets from previous tracking registers.
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

          {/* JSON Full Backup Section */}
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-200">
              <FileCode className="w-4 h-4 text-cyan-400" />
              <span>Full Database JSON Backup</span>
            </div>
            <p className="text-xs text-slate-400">
              Export complete application state (transactions, custom categories, budgets, and settings) or restore from an existing backup.
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

        {/* Local Storage Privacy Notice */}
        <div className="mt-4 p-3 rounded-xl bg-slate-900/40 border border-slate-800/60 flex items-start gap-3">
          <HardDrive className="w-4 h-4 text-cyan-400 mt-0.5 shrink-0" />
          <p className="text-xs text-slate-400 leading-relaxed">
            <span className="font-semibold text-slate-300">Local-First Storage Notice: </span>
            All financial transactions are stored locally inside your browser via IndexedDB (Dexie). No data is sent to external servers or cloud services. Regularly download a JSON backup to protect your records against browser cache clearing.
          </p>
        </div>
      </Card>

      {/* Academic Demonstration Actions */}
      <Card className="p-5 border border-cyan-500/20">
        <CardHeader>
          <div>
            <CardTitle className="flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-cyan-400" />
              <span>Academic Demonstration Tools</span>
            </CardTitle>
            <CardDescription>
              Verify test cases and reset test datasets according to BCA-308 project guidelines.
            </CardDescription>
          </div>
        </CardHeader>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
            <p className="text-xs font-bold text-slate-200">Load Academic Test Data</p>
            <p className="text-xs text-slate-400">
              Populates the database with the exact test dataset described in Chapter 7 Table 7.3 of the university project report (Allowance ₹15,000, Education ₹2,500, Food ₹1,200, Travel ₹500, Balance ₹10,800).
            </p>
            <Button
              variant="primary"
              size="sm"
              leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
              onClick={() => setIsSeedConfirmOpen(true)}
              className="mt-2"
            >
              Load Test Dataset
            </Button>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
            <p className="text-xs font-bold text-rose-300">Reset Application Database</p>
            <p className="text-xs text-slate-400">
              Clears all saved transaction records and custom budgets for a clean slate or new testing cycle.
            </p>
            <Button
              variant="danger"
              size="sm"
              leftIcon={<Trash2 className="w-3.5 h-3.5" />}
              onClick={() => setIsResetConfirmOpen(true)}
              className="mt-2"
            >
              Reset Database
            </Button>
          </div>
        </div>
      </Card>

      {/* CSV Import Results Modal */}
      {csvResultModal && (
        <Modal
          isOpen={!!csvResultModal}
          onClose={() => setCsvResultModal(null)}
          title="CSV Import Summary"
          description="Detailed breakdown of the spreadsheet processing results"
          maxWidth="md"
        >
          <div className="space-y-3 text-xs">
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                <p className="text-[10px] text-slate-400">Imported</p>
                <p className="text-base font-bold font-mono text-emerald-400">
                  {csvResultModal.importedCount}
                </p>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700">
                <p className="text-[10px] text-slate-400">Skipped Duplicates</p>
                <p className="text-base font-bold font-mono text-slate-300">
                  {csvResultModal.skippedDuplicatesCount}
                </p>
              </div>
              <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20">
                <p className="text-[10px] text-slate-400">Errors</p>
                <p className="text-base font-bold font-mono text-rose-400">
                  {csvResultModal.errorCount}
                </p>
              </div>
            </div>

            {csvResultModal.errors.length > 0 && (
              <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-500/30 max-h-32 overflow-y-auto space-y-1 text-rose-300">
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
          description="Review restore parameters before applying changes."
          maxWidth="md"
        >
          <div className="space-y-4 text-xs">
            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
              <p className="text-slate-300">
                <span className="font-semibold">Export Date:</span> {pendingRestoreData.exportedAt || 'Unknown'}
              </p>
              <p className="text-slate-300">
                <span className="font-semibold">Transactions:</span> {pendingRestoreData.transactions?.length || 0}
              </p>
              <p className="text-slate-300">
                <span className="font-semibold">Categories:</span> {pendingRestoreData.categories?.length || 0}
              </p>
              <p className="text-slate-300">
                <span className="font-semibold">Budgets:</span> {pendingRestoreData.budgets?.length || 0}
              </p>
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1.5">Restore Strategy:</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setRestoreMode('replace')}
                  className={`p-2.5 rounded-xl border text-left transition ${
                    restoreMode === 'replace'
                      ? 'border-cyan-500 bg-cyan-500/10 text-white'
                      : 'border-slate-800 bg-slate-900 text-slate-400'
                  }`}
                >
                  <p className="font-bold">Replace Everything</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">Clears existing tables and loads backup.</p>
                </button>
                <button
                  type="button"
                  onClick={() => setRestoreMode('merge')}
                  className={`p-2.5 rounded-xl border text-left transition ${
                    restoreMode === 'merge'
                      ? 'border-cyan-500 bg-cyan-500/10 text-white'
                      : 'border-slate-800 bg-slate-900 text-slate-400'
                  }`}
                >
                  <p className="font-bold">Merge with Existing</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">Adds non-duplicate records.</p>
                </button>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-white/5">
              <Button variant="ghost" size="sm" onClick={() => setPendingRestoreData(null)}>
                Cancel
              </Button>
              <Button variant="primary" size="sm" onClick={handleConfirmRestore} isLoading={isProcessing}>
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
        message="This will add the reference test transactions and budgets from Table 7.3 of the BCA-308 project report (Allowance ₹15,000, Education ₹2,500, Food ₹1,200, Travel ₹500). Continue?"
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
        message="Are you sure you want to delete all recorded transactions and custom budgets? This action is permanent and cannot be undone."
        confirmText="Reset All Data"
        variant="danger"
        isLoading={isProcessing}
      />
    </div>
  );
};

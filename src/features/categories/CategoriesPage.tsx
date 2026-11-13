import React, { useState, useMemo } from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { CategoryIcon } from '../../components/ui/CategoryIcon';
import { CategoryModal } from '../../components/forms/CategoryModal';
import { Modal } from '../../components/ui/Modal';
import { Select } from '../../components/ui/Select';
import { Category, TransactionType } from '../../types';
import { useCategories } from '../../hooks/useCategories';
import { useTransactions } from '../../hooks/useTransactions';
import { showToast } from '../../hooks/useToast';
import { formatINR } from '../../utils/currency';
import {
  FolderTree,
  Plus,
  Trash2,
  Edit2,
  AlertTriangle,
  Lock,
} from 'lucide-react';

export const CategoriesPage: React.FC = () => {
  const {
    expenseCategories,
    incomeCategories,
    addCategory,
    updateCategory,
    deleteCategory,
    getUsageCount,
  } = useCategories();

  const { allTransactions } = useTransactions();

  const [activeTab, setActiveTab] = useState<TransactionType>('expense');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  // Category deletion & reassignment state
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);
  const [reassignCategoryName, setReassignCategoryName] = useState<string>('');
  const [usageCount, setUsageCount] = useState<number>(0);
  const [isDeleting, setIsDeleting] = useState(false);

  const displayedCategories = activeTab === 'expense' ? expenseCategories : incomeCategories;

  // Precompute count and total paise volume per category+type
  const categoryStatsMap = useMemo(() => {
    const map = new Map<string, { count: number; totalPaise: number }>();
    for (const tx of allTransactions) {
      const key = `${tx.type}::${tx.category}`;
      const existing = map.get(key) || { count: 0, totalPaise: 0 };
      existing.count += 1;
      existing.totalPaise += tx.amount;
      map.set(key, existing);
    }
    return map;
  }, [allTransactions]);

  const handleEdit = (cat: Category) => {
    setEditingCategory(cat);
    setIsModalOpen(true);
  };

  const handleAdd = () => {
    setEditingCategory(null);
    setIsModalOpen(true);
  };

  const handleInitiateDelete = async (cat: Category) => {
    const count = await getUsageCount(cat.name);
    setUsageCount(count);
    setCategoryToDelete(cat);

    const candidates = displayedCategories.filter((c) => c.id !== cat.id);
    if (candidates.length > 0) {
      setReassignCategoryName(candidates[0].name);
    }
  };

  const handleConfirmDelete = async () => {
    if (!categoryToDelete) return;
    try {
      setIsDeleting(true);
      if (usageCount > 0) {
        await deleteCategory(categoryToDelete.id, reassignCategoryName);
        showToast({
          type: 'success',
          title: 'Category Reassigned & Deleted',
          description: `All ${usageCount} transaction(s) were reassigned to "${reassignCategoryName}".`,
        });
      } else {
        await deleteCategory(categoryToDelete.id);
        showToast({
          type: 'info',
          title: 'Category Removed',
          description: `Category "${categoryToDelete.name}" was deleted.`,
        });
      }
      setCategoryToDelete(null);
    } catch (err: any) {
      showToast({
        type: 'error',
        title: 'Error Deleting Category',
        description: err.message,
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-5 max-w-7xl mx-auto">
      {/* Top Header Card */}
      <Card className="p-4 sm:p-5 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 shrink-0">
            <FolderTree className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white">Category Management</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Default categories and custom classifications with live transaction volume
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto justify-between lg:justify-end">
          <div className="flex items-center bg-[#090E18] p-1 rounded-xl border border-white/[0.08]">
            <button
              type="button"
              onClick={() => setActiveTab('expense')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                activeTab === 'expense'
                  ? 'bg-rose-500/15 text-rose-300 font-semibold border border-rose-500/35'
                  : 'text-slate-400 hover:text-white border border-transparent'
              }`}
            >
              Expense ({expenseCategories.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('income')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                activeTab === 'income'
                  ? 'bg-emerald-500/15 text-emerald-300 font-semibold border border-emerald-500/35'
                  : 'text-slate-400 hover:text-white border border-transparent'
              }`}
            >
              Income ({incomeCategories.length})
            </button>
          </div>

          <Button
            variant="primary"
            size="sm"
            leftIcon={<Plus className="w-4 h-4" />}
            onClick={handleAdd}
          >
            Add Category
          </Button>
        </div>
      </Card>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {displayedCategories.map((cat) => {
          const stats = categoryStatsMap.get(`${cat.type}::${cat.name}`) || {
            count: 0,
            totalPaise: 0,
          };

          return (
            <Card key={cat.id} className="p-4 flex flex-col justify-between gap-4">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-3 min-w-0">
                  <CategoryIcon name={cat.icon} color={cat.color} size="md" />
                  <div className="min-w-0">
                    <h4 className="text-sm font-bold text-white truncate">{cat.name}</h4>
                    <p className="text-[11px] text-slate-400">
                      {cat.isCustom ? 'Custom' : 'System Default'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  {cat.isCustom ? (
                    <>
                      <button
                        type="button"
                        onClick={() => handleEdit(cat)}
                        aria-label={`Edit ${cat.name} category`}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-cyan-300 hover:bg-slate-800 transition"
                        title="Edit Category"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleInitiateDelete(cat)}
                        aria-label={`Delete ${cat.name} category`}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition"
                        title="Delete Category"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </>
                  ) : (
                    <span
                      className="p-1.5 text-slate-600"
                      title="System default category (Protected)"
                    >
                      <Lock className="w-3.5 h-3.5" />
                    </span>
                  )}
                </div>
              </div>

              <div className="pt-3 border-t border-white/[0.06] flex items-center justify-between text-xs">
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-slate-500 block">
                    Total Volume
                  </span>
                  <span className="font-mono font-bold text-slate-200 tabular-nums">
                    {formatINR(stats.totalPaise)}
                  </span>
                </div>
                <Badge variant={stats.count > 0 ? 'cyan' : 'slate'} size="sm">
                  {stats.count} tx{stats.count === 1 ? '' : 's'}
                </Badge>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Add / Edit Category Modal */}
      <CategoryModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        defaultType={activeTab}
        onSubmit={async (data) => {
          if (editingCategory) {
            await updateCategory(editingCategory.id, data);
            showToast({
              type: 'success',
              title: 'Category Updated',
              description: `Category "${data.name}" updated successfully.`,
            });
          } else {
            await addCategory(data);
            showToast({
              type: 'success',
              title: 'Category Created',
              description: `Category "${data.name}" added successfully.`,
            });
          }
        }}
        initialData={editingCategory}
      />

      {/* Safe Category Deletion & Reassignment Modal */}
      <Modal
        isOpen={!!categoryToDelete}
        onClose={() => setCategoryToDelete(null)}
        title="Delete Category"
        description="Verify category removal and transaction dependency safety."
        maxWidth="md"
      >
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-100">
                Delete "{categoryToDelete?.name}"?
              </p>
              {usageCount > 0 ? (
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                  This category is linked to{' '}
                  <span className="font-bold text-cyan-300">{usageCount}</span> existing
                  transaction(s). Select a replacement category to safely reassign those records.
                </p>
              ) : (
                <p className="text-xs text-slate-400 mt-1">
                  No transactions currently use this category. It will be removed cleanly.
                </p>
              )}
            </div>
          </div>

          {usageCount > 0 && (
            <Select
              label="Reassign Existing Transactions To"
              value={reassignCategoryName}
              onChange={(e) => setReassignCategoryName(e.target.value)}
              required
            >
              {displayedCategories
                .filter((c) => c.id !== categoryToDelete?.id)
                .map((c) => (
                  <option key={c.id} value={c.name} className="bg-[#0D131F] text-white">
                    {c.name}
                  </option>
                ))}
            </Select>
          )}

          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-white/[0.06]">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setCategoryToDelete(null)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="danger"
              size="sm"
              onClick={handleConfirmDelete}
              isLoading={isDeleting}
            >
              {usageCount > 0 ? 'Reassign & Delete' : 'Confirm Delete'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { CategoryModal } from '../../components/forms/CategoryModal';
import { Modal } from '../../components/ui/Modal';
import { Select } from '../../components/ui/Select';
import { Category, TransactionType } from '../../types';
import { useCategories } from '../../hooks/useCategories';
import { useTransactions } from '../../hooks/useTransactions';
import { showToast } from '../../hooks/useToast';
import {
  FolderTree,
  Plus,
  Trash2,
  Edit2,
  AlertTriangle,
  Lock,
  Layers,
  Sparkles,
} from 'lucide-react';

export const CategoriesPage: React.FC = () => {
  const {
    categories,
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

  const handleEdit = (cat: Category) => {
    setEditingCategory(cat);
    setIsModalOpen(true);
  };

  const handleAdd = () => {
    setEditingCategory(null);
    setIsModalOpen(true);
  };

  const handleInitiateDelete = async (cat: Category) => {
    const count = await getUsageCount(cat.name, cat.type);
    setUsageCount(count);
    setCategoryToDelete(cat);

    // Pick first candidate for reassignment from the same transaction type
    const sameTypeCategories = cat.type === 'expense' ? expenseCategories : incomeCategories;
    const candidates = sameTypeCategories.filter((c) => c.id !== cat.id);
    if (candidates.length > 0) {
      setReassignCategoryName(candidates[0].name);
    } else {
      setReassignCategoryName('');
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
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Header Card */}
      <Card className="p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <FolderTree className="w-5 h-5 text-cyan-400" />
            <span>Category Management</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Default curriculum categories and custom user classifications
          </p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          {/* Tab Selector */}
          <div className="flex items-center bg-slate-900 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setActiveTab('expense')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                activeTab === 'expense'
                  ? 'bg-rose-500/20 text-rose-300 font-semibold border border-rose-500/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Expense Categories ({expenseCategories.length})
            </button>
            <button
              onClick={() => setActiveTab('income')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                activeTab === 'income'
                  ? 'bg-emerald-500/20 text-emerald-300 font-semibold border border-emerald-500/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Income Categories ({incomeCategories.length})
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
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {displayedCategories.map((cat) => {
          const txCount = allTransactions.filter(
            (t) => t.category === cat.name && t.type === cat.type
          ).length;

          return (
            <Card
              key={cat.id}
              className="p-4 border border-white/5 hover:border-slate-700 transition space-y-3"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2.5">
                  <span
                    className="w-3.5 h-3.5 rounded-full ring-2 ring-white/10 shrink-0"
                    style={{ backgroundColor: cat.color }}
                  />
                  <div>
                    <h4 className="text-sm font-bold text-white">{cat.name}</h4>
                    <p className="text-[10px] text-slate-500 font-mono">
                      {cat.isCustom ? 'Custom Category' : 'Predefined Category'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  {cat.isCustom ? (
                    <>
                      <button
                        onClick={() => handleEdit(cat)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-cyan-300 hover:bg-slate-800"
                        title="Edit Category"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleInitiateDelete(cat)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800"
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

              {/* Usage Stats */}
              <div className="pt-2 border-t border-white/5 flex items-center justify-between text-xs">
                <span className="text-slate-400">Transactions</span>
                <Badge variant={txCount > 0 ? 'cyan' : 'slate'} size="sm">
                  {txCount} linked
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
            <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-100">
                Delete "{categoryToDelete?.name}"?
              </p>
              {usageCount > 0 ? (
                <p className="text-xs text-slate-300 mt-1">
                  This category is currently linked to{' '}
                  <span className="font-bold text-cyan-400">{usageCount}</span> existing
                  transaction(s). To protect historical integrity, select a replacement category
                  to reassign these records.
                </p>
              ) : (
                <p className="text-xs text-slate-400 mt-1">
                  No transactions currently use this category. It will be safely deleted.
                </p>
              )}
            </div>
          </div>

          {usageCount > 0 && (
            <Select
              label="Reassign Existing Transactions To:"
              value={reassignCategoryName}
              onChange={(e) => setReassignCategoryName(e.target.value)}
              required
            >
              {(categoryToDelete?.type === 'expense' ? expenseCategories : incomeCategories)
                .filter((c) => c.id !== categoryToDelete?.id)
                .map((c) => (
                  <option key={c.id} value={c.name} className="bg-slate-900 text-white">
                    {c.name}
                  </option>
                ))}
            </Select>
          )}

          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-white/5">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setCategoryToDelete(null)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
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

import { db } from '../db';
import { Category, TransactionType } from '../../types';

export const categoryRepository = {
  async getAll(): Promise<Category[]> {
    return db.categories.toArray();
  },

  async getByType(type: TransactionType): Promise<Category[]> {
    return db.categories.where('type').equals(type).toArray();
  },

  async getByNameAndType(name: string, type: TransactionType): Promise<Category | undefined> {
    return db.categories
      .filter((c) => c.name.toLowerCase() === name.trim().toLowerCase() && c.type === type)
      .first();
  },

  async add(categoryData: Omit<Category, 'id' | 'createdAt' | 'isCustom'>): Promise<Category> {
    const trimmedName = categoryData.name.trim();
    const existing = await this.getByNameAndType(trimmedName, categoryData.type);
    if (existing) {
      throw new Error(
        `Category "${trimmedName}" already exists for ${categoryData.type} transactions.`
      );
    }

    const newCategory: Category = {
      ...categoryData,
      name: trimmedName,
      id: `cat_custom_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      isCustom: true,
      createdAt: new Date().toISOString(),
    };

    await db.categories.add(newCategory);
    return newCategory;
  },

  async update(id: string, updates: Partial<Omit<Category, 'id' | 'createdAt'>>): Promise<Category> {
    const existing = await db.categories.get(id);
    if (!existing) {
      throw new Error('Category not found');
    }

    const oldName = existing.name;
    const catType = existing.type;
    const newName = updates.name ? updates.name.trim() : oldName;

    // Check duplicate if renaming
    if (newName !== oldName) {
      const duplicate = await this.getByNameAndType(newName, catType);
      if (duplicate && duplicate.id !== id) {
        throw new Error(`Category "${newName}" already exists for ${catType} transactions.`);
      }
    }

    const updated: Category = {
      ...existing,
      ...updates,
      name: newName,
    };

    await db.categories.put(updated);

    // If category name changed, cascade update ONLY to transactions of that exact type
    if (newName !== oldName) {
      await db.transactions
        .where('[type+category]')
        .equals([catType, oldName])
        .modify({ category: newName });

      // If this is an expense category, also update category-specific budgets
      if (catType === 'expense') {
        await db.budgets
          .where('category')
          .equals(oldName)
          .modify({ category: newName, updatedAt: new Date().toISOString() });
      }
    }

    return updated;
  },

  /**
   * Safe deletion: checks if transactions use this category for its specific transaction type.
   * If reassignToCategory is provided, updates existing transactions of this type.
   * Also cleans up or updates associated budgets to prevent orphaned records.
   */
  async delete(id: string, reassignToCategoryName?: string): Promise<void> {
    const cat = await db.categories.get(id);
    if (!cat) return;

    // Count usage ONLY for this category's specific type using compound index
    const countUsing = await db.transactions
      .where('[type+category]')
      .equals([cat.type, cat.name])
      .count();

    if (countUsing > 0) {
      if (!reassignToCategoryName) {
        throw new Error(
          `Cannot delete category "${cat.name}" because it is used by ${countUsing} ${cat.type} transaction(s). Please specify a replacement category.`
        );
      }

      // Verify that replacement category exists and is of the same type
      const targetCat = await this.getByNameAndType(reassignToCategoryName, cat.type);
      if (!targetCat) {
        throw new Error(
          `Replacement category "${reassignToCategoryName}" does not exist for ${cat.type} transactions.`
        );
      }

      // Reassign ONLY transactions matching both category and type
      await db.transactions
        .where('[type+category]')
        .equals([cat.type, cat.name])
        .modify({ category: targetCat.name });

      // If an expense category is deleted, manage associated budgets
      if (cat.type === 'expense') {
        const associatedBudgets = await db.budgets.where('category').equals(cat.name).toArray();
        for (const bud of associatedBudgets) {
          const targetBudget = await db.budgets
            .where(['category', 'month'])
            .equals([targetCat.name, bud.month])
            .first();

          if (targetBudget) {
            // Target category already has a budget for this month; remove old to prevent conflict
            await db.budgets.delete(bud.id);
          } else {
            // Reassign the budget to the replacement category
            await db.budgets.update(bud.id, {
              category: targetCat.name,
              updatedAt: new Date().toISOString(),
            });
          }
        }
      }
    } else {
      // No transactions use it, but clean up any orphaned budgets for this expense category
      if (cat.type === 'expense') {
        await db.budgets.where('category').equals(cat.name).delete();
      }
    }

    await db.categories.delete(id);
  },

  async countUsage(categoryName: string, type: TransactionType): Promise<number> {
    return db.transactions
      .where('[type+category]')
      .equals([type, categoryName])
      .count();
  },
};

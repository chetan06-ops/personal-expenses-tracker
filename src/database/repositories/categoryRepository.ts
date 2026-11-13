import { db } from '../db';
import { Category, TransactionType } from '../../types';

export const categoryRepository = {
  async getAll(): Promise<Category[]> {
    return db.categories.toArray();
  },

  async getByType(type: TransactionType): Promise<Category[]> {
    return db.categories.where('type').equals(type).toArray();
  },

  async getByName(name: string): Promise<Category | undefined> {
    return db.categories.where('name').equalsIgnoreCase(name).first();
  },

  async add(categoryData: Omit<Category, 'id' | 'createdAt' | 'isCustom'>): Promise<Category> {
    const existing = await this.getByName(categoryData.name);
    if (existing && existing.type === categoryData.type) {
      throw new Error(`Category "${categoryData.name}" already exists for ${categoryData.type}`);
    }

    const newCategory: Category = {
      ...categoryData,
      id: `cat_custom_${Date.now()}`,
      isCustom: true,
      createdAt: new Date().toISOString(),
    };

    await db.categories.add(newCategory);
    return newCategory;
  },

  async update(id: string, updates: Partial<Omit<Category, 'id' | 'createdAt'>>): Promise<Category> {
    const existing = await db.categories.get(id);
    if (!existing) {
      throw new Error(`Category not found`);
    }

    const oldName = existing.name;
    const updated: Category = {
      ...existing,
      ...updates,
    };

    await db.categories.put(updated);

    // If category name changed, cascade update to transactions and budgets
    if (updates.name && updates.name !== oldName) {
      await db.transactions
        .where('category')
        .equals(oldName)
        .modify({ category: updates.name });

      await db.budgets
        .where('category')
        .equals(oldName)
        .modify({ category: updates.name });
    }

    return updated;
  },

  /**
   * Safe deletion: checks if transactions use this category.
   * If reassignToCategory is provided, updates existing transactions and budgets to the new category.
   * Otherwise throws an error if transactions exist.
   */
  async delete(id: string, reassignToCategory?: string): Promise<void> {
    const cat = await db.categories.get(id);
    if (!cat) return;

    const countUsing = await db.transactions.where('category').equals(cat.name).count();

    if (countUsing > 0) {
      if (!reassignToCategory) {
        throw new Error(
          `Cannot delete category "${cat.name}" because it is used by ${countUsing} transaction(s). Please specify a replacement category.`
        );
      }
      // Reassign transactions
      await db.transactions
        .where('category')
        .equals(cat.name)
        .modify({ category: reassignToCategory });

      // Delete associated budget if any
      await db.budgets.where('category').equals(cat.name).delete();
    }

    await db.categories.delete(id);
  },

  async countUsage(categoryName: string): Promise<number> {
    return db.transactions.where('category').equals(categoryName).count();
  },
};

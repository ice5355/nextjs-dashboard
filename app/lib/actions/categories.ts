'use server';

import { z } from 'zod';
import db from '@/app/lib/db';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

const CategoryFormSchema = z.object({
  id: z.string(),
  name: z.string({
    invalid_type_error: '分类名称必须是字符串',
  }).min(1, '请输入分类名称'),
  chinese_name: z.string({
    invalid_type_error: '中文分类名称必须是字符串',
  }).min(1, '请输入中文分类名称'),
  game_ids: z.array(z.string()).optional(),
});

export type CategoryState = {
  errors?: {
    name?: string[];
    chinese_name?: string[];
    game_ids?: string[];
  };
  message?: string | null;
};

const CreateCategory = CategoryFormSchema.omit({ id: true });

export async function createCategory(prevState: CategoryState, formData: FormData) {
  const validatedFields = CreateCategory.safeParse({
    name: formData.get('name'),
    chinese_name: formData.get('chinese_name'),
    game_ids: formData.getAll('game_ids'),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: '表单验证失败，请检查输入。',
    };
  }

  const { name, chinese_name, game_ids = [] } = validatedFields.data;

  try {
    // 检查是否存在相同名称的分类
    const [existingCategories] = await db.query(
      `SELECT id FROM categories 
      WHERE LOWER(name) = LOWER(?)`,
      [name]
    );
    
    if ((existingCategories as any[]).length > 0) {
      return {
        errors: {
          name: ['该分类名称已存在'],
        },
        message: '创建分类失败。',
      };
    }

    // 创建分类
    const [result] = await db.query(
      `INSERT INTO categories (name, chinese_name)
      VALUES (?, ?)`,
      [name, chinese_name]
    );
    
    const categoryId = (result as any).insertId;

    // 创建游戏关联
    if (game_ids.length > 0) {
      for (const game_id of game_ids) {
        await db.query(
          `INSERT INTO game_categories (category_id, game_id)
          VALUES (?, ?)`,
          [categoryId, parseInt(game_id)]
        );
      }
    }
  } catch (error) {
    console.error('Database Error:', error);
    return {
      message: 'Database Error: Failed to create category.',
    };
  }

  revalidatePath('/dashboard/categories');
  redirect('/dashboard/categories');
}

export async function updateCategory(
  id: string,
  prevState: CategoryState,
  formData: FormData,
) {
  const validatedFields = CategoryFormSchema.safeParse({
    id: formData.get('id'),
    name: formData.get('name'),
    chinese_name: formData.get('chinese_name'),
    game_ids: formData.getAll('game_ids'),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: '表单验证失败，请检查输入。',
    };
  }

  const { name, chinese_name, game_ids = [] } = validatedFields.data;
  const categoryId = parseInt(id);

  try {
    // 检查是否存在相同名称的其他分类
    const [existingCategories] = await db.query(
      `SELECT id FROM categories 
      WHERE LOWER(name) = LOWER(?)
      AND id != ?`,
      [name, categoryId]
    );
    
    if ((existingCategories as any[]).length > 0) {
      return {
        errors: {
          name: ['该分类名称已存在'],
        },
        message: '更新分类失败。',
      };
    }

    // 更新分类信息
    await db.query(
      `UPDATE categories
      SET name = ?, chinese_name = ?
      WHERE id = ?`,
      [name, chinese_name, categoryId]
    );

    // 删除现有关联
    await db.query(
      `DELETE FROM game_categories WHERE category_id = ?`,
      [categoryId]
    );

    // 创建新的关联
    if (game_ids.length > 0) {
      for (const game_id of game_ids) {
        await db.query(
          `INSERT INTO game_categories (category_id, game_id)
          VALUES (?, ?)`,
          [categoryId, parseInt(game_id)]
        );
      }
    }
  } catch (error) {
    console.error('Database Error:', error);
    return {
      message: 'Database Error: Failed to update category.',
    };
  }

  revalidatePath('/dashboard/categories');
  redirect('/dashboard/categories');
}

export async function deleteCategory(id: string) {
  try {
    // 首先删除关联表中的记录
    await db.query(
      `DELETE FROM game_categories WHERE category_id = ?`,
      [parseInt(id)]
    );
    
    // 然后删除分类
    await db.query(
      `DELETE FROM categories WHERE id = ?`,
      [parseInt(id)]
    );

    revalidatePath('/dashboard/categories');
    console.log('分类删除成功');
    return { success: true, message: '分类删除成功' };
  } catch (error) {
    console.error('删除分类失败', error);
    return { success: false, message: '删除分类失败' };
  }
} 
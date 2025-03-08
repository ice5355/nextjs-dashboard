'use server';

import { z } from 'zod';
import postgres from 'postgres';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

const sql = postgres(process.env.POSTGRES_URL!, { ssl: 'require' });

const CategoryFormSchema = z.object({
  id: z.string(),
  category_name: z.string({
    invalid_type_error: '分类名称必须是字符串',
  }).min(1, '请输入分类名称'),
  game_ids: z.array(z.string()).optional(),
});

export type CategoryState = {
  errors?: {
    category_name?: string[];
    game_ids?: string[];
  };
  message?: string | null;
};

const CreateCategory = CategoryFormSchema.omit({ id: true });

export async function createCategory(prevState: CategoryState, formData: FormData) {
  const validatedFields = CreateCategory.safeParse({
    category_name: formData.get('category_name'),
    game_ids: formData.getAll('game_ids'),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: '表单验证失败，请检查输入。',
    };
  }

  const { category_name, game_ids = [] } = validatedFields.data;

  try {
    await sql.begin(async (sql) => {
      // 检查是否存在相同名称的分类
      const existingCategory = await sql`
        SELECT id FROM categories 
        WHERE LOWER(category_name) = LOWER(${category_name})
      `;

      if (existingCategory.length > 0) {
        return {
          errors: {
            category_name: ['该分类名称已存在'],
          },
          message: '创建分类失败。',
        };
      }

      // 创建分类
      const [newCategory] = await sql`
        INSERT INTO categories (category_name)
        VALUES (${category_name})
        RETURNING id
      `;

      // 创建游戏关联
      if (game_ids.length > 0) {
        const gameCategories = game_ids.map(game_id => ({
          category_id: newCategory.id,
          game_id: parseInt(game_id),
        }));

        await sql`
          INSERT INTO game_categories ${sql(gameCategories)}
        `;
      }
    });
  } catch (error) {
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
    category_name: formData.get('category_name'),
    game_ids: formData.getAll('game_ids'),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: '表单验证失败，请检查输入。',
    };
  }

  const { category_name, game_ids = [] } = validatedFields.data;
  const categoryId = parseInt(id);

  try {
    await sql.begin(async (sql) => {
      // 检查是否存在相同名称的其他分类
      const existingCategory = await sql`
        SELECT id FROM categories 
        WHERE LOWER(category_name) = LOWER(${category_name})
        AND id != ${categoryId}
      `;

      if (existingCategory.length > 0) {
        return {
          errors: {
            category_name: ['该分类名称已存在'],
          },
          message: '更新分类失败。',
        };
      }

      // 更新分类信息
      await sql`
        UPDATE categories
        SET category_name = ${category_name}
        WHERE id = ${categoryId}
      `;

      // 删除现有关联
      await sql`DELETE FROM game_categories WHERE category_id = ${categoryId}`;

      // 创建新的关联
      if (game_ids.length > 0) {
        const gameCategories = game_ids.map(game_id => ({
          category_id: categoryId,
          game_id: parseInt(game_id),
        }));

        await sql`
          INSERT INTO game_categories ${sql(gameCategories)}
        `;
      }
    });
  } catch (error) {
    return {
      message: 'Database Error: Failed to update category.',
    };
  }

  revalidatePath('/dashboard/categories');
  redirect('/dashboard/categories');
}

export async function deleteCategory(id: string) {
  try {
    await sql.begin(async (sql) => {
      // 首先删除关联表中的记录
      await sql`DELETE FROM game_categories WHERE category_id = ${parseInt(id)}`;
      // 然后删除分类
      await sql`DELETE FROM categories WHERE id = ${parseInt(id)}`;
    });

    revalidatePath('/dashboard/categories');
    console.log('分类删除成功');
    return { success: true, message: '分类删除成功' };
  } catch (error) {
    console.error('删除分类失败', error);
    return { success: false, message: '删除分类失败' };
  }
} 
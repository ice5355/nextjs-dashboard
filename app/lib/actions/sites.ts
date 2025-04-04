'use server';

import { z } from 'zod';
import db from '@/app/lib/db';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';


const SiteFormSchema = z.object({
  id: z.string().optional(),
  name: z.string({
    invalid_type_error: '网站名称必须是字符串',
  }).min(1, '请输入网站名称'),
  url: z.string({
    invalid_type_error: 'URL必须是字符串',
  }).url('请输入有效的URL'),
  game_ids: z.array(z.string()).optional(),
});

export type SiteState = {
  errors?: {
    name?: string[];
    url?: string[];
  };
  message?: string | null;
};

export async function createSite(prevState: SiteState, formData: FormData) {
  const validatedFields = SiteFormSchema.safeParse({
    name: formData.get('name'),
    url: formData.get('url'),
    game_ids: formData.getAll('game_ids'),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: '表单验证失败，请检查输入。',
    };
  }

  const { name, url, game_ids = [] } = validatedFields.data;

  try {
    // 开始事务
    const connection = await db.getConnection();
    await connection.beginTransaction();
    
    try {
      // 创建网站
      const [result] = await connection.query(
        `INSERT INTO sites (name, url)
        VALUES (?, ?)`,
        [name, url]
      );
      
      const siteId = (result as any).insertId;

      // 创建游戏关联
      if (game_ids.length > 0) {
        for (const game_id of game_ids) {
          const weight = parseInt(formData.get(`weight-${game_id}`)?.toString() || '0');
          await connection.query(
            `INSERT INTO site_games (site_id, game_id, weight)
            VALUES (?, ?, ?)`,
            [siteId, parseInt(game_id), weight]
          );
        }
      }

      // 提交事务
      await connection.commit();
    } catch (error) {
      // 发生错误时回滚事务
      await connection.rollback();
      throw error;
    } finally {
      // 释放连接
      connection.release();
    }
  } catch (error) {
    console.error('Failed to create site:', error);
    return {
      message: 'Database Error: Failed to create site.',
    };
  }

  revalidatePath('/dashboard/sites');
  redirect('/dashboard/sites');
}

export async function updateSite(
  id: number,
  prevState: SiteState,
  formData: FormData,
) {
  const validatedFields = SiteFormSchema.safeParse({
    name: formData.get('name'),
    url: formData.get('url'),
    game_ids: formData.getAll('game_ids'),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: '表单验证失败，请检查输入。',
    };
  }

  const { name, url, game_ids = [] } = validatedFields.data;

  try {
    // 开始事务
    const connection = await db.getConnection();
    await connection.beginTransaction();
    
    try {
      // 更新网站信息
      await connection.query(
        `UPDATE sites
        SET name = ?, url = ?
        WHERE id = ?`,
        [name, url, id]
      );

      // 删除现有关联
      await connection.query(
        `DELETE FROM site_games WHERE site_id = ?`,
        [id]
      );

      // 创建新的关联
      if (game_ids.length > 0) {
        for (const game_id of game_ids) {
          const weight = parseInt(formData.get(`weight-${game_id}`)?.toString() || '0');
          await connection.query(
            `INSERT INTO site_games (site_id, game_id, weight)
            VALUES (?, ?, ?)`,
            [id, parseInt(game_id), weight]
          );
        }
      }

      // 提交事务
      await connection.commit();
    } catch (error) {
      // 发生错误时回滚事务
      await connection.rollback();
      throw error;
    } finally {
      // 释放连接
      connection.release();
    }
  } catch (error) {
    console.error('Failed to update site:', error);
    return {
      message: 'Database Error: Failed to update site.',
    };
  }

  revalidatePath('/dashboard/sites');
  redirect('/dashboard/sites');
}

export async function deleteSite(id: string) {
  try {
    // 开始事务
    const connection = await db.getConnection();
    await connection.beginTransaction();
    
    try {
      // 首先删除关联表中的记录
      await connection.query(
        `DELETE FROM site_games WHERE site_id = ?`,
        [parseInt(id)]
      );
      
      // 然后删除网站
      await connection.query(
        `DELETE FROM sites WHERE id = ?`,
        [parseInt(id)]
      );

      // 提交事务
      await connection.commit();
    } catch (error) {
      // 发生错误时回滚事务
      await connection.rollback();
      throw error;
    } finally {
      // 释放连接
      connection.release();
    }

    revalidatePath('/dashboard/sites');
    console.log('网站删除成功');
    return { success: true, message: '网站删除成功' };
  } catch (error) {
    console.error('删除网站失败', error);
    return { success: false, message: '删除网站失败' };
  }
} 
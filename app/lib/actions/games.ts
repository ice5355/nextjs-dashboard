'use server';

import { z } from 'zod';
import db from '@/app/lib/db';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { generatePresignedUrl } from '../r2';

export const runtime = 'edge';

const GameFormSchema = z.object({
  id: z.string().optional(),
  name: z.string({
    invalid_type_error: '游戏名称必须是字符串',
  }).min(1, '请输入游戏名称'),
  icon_url: z.string().url('请输入有效的图标URL').optional().nullable(),
  game_url: z.string().url('请输入有效的游戏链接URL').optional().nullable(),
  description: z.string().optional().nullable(),
  details: z.string().optional().nullable(),
  category_ids: z.array(z.number()).optional(),
});

export type GameState = {
  errors?: {
    name?: string[];
    icon_url?: string[];
    game_url?: string[];
    description?: string[];
    details?: string[];
    category_ids?: string[];
  };
  message?: string | null;
};

const CreateGame = GameFormSchema.omit({ id: true });

export async function createGame(prevState: GameState, formData: FormData) {
  const iconUrl = formData.get('icon_url');

  // 获取并处理分类ID
  const categoryIds = formData.getAll('category_ids').map(id => parseInt(id.toString()));
  
  const validatedFields = CreateGame.safeParse({
    name: formData.get('name'),
    icon_url: iconUrl,
    game_url: formData.get('game_url'),
    description: formData.get('description') || null,
    details: formData.get('details') || null,
    category_ids: categoryIds,
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: '表单验证失败，请检查输入。',
    };
  }

  const { name, icon_url, game_url, description, details, category_ids } = validatedFields.data;

  try {
    // 开始事务
    const connection = await db.getConnection();
    await connection.beginTransaction();
    
    try {
      // 插入游戏基本信息
      const [result] = await connection.query(
        `INSERT INTO games (name, icon_url, game_url, description, details)
        VALUES (?, ?, ?, ?, ?)`,
        [name, icon_url || null, game_url || null, description || null, details || null]
      );
      
      const gameId = (result as any).insertId;

      // 处理网站关联和权重
      const siteIds = formData.getAll('site_ids');
      for (const siteId of siteIds) {
        const weight = formData.get(`weight-${siteId}`) || '0';
        await connection.query(
          `INSERT INTO site_games (game_id, site_id, weight)
          VALUES (?, ?, ?)`,
          [gameId, parseInt(siteId.toString()), parseInt(weight.toString())]
        );
      }

      // 处理分类关联
      if (category_ids && category_ids.length > 0) {
        for (const categoryId of category_ids) {
          await connection.query(
            `INSERT INTO game_categories (game_id, category_id)
            VALUES (?, ?)`,
            [gameId, categoryId]
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
    console.error('Database Error:', error);
    return {
      message: 'Database Error: Failed to create game.',
    };
  }

  revalidatePath('/dashboard/games');
  redirect('/dashboard/games');
}

export async function updateGame(
  id: string,
  prevState: GameState,
  formData: FormData,
) {
  const iconUrl = formData.get('icon_url');
  
  // 获取并处理分类ID
  const categoryIds = formData.getAll('category_ids').map(id => parseInt(id.toString()));

  const validatedFields = GameFormSchema.safeParse({
    id: formData.get('id'),
    name: formData.get('name'),
    icon_url: iconUrl,
    game_url: formData.get('game_url'),
    description: formData.get('description') || null,
    details: formData.get('details') || null,
    category_ids: categoryIds,
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: '表单验证失败，请检查输入。',
    };
  }

  const { id: updatedId, name, icon_url, game_url, description, details, category_ids } = validatedFields.data;
  if (!updatedId) {
    return {
      message: 'Missing game ID.',
    };
  }

  try {
    // 开始事务
    const connection = await db.getConnection();
    await connection.beginTransaction();
    
    try {
      // 更新游戏基本信息
      await connection.query(
        `UPDATE games
        SET 
          name = ?, 
          icon_url = ?, 
          game_url = ?, 
          description = ?, 
          details = ?
        WHERE id = ?`,
        [name, icon_url || null, game_url || null, description || null, details || null, parseInt(updatedId)]
      );
      
      // 删除旧的分类关联
      await connection.query(
        `DELETE FROM game_categories WHERE game_id = ?`,
        [parseInt(updatedId)]
      );
      
      // 添加新的分类关联
      if (category_ids && category_ids.length > 0) {
        for (const categoryId of category_ids) {
          await connection.query(
            `INSERT INTO game_categories (game_id, category_id)
            VALUES (?, ?)`,
            [parseInt(updatedId), categoryId]
          );
        }
      }
      
      // 删除旧的网站关联
      await connection.query(
        `DELETE FROM site_games WHERE game_id = ?`,
        [parseInt(updatedId)]
      );
      
      // 处理网站关联和权重
      const siteIds = formData.getAll('site_ids');
      for (const siteId of siteIds) {
        const weight = formData.get(`weight-${siteId}`) || '0';
        await connection.query(
          `INSERT INTO site_games (game_id, site_id, weight)
          VALUES (?, ?, ?)`,
          [parseInt(updatedId), parseInt(siteId.toString()), parseInt(weight.toString())]
        );
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
    console.error('Database Error:', error);
    return {
      message: 'Database Error: Failed to update game.',
    };
  }

  revalidatePath('/dashboard/games');
  redirect('/dashboard/games');
}

export async function deleteGame(id: string) {
  try {
    // 开始事务
    const connection = await db.getConnection();
    await connection.beginTransaction();
    
    try {
      // 首先删除关联表中的记录
      await connection.query(
        `DELETE FROM game_categories WHERE game_id = ?`,
        [parseInt(id)]
      );
      
      await connection.query(
        `DELETE FROM site_games WHERE game_id = ?`,
        [parseInt(id)]
      );
      
      // 然后删除游戏
      await connection.query(
        `DELETE FROM games WHERE id = ?`,
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

    revalidatePath('/dashboard/games');
    console.log('游戏删除成功');
    return { success: true, message: '游戏删除成功' };
  } catch (error) {
    console.error('删除游戏失败', error);
    return { success: false, message: '删除游戏失败' };
  }
} 

export async function getUploadUrl(filename: string) {
  try {
    const uploadUrl = await generatePresignedUrl(filename);
    return uploadUrl;
  } catch (error) {
    console.error('生成上传URL失败:', error);
    throw new Error('生成上传URL失败');
  }
}


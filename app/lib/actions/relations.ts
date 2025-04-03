'use server';

import db from '@/app/lib/db';
import { revalidatePath } from 'next/cache';

export async function updateGameSites(
  gameId: number,
  relations: Array<{ game_id: number; site_id: number; weight: number }>
) {
  try {
    // 开始事务
    const connection = await db.getConnection();
    await connection.beginTransaction();
    
    try {
      // 删除现有关联
      await connection.query(
        `DELETE FROM site_games 
        WHERE game_id = ?`,
        [gameId]
      );

      // 插入新的关联
      if (relations.length > 0) {
        for (const relation of relations) {
          await connection.query(
            `INSERT INTO site_games (game_id, site_id, weight)
            VALUES (?, ?, ?)`,
            [relation.game_id, relation.site_id, relation.weight]
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

    revalidatePath('/dashboard/relations');
    return { success: true };
  } catch (error) {
    console.error('更新游戏-网站关系失败:', error);
    return {
      message: 'Database Error: Failed to update relations.',
    };
  }
}

export async function updateGameCategories(
  gameId: number,
  categoryIds: number[]
) {
  try {
    // 开始事务
    const connection = await db.getConnection();
    await connection.beginTransaction();
    
    try {
      // 删除现有关联
      await connection.query(
        `DELETE FROM game_categories 
        WHERE game_id = ?`,
        [gameId]
      );

      // 插入新的关联
      if (categoryIds.length > 0) {
        for (const categoryId of categoryIds) {
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

    revalidatePath('/dashboard/relations');
    return { success: true };
  } catch (error) {
    console.error('更新游戏-分类关系失败:', error);
    return {
      message: 'Database Error: Failed to update relations.',
    };
  }
} 
'use server';

import postgres from 'postgres';
import { revalidatePath } from 'next/cache';

const sql = postgres(process.env.POSTGRES_URL!, { ssl: 'require' });

export async function updateGameSites(
  gameId: number,
  relations: Array<{ game_id: number; site_id: number; weight: number }>
) {
  try {
    await sql.begin(async (sql) => {
      // 删除现有关联
      await sql`
        DELETE FROM site_games 
        WHERE game_id = ${gameId}
      `;

      // 插入新的关联
      if (relations.length > 0) {
        await sql`
          INSERT INTO site_games (game_id, site_id, weight)
          SELECT * FROM ${sql(
            relations.map(r => ({
              game_id: r.game_id,
              site_id: r.site_id,
              weight: r.weight,
            }))
          )}
        `;
      }
    });

    revalidatePath('/dashboard/relations');
    return { success: true };
  } catch (error) {
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
    await sql.begin(async (sql) => {
      // 删除现有关联
      await sql`
        DELETE FROM game_categories 
        WHERE game_id = ${gameId}
      `;

      // 插入新的关联
      if (categoryIds.length > 0) {
        await sql`
          INSERT INTO game_categories (game_id, category_id)
          SELECT * FROM ${sql(
            categoryIds.map(categoryId => ({
              game_id: gameId,
              category_id: categoryId,
            }))
          )}
        `;
      }
    });

    revalidatePath('/dashboard/relations');
    return { success: true };
  } catch (error) {
    return {
      message: 'Database Error: Failed to update relations.',
    };
  }
} 
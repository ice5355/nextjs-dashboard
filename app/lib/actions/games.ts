'use server';

import { z } from 'zod';
import postgres from 'postgres';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { generatePresignedUrl } from '../r2';

const sql = postgres(process.env.POSTGRES_URL!, { ssl: 'require' });

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
    // 使用事务来确保所有相关操作都成功完成
    await sql.begin(async (sql) => {
      // 插入游戏基本信息
      const [newGame] = await sql`
        INSERT INTO games (name, icon_url, game_url, description, details)
        VALUES (${name}, ${icon_url || null}, ${game_url || null}, ${description || null}, ${details || null})
        RETURNING id
      `;

      // 处理网站关联和权重
      const siteIds = formData.getAll('site_ids');
      for (const siteId of siteIds) {
        const weight = formData.get(`weight-${siteId}`) || '0';
        await sql`
          INSERT INTO site_games (game_id, site_id, weight)
          VALUES (${newGame.id}, ${parseInt(siteId.toString())}, ${parseInt(weight.toString())})
        `;
      }

      // 处理分类关联
      if (category_ids && category_ids.length > 0) {
        for (const categoryId of category_ids) {
          await sql`
            INSERT INTO game_categories (game_id, category_id)
            VALUES (${newGame.id}, ${categoryId})
          `;
        }
      }
    });
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

  const validatedFields = GameFormSchema.safeParse({
    id: formData.get('id'),
    name: formData.get('name'),
    icon_url: iconUrl,
    game_url: formData.get('game_url'),
    description: formData.get('description') || null,
    details: formData.get('details') || null,
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: '表单验证失败，请检查输入。',
    };
  }

  const { id: updatedId, name, icon_url, game_url, description, details } = validatedFields.data;
  if (!updatedId) {
    return {
      message: 'Missing game ID.',
    };
  }

  try {
    await sql`
      UPDATE games
      SET 
        name = ${name}, 
        icon_url = ${icon_url || null}, 
        game_url = ${game_url || null}, 
        description = ${description || null}, 
        details = ${details || null}
      WHERE id = ${parseInt(updatedId)}
    `;
  } catch (error) {
    return {
      message: 'Database Error: Failed to update game.',
    };
  }

  revalidatePath('/dashboard/games');
  redirect('/dashboard/games');
}

export async function deleteGame(id: string) {
  try {
    await sql.begin(async (sql) => {
      // 首先删除关联表中的记录
      await sql`DELETE FROM game_categories WHERE game_id = ${parseInt(id)}`;
      await sql`DELETE FROM site_games WHERE game_id = ${parseInt(id)}`;
      // 然后删除游戏
      await sql`DELETE FROM games WHERE id = ${parseInt(id)}`;
    });

    revalidatePath('/dashboard/games');
    console.log('游戏删除成功');
    return { success: true , message: '游戏删除成功' };
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


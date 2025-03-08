'use server';

import { z } from 'zod';
import postgres from 'postgres';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

const sql = postgres(process.env.POSTGRES_URL!, { ssl: 'require' });

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
    await sql.begin(async (sql) => {
      // 创建网站
      const [site] = await sql`
        INSERT INTO sites (name, url)
        VALUES (${name}, ${url})
        RETURNING id
      `;

      // 创建游戏关联
      if (game_ids.length > 0) {
        const siteGames = game_ids.map(game_id => ({
          site_id: site.id,
          game_id: parseInt(game_id),
          weight: parseInt(formData.get(`weight-${game_id}`)?.toString() || '0'),
        }));

        await sql`
          INSERT INTO site_games ${sql(siteGames)}
        `;
      }
    });
  } catch (error) {
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
    await sql.begin(async (sql) => {
      // 更新网站信息
      await sql`
        UPDATE sites
        SET name = ${name}, url = ${url}
        WHERE id = ${id}
      `;

      // 删除现有关联
      await sql`DELETE FROM site_games WHERE site_id = ${id}`;

      // 创建新的关联
      if (game_ids.length > 0) {
        const siteGames = game_ids.map(game_id => ({
          site_id: id,
          game_id: parseInt(game_id),
          weight: parseInt(formData.get(`weight-${game_id}`)?.toString() || '0'),
        }));

        await sql`
          INSERT INTO site_games ${sql(siteGames)}
        `;
      }
    });
  } catch (error) {
    return {
      message: 'Database Error: Failed to update site.',
    };
  }

  revalidatePath('/dashboard/sites');
  redirect('/dashboard/sites');
}

export async function deleteSite(id: string) {
  try {
    await sql.begin(async (sql) => {
      // 首先删除关联表中的记录
      await sql`DELETE FROM site_games WHERE site_id = ${parseInt(id)}`;
      // 然后删除网站
      await sql`DELETE FROM sites WHERE id = ${parseInt(id)}`;
    });

    revalidatePath('/dashboard/sites');
    console.log('网站删除成功');
    return { success: true , message: '网站删除成功' };
  } catch (error) {
    console.error('删除网站失败', error);
    return { success: false, message: '删除网站失败' };
  }
} 
import db from '@/app/lib/db';
import { Category } from '../definitions';

export const runtime = 'edge';

const ITEMS_PER_PAGE = 10;

export async function fetchCategories() {
  try {
    const [data] = await db.query(`
      SELECT 
        c.*,
        COUNT(gc.game_id) as game_count
      FROM categories c
      LEFT JOIN game_categories gc ON c.id = gc.category_id
      GROUP BY c.id
      ORDER BY c.name ASC
    `);
    return data as (Category & { game_count: number })[];
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch categories.');
  }
}

export async function fetchCategoryById(id: number) {
  try {
    const [data] = await db.query(`
      SELECT * FROM categories 
      WHERE id = ?
    `, [id]);
    return (data as Category[])[0];
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch category.');
  }
}

export async function fetchGamesByCategoryId(categoryId: number) {
  try {
    const [games] = await db.query(`
      SELECT game_id
      FROM game_categories
      WHERE category_id = ?
    `, [categoryId]);
    return games as { game_id: number }[];
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch category games.');
  }
}

export async function fetchCategoriesWithParams(query: string, currentPage: number) {
  const offset = (currentPage - 1) * ITEMS_PER_PAGE;

  try {
    const [categories] = await db.query(`
      SELECT 
        c.*,
        COUNT(gc.game_id) as game_count
      FROM categories c
      LEFT JOIN game_categories gc ON c.id = gc.category_id
      WHERE
        c.name LIKE ?
      GROUP BY c.id
      ORDER BY c.name ASC
      LIMIT ? OFFSET ?
    `, [`%${query}%`, ITEMS_PER_PAGE, offset]);
    
    return categories as (Category & { game_count: number })[];
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch categories.');
  }
}

export async function fetchCategoriesPages(query: string) {
  try {
    const [data] = await db.query(`
      SELECT COUNT(DISTINCT categories.id) as count
      FROM categories
      WHERE
        categories.name LIKE ?
    `, [`%${query}%`]);

    const totalPages = Math.ceil(Number((data as any[])[0].count) / ITEMS_PER_PAGE);
    return totalPages;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch total number of categories.');
  }
} 
import postgres from 'postgres';
import { Category } from '../definitions';

const sql = postgres(process.env.POSTGRES_URL!, { ssl: 'require' });
const ITEMS_PER_PAGE = 10;

export async function fetchCategories() {
  try {
    const data = await sql<(Category & { game_count: number })[]>`
      SELECT 
        c.*,
        COUNT(gc.game_id) as game_count
      FROM categories c
      LEFT JOIN game_categories gc ON c.id = gc.category_id
      GROUP BY c.id
      ORDER BY c.category_name ASC
    `;
    return data;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch categories.');
  }
}

export async function fetchCategoryById(id: number) {
  try {
    const data = await sql<Category[]>`
      SELECT * FROM categories 
      WHERE id = ${id}
    `;
    return data[0];
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch category.');
  }
}

export async function fetchGamesByCategoryId(categoryId: number) {
  try {
    const games = await sql<{ game_id: number }[]>`
      SELECT game_id
      FROM game_categories
      WHERE category_id = ${categoryId}
    `;
    return games;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch category games.');
  }
}

export async function fetchCategoriesWithParams(query: string, currentPage: number) {
  const offset = (currentPage - 1) * ITEMS_PER_PAGE;

  try {
    const categories = await sql<(Category & { game_count: number })[]>`
      SELECT 
        c.*,
        COUNT(gc.game_id) as game_count
      FROM categories c
      LEFT JOIN game_categories gc ON c.id = gc.category_id
      WHERE
        c.category_name ILIKE ${`%${query}%`}
      GROUP BY c.id
      ORDER BY c.category_name ASC
      LIMIT ${ITEMS_PER_PAGE} OFFSET ${offset}
    `;
    
    return categories;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch categories.');
  }
}

export async function fetchCategoriesPages(query: string) {
  try {
    const data = await sql`
      SELECT COUNT(DISTINCT categories.id)
      FROM categories
      WHERE
        categories.category_name ILIKE ${`%${query}%`}
    `;

    const totalPages = Math.ceil(Number(data[0].count) / ITEMS_PER_PAGE);
    return totalPages;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch total number of categories.');
  }
} 
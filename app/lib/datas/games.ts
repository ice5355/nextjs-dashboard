import db from '@/app/lib/db';
import { Game, Category, Site } from '../definitions';

export async function fetchGames() {
  try {
    const [data] = await db.query(`
      SELECT * FROM games 
      ORDER BY created_at DESC
    `);
    return data as Game[];
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch games data.');
  }
}

export async function fetchGameById(id: number) {
  try {
    const [gameResult] = await db.query(`
      SELECT * FROM games 
      WHERE id = ?
    `, [id]);
    
    const game = (gameResult as Game[])[0];
    
    const [categoriesResult] = await db.query(`
      SELECT c.* FROM categories c
      JOIN game_categories gc ON c.id = gc.category_id
      WHERE gc.game_id = ?
    `, [id]);
    
    const categories = categoriesResult as Category[];
    
    const [sitesResult] = await db.query(`
      SELECT s.*, sg.weight 
      FROM sites s
      JOIN site_games sg ON s.id = sg.site_id
      WHERE sg.game_id = ?
      ORDER BY sg.weight DESC
    `, [id]);
    
    const sites = sitesResult as (Site & { weight: number })[];
    
    return {
      ...game,
      categories: categories,
      sites: sites
    };
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch game.');
  }
}

export async function fetchGamesWithParams(query: string, currentPage: number) {
  const ITEMS_PER_PAGE = 10;
  try {
    const offset = (currentPage - 1) * ITEMS_PER_PAGE;

    const [gamesResult] = await db.query(`
      SELECT 
        games.*,
        COUNT(site_games.site_id) as sites_count
      FROM games
      LEFT JOIN site_games ON games.id = site_games.game_id
      WHERE games.name LIKE ?
      GROUP BY games.id
      ORDER BY games.created_at DESC
      LIMIT ? OFFSET ?
    `, [`%${query}%`, ITEMS_PER_PAGE, offset]);

    const [totalGamesResult] = await db.query(`
      SELECT COUNT(*) as count
      FROM games
      WHERE name LIKE ?
    `, [`%${query}%`]);

    const games = gamesResult as any[];
    
    const gamesWithSiteCount = games.map(game => ({
      ...game,
      sitesCount: Number(game.sites_count || 0)
    }));

    return {
      games: gamesWithSiteCount,
      totalPages: Math.ceil(Number((totalGamesResult as any[])[0]?.count || 0) / ITEMS_PER_PAGE)
    };
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch games data.');
  }
}

export async function fetchGamesPages(query: string) {
  const ITEMS_PER_PAGE = 10;
  try {
    const [data] = await db.query(`
      SELECT COUNT(*) as count
      FROM games
      WHERE name LIKE ?
    `, [`%${query}%`]);

    const totalPages = Math.ceil(Number((data as any[])[0].count) / ITEMS_PER_PAGE);
    return totalPages;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch total number of games.');
  }
} 
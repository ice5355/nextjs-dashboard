import db from '@/app/lib/db';
import { Site } from '../definitions';

export const runtime = 'edge';

export async function fetchAllRelations() {
  try {
    const [siteGamesResult] = await db.query(`
      SELECT game_id, site_id, weight 
      FROM site_games
      ORDER BY weight DESC
    `);
    
    const [gameCategoriesResult] = await db.query(`
      SELECT game_id, category_id
      FROM game_categories
    `);

    return {
      siteGames: siteGamesResult as { game_id: number; site_id: number; weight: number }[],
      gameCategories: gameCategoriesResult as { game_id: number; category_id: number }[],
    };
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch relations.');
  }
}

export async function fetchGameSites(gameId: number) {
  try {
    const [data] = await db.query(`
      SELECT s.*, sg.weight 
      FROM sites s
      JOIN site_games sg ON s.id = sg.site_id
      WHERE sg.game_id = ?
      ORDER BY sg.weight DESC
    `, [gameId]);
    
    return data as (Site & { weight: number })[];
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch game sites.');
  }
} 
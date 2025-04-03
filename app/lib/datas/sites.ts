import db from '@/app/lib/db';
import { Site } from '../definitions';

const ITEMS_PER_PAGE = 10;

export async function fetchSites() {
  try {
    const [data] = await db.query(`
      SELECT * FROM sites 
      ORDER BY created_at DESC
    `);
    return data as Site[];
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch sites data.');
  }
}

export async function fetchSiteById(id: number) {
  try {
    const [sites] = await db.query(`
      SELECT * FROM sites 
      WHERE id = ?
    `, [id]);

    const site = (sites as any[])[0];
    if (!site) return null;

    // 获取关联的游戏信息
    const [games] = await db.query(`
      SELECT game_id, weight
      FROM site_games
      WHERE site_id = ?
      ORDER BY weight DESC
    `, [id]);

    return {
      ...site,
      games,
    };
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch site.');
  }
}

export async function fetchSitesWithParams(query: string, currentPage: number) {
  try {
    const offset = (currentPage - 1) * ITEMS_PER_PAGE;

    const [sites] = await db.query(`
      SELECT 
        sites.*,
        COUNT(site_games.game_id) as games_count
      FROM sites
      LEFT JOIN site_games ON sites.id = site_games.site_id
      WHERE sites.name LIKE ? OR sites.url LIKE ?
      GROUP BY sites.id
      ORDER BY sites.created_at DESC
      LIMIT ? OFFSET ?
    `, [`%${query}%`, `%${query}%`, ITEMS_PER_PAGE, offset]);

    const [totalSitesResult] = await db.query(`
      SELECT COUNT(*) as count
      FROM sites
      WHERE name LIKE ? OR url LIKE ?
    `, [`%${query}%`, `%${query}%`]);

    const sitesWithGameCount = (sites as any[]).map(site => ({
      ...site,
      gamesCount: Number(site.games_count)
    }));

    return {
      sites: sitesWithGameCount,
      totalPages: Math.ceil(Number((totalSitesResult as any[])[0].count) / ITEMS_PER_PAGE)
    };
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch sites data.');
  }
}

export async function fetchFilteredSites(
  query: string,
  currentPage: number,
) {
  const offset = (currentPage - 1) * ITEMS_PER_PAGE;

  try {
    const [sites] = await db.query(`
      SELECT 
        sites.*,
        COUNT(site_games.game_id) as games_count
      FROM sites
      LEFT JOIN site_games ON sites.id = site_games.site_id
      WHERE
        sites.name LIKE ? OR 
        sites.url LIKE ?
      GROUP BY sites.id
      ORDER BY sites.created_at DESC
      LIMIT ? OFFSET ?
    `, [`%${query}%`, `%${query}%`, ITEMS_PER_PAGE, offset]);

    return (sites as any[]).map(site => ({
      ...site,
      gamesCount: Number(site.games_count)
    }));
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch sites.');
  }
}

export async function fetchSitesPages(query: string) {
  try {
    const [data] = await db.query(`
      SELECT COUNT(DISTINCT sites.id) as count
      FROM sites
      WHERE
        sites.name LIKE ? OR 
        sites.url LIKE ?
    `, [`%${query}%`, `%${query}%`]);

    const totalPages = Math.ceil(Number((data as any[])[0].count) / ITEMS_PER_PAGE);
    return totalPages;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch total number of sites.');
  }
} 
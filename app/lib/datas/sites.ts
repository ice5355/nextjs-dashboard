import postgres from 'postgres';
import { Site } from '../definitions';

const sql = postgres(process.env.POSTGRES_URL!, { ssl: 'require' });
const ITEMS_PER_PAGE = 10;

export async function fetchSites() {
  try {
    const data = await sql<Site[]>`
      SELECT * FROM sites 
      ORDER BY created_at DESC
    `;
    return data;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch sites data.');
  }
}

export async function fetchSiteById(id: number) {
  try {
    const [site] = await sql<Site[]>`
      SELECT * FROM sites 
      WHERE id = ${id}
    `;

    if (!site) return null;

    // 获取关联的游戏信息
    const games = await sql<{ game_id: number; weight: number }[]>`
      SELECT game_id, weight
      FROM site_games
      WHERE site_id = ${id}
      ORDER BY weight DESC
    `;

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

    const sites = await sql<(Site & { games_count: number })[]>`
      SELECT 
        sites.*,
        COUNT(site_games.game_id) as games_count
      FROM sites
      LEFT JOIN site_games ON sites.id = site_games.site_id
      WHERE sites.name ILIKE ${`%${query}%`} OR sites.url ILIKE ${`%${query}%`}
      GROUP BY sites.id
      ORDER BY sites.created_at DESC
      LIMIT ${ITEMS_PER_PAGE} OFFSET ${offset}
    `;

    const totalSites = await sql`
      SELECT COUNT(*)
      FROM sites
      WHERE name ILIKE ${`%${query}%`} OR url ILIKE ${`%${query}%`}
    `;

    const sitesWithGameCount = sites.map(site => ({
      ...site,
      gamesCount: Number(site.games_count)
    }));

    return {
      sites: sitesWithGameCount,
      totalPages: Math.ceil(Number(totalSites[0].count) / ITEMS_PER_PAGE)
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
    const sites = await sql<(Site & { games_count: number })[]>`
      SELECT 
        sites.*,
        COUNT(site_games.game_id) as games_count
      FROM sites
      LEFT JOIN site_games ON sites.id = site_games.site_id
      WHERE
        sites.name ILIKE ${`%${query}%`} OR 
        sites.url ILIKE ${`%${query}%`}
      GROUP BY sites.id
      ORDER BY sites.created_at DESC
      LIMIT ${ITEMS_PER_PAGE} OFFSET ${offset}
    `;

    return sites.map(site => ({
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
    const data = await sql`
      SELECT COUNT(DISTINCT sites.id)
      FROM sites
      WHERE
        sites.name ILIKE ${`%${query}%`} OR 
        sites.url ILIKE ${`%${query}%`}
    `;

    const totalPages = Math.ceil(Number(data[0].count) / ITEMS_PER_PAGE);
    return totalPages;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch total number of sites.');
  }
} 
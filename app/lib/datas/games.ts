import postgres from 'postgres';
import { Game, Category, Site } from '../definitions';

const sql = postgres(process.env.POSTGRES_URL!, { ssl: 'require' });

export async function fetchGames() {
  try {
    const data = await sql<Game[]>`
      SELECT * FROM games 
      ORDER BY created_at DESC
    `;
    return data;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch games data.');
  }
}

export async function fetchGameById(id: number) {
  try {
    const game = await sql<Game[]>`
      SELECT * FROM games 
      WHERE id = ${id}
    `;
    
    const categories = await sql<Category[]>`
      SELECT c.* FROM categories c
      JOIN game_categories gc ON c.id = gc.category_id
      WHERE gc.game_id = ${id}
    `;
    
    const sites = await sql<(Site & { weight: number })[]>`
      SELECT s.*, sg.weight 
      FROM sites s
      JOIN site_games sg ON s.id = sg.site_id
      WHERE sg.game_id = ${id}
      ORDER BY sg.weight DESC
    `;
    
    return {
      ...game[0],
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

    const games = await sql<(Game & { sites_count: number })[]>`
      SELECT 
        games.*,
        COUNT(site_games.site_id) as sites_count
      FROM games
      LEFT JOIN site_games ON games.id = site_games.game_id
      WHERE games.name ILIKE ${`%${query}%`}
      GROUP BY games.id
      ORDER BY games.created_at DESC
      LIMIT ${ITEMS_PER_PAGE} OFFSET ${offset}
    `;

    const totalGames = await sql`
      SELECT COUNT(*)
      FROM games
      WHERE name ILIKE ${`%${query}%`}
    `;

    const gamesArray = Array.isArray(games) ? games : [];
    
    const gamesWithSiteCount = gamesArray.map(game => ({
      ...game,
      sitesCount: Number(game.sites_count || 0)
    }));

    return {
      games: gamesWithSiteCount,
      totalPages: Math.ceil(Number(totalGames?.[0]?.count || 0) / ITEMS_PER_PAGE)
    };
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch games data.');
  }
}

export async function fetchGamesPages(query: string) {
  const ITEMS_PER_PAGE = 10;
  try {
    const data = await sql`
      SELECT COUNT(*)
      FROM games
      WHERE name ILIKE ${`%${query}%`}
    `;

    const totalPages = Math.ceil(Number(data[0].count) / ITEMS_PER_PAGE);
    return totalPages;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch total number of games.');
  }
} 
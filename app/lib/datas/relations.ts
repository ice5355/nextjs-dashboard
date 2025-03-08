import postgres from 'postgres';

const sql = postgres(process.env.POSTGRES_URL!, { ssl: 'require' });

export async function fetchAllRelations() {
  try {
    const [siteGames, gameCategories] = await Promise.all([
      sql<{ game_id: number; site_id: number; weight: number }[]>`
        SELECT game_id, site_id, weight 
        FROM site_games
        ORDER BY weight DESC
      `,
      sql<{ game_id: number; category_id: number }[]>`
        SELECT game_id, category_id
        FROM game_categories
      `,
    ]);

    return {
      siteGames,
      gameCategories,
    };
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch relations.');
  }
}

export async function fetchGameSites(gameId: number) {
  try {
    const data = await sql<(Site & { weight: number })[]>`
      SELECT s.*, sg.weight 
      FROM sites s
      JOIN site_games sg ON s.id = sg.site_id
      WHERE sg.game_id = ${gameId}
      ORDER BY sg.weight DESC
    `;
    return data;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch game sites.');
  }
} 
import postgres from 'postgres';

const sql = postgres(process.env.POSTGRES_URL!, { ssl: 'require' });

export async function fetchSiteGameCategoryData() {
    try {
      // 分别获取网站、游戏和分类的数量
      const siteCountPromise = sql`SELECT COUNT(*) FROM sites`;
      const gameCountPromise = sql`SELECT COUNT(*) FROM games`;
      const categoryCountPromise = sql`SELECT COUNT(*) FROM categories`;
  
      const data = await Promise.all([
        siteCountPromise,
        gameCountPromise,
        categoryCountPromise,
      ]);
  
      const numberOfSites = Number(data[0][0].count ?? '0');
      const numberOfGames = Number(data[1][0].count ?? '0');
      const numberOfCategories = Number(data[2][0].count ?? '0');
  
      return {
        numberOfSites,
        numberOfGames,
        numberOfCategories,
      };
    } catch (error) {
      console.error('Database Error:', error);
      throw new Error('Failed to fetch site, game, and category data.');
    }
  }
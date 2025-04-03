import db from '@/app/lib/db';

export const runtime = 'edge';
// 缓存相关变量
type DashboardStats = {
  numberOfSites: number;
  numberOfGames: number;
  numberOfCategories: number;
};

let cachedData: DashboardStats | null = null;
let cacheTimestamp: number = 0;
const CACHE_TTL = 120 * 1000; // 缓存有效期120秒

export async function fetchSiteGameCategoryData() {
  try {
    const now = Date.now();
    
    // 检查缓存是否有效
    if (cachedData && (now - cacheTimestamp < CACHE_TTL)) {
      console.log('Dashboard use cache');
      return cachedData;
    }
    
    // 使用单个查询获取所有计数，避免多次数据库连接
    const [result] = await db.query(`
      SELECT 
        (SELECT COUNT(*) FROM sites) AS site_count,
        (SELECT COUNT(*) FROM games) AS game_count,
        (SELECT COUNT(*) FROM categories) AS category_count
    `);
    
    // 安全地提取结果
    const data = result as Array<{site_count: number, game_count: number, category_count: number}>;
    const counts = data[0] || { site_count: 0, game_count: 0, category_count: 0 };
    
    // 构建结果对象
    const stats: DashboardStats = {
      numberOfSites: Number(counts.site_count),
      numberOfGames: Number(counts.game_count),
      numberOfCategories: Number(counts.category_count),
    };
    
    // 更新缓存
    cachedData = stats;
    cacheTimestamp = now;
    
    return stats;
  } catch (error) {
    console.error('数据库统计数据获取失败:', error);
    
    // 如果缓存存在，在查询失败时返回缓存，避免用户看到错误
    if (cachedData) {
      console.log('查询失败，返回过期缓存');
      return cachedData;
    }
    
    // 提供更详细的错误信息
    throw new Error(`无法获取网站、游戏和分类的统计数据: ${error instanceof Error ? error.message : String(error)}`);
  }
}
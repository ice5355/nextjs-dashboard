import db from '@/app/lib/db';

export const runtime = 'edge';

// async function listInvoices() {
// 	const data = await sql`
//     SELECT invoices.amount, customers.name
//     FROM invoices
//     JOIN customers ON invoices.customer_id = customers.id
//     WHERE invoices.amount = 666;
//   `;

// 	return data;
// }

// export async function GET() {
//   // return Response.json({
//   //   message:
//   //     'Uncomment this file and remove this line. You can delete this file when you are finished.',
//   // });
//   try {
//   	return Response.json(await listInvoices());
//   } catch (error) {
//   	return Response.json({ error }, { status: 500 });
//   }
// }

// 获取所有游戏及其分类信息
async function listGamesWithCategories() {
  const [data] = await db.query(`
    SELECT 
      g.id,
      g.name,
      g.icon_url,
      g.description,
      GROUP_CONCAT(DISTINCT c.chinese_name) as categories,
      COUNT(DISTINCT s.id) as site_count,
      AVG(sg.weight) as avg_weight
    FROM games g
    LEFT JOIN game_categories gc ON g.id = gc.game_id
    LEFT JOIN categories c ON gc.category_id = c.id
    LEFT JOIN site_games sg ON g.id = sg.game_id
    LEFT JOIN sites s ON sg.site_id = s.id
    GROUP BY g.id, g.name, g.icon_url, g.description
    ORDER BY avg_weight DESC
  `);
  return data;
}

// 获取每个网站的热门游戏（按权重排序）
async function listTopGamesPerSite() {
  // MySQL不支持PARTITION BY子句，所以我们需要使用子查询
  const [data] = await db.query(`
    SELECT s.id as site_id, s.name as site_name, g.name as game_name, sg.weight
    FROM sites s
    JOIN site_games sg ON s.id = sg.site_id
    JOIN games g ON sg.game_id = g.id
    WHERE (
      SELECT COUNT(*) 
      FROM site_games sg2
      WHERE sg2.site_id = s.id AND sg2.weight > sg.weight
    ) < 3
    ORDER BY s.id, sg.weight DESC
  `);
  return data;
}

// 获取每个分类下的游戏数量统计
async function getCategoryStats() {
  const [data] = await db.query(`
    SELECT 
      c.name,
      c.chinese_name,
      COUNT(DISTINCT gc.game_id) as game_count,
      AVG(sg.weight) as avg_popularity
    FROM categories c
    LEFT JOIN game_categories gc ON c.id = gc.category_id
    LEFT JOIN site_games sg ON gc.game_id = sg.game_id
    GROUP BY c.id, c.name, c.chinese_name
    ORDER BY game_count DESC
  `);
  return data;
}


// /query?query=games 获取游戏列表
// /query?query=top-games 获取各网站热门游戏
// /query?query=categories 获取分类统计
// /query 获取所有数据
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('query');

    let result;
    switch (query) {
      case 'games':
        result = await listGamesWithCategories();
        break;
      case 'top-games':
        result = await listTopGamesPerSite();
        break;
      case 'categories':
        result = await getCategoryStats();
        break;
      default:
        // 默认返回所有查询结果
        const [games, topGames, categories] = await Promise.all([
          listGamesWithCategories(),
          listTopGamesPerSite(),
          getCategoryStats(),
        ]);
        result = {
          games,
          topGames,
          categories,
        };
    }

    return Response.json(result);
  } catch (error) {
    console.error('查询错误:', error);
    return Response.json({ error: '查询执行失败' }, { status: 500 });
  }
}
import { NextRequest, NextResponse } from 'next/server';
import db from '@/app/lib/db';

export const runtime = 'edge';
// 处理GET请求，根据网站ID获取按分类组织的游戏列表
export async function GET(
  request: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  try {
    // 获取网站ID
    const params = await props.params;
    const siteId = parseInt(params.id);

    // 如果ID无效，返回错误
    if (isNaN(siteId)) {
      return NextResponse.json(
        { 
          status: 400,
          error: '无效的网站ID' 
        },
        { status: 400 }
      );
    }

    // 查询网站基本信息
    const [sites] = await db.query(
      `SELECT id, name, url
      FROM sites
      WHERE id = ?`,
      [siteId]
    );

    // 如果网站不存在，返回404错误
    if ((sites as any[]).length === 0) {
      return NextResponse.json(
        { 
          status: 404,
          error: '网站不存在' 
        },
        { status: 404 }
      );
    }

    const site = (sites as any[])[0];

    // 获取该网站关联的所有游戏及其分类信息
    const [gameCategories] = await db.query(
      `SELECT 
        g.id as game_id, 
        g.name as game_name, 
        g.icon_url, 
        g.game_url, 
        g.description, 
        g.details,
        sg.weight,
        c.id as category_id,
        c.name,
        c.chinese_name
      FROM games g
      JOIN site_games sg ON g.id = sg.game_id
      JOIN game_categories gc ON g.id = gc.game_id
      JOIN categories c ON gc.category_id = c.id
      WHERE sg.site_id = ?
      ORDER BY c.id ASC, sg.weight DESC`,
      [siteId]
    );

    // 如果没有找到任何游戏或分类，返回空列表
    if ((gameCategories as any[]).length === 0) {
      return NextResponse.json({
        status: 200,
        error: null,
        id: site.id,
        name: site.name,
        url: site.url,
        categories: []
      });
    }

    // 按分类组织游戏
    const categoriesMap = new Map();
    
    // 定义游戏对象的类型
    type Game = {
      id: number;
      name: string;
      icon_url: string | null;
      game_url: string | null;
      description: string | null;
      details: string | null;
      weight: number;
    };
    
    // 定义数据库返回的游戏分类项目类型
    type GameCategoryItem = {
      game_id: number;
      game_name: string;
      icon_url: string | null;
      game_url: string | null;
      description: string | null;
      details: string | null;
      weight: number;
      category_id: number;
      name: string;
      chinese_name: string;
    };
    
    // 遍历结果集，按分类分组
    (gameCategories as GameCategoryItem[]).forEach(item => {
      // 创建游戏对象
      const game: Game = {
        id: item.game_id,
        name: item.game_name,
        icon_url: item.icon_url,
        game_url: item.game_url,
        description: item.description,
        details: item.details,
        weight: item.weight
      };
      
      // 使用中文名称作为Map的键
      const mapKey = item.chinese_name;
      
      // 如果分类不存在于Map中，则创建
      if (!categoriesMap.has(mapKey)) {
        categoriesMap.set(mapKey, {
          id: item.category_id,
          name: item.name,
          chinese_name: item.chinese_name,
          games: []
        });
      }
      
      // 获取分类并添加游戏
      const category = categoriesMap.get(mapKey);
      const gameExists = category.games.some((g: Game) => g.id === game.id);
      
      if (!gameExists) {
        category.games.push(game);
      }
    });
    
    // 将Map转换为数组
    const categoriesArray = Array.from(categoriesMap.values());

    // 构建响应数据
    const response = {
      status: 200,
      error: null,
      id: site.id,
      name: site.name,
      url: site.url,
      categories: categoriesArray
    };

    // 返回JSON格式的数据
    return NextResponse.json(response);
  } catch (error) {
    console.error('获取网站游戏分类列表失败:', error);
    return NextResponse.json(
      { 
        status: 500,
        error: '获取网站游戏分类列表失败' 
      },
      { status: 500 }
    );
  }
} 
import { NextRequest, NextResponse } from 'next/server';
import db from '@/app/lib/db';

// 处理GET请求，根据网站ID获取相关的游戏列表
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
        { error: '无效的网站ID' },
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
        { error: '网站不存在' },
        { status: 404 }
      );
    }

    const site = (sites as any[])[0];

    // 定义游戏类型
    type Game = {
      id: number;
      name: string;
      icon_url: string | null;
      game_url: string | null;
      description: string | null;
      details: string | null;
      weight: number;
    };

    // 查询关联的游戏信息，包括权重
    const [games] = await db.query(
      `SELECT 
        g.id, 
        g.name, 
        g.icon_url, 
        g.game_url, 
        g.description, 
        g.details,
        sg.weight
      FROM games g
      JOIN site_games sg ON g.id = sg.game_id
      WHERE sg.site_id = ?
      ORDER BY sg.weight DESC`,
      [siteId]
    );

    // 为每个游戏查询分类
    const gamesWithCategories = await Promise.all(
      (games as Game[]).map(async (game) => {
        // 查询游戏的分类
        const [categories] = await db.query(
          `SELECT c.chinese_name
          FROM categories c
          JOIN game_categories gc ON c.id = gc.category_id
          WHERE gc.game_id = ?`,
          [game.id]
        );

        // 返回带有分类的游戏数据
        return {
          id: game.id,
          name: game.name,
          icon_url: game.icon_url,
          game_url: game.game_url,
          description: game.description,
          details: game.details,
          weight: game.weight,
          categories: (categories as {chinese_name: string}[]).map(c => c.chinese_name)
        };
      })
    );

    // 构建响应数据
    const response = {
      status: 200,
      error: null,
      id: site.id,
      name: site.name,
      url: site.url,
      games: gamesWithCategories
    };

    // 返回JSON格式的数据
    return NextResponse.json(response);
  } catch (error) {
    console.error('获取网站游戏列表失败:', error);
    return NextResponse.json(
      { error: '获取网站游戏列表失败' },
      { status: 500 }
    );
  }
} 
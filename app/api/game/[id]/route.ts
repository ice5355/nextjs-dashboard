import { NextRequest, NextResponse } from 'next/server';
import db from '@/app/lib/db';

export const runtime = 'edge';
// 处理GET请求，根据游戏ID获取游戏详细信息
export async function GET(
  request: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  try {
    // 获取游戏ID
    const params = await props.params;
    const gameId = parseInt(params.id);

    // 如果ID无效，返回错误
    if (isNaN(gameId)) {
      return NextResponse.json(
        { error: '无效的游戏ID' },
        { status: 400 }
      );
    }

    // 查询游戏基本信息
    const [gamesResult] = await db.query(
      `SELECT id, name, icon_url, game_url, description, details
      FROM games
      WHERE id = ?`,
      [gameId]
    );
    
    const games = gamesResult as any[];

    // 如果游戏不存在，返回404错误
    if (games.length === 0) {
      return NextResponse.json(
        { error: '游戏不存在' },
        { status: 404 }
      );
    }

    const game = games[0];

    // 查询游戏分类
    const [categoriesResult] = await db.query(
      `SELECT c.name, c.chinese_name
      FROM categories c
      JOIN game_categories gc ON c.id = gc.category_id
      WHERE gc.game_id = ?`,
      [gameId]
    );
    
    const categories = categoriesResult as any[];

    // 返回带有分类的游戏信息
    return NextResponse.json({
      ...game,
      categories: categories.map((c: any) => c.chinese_name)
    });
  } catch (error) {
    console.error('获取游戏信息失败:', error);
    return NextResponse.json(
      { error: '获取游戏信息失败' },
      { status: 500 }
    );
  }
} 
import { NextRequest, NextResponse } from 'next/server';
import postgres from 'postgres';

// 初始化数据库连接
const sql = postgres(process.env.POSTGRES_URL!, { ssl: 'require' });

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
        { 
          status: 400,
          error: '无效的游戏ID' 
        },
        { status: 400 }
      );
    }

    // 查询游戏基本信息
    const games = await sql`
      SELECT id, name, icon_url, game_url, description, details
      FROM games
      WHERE id = ${gameId}
    `;

    // 如果游戏不存在，返回404错误
    if (games.length === 0) {
      return NextResponse.json(
        { 
          status: 404,
          error: '游戏不存在' 
        },
        { status: 404 }
      );
    }

    const game = games[0];

    // 查询游戏关联的分类
    const categories = await sql`
      SELECT c.category_name
      FROM categories c
      JOIN game_categories gc ON c.id = gc.category_id
      WHERE gc.game_id = ${gameId}
    `;

    // 构建响应数据
    const response = {
      status: 200,
      error: null,
      id: game.id,
      name: game.name,
      icon_url: game.icon_url,
      game_url: game.game_url,
      description: game.description,
      details: game.details,
      categories: categories.map(c => c.category_name)
    };

    // 返回JSON格式的数据
    return NextResponse.json(response);
  } catch (error) {
    console.error('获取游戏详细信息失败:', error);
    return NextResponse.json(
      { 
        status: 500,
        error: '获取游戏详细信息失败' 
      },
      { status: 500 }
    );
  }
} 
import bcrypt from 'bcrypt';
import db from '@/app/lib/db';
import {users, sites, categories, games, siteGames, gameCategories } from '../lib/placeholder-data';

export const runtime = 'edge';
async function seedUsers() {
  await db.query(`
    CREATE TABLE IF NOT EXISTS users (
      id INT PRIMARY KEY AUTO_INCREMENT,
      name VARCHAR(255) NOT NULL,
      email TEXT NOT NULL,
      password TEXT NOT NULL,
      UNIQUE KEY unique_email (email(191))
    )
  `);

  for (const user of users) {
    const hashedPassword = await bcrypt.hash(user.password, 10);
    await db.query(
      `INSERT INTO users (id, name, email, password)
      VALUES (?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE id=id`,
      [user.id, user.name, user.email, hashedPassword]
    );
  }

  return { success: true };
}


async function seedSites() {
  await db.query(`
    CREATE TABLE IF NOT EXISTS sites (
      id INT PRIMARY KEY AUTO_INCREMENT,
      name VARCHAR(255) NOT NULL,
      url VARCHAR(255) NOT NULL,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `);

  for (const site of sites) {
    await db.query(
      `INSERT INTO sites (id, name, url, created_at)
      VALUES (?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE id=id`,
      [site.id, site.name, site.url, site.created_at]
    );
  }

  return { success: true };
}

async function seedCategories() {
  await db.query(`
    CREATE TABLE IF NOT EXISTS categories (
      id INT PRIMARY KEY AUTO_INCREMENT,
      name VARCHAR(255) NOT NULL,
      chinese_name VARCHAR(255) NOT NULL
    )
  `);

  for (const category of categories) {
    await db.query(
      `INSERT INTO categories (id, name, chinese_name)
      VALUES (?, ?, ?)
      ON DUPLICATE KEY UPDATE name=VALUES(name), chinese_name=VALUES(chinese_name)`,
      [category.id, category.name, category.chinese_name]
    );
  }

  return { success: true };
}

async function seedGames() {
  await db.query(`
    CREATE TABLE IF NOT EXISTS games (
      id INT PRIMARY KEY AUTO_INCREMENT,
      name VARCHAR(255) NOT NULL,
      icon_url VARCHAR(255),
      game_url VARCHAR(255),
      description TEXT,
      details TEXT,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `);

  for (const game of games) {
    await db.query(
      `INSERT INTO games (id, name, icon_url, game_url, description, details, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE id=id`,
      [game.id, game.name, game.icon_url, game.game_url, game.description, game.details, game.created_at]
    );
  }

  return { success: true };
}

async function seedSiteGames() {
  await db.query(`
    CREATE TABLE IF NOT EXISTS site_games (
      site_id INT,
      game_id INT,
      weight INT NOT NULL,
      PRIMARY KEY (site_id, game_id),
      FOREIGN KEY (site_id) REFERENCES sites(id),
      FOREIGN KEY (game_id) REFERENCES games(id)
    )
  `);

  for (const siteGame of siteGames) {
    await db.query(
      `INSERT INTO site_games (site_id, game_id, weight)
      VALUES (?, ?, ?)
      ON DUPLICATE KEY UPDATE weight=VALUES(weight)`,
      [siteGame.site_id, siteGame.game_id, siteGame.weight]
    );
  }

  return { success: true };
}

async function seedGameCategories() {
  await db.query(`
    CREATE TABLE IF NOT EXISTS game_categories (
      game_id INT,
      category_id INT,
      PRIMARY KEY (game_id, category_id),
      FOREIGN KEY (game_id) REFERENCES games(id),
      FOREIGN KEY (category_id) REFERENCES categories(id)
    )
  `);

  for (const gameCategory of gameCategories) {
    await db.query(
      `INSERT INTO game_categories (game_id, category_id)
      VALUES (?, ?)
      ON DUPLICATE KEY UPDATE game_id=game_id`,
      [gameCategory.game_id, gameCategory.category_id]
    );
  }

  return { success: true };
}

export async function GET() {
  try {
    // 禁用外键检查以便能顺利删除表
    await db.query('SET FOREIGN_KEY_CHECKS = 0');
    
    // 删除旧表 - 按照依赖关系的反向顺序删除
    try {
      // 先删除关联表
      await db.query(`DROP TABLE IF EXISTS game_categories`);
      await db.query(`DROP TABLE IF EXISTS site_games`);
      
      // 然后删除主表
      await db.query(`DROP TABLE IF EXISTS games`);
      await db.query(`DROP TABLE IF EXISTS categories`);
      await db.query(`DROP TABLE IF EXISTS sites`);
      await db.query(`DROP TABLE IF EXISTS users`);
    } catch (error) {
      console.warn('删除旧表失败，继续执行:', error);
    }
    
    // 重新启用外键检查
    await db.query('SET FOREIGN_KEY_CHECKS = 1');

    // 直接执行种子函数，不使用显式事务
    await seedUsers();
    await seedSites();
    await seedCategories();
    await seedGames();
    await seedSiteGames();
    await seedGameCategories();

    return Response.json({ message: '数据库初始化成功' });
  } catch (error) {
    console.error('种子数据插入错误:', error);
    return Response.json({ error: '数据库初始化失败', details: String(error) }, { status: 500 });
  }
}

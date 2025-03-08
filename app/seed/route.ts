import bcrypt from 'bcrypt';
import postgres from 'postgres';
import { invoices, customers, revenue, users, sites, categories, games, siteGames, gameCategories } from '../lib/placeholder-data';

const sql = postgres(process.env.POSTGRES_URL!, { ssl: 'require' });

// async function seedUsers() {
//   await sql`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`;
//   await sql`
//     CREATE TABLE IF NOT EXISTS users (
//       id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
//       name VARCHAR(255) NOT NULL,
//       email TEXT NOT NULL UNIQUE,
//       password TEXT NOT NULL
//     );
//   `;

//   const insertedUsers = await Promise.all(
//     users.map(async (user) => {
//       const hashedPassword = await bcrypt.hash(user.password, 10);
//       return sql`
//         INSERT INTO users (id, name, email, password)
//         VALUES (${user.id}, ${user.name}, ${user.email}, ${hashedPassword})
//         ON CONFLICT (id) DO NOTHING;
//       `;
//     }),
//   );

//   return insertedUsers;
// }

// async function seedInvoices() {
//   await sql`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`;

//   await sql`
//     CREATE TABLE IF NOT EXISTS invoices (
//       id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
//       customer_id UUID NOT NULL,
//       amount INT NOT NULL,
//       status VARCHAR(255) NOT NULL,
//       date DATE NOT NULL
//     );
//   `;

//   const insertedInvoices = await Promise.all(
//     invoices.map(
//       (invoice) => sql`
//         INSERT INTO invoices (customer_id, amount, status, date)
//         VALUES (${invoice.customer_id}, ${invoice.amount}, ${invoice.status}, ${invoice.date})
//         ON CONFLICT (id) DO NOTHING;
//       `,
//     ),
//   );

//   return insertedInvoices;
// }

// async function seedCustomers() {
//   await sql`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`;

//   await sql`
//     CREATE TABLE IF NOT EXISTS customers (
//       id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
//       name VARCHAR(255) NOT NULL,
//       email VARCHAR(255) NOT NULL,
//       image_url VARCHAR(255) NOT NULL
//     );
//   `;

//   const insertedCustomers = await Promise.all(
//     customers.map(
//       (customer) => sql`
//         INSERT INTO customers (id, name, email, image_url)
//         VALUES (${customer.id}, ${customer.name}, ${customer.email}, ${customer.image_url})
//         ON CONFLICT (id) DO NOTHING;
//       `,
//     ),
//   );

//   return insertedCustomers;
// }

// async function seedRevenue() {
//   await sql`
//     CREATE TABLE IF NOT EXISTS revenue (
//       month VARCHAR(4) NOT NULL UNIQUE,
//       revenue INT NOT NULL
//     );
//   `;

//   const insertedRevenue = await Promise.all(
//     revenue.map(
//       (rev) => sql`
//         INSERT INTO revenue (month, revenue)
//         VALUES (${rev.month}, ${rev.revenue})
//         ON CONFLICT (month) DO NOTHING;
//       `,
//     ),
//   );

//   return insertedRevenue;
// }

async function seedSites() {
  await sql`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`;
  await sql`
    CREATE TABLE IF NOT EXISTS sites (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      url VARCHAR(255) NOT NULL,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `;

  const insertedSites = await Promise.all(
    sites.map(
      (site) => sql`
        INSERT INTO sites (id, name, url, created_at)
        VALUES (${site.id}, ${site.name}, ${site.url}, ${site.created_at})
        ON CONFLICT (id) DO NOTHING;
      `,
    ),
  );

  return insertedSites;
}

async function seedCategories() {
  await sql`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`;
  await sql`
    CREATE TABLE IF NOT EXISTS categories (
      id SERIAL PRIMARY KEY,
      category_name VARCHAR(255) NOT NULL
    );
  `;

  const insertedCategories = await Promise.all(
    categories.map(
      (category) => sql`
        INSERT INTO categories (id, category_name)
        VALUES (${category.id}, ${category.category_name})
        ON CONFLICT (id) DO NOTHING;
      `,
    ),
  );

  return insertedCategories;
}

async function seedGames() {
  await sql`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`;
  await sql`
    CREATE TABLE IF NOT EXISTS games (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      icon_url VARCHAR(255),
      game_url VARCHAR(255),
      description TEXT,
      details TEXT,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `;

  const insertedGames = await Promise.all(
    games.map(
      (game) => sql`
        INSERT INTO games (id, name, icon_url, game_url, description, details, created_at)
        VALUES (${game.id}, ${game.name}, ${game.icon_url}, ${game.game_url}, ${game.description}, ${game.details}, ${game.created_at})
        ON CONFLICT (id) DO NOTHING;
      `,
    ),
  );

  return insertedGames;
}

async function seedSiteGames() {
  await sql`
    CREATE TABLE IF NOT EXISTS site_games (
      site_id INTEGER REFERENCES sites(id),
      game_id INTEGER REFERENCES games(id),
      weight INTEGER NOT NULL,
      PRIMARY KEY (site_id, game_id)
    );
  `;

  const insertedSiteGames = await Promise.all(
    siteGames.map(
      (siteGame) => sql`
        INSERT INTO site_games (site_id, game_id, weight)
        VALUES (${siteGame.site_id}, ${siteGame.game_id}, ${siteGame.weight})
        ON CONFLICT (site_id, game_id) DO NOTHING;
      `,
    ),
  );

  return insertedSiteGames;
}

async function seedGameCategories() {
  await sql`
    CREATE TABLE IF NOT EXISTS game_categories (
      game_id INTEGER REFERENCES games(id),
      category_id INTEGER REFERENCES categories(id),
      PRIMARY KEY (game_id, category_id)
    );
  `;

  const insertedGameCategories = await Promise.all(
    gameCategories.map(
      (gameCategory) => sql`
        INSERT INTO game_categories (game_id, category_id)
        VALUES (${gameCategory.game_id}, ${gameCategory.category_id})
        ON CONFLICT (game_id, category_id) DO NOTHING;
      `,
    ),
  );

  return insertedGameCategories;
}

export async function GET() {
  try {
    await sql.begin(async (sql) => {
      await seedSites();
      await seedCategories();
      await seedGames();
      await seedSiteGames();
      await seedGameCategories();
    });

    return Response.json({ message: '数据库初始化成功' });
  } catch (error) {
    console.error('种子数据插入错误:', error);
    return Response.json({ error: '数据库初始化失败' }, { status: 500 });
  }
}

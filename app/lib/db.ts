import mysql from 'mysql2/promise'; // 使用 Promise 版本

export const runtime = 'edge';
// 创建MySQL连接池
const pool = mysql.createPool({
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
  waitForConnections: true,
  connectionLimit: 10, // 设置最大连接数
  queueLimit: 0,
  connectTimeout: 30000, // 连接超时时间30秒
  enableKeepAlive: true, // 启用TCP保活机制
  keepAliveInitialDelay: 10000 // 保活初始延迟10秒
} as mysql.PoolOptions);

export default pool;

// This file contains placeholder data that you'll be replacing with real data in the Data Fetching chapter:
// https://nextjs.org/learn/dashboard-app/fetching-data
const users = [
  {
    id: '410544b2-4001-4271-9855-fec4b6a6442a',
    name: 'User',
    email: 'user@nextmail.com',
    password: '123456',
  },
];

const customers = [
  {
    id: 'd6e15727-9fe1-4961-8c5b-ea44a9bd81aa',
    name: 'Evil Rabbit',
    email: 'evil@rabbit.com',
    image_url: '/customers/evil-rabbit.png',
  },
  {
    id: '3958dc9e-712f-4377-85e9-fec4b6a6442a',
    name: 'Delba de Oliveira',
    email: 'delba@oliveira.com',
    image_url: '/customers/delba-de-oliveira.png',
  },
  {
    id: '3958dc9e-742f-4377-85e9-fec4b6a6442a',
    name: 'Lee Robinson',
    email: 'lee@robinson.com',
    image_url: '/customers/lee-robinson.png',
  },
  {
    id: '76d65c26-f784-44a2-ac19-586678f7c2f2',
    name: 'Michael Novotny',
    email: 'michael@novotny.com',
    image_url: '/customers/michael-novotny.png',
  },
  {
    id: 'CC27C14A-0ACF-4F4A-A6C9-D45682C144B9',
    name: 'Amy Burns',
    email: 'amy@burns.com',
    image_url: '/customers/amy-burns.png',
  },
  {
    id: '13D07535-C59E-4157-A011-F8D2EF4E0CBB',
    name: 'Balazs Orban',
    email: 'balazs@orban.com',
    image_url: '/customers/balazs-orban.png',
  },
];

const invoices = [
  {
    customer_id: customers[0].id,
    amount: 15795,
    status: 'pending',
    date: '2022-12-06',
  },
  {
    customer_id: customers[1].id,
    amount: 20348,
    status: 'pending',
    date: '2022-11-14',
  },
  {
    customer_id: customers[4].id,
    amount: 3040,
    status: 'paid',
    date: '2022-10-29',
  },
  {
    customer_id: customers[3].id,
    amount: 44800,
    status: 'paid',
    date: '2023-09-10',
  },
  {
    customer_id: customers[5].id,
    amount: 34577,
    status: 'pending',
    date: '2023-08-05',
  },
  {
    customer_id: customers[2].id,
    amount: 54246,
    status: 'pending',
    date: '2023-07-16',
  },
  {
    customer_id: customers[0].id,
    amount: 666,
    status: 'pending',
    date: '2023-06-27',
  },
  {
    customer_id: customers[3].id,
    amount: 32545,
    status: 'paid',
    date: '2023-06-09',
  },
  {
    customer_id: customers[4].id,
    amount: 1250,
    status: 'paid',
    date: '2023-06-17',
  },
  {
    customer_id: customers[5].id,
    amount: 8546,
    status: 'paid',
    date: '2023-06-07',
  },
  {
    customer_id: customers[1].id,
    amount: 500,
    status: 'paid',
    date: '2023-08-19',
  },
  {
    customer_id: customers[5].id,
    amount: 8945,
    status: 'paid',
    date: '2023-06-03',
  },
  {
    customer_id: customers[2].id,
    amount: 1000,
    status: 'paid',
    date: '2022-06-05',
  },
];

const revenue = [
  { month: 'Jan', revenue: 2000 },
  { month: 'Feb', revenue: 1800 },
  { month: 'Mar', revenue: 2200 },
  { month: 'Apr', revenue: 2500 },
  { month: 'May', revenue: 2300 },
  { month: 'Jun', revenue: 3200 },
  { month: 'Jul', revenue: 3500 },
  { month: 'Aug', revenue: 3700 },
  { month: 'Sep', revenue: 2500 },
  { month: 'Oct', revenue: 2800 },
  { month: 'Nov', revenue: 3000 },
  { month: 'Dec', revenue: 4800 },
];

const sites = [
  {
    id: 1,
    name: '游戏门户A',
    url: 'https://game-portal-a.com',
    created_at: '2024-01-01',
  },
  {
    id: 2,
    name: '游戏平台B',
    url: 'https://game-platform-b.com',
    created_at: '2024-01-15',
  },
  {
    id: 3,
    name: '游戏社区C',
    url: 'https://game-community-c.com',
    created_at: '2024-02-01',
  },
  {
    id: 4,
    name: '电竞平台D',
    url: 'https://esports-d.com',
    created_at: '2024-02-15',
  },
  {
    id: 5,
    name: '游戏资讯E',
    url: 'https://game-news-e.com',
    created_at: '2024-03-01',
  },
  {
    id: 6,
    name: '游戏论坛F',
    url: 'https://game-forum-f.com',
    created_at: '2024-03-15',
  },
];

const categories = [
  {
    id: 1,
    category_name: '动作游戏',
  },
  {
    id: 2,
    category_name: '角色扮演',
  },
  {
    id: 3,
    category_name: '策略游戏',
  },
  {
    id: 4,
    category_name: '体育竞技',
  },
  {
    id: 5,
    category_name: '射击游戏',
  },
  {
    id: 6,
    category_name: '模拟经营',
  },
  {
    id: 7,
    category_name: '卡牌游戏',
  },
  {
    id: 8,
    category_name: '冒险解谜',
  },
];

const games = [
  {
    id: 1,
    name: '魔兽世界',
    icon_url: '/games/wow.png',
    game_url: 'https://worldofwarcraft.blizzard.com/zh-cn/',
    description: '著名的大型多人在线角色扮演游戏',
    details: '魔兽世界是暴雪娱乐开发的一款大型多人在线角色扮演游戏...',
    created_at: '2024-01-01',
  },
  {
    id: 2,
    name: '英雄联盟',
    icon_url: '/games/lol.png',
    game_url: 'https://lol.qq.com/',
    description: '风靡全球的多人在线竞技游戏',
    details: '英雄联盟是拳头游戏开发的一款多人在线战术竞技游戏...',
    created_at: '2024-01-15',
  },
  {
    id: 3,
    name: '文明6',
    icon_url: '/games/civilization6.png',
    game_url: 'https://civilization.com/zh-CN/',
    description: '回合制策略游戏',
    details: '文明6是Firaxis Games开发的一款回合制策略游戏...',
    created_at: '2024-02-01',
  },
  {
    id: 4,
    name: 'CS:GO',
    icon_url: '/games/csgo.png',
    game_url: 'https://www.counter-strike.net/cs2',
    description: '第一人称射击游戏',
    details: 'CS:GO是Valve开发的一款第一人称射击游戏...',
    created_at: '2024-02-15',
  },
  {
    id: 5,
    name: '模拟人生4',
    icon_url: '/games/sims4.png',
    game_url: 'https://www.ea.com/zh-cn/games/the-sims/the-sims-4',
    description: '生活模拟游戏',
    details: '模拟人生4是Maxis开发的一款生活模拟游戏...',
    created_at: '2024-03-01',
  },
  {
    id: 6,
    name: '炉石传说',
    icon_url: '/games/hearthstone.png',
    game_url: 'https://hearthstone.blizzard.com/zh-cn',
    description: '卡牌对战游戏',
    details: '炉石传说是暴雪娱乐开发的一款卡牌对战游戏...',
    created_at: '2024-03-15',
  },
  {
    id: 7,
    name: '塞尔达传说',
    icon_url: '/games/zelda.png',
    game_url: 'https://www.nintendo.com/cn/switch/aabp/index.html',
    description: '动作冒险游戏',
    details: '塞尔达传说是任天堂开发的一款动作冒险游戏...',
    created_at: '2024-03-20',
  },
  {
    id: 8,
    name: 'FIFA 24',
    icon_url: '/games/fifa24.png',
    game_url: 'https://www.ea.com/zh-cn/games/ea-sports-fc/fc-24',
    description: '足球体育游戏',
    details: 'FIFA 24是EA Sports开发的一款足球体育游戏...',
    created_at: '2024-03-25',
  },
];

const siteGames = [
  // 游戏门户A的游戏
  { site_id: 1, game_id: 1, weight: 100 },
  { site_id: 1, game_id: 2, weight: 95 },
  { site_id: 1, game_id: 3, weight: 85 },
  { site_id: 1, game_id: 4, weight: 90 },
  { site_id: 1, game_id: 6, weight: 80 },
  
  // 游戏平台B的游戏
  { site_id: 2, game_id: 1, weight: 95 },
  { site_id: 2, game_id: 2, weight: 100 },
  { site_id: 2, game_id: 4, weight: 90 },
  { site_id: 2, game_id: 6, weight: 85 },
  { site_id: 2, game_id: 7, weight: 80 },
  
  // 游戏社区C的游戏
  { site_id: 3, game_id: 2, weight: 90 },
  { site_id: 3, game_id: 3, weight: 85 },
  { site_id: 3, game_id: 5, weight: 95 },
  { site_id: 3, game_id: 8, weight: 80 },
  
  // 电竞平台D的游戏
  { site_id: 4, game_id: 2, weight: 100 },
  { site_id: 4, game_id: 4, weight: 95 },
  { site_id: 4, game_id: 8, weight: 90 },
  
  // 游戏资讯E的游戏
  { site_id: 5, game_id: 1, weight: 90 },
  { site_id: 5, game_id: 2, weight: 85 },
  { site_id: 5, game_id: 3, weight: 80 },
  { site_id: 5, game_id: 4, weight: 85 },
  { site_id: 5, game_id: 5, weight: 80 },
  { site_id: 5, game_id: 6, weight: 75 },
  { site_id: 5, game_id: 7, weight: 85 },
  { site_id: 5, game_id: 8, weight: 80 },
  
  // 游戏论坛F的游戏
  { site_id: 6, game_id: 1, weight: 85 },
  { site_id: 6, game_id: 2, weight: 90 },
  { site_id: 6, game_id: 5, weight: 80 },
  { site_id: 6, game_id: 7, weight: 85 },
];

const gameCategories = [
  // 魔兽世界
  { game_id: 1, category_id: 2 }, // 角色扮演
  { game_id: 1, category_id: 1 }, // 动作游戏
  
  // 英雄联盟
  { game_id: 2, category_id: 1 }, // 动作游戏
  { game_id: 2, category_id: 4 }, // 体育竞技
  { game_id: 2, category_id: 3 }, // 策略游戏
  
  // 文明6
  { game_id: 3, category_id: 3 }, // 策略游戏
  
  // CS:GO
  { game_id: 4, category_id: 5 }, // 射击游戏
  { game_id: 4, category_id: 4 }, // 体育竞技
  
  // 模拟人生4
  { game_id: 5, category_id: 6 }, // 模拟经营
  
  // 炉石传说
  { game_id: 6, category_id: 7 }, // 卡牌游戏
  { game_id: 6, category_id: 3 }, // 策略游戏
  
  // 塞尔达传说
  { game_id: 7, category_id: 1 }, // 动作游戏
  { game_id: 7, category_id: 8 }, // 冒险解谜
  { game_id: 7, category_id: 2 }, // 角色扮演
  
  // FIFA 24
  { game_id: 8, category_id: 4 }, // 体育竞技
  { game_id: 8, category_id: 6 }, // 模拟经营
];

export { users, customers, invoices, revenue, sites, games, categories, siteGames, gameCategories };

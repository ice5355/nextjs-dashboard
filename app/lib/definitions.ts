// This file contains type definitions for your data.
// It describes the shape of the data, and what data type each property should accept.
// For simplicity of teaching, we're manually defining these types.
// However, these types are generated automatically if you're using an ORM such as Prisma.
export type User = {
  id: string;
  name: string;
  email: string;
  password: string;
};

// 网站相关类型定义
export type Site = {
  id: number;
  name: string;
  url: string;
  created_at: string;
  updated_at: string;
  gamesCount?: number;
};

export type SiteForm = {
  id?: number;
  name: string;
  url: string;
};

// 游戏相关类型定义
export type Game = {
  id: number;
  name: string;
  icon_url: string | null;
  game_url: string | null;
  description: string | null;
  details: string | null;
  created_at: string;
  categories?: Category[];
  sites?: (Site & { weight: number })[];
};

export type GameForm = {
  id?: number;
  name: string;
  icon_url?: string;
  game_url?: string;
  description?: string;
  details?: string;
  category_ids?: number[];
};

// 分类相关类型定义
export type Category = {
  id: number;
  name: string;
  chinese_name: string;
  game_count?: number;
};

export type CategoryForm = {
  id?: number;
  name: string;
  chinese_name: string;
};

// 关联关系类型定义
export type SiteGame = {
  site_id: number;
  game_id: number;
  weight: number;
};

export type GameCategory = {
  game_id: number;
  category_id: number;
};

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

export type Customer = {
  id: string;
  name: string;
  email: string;
  image_url: string;
};

export type Invoice = {
  id: string;
  customer_id: string;
  amount: number;
  date: string;
  // In TypeScript, this is called a string union type.
  // It means that the "status" property can only be one of the two strings: 'pending' or 'paid'.
  status: 'pending' | 'paid';
};

export type Revenue = {
  month: string;
  revenue: number;
};

export type LatestInvoice = {
  id: string;
  name: string;
  image_url: string;
  email: string;
  amount: string;
};

// The database returns a number for amount, but we later format it to a string with the formatCurrency function
export type LatestInvoiceRaw = Omit<LatestInvoice, 'amount'> & {
  amount: number;
};

export type InvoicesTable = {
  id: string;
  customer_id: string;
  name: string;
  email: string;
  image_url: string;
  date: string;
  amount: number;
  status: 'pending' | 'paid';
};

export type CustomersTableType = {
  id: string;
  name: string;
  email: string;
  image_url: string;
  total_invoices: number;
  total_pending: number;
  total_paid: number;
};

export type FormattedCustomersTable = {
  id: string;
  name: string;
  email: string;
  image_url: string;
  total_invoices: number;
  total_pending: string;
  total_paid: string;
};

export type CustomerField = {
  id: string;
  name: string;
};

export type InvoiceForm = {
  id: string;
  customer_id: string;
  amount: number;
  status: 'pending' | 'paid';
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
  category_name: string;
  game_count?: number;
};

export type CategoryForm = {
  id?: number;
  category_name: string;
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

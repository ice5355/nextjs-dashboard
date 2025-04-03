import { Suspense } from 'react';
import { lusitana } from '@/app/ui/fonts';
import Search from '@/app/ui/search';
import { CreateCategory } from '@/app/ui/categories/buttons';
import CategoriesTable from '@/app/ui/categories/table';
import { fetchCategoriesPages } from '@/app/lib/datas/categories';
import Pagination from '@/app/ui/pagination';
import { CategoryTableSkeleton } from '@/app/ui/categories/skeletons';

export const runtime = 'edge';
export default async function CategoriesPage(props: {
  searchParams?: Promise<{
    query?: string;
    page?: string;
  }>;
}) {
  const searchParams = await props.searchParams;
  const query = searchParams?.query || '';
  const currentPage = Number(searchParams?.page) || 1;
  const totalPages = await fetchCategoriesPages(query);

  return (
    <div className="w-full">
      <div className="flex w-full items-center justify-between">
        <h1 className={`${lusitana.className} text-2xl`}>分类管理</h1>
      </div>
      <div className="mt-4 flex items-center justify-between gap-2 md:mt-8">
        <Search placeholder="搜索分类..." />
        <CreateCategory />
      </div>
      <Suspense key={query + currentPage} fallback={<CategoryTableSkeleton />}>
        <CategoriesTable query={query} currentPage={currentPage} />
      </Suspense>
      <div className="mt-5 flex w-full justify-center">
        <Pagination totalPages={totalPages} />
      </div>
    </div>
  );
} 
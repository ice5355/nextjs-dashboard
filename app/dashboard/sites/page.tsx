import { Suspense } from 'react';
import { lusitana } from '@/app/ui/fonts';
import Search from '@/app/ui/search';
import { CreateSite } from '@/app/ui/sites/buttons';
import SitesTable from '@/app/ui/sites/table';
import { fetchSitesPages } from '@/app/lib/datas/sites';
import Pagination from '@/app/ui/pagination';
import { SiteTableSkeleton } from '@/app/ui/sites/skeletons';

export default async function SitesPage(props: {
  searchParams?: Promise<{
    query?: string;
    page?: string;
  }>;
}) {
  const searchParams = await props.searchParams;
  const query = searchParams?.query || '';
  const currentPage = Number(searchParams?.page) || 1;
  const totalPages = await fetchSitesPages(query);

  return (
    <div className="w-full">
      <div className="flex w-full items-center justify-between">
        <h1 className={`${lusitana.className} text-2xl`}>网站管理</h1>
      </div>
      <div className="mt-4 flex items-center justify-between gap-2 md:mt-8">
        <Search placeholder="搜索网站..." />
        <CreateSite />
      </div>
      <Suspense key={query + currentPage} fallback={<SiteTableSkeleton />}>
        <SitesTable query={query} currentPage={currentPage} />
      </Suspense>
      <div className="mt-5 flex w-full justify-center">
        <Pagination totalPages={totalPages} />
      </div>
    </div>
  );
} 
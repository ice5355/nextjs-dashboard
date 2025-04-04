import { Suspense } from 'react';
import { lusitana } from '@/app/ui/fonts';
import Search from '@/app/ui/search';
import { CreateGame } from '@/app/ui/games/buttons';
import { GamesTable } from '@/app/ui/games/table';
import { fetchGamesPages } from '@/app/lib/datas/games';
import Pagination from '@/app/ui/pagination';
import { GameTableSkeleton } from '@/app/ui/games/skeletons';

export const runtime = 'edge';
export default async function GamesPage(props: {
  searchParams?: Promise<{
    query?: string;
    page?: string;
  }>;
}) {
  const searchParams = await props.searchParams;
  const query = searchParams?.query || '';
  const currentPage = Number(searchParams?.page) || 1;
  const totalPages = await fetchGamesPages(query);

  return (
    <div className="w-full">
      <div className="flex w-full items-center justify-between">
        <h1 className={`${lusitana.className} text-2xl`}>游戏管理</h1>
      </div>
      <div className="mt-4 flex items-center justify-between gap-2 md:mt-8">
        <Search placeholder="搜索游戏..." />
        <CreateGame />
      </div>
      <Suspense key={query + currentPage} fallback={<GameTableSkeleton />}>
        <GamesTable query={query} currentPage={currentPage} />
      </Suspense>
      <div className="mt-5 flex w-full justify-center">
        <Pagination totalPages={totalPages} />
      </div>
    </div>
  );
} 
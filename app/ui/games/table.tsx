import { Game } from '@/app/lib/definitions';
import { fetchGamesWithParams } from '@/app/lib/datas/games';
import { UpdateGame, DeleteGame } from '@/app/ui/games/buttons';
import { formatDateToLocal } from '@/app/lib/utils';
import Link from 'next/link';
import Image from 'next/image';

export async function GamesTable({
  query,
  currentPage,
}: {
  query: string;
  currentPage: number;
}) {
  const { games } = await fetchGamesWithParams(query, currentPage);
  
  return (
    <div className="mt-6 flow-root">
      <div className="inline-block min-w-full align-middle">
        <div className="rounded-lg bg-gray-50 p-2 md:pt-0">
          <table className="min-w-full text-gray-900">
            <thead className="rounded-lg text-left text-sm font-normal">
              <tr>
                <th scope="col" className="px-4 py-5 font-medium sm:pl-6">
                  游戏名称
                </th>
                <th scope="col" className="px-3 py-5 font-medium">
                  描述
                </th>
                <th scope="col" className="px-3 py-5 font-medium">
                  游戏链接
                </th>
                <th scope="col" className="px-3 py-5 font-medium">
                  关联网站数
                </th>
                <th scope="col" className="px-3 py-5 font-medium">
                  创建时间
                </th>
                <th
                  scope="col"
                  className="relative py-3.5 pl-3 pr-4"
                >
                  <span className="sr-only">操作</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white">
              {games.map((game) => (
                <tr key={game.id} className="w-full border-b py-3 text-sm last-of-type:border-none [&:first-child>td:first-child]:rounded-tl-lg [&:first-child>td:last-child]:rounded-tr-lg [&:last-child>td:first-child]:rounded-bl-lg [&:last-child>td:last-child]:rounded-br-lg">
                  <td className="whitespace-nowrap py-3 pl-6 pr-3">
                    <div className="flex items-center gap-3">
                      {game.icon_url ? (
                        <Image src={game.icon_url} alt={game.name} className="h-8 w-8 rounded-full" width={32} height={32} unoptimized/>
                      ) : (
                        <div className="h-8 w-8 rounded-full bg-gray-200" />
                      )}
                      <Link href={`/dashboard/games/${game.id}/edit`} className="whitespace-nowrap font-medium text-blue-600 hover:text-blue-500">
                        {game.name}
                      </Link>
                    </div>
                  </td>
                  <td className="px-3 py-3">
                    {game.description ? (
                      <p className="line-clamp-2 max-w-[300px]">{game.description}</p>
                    ) : (
                      <span className="text-gray-400">暂无描述</span>
                    )}
                  </td>
                  <td className="whitespace-nowrap px-3 py-3">
                    {game.game_url ? (
                      <a 
                        href={game.game_url} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="text-blue-600 hover:text-blue-500 hover:underline"
                      >
                        访问链接
                      </a>
                    ) : (
                      <span className="text-gray-400">暂无链接</span>
                    )}
                  </td>
                  <td className="whitespace-nowrap px-3 py-3">
                    <span className="inline-flex items-center rounded-md px-2 py-1 text-xs font-medium bg-blue-50 text-blue-700 ring-1 ring-blue-600/20">
                      {game.sitesCount || 0} 个网站
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-3 py-3">
                    {formatDateToLocal(game.created_at)}
                  </td>
                  <td className="whitespace-nowrap py-3 pl-6 pr-3">
                    <div className="flex justify-end gap-3">
                      <UpdateGame id={game.id.toString()} />
                      <DeleteGame id={game.id.toString()} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
} 
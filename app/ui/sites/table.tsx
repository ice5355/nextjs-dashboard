import { Site } from '@/app/lib/definitions';
import { UpdateSite, DeleteSite } from '@/app/ui/sites/buttons';
import { formatDateToLocal } from '@/app/lib/utils';
import { fetchSitesWithParams } from '@/app/lib/datas/sites';

export default async function SitesTable({
  query,
  currentPage,
}: {
  query: string;
  currentPage: number;
}) {
  const { sites } = await fetchSitesWithParams(query, currentPage);

  return (
    <div className="mt-6 flow-root">
      <div className="inline-block min-w-full align-middle">
        <div className="rounded-lg bg-gray-50 p-2 md:pt-0">
          {/* 移动端视图 */}
          <div className="md:hidden">
            {sites?.map((site: Site) => (
              <div
                key={site.id}
                className="mb-2 w-full rounded-md bg-white p-4"
              >
                <div className="flex items-center justify-between border-b pb-4">
                  <div>
                    <div className="mb-2 flex items-center">
                      <p className="mr-2 text-sm text-gray-500">ID: {site.id}</p>
                      <p className="font-medium">{site.name}</p>
                    </div>
                    <p className="text-sm text-gray-500">{site.url}</p>
                  </div>
                  <p className="text-sm text-gray-500">
                    游戏数量: {site.gamesCount || 0}
                  </p>
                </div>
                <div className="flex w-full items-center justify-between pt-4">
                  <div>
                    <p>{formatDateToLocal(site.created_at)}</p>
                  </div>
                  <div className="flex justify-end gap-2">
                    <UpdateSite id={site.id.toString()} />
                    <DeleteSite id={site.id.toString()} />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* 桌面端视图 */}
          <table className="hidden min-w-full text-gray-900 md:table">
            <thead className="rounded-lg text-left text-sm font-normal">
              <tr>
                <th scope="col" className="px-4 py-5 font-medium sm:pl-6">
                  ID
                </th>
                <th scope="col" className="px-4 py-5 font-medium">
                  网站名称
                </th>
                <th scope="col" className="px-3 py-5 font-medium">
                  域名
                </th>
                <th scope="col" className="px-3 py-5 font-medium">
                  关联游戏数
                </th>
                <th scope="col" className="px-3 py-5 font-medium">
                  创建时间
                </th>
                <th scope="col" className="relative py-3 pl-6 pr-3">
                  <span className="sr-only">操作</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white">
              {sites?.map((site: Site) => (
                <tr
                  key={site.id}
                  className="w-full border-b py-3 text-sm last-of-type:border-none [&:first-child>td:first-child]:rounded-tl-lg [&:first-child>td:last-child]:rounded-tr-lg [&:last-child>td:first-child]:rounded-bl-lg [&:last-child>td:last-child]:rounded-br-lg"
                >
                  <td className="whitespace-nowrap py-3 pl-6 pr-3">
                    <p>{site.id}</p>
                  </td>
                  <td className="whitespace-nowrap px-3 py-3">
                    <p>{site.name}</p>
                  </td>
                  <td className="whitespace-nowrap px-3 py-3">
                    {site.url}
                  </td>
                  <td className="whitespace-nowrap px-3 py-3">
                    <span className="inline-flex items-center rounded-md px-2 py-1 text-xs font-medium bg-blue-50 text-blue-700 ring-1 ring-blue-600/20">
                      {site.gamesCount || 0} 个游戏
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-3 py-3">
                    {formatDateToLocal(site.created_at)}
                  </td>
                  <td className="whitespace-nowrap py-3 pl-6 pr-3">
                    <div className="flex justify-end gap-3">
                      <UpdateSite id={site.id.toString()} />
                      <DeleteSite id={site.id.toString()} />
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
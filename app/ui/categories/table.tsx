import { Category } from '@/app/lib/definitions';
import { UpdateCategory, DeleteCategory } from '@/app/ui/categories/buttons';
import { fetchCategoriesWithParams } from '@/app/lib/datas/categories';

export default async function CategoriesTable({
  query,
  currentPage,
}: {
  query: string;
  currentPage: number;
}) {
  const categories = await fetchCategoriesWithParams(query, currentPage);

  return (
    <div className="mt-6 flow-root">
      <div className="inline-block min-w-full align-middle">
        <div className="rounded-lg bg-gray-50 p-2 md:pt-0">
          {/* 移动端视图 */}
          <div className="md:hidden">
            {categories.map((category: Category & { game_count: number }) => (
              <div
                key={category.id}
                className="mb-2 w-full rounded-md bg-white p-4"
              >
                <div className="flex items-center justify-between border-b pb-4">
                  <div>
                    <div className="mb-2 flex items-center">
                      <p className="font-medium">{category.chinese_name} ({category.name})</p>
                    </div>
                  </div>
                </div>
                <div className="flex w-full items-center justify-between pt-4">
                  <div>
                    <p className="text-sm text-gray-500">
                      关联游戏数: {category.game_count || 0}
                    </p>
                  </div>
                  <div className="flex justify-end gap-2">
                    <UpdateCategory id={category.id.toString()} />
                    <DeleteCategory id={category.id.toString()} />
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
                  分类名称
                </th>
                <th scope="col" className="px-4 py-5 font-medium sm:pl-6">
                  分类名称（英文）
                </th>
                <th scope="col" className="px-3 py-5 font-medium">
                  关联游戏数
                </th>
                <th scope="col" className="relative py-3 pl-6 pr-3">
                  <span className="sr-only">操作</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white">
              {categories.map((category: Category & { game_count: number }) => (
                <tr
                  key={category.id}
                  className="w-full border-b py-3 text-sm last-of-type:border-none [&:first-child>td:first-child]:rounded-tl-lg [&:first-child>td:last-child]:rounded-tr-lg [&:last-child>td:first-child]:rounded-bl-lg [&:last-child>td:last-child]:rounded-br-lg"
                >
                  <td className="whitespace-nowrap py-3 pl-6 pr-3">
                    <div className="flex items-center gap-3">
                      <p>{category.chinese_name}</p>
                    </div>
                  </td>
                  <td className="whitespace-nowrap py-3 pl-6 pr-3">
                    <div className="flex items-center gap-3">
                      <p>{category.name}</p>
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-3 py-3">
                    <span className="inline-flex items-center rounded-md px-2 py-1 text-xs font-medium bg-blue-50 text-blue-700 ring-1 ring-blue-600/20">
                      {category.game_count || 0} 个游戏
                    </span>
                  </td>
                  <td className="whitespace-nowrap py-3 pl-6 pr-3">
                    <div className="flex justify-end gap-3">
                      <UpdateCategory id={category.id.toString()} />
                      <DeleteCategory id={category.id.toString()} />
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
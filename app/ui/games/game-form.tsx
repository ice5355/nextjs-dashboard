'use client';

import { Game, Site, Category } from '@/app/lib/definitions';
import { useActionState } from 'react';
import { createGame, updateGame } from '@/app/lib/actions/games';
import { Button } from '@/app/ui/button';
import { useFormStatus } from 'react-dom';
import Link from 'next/link';
import ImageUploader from './image-uploader';

// 创建提交按钮组件来处理 loading 状态
function SubmitButton({ isEdit }: { isEdit: boolean }) {
  const { pending } = useFormStatus();
  
  return (
    <Button type="submit" disabled={pending}>
      {pending ? '保存中...' : (isEdit ? '保存修改' : '创建游戏')}
    </Button>
  );
}

export function GameForm({ 
  game,
  sites = [], // 设置默认值为空数组
  categories = [], // 设置默认值为空数组
  gameSites = [], // 已关联的网站及权重
  gameCategories = [], // 已关联的分类ID列表
}: { 
  game?: Game;
  sites?: Site[];
  categories?: Category[];
  gameSites?: Array<{ site_id: number; weight: number }>;
  gameCategories?: number[];
}) {
  const initialState = { message: '', errors: {} };
  const [state, dispatch] = useActionState(
    game ? updateGame.bind(null, game.id.toString()) : createGame,
    initialState
  );

  return (
    <form action={dispatch}>
      {game?.id && <input type="hidden" name="id" value={game.id} />}
      
      <div className="rounded-md bg-gray-50 p-4 md:p-6">
        {/* 游戏名称 */}
        <div className="mb-4">
          <label htmlFor="name" className="mb-2 block text-sm font-medium">
            名称
          </label>
          <input
            id="name"
            name="name"
            type="text"
            defaultValue={game?.name}
            placeholder="请输入游戏名称"
            className="block w-full rounded-md border border-gray-200 py-2 px-3 text-sm outline-2 placeholder:text-gray-500"
            aria-describedby="name-error"
          />
          {state.errors?.name && (
            <div id="name-error" className="mt-2 text-sm text-red-500">
              {state.errors.name.map((error: string) => (
                <p key={error}>{error}</p>
              ))}
            </div>
          )}
        </div>

        {/* 游戏图标上传 */}
        <div className="mb-4">
          <label htmlFor="icon_url" className="mb-2 block text-sm font-medium">
            游戏图标
          </label>
          <div className="flex items-start gap-4">
            <ImageUploader 
              defaultImageUrl={game?.icon_url || undefined}
              name="icon_url"
            />
            <div className="flex-1">
              <p className="text-sm text-gray-500 mb-2">
                上传游戏图标图片。建议使用正方形图片，大小不超过10MB。
              </p>
              {state.errors?.icon_url && (
                <div id="icon-error" className="mt-2 text-sm text-red-500">
                  {state.errors.icon_url.map((error: string) => (
                    <p key={error}>{error}</p>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 游戏链接 */}
        <div className="mb-4">
          <label htmlFor="game_url" className="mb-2 block text-sm font-medium">
            游戏链接
          </label>
          <input
            id="game_url"
            name="game_url"
            type="url"
            defaultValue={game?.game_url || undefined}
            placeholder="请输入游戏链接"
            className="block w-full rounded-md border border-gray-200 py-2 px-3 text-sm outline-2 placeholder:text-gray-500"
            aria-describedby="game_url-error"
          />
          {state.errors?.game_url && (
            <div id="game_url-error" className="mt-2 text-sm text-red-500">
              {state.errors.game_url.map((error: string) => (
                <p key={error}>{error}</p>
              ))}
            </div>
          )}
        </div>

        {/* 游戏描述 */}
        <div className="mb-4">
          <label htmlFor="description" className="mb-2 block text-sm font-medium">
            描述
          </label>
          <textarea
            id="description"
            name="description"
            defaultValue={game?.description || undefined}
            placeholder="请输入游戏一句话描述"
            className="block w-full rounded-md border border-gray-200 py-2 px-3 text-sm outline-2 placeholder:text-gray-500"
            rows={3}
            aria-describedby="description-error"
          />
          {state.errors?.description && (
            <div id="description-error" className="mt-2 text-sm text-red-500">
              {state.errors.description.map((error: string) => (
                <p key={error}>{error}</p>
              ))}
            </div>
          )}
        </div>

        {/* 游戏详情 */}
        <div className="mb-4">
          <label htmlFor="details" className="mb-2 block text-sm font-medium">
            详情
          </label>
          <textarea
            id="details"
            name="details"
            defaultValue={game?.details || undefined}
            placeholder="请输入游戏详情"
            className="block w-full rounded-md border border-gray-200 py-2 px-3 text-sm outline-2 placeholder:text-gray-500"
            rows={5}
            aria-describedby="details-error"
          />
          {state.errors?.details && (
            <div id="details-error" className="mt-2 text-sm text-red-500">
              {state.errors.details.map((error: string) => (
                <p key={error}>{error}</p>
              ))}
            </div>
          )}
        </div>

        {/* 关联网站 */}
        <div className="mb-4">
          <label className="mb-2 block text-sm font-medium">
            关联网站
          </label>
          <div className="space-y-3">
            {sites.map((site) => {
              const gameSite = gameSites.find(gs => gs.site_id === site.id);
              return (
                <div key={site.id} className="flex items-center gap-4">
                  <input
                    type="checkbox"
                    id={`site-${site.id}`}
                    name="site_ids"
                    value={site.id}
                    defaultChecked={!!gameSite}
                    className="h-4 w-4 rounded border-gray-300"
                  />
                  <label htmlFor={`site-${site.id}`} className="text-sm font-medium">
                    {site.name}
                  </label>
                  <input
                    type="number"
                    name={`weight-${site.id}`}
                    defaultValue={gameSite?.weight ?? 0}
                    placeholder="权重"
                    className="w-24 rounded-md border border-gray-200 py-2 px-3 text-sm"
                  />
                </div>
              );
            })}
          </div>
        </div>

        {/* 关联分类 */}
        <div className="mb-4">
          <label className="mb-2 block text-sm font-medium">
            关联分类
          </label>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {categories.map((category) => (
              <div key={category.id} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id={`category-${category.id}`}
                  name="category_ids"
                  value={category.id}
                  defaultChecked={gameCategories.includes(category.id)}
                  className="h-4 w-4 rounded border-gray-300"
                />
                <label htmlFor={`category-${category.id}`} className="text-sm">
                  {category.category_name}
                </label>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-6 flex justify-end gap-4">
        <Link
          href="/dashboard/games"
          className="flex h-10 items-center rounded-lg bg-gray-100 px-4 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-200"
        >
          取消
        </Link>
        <SubmitButton isEdit={!!game} />
      </div>
    </form>
  );
} 
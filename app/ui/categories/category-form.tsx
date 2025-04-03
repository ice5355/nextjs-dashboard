'use client';

import { Category, Game } from '@/app/lib/definitions';
import { createCategory } from '@/app/lib/actions/categories';
import { updateCategory, type CategoryState } from '@/app/lib/actions/categories';
import { Button } from '@/app/ui/button';
import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import Link from 'next/link';

// 创建一个提交按钮组件来处理 loading 状态
function SubmitButton({ isEdit }: { isEdit: boolean }) {
  const { pending } = useFormStatus();
  
  return (
    <Button type="submit" disabled={pending}>
      {pending ? '保存中...' : (isEdit ? '保存修改' : '创建分类')}
    </Button>
  );
}

export default function CategoryForm({ 
  category,
  games = [], // 设置默认值为空数组
  categoryGames = [],
}: { 
  category?: Category;
  games?: Game[];  // 设置为可选参数
  categoryGames?: number[];
}) {
  const initialState: CategoryState = { message: null, errors: {} };
  const [state, dispatch] = useActionState(
    category ? 
      (prevState: CategoryState, formData: FormData) => updateCategory(category.id.toString(), prevState, formData) :
      (prevState: CategoryState, formData: FormData) => createCategory(prevState, formData),
    initialState
  );

  return (
    <form action={dispatch}>
      {category?.id && <input type="hidden" name="id" value={category.id} />}
      
      <div className="rounded-md bg-gray-50 p-4 md:p-6">
        {/* 英文分类名称 */}
        <div className="mb-4">
          <label htmlFor="name" className="mb-2 block text-sm font-bold">
            英文分类名称
          </label>
          <input
            id="name"
            name="name"
            defaultValue={category?.name}
            className="block w-full rounded-md border border-gray-200 py-2 px-3 text-sm"
            placeholder="输入英文分类名称"
          />
          {state.errors?.name && (
            <div className="mt-2 text-sm text-red-500">
              {state.errors.name.map((error: string) => (
                <p key={error}>{error}</p>
              ))}
            </div>
          )}
        </div>

        {/* 中文分类名称 */}
        <div className="mb-4">
          <label htmlFor="chinese_name" className="mb-2 block text-sm font-bold">
            中文分类名称
          </label>
          <input
            id="chinese_name"
            name="chinese_name"
            defaultValue={category?.chinese_name}
            className="block w-full rounded-md border border-gray-200 py-2 px-3 text-sm"
            placeholder="输入中文分类名称"
          />
          {state.errors?.chinese_name && (
            <div className="mt-2 text-sm text-red-500">
              {state.errors.chinese_name.map((error: string) => (
                <p key={error}>{error}</p>
              ))}
            </div>
          )}
        </div>

        {/* 关联游戏 */}
        {games.length > 0 && (
          <div className="mb-4">
            <label className="mb-2 block text-sm font-bold">
              关联游戏
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {games.map((game) => (
                <div key={game.id} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id={`game-${game.id}`}
                    name="game_ids"
                    value={game.id}
                    defaultChecked={categoryGames.includes(game.id)}
                    className="h-4 w-4 rounded border-gray-300"
                  />
                  <label htmlFor={`game-${game.id}`} className="text-sm">
                    {game.name}
                  </label>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="mt-6 flex justify-end gap-4">
        <Link
          href="/dashboard/categories"
          className="flex h-10 items-center rounded-lg bg-gray-100 px-4 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-200"
        >
          取消
        </Link>
        <SubmitButton isEdit={!!category} />
      </div>
    </form>
  );
} 
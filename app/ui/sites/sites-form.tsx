'use client';

import { Site, Game } from '@/app/lib/definitions';
import { createSite, updateSite } from '@/app/lib/actions/sites';
import { useActionState } from "react";
import { Button } from '@/app/ui/button';
import Link from 'next/link';
import {
  GlobeAltIcon,
  DocumentTextIcon,
  ComputerDesktopIcon,
  CheckIcon,
  XMarkIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline';
import { useFormStatus } from 'react-dom';
import { useState, useRef, useEffect } from 'react';

// 创建提交按钮组件来处理 loading 状态
function SubmitButton({ isEdit }: { isEdit: boolean }) {
  const { pending } = useFormStatus();
  
  return (
    <Button type="submit" disabled={pending}>
      {pending ? '保存中...' : (isEdit ? '保存修改' : '创建网站')}
    </Button>
  );
}

export function SiteForm({
  site,
  games,
  siteGames,
  gamesOnly = false,
}: {
  site?: Site;
  games: Game[];
  siteGames?: { game_id: number; weight: number }[];
  gamesOnly?: boolean;
}) {
  const initialState = { message: '', errors: {} };
  // 根据是否有 site 来决定使用哪个 action
  const action = site ? updateSite.bind(null, site.id) : createSite;
  const [state, dispatch] = useActionState(action, initialState);
  
  // 为游戏复选框添加引用数组
  const gameCheckboxRefs = useRef<(HTMLInputElement | null)[]>([]);
  
  // 初始化引用数组
  useEffect(() => {
    gameCheckboxRefs.current = gameCheckboxRefs.current.slice(0, games.length);
  }, [games.length]);
  
  // 全选功能
  const selectAll = () => {
    gameCheckboxRefs.current.forEach(checkbox => {
      if (checkbox) checkbox.checked = true;
    });
  };
  
  // 全不选功能
  const deselectAll = () => {
    gameCheckboxRefs.current.forEach(checkbox => {
      if (checkbox) checkbox.checked = false;
    });
  };
  
  // 反选功能
  const invertSelection = () => {
    gameCheckboxRefs.current.forEach(checkbox => {
      if (checkbox) checkbox.checked = !checkbox.checked;
    });
  };
  
  // 设置ref的回调函数
  const setCheckboxRef = (el: HTMLInputElement | null, index: number) => {
    gameCheckboxRefs.current[index] = el;
  };

  return (
    <form action={dispatch}>
      <div className="rounded-md bg-gray-50 p-4 md:p-6">
        {!gamesOnly && (
          <>
            {/* 网站名称 */}
            <div className="mb-4">
              <label htmlFor="name" className="mb-2 block text-sm font-bold">
                网站名称
              </label>
              <div className="relative">
                <input
                  id="name"
                  name="name"
                  type="text"
                  defaultValue={site?.name}
                  placeholder="请输入网站名称"
                  className="peer block w-full rounded-md border border-gray-200 py-2 pl-10 text-sm outline-2 placeholder:text-gray-500"
                  aria-describedby="name-error"
                />
                <DocumentTextIcon className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500 peer-focus:text-gray-900" />
              </div>
              <div id="name-error" aria-live="polite" aria-atomic="true">
                {state.errors?.name &&
                  state.errors.name.map((error: string) => (
                    <p className="mt-2 text-sm text-red-500" key={error}>
                      {error}
                    </p>
                  ))}
              </div>
            </div>

            {/* 网站链接 */}
            <div className="mb-4">
              <label htmlFor="url" className="mb-2 block text-sm font-bold">
                网站链接
              </label>
              <div className="relative">
                <input
                  id="url"
                  name="url"
                  type="url"
                  defaultValue={site?.url}
                  placeholder="请输入网站链接"
                  className="peer block w-full rounded-md border border-gray-200 py-2 pl-10 text-sm outline-2 placeholder:text-gray-500"
                  aria-describedby="url-error"
                />
                <GlobeAltIcon className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500 peer-focus:text-gray-900" />
              </div>
              <div id="url-error" aria-live="polite" aria-atomic="true">
                {state.errors?.url &&
                  state.errors.url.map((error: string) => (
                    <p className="mt-2 text-sm text-red-500" key={error}>
                      {error}
                    </p>
                  ))}
              </div>
            </div>
          </>
        )}

        {/* 关联游戏 */}
        <fieldset className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <legend className="block text-sm font-bold">
              关联游戏
            </legend>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={selectAll}
                className="px-2 py-1 bg-gray-200 text-xs rounded hover:bg-gray-300 flex items-center gap-1"
              >
                <CheckIcon className="h-3 w-3" /> 全选
              </button>
              <button
                type="button"
                onClick={deselectAll}
                className="px-2 py-1 bg-gray-200 text-xs rounded hover:bg-gray-300 flex items-center gap-1"
              >
                <XMarkIcon className="h-3 w-3" /> 全不选
              </button>
              <button
                type="button"
                onClick={invertSelection}
                className="px-2 py-1 bg-gray-200 text-xs rounded hover:bg-gray-300 flex items-center gap-1"
              >
                <ArrowPathIcon className="h-3 w-3" /> 反选
              </button>
            </div>
          </div>
          <div className="rounded-md border border-gray-200 bg-white px-[14px] py-3">
            <div className="space-y-3">
              {games.map((game, index) => {
                const siteGame = siteGames?.find(sg => sg.game_id === game.id);
                return (
                  <div key={game.id} className="flex items-center gap-4">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id={`game-${game.id}`}
                        name="game_ids"
                        value={game.id}
                        defaultChecked={!!siteGame}
                        className="h-4 w-4 rounded border-gray-300 bg-gray-100 text-gray-600 focus:ring-0 focus:ring-offset-0"
                        ref={el => setCheckboxRef(el, index)}
                      />
                      <label
                        htmlFor={`game-${game.id}`}
                        className="ml-2 flex cursor-pointer items-center gap-1.5 rounded-full bg-gray-100 px-3 py-1.5 text-xs font-medium text-gray-600"
                      >
                        {game.name} <ComputerDesktopIcon className="h-4 w-4" />
                      </label>
                    </div>
                    <div className="flex items-center gap-2">
                      <label
                        htmlFor={`weight-${game.id}`}
                        className="text-xs font-medium text-gray-600"
                      >
                        权重：
                      </label>
                      <input
                        type="number"
                        id={`weight-${game.id}`}
                        name={`weight-${game.id}`}
                        defaultValue={siteGame?.weight ?? 0}
                        placeholder="权重"
                        className="w-24 rounded-md border border-gray-200 py-2 px-3 text-sm"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </fieldset>

        {/* 错误信息显示 */}
        <div aria-live="polite" aria-atomic="true">
          {state.message && (
            <p className="mt-2 text-sm text-red-500">{state.message}</p>
          )}
        </div>
      </div>

      <div className="mt-6 flex justify-end gap-4">
        <Link
          href="/dashboard/sites"
          className="flex h-10 items-center rounded-lg bg-gray-100 px-4 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-200"
        >
          取消
        </Link>
        <SubmitButton isEdit={!!site} />
      </div>
    </form>
  );
} 
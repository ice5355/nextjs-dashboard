"use client";

import { PencilIcon, PlusIcon, TrashIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import { deleteCategory } from '@/app/lib/actions/categories';
import { useState, useTransition, useEffect } from 'react';
import { XCircleIcon, CheckCircleIcon } from '@heroicons/react/24/solid';

export function CreateCategory() {
  return (
    <Link
      href="/dashboard/categories/create"
      className="flex h-10 items-center rounded-lg bg-blue-600 px-4 text-sm font-medium text-white transition-colors hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
    >
      <span className="hidden md:block">创建分类</span>{' '}
      <PlusIcon className="h-5 md:ml-4" />
    </Link>
  );
}

export function UpdateCategory({ id }: { id: string }) {
  return (
    <Link
      href={`/dashboard/categories/${id}/edit`}
      className="rounded-md border p-2 hover:bg-gray-100"
    >
      <PencilIcon className="w-5" />
    </Link>
  );
}

export function DeleteCategory({ id }: { id: string }) {
  const [showConfirm, setShowConfirm] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (status !== "idle") {
      const timer = setTimeout(() => setStatus("idle"), 3000);
      return () => clearTimeout(timer);
    }
  }, [status]);

  const handleDelete = () => {
    setShowConfirm(false);
    startTransition(async () => {
      const { success, message } = await deleteCategory(id);
      setStatus(success ? "success" : "error");
    });
  };

  return (
    <>
      <button onClick={() => setShowConfirm(true)} className="rounded-md border p-2 hover:bg-gray-100" disabled={isPending}>
        <TrashIcon className="w-5" />
      </button>

      {showConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
            <h3 className="text-lg font-medium mb-3">确认删除</h3>
            <p className="mb-4">您确定要删除这个分类吗？此操作无法撤销。</p>
            <div className="flex justify-end space-x-3">
              <button onClick={() => setShowConfirm(false)} className="px-4 py-2 border rounded-md hover:bg-gray-100" disabled={isPending}>
                取消
              </button>
              <button onClick={handleDelete} className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700" disabled={isPending}>
                {isPending ? "删除中..." : "确认删除"}
              </button>
            </div>
          </div>
        </div>
      )}

      {isPending && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white p-4 rounded-lg shadow-lg flex items-center">
            <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-600 mr-3"></div>
            <p>正在处理，请稍候...</p>
          </div>
        </div>
      )}

      {status !== "idle" && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className={`bg-white p-6 rounded-lg shadow-lg max-w-md w-full border-l-4 ${status === "success" ? "border-green-500" : "border-red-500"}`}>
            <div className="flex items-center mb-4">
              {status === "success" ? <CheckCircleIcon className="w-8 h-8 text-green-500 mr-3" /> : <XCircleIcon className="w-8 h-8 text-red-500 mr-3" />}
              <h3 className={`text-lg font-medium ${status === "success" ? "text-green-600" : "text-red-600"}`}>
                {status === "success" ? "操作成功" : "操作失败"}
              </h3>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
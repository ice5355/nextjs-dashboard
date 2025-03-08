'use client';

import { useState, useRef } from 'react';
import { getUploadUrl } from '@/app/lib/actions/games';

interface ImageUploaderProps {
  defaultImageUrl?: string;
  onImageUpload?: (imageUrl: string) => void;
  name: string; // 表单字段名称
}

export default function ImageUploader({ 
  defaultImageUrl, 
  onImageUpload,
  name
}: ImageUploaderProps) {
  const [previewUrl, setPreviewUrl] = useState<string>(defaultImageUrl || '');
  const [uploadedUrl, setUploadedUrl] = useState<string>(defaultImageUrl || '');
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 显示本地预览
    const localPreview = URL.createObjectURL(file);
    setPreviewUrl(localPreview);
    setIsUploading(true);

    try {
      // 生成唯一文件名
      const date = new Date();
      const dateStr = date.toISOString().split('T')[0].replace(/-/g, '');
      const timeStr = date.toTimeString().split(' ')[0].replace(/:/g, '');
      const random = Math.random().toString(36).substring(2, 8);
      const fileExt = file.name.split('.').pop();
      const uniqueFilename = `games/${dateStr}_${timeStr}_${random}.${fileExt}`;

      // 获取上传URL
      const uploadUrl = await getUploadUrl(uniqueFilename);

      // 上传文件
      const response = await fetch(uploadUrl, {
        method: 'PUT',
        headers: {
          'Content-Type': file.type,
        },
        body: file,
      });
      console.log('上传文件响应:', response);

      // 设置公共URL
      const publicUrl = `${process.env.NEXT_PUBLIC_R2_PUBLIC_URL}/${uniqueFilename}`;
      setUploadedUrl(publicUrl);
      if (onImageUpload) {
        onImageUpload(publicUrl);
      }
    } catch (error) {
      console.error('上传失败:', error);
      alert('图片上传失败，请重试');
      // 如果上传失败，回退到默认图片
      setPreviewUrl(defaultImageUrl || '');
    } finally {
      setIsUploading(false);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const clearImage = () => {
    setPreviewUrl('');
    setUploadedUrl('');
    if (onImageUpload) {
      onImageUpload('');
    }
  };

  return (
    <div className="flex flex-col items-center gap-2">
      {/* 隐藏的表单字段，用于提交URL值 */}
      <input type="hidden" name={name} value={uploadedUrl} />
      
      <div 
        className="w-32 h-32 border-2 border-dashed border-gray-300 rounded-md flex items-center justify-center cursor-pointer overflow-hidden relative"
        onClick={triggerFileInput}
      >
        {previewUrl ? (
          <div className="relative w-full h-full">
            <img 
              src={previewUrl} 
              alt="游戏图标预览" 
              className="w-full h-full object-cover"
            />
          </div>
        ) : (
          <span className="text-gray-500 text-sm text-center">点击上传图标</span>
        )}
        {isUploading && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <span className="text-white">上传中...</span>
          </div>
        )}
      </div>
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        accept="image/*"
        onChange={handleFileChange}
      />
      <button
        type="button"
        className="text-sm text-blue-600 hover:text-blue-800"
        onClick={triggerFileInput}
      >
        {previewUrl ? '更换图片' : '上传图片'}
      </button>
      {previewUrl && (
        <button
          type="button"
          className="text-sm text-red-600 hover:text-red-800"
          onClick={clearImage}
        >
          移除图片
        </button>
      )}
    </div>
  );
} 
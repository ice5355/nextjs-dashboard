'use client';

import { useState, useRef, useEffect } from 'react';
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
  const [manualUrl, setManualUrl] = useState<string>('');
  const [isUploading, setIsUploading] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [isUrlUploading, setIsUrlUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 当组件加载时设置初始值
  useEffect(() => {
    if (defaultImageUrl) {
      setManualUrl(defaultImageUrl);
    }
  }, [defaultImageUrl]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 显示本地预览
    const localPreview = URL.createObjectURL(file);
    setPreviewUrl(localPreview);
    setIsUploading(true);
    setShowUrlInput(false); // 切换到上传模式
    setManualUrl('');

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

  const handleManualUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value;
    setManualUrl(url);
    setImageError(false); // 清除之前的错误
  };

  // 处理URL图片下载和上传
  const handleUrlSubmit = async () => {
    if (!manualUrl || manualUrl === uploadedUrl) return;
    
    setIsUrlUploading(true);
    setImageError(false);
    
    try {
      // 生成文件名
      const date = new Date();
      const dateStr = date.toISOString().split('T')[0].replace(/-/g, '');
      const timeStr = date.toTimeString().split(' ')[0].replace(/:/g, '');
      const random = Math.random().toString(36).substring(2, 8);
      
      // 从URL中提取文件扩展名
      const urlParts = manualUrl.split('.');
      let fileExt = urlParts.length > 1 ? urlParts[urlParts.length - 1].split(/[?#]/)[0] : 'jpg';
      
      //如果扩展名不是jpg,png,gif,webp,bmp,tif,则设置为webp
      if (fileExt !== 'jpg' && fileExt !== 'png' && fileExt !== 'gif' && fileExt !== 'webp' && fileExt !== 'bmp' && fileExt !== 'tif') {
        fileExt = 'webp';
      }
      
      const uniqueFilename = `games/${dateStr}_${timeStr}_${random}.${fileExt}`;
      
      // 先尝试下载图片
      const imageResponse = await fetch(manualUrl);
      if (!imageResponse.ok) {
        throw new Error('无法获取图片');
      }
      
      // 获取图片blob数据
      const imageBlob = await imageResponse.blob();
      
      // 立即为下载的Blob创建本地预览URL，避免预览区域空白
      const localPreviewUrl = URL.createObjectURL(imageBlob);
      setPreviewUrl(localPreviewUrl); // 立即显示本地预览
      
      // 获取上传URL
      const uploadUrl = await getUploadUrl(uniqueFilename);
      
      // 上传到R2
      const uploadResponse = await fetch(uploadUrl, {
        method: 'PUT',
        headers: {
          'Content-Type': imageBlob.type || 'image/jpeg',
        },
        body: imageBlob,
      });
      
      if (!uploadResponse.ok) {
        throw new Error('上传图片到R2失败');
      }
      
      // 设置公共URL
      const publicUrl = `${process.env.NEXT_PUBLIC_R2_PUBLIC_URL}/${uniqueFilename}`;
      
      // 预加载最终的R2图片
      const preloadImage = new Image();
      preloadImage.onload = () => {
        // R2图片加载完成后，才替换本地预览
        setPreviewUrl(publicUrl);
        // 清理本地对象URL以避免内存泄漏
        URL.revokeObjectURL(localPreviewUrl);
      };
      preloadImage.src = publicUrl;
      
      // 无论如何都更新表单提交值
      setUploadedUrl(publicUrl);
      
      if (onImageUpload) {
        onImageUpload(publicUrl);
      }
    } catch (error) {
      console.error('处理图片URL失败:', error);
      setImageError(true);
    } finally {
      setIsUrlUploading(false);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const clearImage = () => {
    setPreviewUrl('');
    setUploadedUrl('');
    setManualUrl('');
    setShowUrlInput(false);
    setImageError(false);
    if (onImageUpload) {
      onImageUpload('');
    }
  };

  const toggleUrlInput = () => {
    setShowUrlInput(!showUrlInput);
    // 如果切换到文件上传，清空手动URL
    if (showUrlInput) {
      setManualUrl('');
    }
  };

  return (
    <div className="flex flex-col gap-2">
      {/* 隐藏的表单字段，用于提交URL值 */}
      <input type="hidden" name={name} value={uploadedUrl} />
      
      <div className="flex gap-4">
        <div className="flex flex-col items-center gap-2">
          <div 
            className="w-32 h-32 border-2 border-dashed border-gray-300 rounded-md flex items-center justify-center cursor-pointer overflow-hidden relative"
            onClick={!showUrlInput ? triggerFileInput : undefined}
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
              <span className="text-gray-500 text-sm text-center">
                {showUrlInput ? '等待上传' : '点击上传图标'}
              </span>
            )}
            {(isUploading || isUrlUploading) && (
              <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                <span className="text-white">上传中...</span>
              </div>
            )}
          </div>
          
          <div className="flex gap-2">
            {!showUrlInput && (
              <button
                type="button"
                className="text-sm text-blue-600 hover:text-blue-800"
                onClick={triggerFileInput}
              >
                {previewUrl ? '更换图片' : '上传图片'}
              </button>
            )}
            <button
              type="button"
              className="text-sm text-blue-600 hover:text-blue-800"
              onClick={toggleUrlInput}
            >
              {showUrlInput ? '切换到上传' : '输入链接'}
            </button>
            {previewUrl && (
              <button
                type="button"
                className="text-sm text-red-600 hover:text-red-800"
                onClick={clearImage}
              >
                移除
              </button>
            )}
          </div>
        </div>
        
        {showUrlInput && (
          <div className="flex-1">
            <div className="flex flex-col space-y-2">
              <input
                type="url"
                className={`w-full px-3 py-2 border rounded-md ${imageError ? 'border-red-500' : 'border-gray-300'}`}
                placeholder="输入图片URL"
                value={manualUrl}
                onChange={handleManualUrlChange}
              />
              <button
                type="button"
                className="px-3 py-1.5 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-blue-300"
                onClick={handleUrlSubmit}
                disabled={!manualUrl || isUrlUploading}
              >
                {isUrlUploading ? '处理中...' : '提交并上传'}
              </button>
              {imageError && (
                <p className="text-xs text-red-500">获取或上传图片失败，请检查URL是否有效</p>
              )}
            </div>
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
    </div>
  );
} 
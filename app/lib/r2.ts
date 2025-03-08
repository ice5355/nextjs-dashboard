import { S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';

const R2_ACCOUNT_ID = process.env.R2_ACCOUNT_ID;
const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID;
const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY;
const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME;

const s3Client = new S3Client({
  region: 'auto',
  endpoint: `https://6f61821417f1652800c06a2b968e2e40.eu.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: R2_ACCESS_KEY_ID!,
    secretAccessKey: R2_SECRET_ACCESS_KEY!,
  },
});

export async function generatePresignedUrl(key: string) {
  const command = new PutObjectCommand({
    Bucket: R2_BUCKET_NAME,
    Key: key,
  });

  try {
    const signedUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
    return signedUrl;
  } catch (error) {
    console.error('Error generating presigned URL:', error);
    throw error;
  }
}

export async function getImageUrl(key: string) {
  return `${process.env.R2_PUBLIC_URL}/${key}`;
} 


/* 使用方法

//首先需要在html页面上获取文件 file

try {
      // 生成唯一文件名：日期_时间_随机数.扩展名
      const date = new Date();
      const dateStr = date.toISOString().split('T')[0].replace(/-/g, '');
      const timeStr = date.toTimeString().split(' ')[0].replace(/:/g, '');
      const random = Math.random().toString(36).substring(2, 8);
      const fileExt = file.name.split('.').pop();
      const uniqueFilename = `image/${dateStr}_${timeStr}_${random}.${fileExt}`;

      // 1. 获取上传 URL
      const uploadUrl = await getUploadUrl(uniqueFilename);

      // 2. 使用上传 URL 上传文件
      await fetch(uploadUrl, {
        method: 'PUT',
        headers: {
          'Content-Type': file.type,
        },
        body: file,
      });

      // 3. 设置图片 URL
      const publicUrl = `${process.env.NEXT_PUBLIC_R2_PUBLIC_URL}/${key}`;

      setImageUrl(publicUrl);
    } catch (error) {
      console.error('Upload failed:', error);
      alert('上传失败，请重试');
    } 

*/
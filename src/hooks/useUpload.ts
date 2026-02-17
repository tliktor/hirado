import { useState, useCallback, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { uploadData } from 'aws-amplify/storage';
import { fetchAuthSession } from 'aws-amplify/auth';
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '../../amplify/data/resource';
import type { UploadingFile } from '../types';

const client = generateClient<Schema>();

export function useUpload(onComplete?: () => void) {
  const [files, setFiles] = useState<UploadingFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  // Cleanup object URLs on unmount
  useEffect(() => {
    return () => {
      files.forEach(file => URL.revokeObjectURL(file.preview));
    };
  }, [files]);

  const addFiles = useCallback((acceptedFiles: File[]) => {
    const newFiles: UploadingFile[] = acceptedFiles.map((file) => ({
      id: uuidv4(),
      file,
      preview: URL.createObjectURL(file),
      progress: 0,
      status: 'pending' as const,
    }));
    setFiles((prev) => [...prev, ...newFiles]);
  }, []);

  const removeFile = useCallback((id: string) => {
    setFiles((prev) => {
      const file = prev.find((f) => f.id === id);
      if (file) URL.revokeObjectURL(file.preview);
      return prev.filter((f) => f.id !== id);
    });
  }, []);

  const uploadFiles = useCallback(
    async (albumId: string, caption: string, tags: string[]) => {
      setIsUploading(true);
      const pending = files.filter((f) => f.status === 'pending');

      try {
        const session = await fetchAuthSession();
        const identityId = session.identityId;

        for (const file of pending) {
          setFiles((prev) =>
            prev.map((f) => (f.id === file.id ? { ...f, status: 'uploading' as const } : f))
          );

          const photoId = uuidv4();
          const ext = file.file.name.split('.').pop() || 'jpg';
          const isVideo = file.file.type.startsWith('video/');
          const prefix = isVideo ? 'videos' : 'photos';
          const s3Key = `${prefix}/${identityId}/${photoId}.${ext}`;

          await uploadData({
            path: s3Key,
            data: file.file,
            options: {
              contentType: file.file.type,
              onProgress: ({ transferredBytes, totalBytes }) => {
                if (totalBytes) {
                  const progress = Math.round((transferredBytes / totalBytes) * 100);
                  setFiles((prev) =>
                    prev.map((f) => (f.id === file.id ? { ...f, progress } : f))
                  );
                }
              },
            },
          }).result;

          let dimensions = { width: 0, height: 0 };
          let duration = 0;

          if (isVideo) {
            const videoDims = await getVideoDimensions(file.preview);
            dimensions = { width: videoDims.width, height: videoDims.height };
            duration = videoDims.duration;
          } else {
            dimensions = await getImageDimensions(file.preview);
          }

          await client.models.Photo.create({
            albumId,
            s3Key,
            thumbnailKey: s3Key.replace(/^(photos|videos)\//, 'thumbnails/'),
            originalFilename: file.file.name,
            caption,
            tags,
            source: 'web',
            mediaType: isVideo ? 'video' : 'image',
            width: dimensions.width,
            height: dimensions.height,
            fileSize: file.file.size,
            duration: isVideo ? duration : undefined,
          });

          setFiles((prev) =>
            prev.map((f) =>
              f.id === file.id ? { ...f, status: 'done' as const, progress: 100 } : f
            )
          );
        }

        onComplete?.();
      } catch (error) {
        console.error('Upload error:', error);
        setFiles((prev) =>
          prev.map((f) =>
            f.status === 'uploading' ? { ...f, status: 'error' as const } : f
          )
        );
      } finally {
        setIsUploading(false);
      }
    },
    [files, onComplete]
  );

  const clearDone = useCallback(() => {
    setFiles((prev) => {
      prev.filter((f) => f.status === 'done').forEach((f) => URL.revokeObjectURL(f.preview));
      return prev.filter((f) => f.status !== 'done');
    });
  }, []);

  return { files, isUploading, addFiles, removeFile, uploadFiles, clearDone };
}

function getImageDimensions(src: string): Promise<{ width: number; height: number }> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve({ width: img.naturalWidth, height: img.naturalHeight });
    img.onerror = () => resolve({ width: 0, height: 0 });
    img.src = src;
  });
}

function getVideoDimensions(src: string): Promise<{ width: number; height: number; duration: number }> {
  return new Promise((resolve) => {
    const video = document.createElement('video');
    video.onloadedmetadata = () => {
      resolve({
        width: video.videoWidth,
        height: video.videoHeight,
        duration: Math.round(video.duration),
      });
    };
    video.onerror = () => resolve({ width: 0, height: 0, duration: 0 });
    video.src = src;
  });
}

export interface Photo {
  id: string;
  userId: string;
  albumId: string;
  s3Key: string;
  thumbnailKey: string;
  originalFilename: string;
  caption: string;
  tags: string[];
  source: 'viber' | 'web';
  mediaType?: 'image' | 'video';
  width: number;
  height: number;
  fileSize: number;
  duration?: number; // Video duration in seconds
  createdAt: string;
  url: string;
  thumbnailUrl: string;
}

export interface Album {
  id: string;
  userId: string;
  name: string;
  description: string;
  coverPhotoId: string;
  photoCount: number;
  createdAt: string;
}

export interface ShareLink {
  id: string;
  albumId: string;
  createdBy: string;
  expiresAt: string | null;
  viewCount: number;
  createdAt: string;
}

export interface UploadingFile {
  id: string;
  file: File;
  preview: string;
  progress: number;
  status: 'pending' | 'uploading' | 'done' | 'error';
}

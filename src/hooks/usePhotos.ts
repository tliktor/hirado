import { useMemo, useState, useCallback, useEffect } from 'react';
import { generateClient } from 'aws-amplify/data';
import { getUrl } from 'aws-amplify/storage';
import type { Schema } from '../../amplify/data/resource';
import type { Photo, Album } from '../types';

type SortOrder = 'newest' | 'oldest';
type SourceFilter = 'all' | 'viber' | 'web';

const client = generateClient<Schema>();

async function resolvePhotoUrls(
  p: Schema['Photo']['type']
): Promise<Photo> {
  const s3Key = p.s3Key;
  const thumbnailKey = p.thumbnailKey || s3Key;

  let url = '';
  let thumbnailUrl = '';

  try {
    const [urlResult, thumbResult] = await Promise.all([
      getUrl({ path: s3Key }),
      getUrl({ path: thumbnailKey }),
    ]);
    url = urlResult.url.toString();
    thumbnailUrl = thumbResult.url.toString();
  } catch {
    // URLs will remain empty if storage isn't configured yet
  }

  return {
    id: p.id,
    userId: p.owner || '',
    albumId: p.albumId || '',
    s3Key,
    thumbnailKey,
    originalFilename: p.originalFilename || '',
    caption: p.caption || '',
    tags: ((p.tags || []) as (string | null)[]).filter((t): t is string => t !== null),
    source: (p.source as 'viber' | 'web') || 'web',
    mediaType: (p.mediaType as 'image' | 'video') || 'image',
    width: p.width || 0,
    height: p.height || 0,
    fileSize: p.fileSize || 0,
    duration: p.duration || undefined,
    createdAt: p.createdAt,
    url,
    thumbnailUrl,
  };
}

export function usePhotos(albumId?: string) {
  const [sourceFilter, setSourceFilter] = useState<SourceFilter>('all');
  const [sortOrder, setSortOrder] = useState<SortOrder>('newest');
  const [searchQuery, setSearchQuery] = useState('');
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [albums, setAlbums] = useState<Album[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [photosResult, albumsResult] = await Promise.all([
        client.models.Photo.list(),
        client.models.Album.list(),
      ]);

      const photosWithUrls = await Promise.all(
        (photosResult.data || []).map(resolvePhotoUrls)
      );
      setPhotos(photosWithUrls);

      setAlbums(
        (albumsResult.data || []).map((a) => ({
          id: a.id,
          userId: a.owner || '',
          name: a.name,
          description: a.description || '',
          coverPhotoId: a.coverPhotoId || '',
          photoCount: a.photoCount || 0,
          createdAt: a.createdAt,
        }))
      );
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const filtered = useMemo(() => {
    let result = photos;

    if (albumId) {
      result = result.filter((p) => p.albumId === albumId);
    }

    if (sourceFilter !== 'all') {
      result = result.filter((p) => p.source === sourceFilter);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.caption.toLowerCase().includes(q) ||
          p.tags.some((t) => t.toLowerCase().includes(q)) ||
          p.originalFilename.toLowerCase().includes(q)
      );
    }

    result.sort((a, b) => {
      const da = new Date(a.createdAt).getTime();
      const db = new Date(b.createdAt).getTime();
      return sortOrder === 'newest' ? db - da : da - db;
    });

    return result;
  }, [photos, albumId, sourceFilter, sortOrder, searchQuery]);

  const stats = useMemo(
    () => ({
      total: photos.length,
      viber: photos.filter((p) => p.source === 'viber').length,
      web: photos.filter((p) => p.source === 'web').length,
      albums: albums.length,
    }),
    [photos, albums]
  );

  return {
    photos: filtered,
    allPhotos: photos,
    albums,
    stats,
    loading,
    sourceFilter,
    setSourceFilter,
    sortOrder,
    setSortOrder,
    searchQuery,
    setSearchQuery,
    refetch: fetchData,
  };
}

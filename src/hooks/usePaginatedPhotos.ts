import { useMemo, useState, useCallback, useEffect } from 'react';
import { generateClient } from 'aws-amplify/data';
import { getUrl } from 'aws-amplify/storage';
import type { Schema } from '../../amplify/data/resource';
import type { Photo, Album } from '../types';
import { useInfiniteScroll } from './useInfiniteScroll';

type SortOrder = 'newest' | 'oldest';
type SourceFilter = 'all' | 'viber' | 'web';

const client = generateClient<Schema>();
const PAGE_SIZE = 20;

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

export function usePaginatedPhotos(albumId?: string) {
  const [sourceFilter, setSourceFilter] = useState<SourceFilter>('all');
  const [sortOrder, setSortOrder] = useState<SortOrder>('newest');
  const [searchQuery, setSearchQuery] = useState('');
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [albums, setAlbums] = useState<Album[]>([]);
  const [loading, setLoading] = useState(true);
  const [nextToken, setNextToken] = useState<string | null | undefined>(null);
  const [hasMore, setHasMore] = useState(true);

  const fetchInitialData = useCallback(async () => {
    setLoading(true);
    setPhotos([]);
    setNextToken(null);
    setHasMore(true);
    
    try {
      const [photosResult, albumsResult] = await Promise.all([
        client.models.Photo.list({ limit: PAGE_SIZE }),
        client.models.Album.list(),
      ]);

      const photosWithUrls = await Promise.all(
        (photosResult.data || []).map(resolvePhotoUrls)
      );
      setPhotos(photosWithUrls);
      setNextToken(photosResult.nextToken);

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
      
      if (!photosResult.nextToken) {
        setHasMore(false);
      }
    } catch (error) {
      console.error('Error fetching initial data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchMore = useCallback(async () => {
    if (!nextToken || !hasMore) return null;
    
    try {
      const photosResult = await client.models.Photo.list({
        limit: PAGE_SIZE,
        nextToken,
      });

      const newPhotos = await Promise.all(
        (photosResult.data || []).map(resolvePhotoUrls)
      );
      
      setPhotos(prev => [...prev, ...newPhotos]);
      setNextToken(photosResult.nextToken);
      
      if (!photosResult.nextToken) {
        setHasMore(false);
      }
      
      return newPhotos;
    } catch (error) {
      console.error('Error fetching more photos:', error);
      return null;
    }
  }, [nextToken, hasMore]);

  const { sentinelRef, isLoading: isLoadingMore } = useInfiniteScroll(fetchMore, {
    enabled: hasMore && !loading,
  });

  useEffect(() => {
    fetchInitialData();
  }, [fetchInitialData]);

  const filtered = useMemo(() => {
    let result = photos;

    if (albumId) {
      result = result.filter((p) => p.albumId === albumId);
    }

    if (sourceFilter !== 'all') {
      result = result.filter((p) => p.source === sourceFilter);
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.caption?.toLowerCase().includes(query) ||
          p.originalFilename?.toLowerCase().includes(query) ||
          p.tags.some((tag) => tag.toLowerCase().includes(query))
      );
    }

    result = [...result].sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
    });

    return result;
  }, [photos, albumId, sourceFilter, searchQuery, sortOrder]);

  const stats = useMemo(() => {
    const total = photos.length;
    const viberCount = photos.filter((p) => p.source === 'viber').length;
    const webCount = photos.filter((p) => p.source === 'web').length;
    const imageCount = photos.filter((p) => p.mediaType === 'image').length;
    const videoCount = photos.filter((p) => p.mediaType === 'video').length;

    return {
      total,
      viberCount,
      webCount,
      imageCount,
      videoCount,
    };
  }, [photos]);

  return {
    photos: filtered,
    albums,
    stats,
    loading,
    isLoadingMore,
    sourceFilter,
    setSourceFilter,
    sortOrder,
    setSortOrder,
    searchQuery,
    setSearchQuery,
    sentinelRef,
    hasMore,
    refetch: fetchInitialData,
  };
}

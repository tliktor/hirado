import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Camera, Eye, Loader2 } from 'lucide-react';
import PhotoGrid from '../components/PhotoGrid';
import { generateClient } from 'aws-amplify/data';
import { getUrl } from 'aws-amplify/storage';
import type { Schema } from '../../amplify/data/resource';
import type { Photo, Album, ShareLink } from '../types';

const publicClient = generateClient<Schema>({ authMode: 'apiKey' });

export default function SharedGallery() {
  const { id } = useParams<{ id: string }>();
  const [shareLink, setShareLink] = useState<ShareLink | null>(null);
  const [album, setAlbum] = useState<Album | null>(null);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadSharedData() {
      try {
        // Find the share link
        const { data: shareLinks } = await publicClient.models.ShareLink.list({
          filter: { id: { eq: id } },
        });
        const link = shareLinks?.[0];
        if (!link) {
          setLoading(false);
          return;
        }
        setShareLink({
          id: link.id,
          albumId: link.albumId,
          createdBy: link.createdBy || '',
          expiresAt: link.expiresAt || null,
          viewCount: link.viewCount || 0,
          createdAt: link.createdAt,
        });

        // Find the album
        const { data: albumData } = await publicClient.models.Album.get({ id: link.albumId });
        if (!albumData) {
          setLoading(false);
          return;
        }
        setAlbum({
          id: albumData.id,
          userId: albumData.owner || '',
          name: albumData.name,
          description: albumData.description || '',
          coverPhotoId: albumData.coverPhotoId || '',
          photoCount: albumData.photoCount || 0,
          createdAt: albumData.createdAt,
        });

        // Get photos for this album
        const { data: photosData } = await publicClient.models.Photo.list({
          filter: { albumId: { eq: link.albumId } },
        });

        const photosWithUrls = await Promise.all(
          (photosData || []).map(async (p) => {
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
              // URLs will remain empty
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
              width: p.width || 0,
              height: p.height || 0,
              fileSize: p.fileSize || 0,
              createdAt: p.createdAt,
              url,
              thumbnailUrl,
            } as Photo;
          })
        );
        setPhotos(photosWithUrls);
      } catch (error) {
        console.error('Error loading shared gallery:', error);
      } finally {
        setLoading(false);
      }
    }

    loadSharedData();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-light-bg dark:bg-dark-bg flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-vault-500" />
          <p className="text-light-muted dark:text-dark-muted mt-4">Galéria betöltése...</p>
        </div>
      </div>
    );
  }

  if (!shareLink || !album) {
    return (
      <div className="min-h-screen bg-light-bg dark:bg-dark-bg flex items-center justify-center">
        <div className="text-center">
          <Camera className="w-16 h-16 text-light-muted dark:text-dark-muted mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-light-text dark:text-dark-text mb-2">
            Galéria nem található
          </h1>
          <p className="text-light-muted dark:text-dark-muted">
            Ez a megosztási link érvénytelen vagy lejárt.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-light-bg dark:bg-dark-bg">
      {/* Minimal header */}
      <header className="border-b border-light-border dark:border-dark-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-gradient-to-br from-vault-500 to-vault-700 text-white">
                <Camera className="w-4 h-4" />
              </div>
              <span className="text-sm font-medium text-light-muted dark:text-dark-muted">
                PhotoVault
              </span>
            </div>
            <div className="flex items-center gap-1 text-xs text-light-muted dark:text-dark-muted">
              <Eye className="w-3 h-3" />
              {shareLink.viewCount} megtekintés
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
          <h1 className="text-3xl sm:text-4xl font-bold text-light-text dark:text-dark-text mb-2">
            {album.name}
          </h1>
          <p className="text-light-muted dark:text-dark-muted">{album.description}</p>
          <p className="text-sm text-light-muted dark:text-dark-muted mt-2">{photos.length} fotó</p>
        </motion.div>

        <PhotoGrid photos={photos} />
      </div>

      <footer className="border-t border-light-border dark:border-dark-border py-6 text-center">
        <div className="flex items-center justify-center gap-2 text-sm text-light-muted dark:text-dark-muted">
          Powered by
          <span className="font-medium bg-gradient-to-r from-vault-500 to-vault-700 bg-clip-text text-transparent">
            PhotoVault
          </span>
        </div>
      </footer>
    </div>
  );
}

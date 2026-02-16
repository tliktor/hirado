import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Upload as UploadIcon, Tag, MessageSquare, FolderOpen, Sparkles, Loader2 } from 'lucide-react';
import UploadZone from '../components/UploadZone';
import { useUpload } from '../hooks/useUpload';
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '../../amplify/data/resource';
import type { Album } from '../types';

const client = generateClient<Schema>();

export default function Upload() {
  const [albumId, setAlbumId] = useState('');
  const [caption, setCaption] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [albums, setAlbums] = useState<Album[]>([]);
  const [albumsLoading, setAlbumsLoading] = useState(true);

  const { files, isUploading, addFiles, removeFile, uploadFiles, clearDone } = useUpload();

  useEffect(() => {
    client.models.Album.list().then(({ data }) => {
      const mapped = (data || []).map((a) => ({
        id: a.id,
        userId: a.owner || '',
        name: a.name,
        description: a.description || '',
        coverPhotoId: a.coverPhotoId || '',
        photoCount: a.photoCount || 0,
        createdAt: a.createdAt,
      }));
      setAlbums(mapped);
      if (mapped.length > 0 && !albumId) {
        setAlbumId(mapped[0].id);
      }
      setAlbumsLoading(false);
    });
  }, []);

  const handleUpload = () => {
    const tags = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);
    uploadFiles(albumId, caption, tags);
  };

  const pendingCount = files.filter((f) => f.status === 'pending').length;
  const doneCount = files.filter((f) => f.status === 'done').length;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 rounded-xl bg-vault-500/10">
            <UploadIcon className="w-6 h-6 text-vault-500" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-light-text dark:text-dark-text">
            Fotók feltöltése
          </h1>
        </div>
        <p className="text-light-muted dark:text-dark-muted mb-8">
          Húzd ide a fotóidat, vagy kattints a feltöltéshez
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <UploadZone
          files={files}
          isUploading={isUploading}
          onDrop={addFiles}
          onRemove={removeFile}
        />
      </motion.div>

      {/* Upload form */}
      {files.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-8 space-y-4"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Album selector */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-light-text dark:text-dark-text mb-2">
                <FolderOpen className="w-4 h-4" />
                Album
              </label>
              {albumsLoading ? (
                <div className="flex items-center gap-2 py-2.5 px-4 text-sm text-light-muted dark:text-dark-muted">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Albumok betöltése...
                </div>
              ) : (
                <select
                  value={albumId}
                  onChange={(e) => setAlbumId(e.target.value)}
                  className="w-full py-2.5 px-4 rounded-xl border border-light-border dark:border-dark-border bg-light-card dark:bg-dark-card text-light-text dark:text-dark-text text-sm focus:outline-none focus:ring-2 focus:ring-vault-500/50"
                >
                  {albums.map((album) => (
                    <option key={album.id} value={album.id}>
                      {album.name}
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Caption */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-light-text dark:text-dark-text mb-2">
                <MessageSquare className="w-4 h-4" />
                Leírás
              </label>
              <input
                type="text"
                placeholder="Add meg a fotók leírását..."
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                className="w-full py-2.5 px-4 rounded-xl border border-light-border dark:border-dark-border bg-light-card dark:bg-dark-card text-light-text dark:text-dark-text text-sm focus:outline-none focus:ring-2 focus:ring-vault-500/50"
              />
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-light-text dark:text-dark-text mb-2">
              <Tag className="w-4 h-4" />
              Címkék
            </label>
            <input
              type="text"
              placeholder="Címkék vesszővel elválasztva (pl: nyár, buli, barátok)"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              className="w-full py-2.5 px-4 rounded-xl border border-light-border dark:border-dark-border bg-light-card dark:bg-dark-card text-light-text dark:text-dark-text text-sm focus:outline-none focus:ring-2 focus:ring-vault-500/50"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center gap-4 pt-2">
            <button
              onClick={handleUpload}
              disabled={pendingCount === 0 || isUploading}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-vault-500 to-vault-700 text-white rounded-xl font-medium hover:shadow-lg hover:shadow-vault-500/25 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              <Sparkles className="w-4 h-4" />
              Feltöltés ({pendingCount} fotó)
            </button>
            {doneCount > 0 && (
              <button
                onClick={clearDone}
                className="px-4 py-3 text-sm text-light-muted dark:text-dark-muted hover:text-light-text dark:hover:text-dark-text transition-colors"
              >
                Kész fotók eltávolítása
              </button>
            )}
          </div>
        </motion.div>
      )}
    </div>
  );
}

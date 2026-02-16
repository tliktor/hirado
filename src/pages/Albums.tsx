import { motion } from 'framer-motion';
import { FolderOpen, Plus, Loader2 } from 'lucide-react';
import AlbumCard from '../components/AlbumCard';
import { usePhotos } from '../hooks/usePhotos';

export default function Albums() {
  const { albums, allPhotos, loading } = usePhotos();

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <Loader2 className="w-8 h-8 animate-spin mx-auto text-vault-500" />
        <p className="text-light-muted dark:text-dark-muted mt-4">Albumok betöltése...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-8"
      >
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-xl bg-emerald-500/10">
              <FolderOpen className="w-6 h-6 text-emerald-500" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-light-text dark:text-dark-text">
              Albumok
            </h1>
          </div>
          <p className="text-light-muted dark:text-dark-muted">
            {albums.length} album, {allPhotos.length} fotó összesen
          </p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-vault-500 to-vault-700 text-white rounded-xl text-sm font-medium hover:shadow-lg hover:shadow-vault-500/25 transition-all">
          <Plus className="w-4 h-4" />
          Új album
        </button>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {albums.map((album, index) => {
          const coverPhoto = allPhotos.find((p) => p.id === album.coverPhotoId);
          return (
            <AlbumCard key={album.id} album={album} coverPhoto={coverPhoto} index={index} />
          );
        })}
      </div>
    </div>
  );
}

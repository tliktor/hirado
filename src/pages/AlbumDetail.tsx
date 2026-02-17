import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Images, Loader2 } from 'lucide-react';
import PhotoGrid from '../components/PhotoGrid';
import { usePhotos } from '../hooks/usePhotos';

export default function AlbumDetail() {
  const { id } = useParams<{ id: string }>();
  const { photos, albums, loading } = usePhotos(id);
  const album = albums.find((a) => a.id === id);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <Loader2 className="w-8 h-8 animate-spin mx-auto text-vault-500" />
        <p className="text-light-muted dark:text-dark-muted mt-4">Album betöltése...</p>
      </div>
    );
  }

  if (!album) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <p className="text-light-muted dark:text-dark-muted text-lg">Album nem található</p>
        <Link to="/albums" className="text-vault-500 hover:text-vault-600 mt-4 inline-block">
          Vissza az albumokhoz
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Back + Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <Link
          to="/albums"
          className="inline-flex items-center gap-2 text-sm text-light-muted dark:text-dark-muted hover:text-light-text dark:hover:text-dark-text mb-4 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Vissza az albumokhoz
        </Link>

        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-light-text dark:text-dark-text">
            {album.name}
          </h1>
          <p className="text-light-muted dark:text-dark-muted mt-1">{album.description}</p>
          <div className="flex items-center gap-2 mt-2 text-sm text-light-muted dark:text-dark-muted">
            <Images className="w-4 h-4" />
            {photos.length} fotó
          </div>
        </div>
      </motion.div>

      <PhotoGrid photos={photos} />
    </div>
  );
}

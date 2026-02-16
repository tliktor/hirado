import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Images } from 'lucide-react';
import type { Album, Photo } from '../types';

interface AlbumCardProps {
  album: Album;
  coverPhoto?: Photo;
  index: number;
}

export default function AlbumCard({ album, coverPhoto, index }: AlbumCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
    >
      <Link
        to={`/albums/${album.id}`}
        className="group block overflow-hidden rounded-2xl bg-light-card dark:bg-dark-card shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
      >
        <div className="relative aspect-[4/3] overflow-hidden">
          {coverPhoto ? (
            <img
              src={coverPhoto.thumbnailUrl}
              alt={album.name}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full bg-light-border dark:bg-dark-border flex items-center justify-center">
              <Images className="w-12 h-12 text-light-muted dark:text-dark-muted" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-black/0" />
          <div className="absolute bottom-0 left-0 right-0 p-4">
            <h3 className="text-white text-lg font-semibold">{album.name}</h3>
            <p className="text-white/70 text-sm mt-0.5">{album.description}</p>
          </div>
          <div className="absolute top-3 right-3 px-2.5 py-1 bg-black/50 backdrop-blur-sm rounded-full text-white text-xs font-medium flex items-center gap-1">
            <Images className="w-3 h-3" />
            {album.photoCount}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

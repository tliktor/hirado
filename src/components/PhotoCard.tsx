import { motion } from 'framer-motion';
import { Smartphone, Globe } from 'lucide-react';
import type { Photo } from '../types';

interface PhotoCardProps {
  photo: Photo;
  onClick: () => void;
  index: number;
}

export default function PhotoCard({ photo, onClick, index }: PhotoCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      className="group cursor-pointer relative overflow-hidden rounded-xl bg-light-card dark:bg-dark-card shadow-sm hover:shadow-xl transition-shadow duration-300"
      onClick={onClick}
    >
      <div className="overflow-hidden">
        <img
          src={photo.thumbnailUrl}
          alt={photo.caption}
          loading="lazy"
          className="w-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
          style={{ aspectRatio: `${photo.width}/${photo.height}` }}
        />
      </div>

      {/* Hover overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/0 to-black/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
        <p className="text-white text-sm font-medium truncate">{photo.caption}</p>
        <div className="flex items-center gap-2 mt-1">
          <div className="flex items-center gap-1 text-white/70 text-xs">
            {photo.source === 'viber' ? (
              <Smartphone className="w-3 h-3" />
            ) : (
              <Globe className="w-3 h-3" />
            )}
            <span>{photo.source === 'viber' ? 'Viber' : 'Web'}</span>
          </div>
          {photo.tags.length > 0 && (
            <span className="text-white/50 text-xs">
              #{photo.tags[0]}
            </span>
          )}
        </div>
      </div>

      {/* Source badge */}
      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <div
          className={`px-2 py-1 rounded-full text-xs font-medium backdrop-blur-sm ${
            photo.source === 'viber'
              ? 'bg-purple-500/80 text-white'
              : 'bg-blue-500/80 text-white'
          }`}
        >
          {photo.source === 'viber' ? 'Viber' : 'Web'}
        </div>
      </div>
    </motion.div>
  );
}

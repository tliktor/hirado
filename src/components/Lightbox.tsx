import { useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, Calendar, HardDrive, Tag, Smartphone, Globe } from 'lucide-react';
import { format } from 'date-fns';
import { hu } from 'date-fns/locale';
import type { Photo } from '../types';

interface LightboxProps {
  photos: Photo[];
  currentIndex: number;
  onClose: () => void;
  onNavigate: (index: number) => void;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function Lightbox({ photos, currentIndex, onClose, onNavigate }: LightboxProps) {
  const photo = photos[currentIndex];
  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex < photos.length - 1;

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft' && hasPrev) onNavigate(currentIndex - 1);
      if (e.key === 'ArrowRight' && hasNext) onNavigate(currentIndex + 1);
    },
    [onClose, onNavigate, currentIndex, hasPrev, hasNext]
  );

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [handleKeyDown]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-sm flex items-center justify-center"
      onClick={onClose}
    >
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
      >
        <X className="w-6 h-6" />
      </button>

      {/* Navigation */}
      {hasPrev && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onNavigate(currentIndex - 1);
          }}
          className="absolute left-4 z-10 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
      )}
      {hasNext && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onNavigate(currentIndex + 1);
          }}
          className="absolute right-4 z-10 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      )}

      {/* Image */}
      <div
        className="flex flex-col items-center max-w-[90vw] max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <AnimatePresence mode="wait">
          <motion.img
            key={photo.id}
            src={photo.url}
            alt={photo.caption}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="max-h-[75vh] max-w-full object-contain rounded-lg"
          />
        </AnimatePresence>

        {/* Info bar */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mt-4 px-6 py-3 bg-white/10 backdrop-blur-sm rounded-xl text-white max-w-2xl w-full"
        >
          <p className="font-medium text-lg mb-2">{photo.caption}</p>
          <div className="flex flex-wrap gap-4 text-sm text-white/70">
            <div className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              {format(new Date(photo.createdAt), 'yyyy. MMM d. HH:mm', { locale: hu })}
            </div>
            <div className="flex items-center gap-1">
              <HardDrive className="w-4 h-4" />
              {formatFileSize(photo.fileSize)}
            </div>
            <div className="flex items-center gap-1">
              {photo.source === 'viber' ? <Smartphone className="w-4 h-4" /> : <Globe className="w-4 h-4" />}
              {photo.source === 'viber' ? 'Viber' : 'Web'}
            </div>
            <div className="flex items-center gap-1">
              {photo.width} x {photo.height}
            </div>
          </div>
          {photo.tags.length > 0 && (
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              <Tag className="w-4 h-4 text-white/50" />
              {photo.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-2 py-0.5 bg-white/10 rounded-full text-xs text-white/80"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
          <div className="text-xs text-white/40 mt-2">
            {currentIndex + 1} / {photos.length}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}

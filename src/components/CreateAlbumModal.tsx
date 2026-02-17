import { useState } from 'react';
import { motion } from 'framer-motion';
import { X, FolderPlus, Loader2 } from 'lucide-react';
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '../../amplify/data/resource';

const client = generateClient<Schema>();

interface CreateAlbumModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export default function CreateAlbumModal({ onClose, onSuccess }: CreateAlbumModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Az album neve kötelező');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await client.models.Album.create({
        name: name.trim(),
        description: description.trim() || undefined,
        photoCount: 0,
      });
      onSuccess();
      onClose();
    } catch (err) {
      console.error('Error creating album:', err);
      setError('Hiba történt az album létrehozása során');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="bg-light-surface dark:bg-dark-card rounded-2xl p-6 max-w-md w-full shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-emerald-500/10">
              <FolderPlus className="w-5 h-5 text-emerald-500" />
            </div>
            <h3 className="text-lg font-semibold text-light-text dark:text-dark-text">
              Új album létrehozása
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-light-border dark:hover:bg-dark-border transition-colors"
            disabled={loading}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="album-name"
              className="block text-sm font-medium text-light-text dark:text-dark-text mb-1"
            >
              Album neve *
            </label>
            <input
              id="album-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2.5 bg-light-bg dark:bg-dark-bg border border-light-border dark:border-dark-border rounded-xl text-light-text dark:text-dark-text focus:outline-none focus:ring-2 focus:ring-vault-500"
              placeholder="pl. Nyaralás 2024"
              disabled={loading}
              autoFocus
            />
          </div>

          <div>
            <label
              htmlFor="album-description"
              className="block text-sm font-medium text-light-text dark:text-dark-text mb-1"
            >
              Leírás (opcionális)
            </label>
            <textarea
              id="album-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-2.5 bg-light-bg dark:bg-dark-bg border border-light-border dark:border-dark-border rounded-xl text-light-text dark:text-dark-text focus:outline-none focus:ring-2 focus:ring-vault-500 resize-none"
              placeholder="Néhány szó az albumról..."
              rows={3}
              disabled={loading}
            />
          </div>

          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-sm text-red-600 dark:text-red-400">
              {error}
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 bg-light-border dark:bg-dark-border text-light-text dark:text-dark-text rounded-xl font-medium hover:bg-light-border/80 dark:hover:bg-dark-border/80 transition-colors"
              disabled={loading}
            >
              Mégse
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2.5 bg-gradient-to-r from-vault-500 to-vault-700 text-white rounded-xl font-medium hover:shadow-lg hover:shadow-vault-500/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              disabled={loading || !name.trim()}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Létrehozás...
                </>
              ) : (
                'Létrehozás'
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}

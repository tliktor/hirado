import { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Copy, Check, Link as LinkIcon, QrCode } from 'lucide-react';

interface ShareModalProps {
  albumName: string;
  shareId: string;
  onClose: () => void;
}

export default function ShareModal({ albumName, shareId, onClose }: ShareModalProps) {
  const [copied, setCopied] = useState(false);
  const shareUrl = `${window.location.origin}/share/${shareId}`;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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
          <h3 className="text-lg font-semibold text-light-text dark:text-dark-text">
            Album megosztása
          </h3>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-light-border dark:hover:bg-dark-border transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-sm text-light-muted dark:text-dark-muted mb-4">
          Oszd meg a(z) <strong className="text-light-text dark:text-dark-text">{albumName}</strong>{' '}
          albumot ezzel a linkkel:
        </p>

        {/* Share link */}
        <div className="flex items-center gap-2 mb-6">
          <div className="flex-1 flex items-center gap-2 px-4 py-3 bg-light-bg dark:bg-dark-bg rounded-xl border border-light-border dark:border-dark-border">
            <LinkIcon className="w-4 h-4 text-light-muted dark:text-dark-muted shrink-0" />
            <span className="text-sm truncate text-light-text dark:text-dark-text">{shareUrl}</span>
          </div>
          <button
            onClick={handleCopy}
            className={`p-3 rounded-xl transition-all ${
              copied
                ? 'bg-green-500 text-white'
                : 'bg-vault-500 hover:bg-vault-600 text-white'
            }`}
          >
            {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
          </button>
        </div>

        {/* QR Code placeholder */}
        <div className="flex flex-col items-center p-6 bg-light-bg dark:bg-dark-bg rounded-xl border border-light-border dark:border-dark-border">
          <QrCode className="w-24 h-24 text-light-muted dark:text-dark-muted mb-3" />
          <p className="text-xs text-light-muted dark:text-dark-muted">
            QR kód a megosztáshoz
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
}

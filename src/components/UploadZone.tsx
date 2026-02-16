import { useDropzone } from 'react-dropzone';
import { motion } from 'framer-motion';
import { Upload, X, CheckCircle, Loader2, Image } from 'lucide-react';
import type { UploadingFile } from '../types';

interface UploadZoneProps {
  files: UploadingFile[];
  isUploading: boolean;
  onDrop: (files: File[]) => void;
  onRemove: (id: string) => void;
}

export default function UploadZone({ files, isUploading, onDrop, onRemove }: UploadZoneProps) {
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.jpg', '.jpeg', '.png', '.webp', '.gif'] },
    disabled: isUploading,
  });

  return (
    <div className="space-y-6">
      {/* Dropzone */}
      <div
        {...getRootProps()}
        className={`relative border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all duration-300 ${
          isDragActive
            ? 'border-vault-500 bg-vault-500/10 scale-[1.02]'
            : 'border-light-border dark:border-dark-border hover:border-vault-400 hover:bg-vault-500/5'
        } ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <input {...getInputProps()} />
        <motion.div
          animate={isDragActive ? { scale: 1.1 } : { scale: 1 }}
          className="flex flex-col items-center gap-4"
        >
          <div className="p-4 rounded-full bg-vault-500/10">
            <Upload className="w-8 h-8 text-vault-500" />
          </div>
          <div>
            <p className="text-lg font-medium text-light-text dark:text-dark-text">
              {isDragActive ? 'Engedd el a fotókat!' : 'Húzd ide a fotókat'}
            </p>
            <p className="text-sm text-light-muted dark:text-dark-muted mt-1">
              vagy kattints a böngészéshez (JPG, PNG, WebP, GIF)
            </p>
          </div>
        </motion.div>
      </div>

      {/* File previews */}
      {files.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {files.map((file) => (
            <motion.div
              key={file.id}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="relative group rounded-xl overflow-hidden bg-light-card dark:bg-dark-card"
            >
              <div className="aspect-square">
                <img
                  src={file.preview}
                  alt={file.file.name}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Progress overlay */}
              {file.status === 'uploading' && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <div className="text-center text-white">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto" />
                    <span className="text-sm mt-1 block">{file.progress}%</span>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/30">
                    <motion.div
                      className="h-full bg-vault-500"
                      initial={{ width: 0 }}
                      animate={{ width: `${file.progress}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Done overlay */}
              {file.status === 'done' && (
                <div className="absolute inset-0 bg-green-500/20 flex items-center justify-center">
                  <CheckCircle className="w-8 h-8 text-green-500" />
                </div>
              )}

              {/* Remove button */}
              {file.status === 'pending' && (
                <button
                  onClick={() => onRemove(file.id)}
                  className="absolute top-1 right-1 p-1 rounded-full bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/70"
                >
                  <X className="w-4 h-4" />
                </button>
              )}

              {/* Filename */}
              <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/60 to-transparent">
                <div className="flex items-center gap-1 text-white text-xs truncate">
                  <Image className="w-3 h-3 shrink-0" />
                  <span className="truncate">{file.file.name}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

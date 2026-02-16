import { motion } from 'framer-motion';
import { Images, Smartphone, Globe, FolderOpen, Search, SlidersHorizontal, Loader2 } from 'lucide-react';
import PhotoGrid from '../components/PhotoGrid';
import { usePhotos } from '../hooks/usePhotos';

export default function Gallery() {
  const {
    photos,
    stats,
    loading,
    sourceFilter,
    setSourceFilter,
    sortOrder,
    setSortOrder,
    searchQuery,
    setSearchQuery,
  } = usePhotos();

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <Loader2 className="w-8 h-8 animate-spin mx-auto text-vault-500" />
        <p className="text-light-muted dark:text-dark-muted mt-4">Fotók betöltése...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl sm:text-4xl font-bold text-light-text dark:text-dark-text mb-2">
          A te{' '}
          <span className="bg-gradient-to-r from-vault-500 to-vault-700 bg-clip-text text-transparent">
            PhotoVault
          </span>
          -od
        </h1>
        <p className="text-light-muted dark:text-dark-muted">
          Minden fotód egy helyen, gyönyörűen rendezve.
        </p>
      </motion.div>

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8"
      >
        {[
          { icon: Images, label: 'Összes fotó', value: stats.total, color: 'text-vault-500' },
          { icon: Smartphone, label: 'Viber-ről', value: stats.viber, color: 'text-purple-500' },
          { icon: Globe, label: 'Webes', value: stats.web, color: 'text-blue-500' },
          { icon: FolderOpen, label: 'Albumok', value: stats.albums, color: 'text-emerald-500' },
        ].map(({ icon: Icon, label, value, color }) => (
          <div
            key={label}
            className="bg-light-card dark:bg-dark-card rounded-xl p-4 border border-light-border dark:border-dark-border"
          >
            <Icon className={`w-5 h-5 ${color} mb-2`} />
            <div className="text-2xl font-bold text-light-text dark:text-dark-text">{value}</div>
            <div className="text-xs text-light-muted dark:text-dark-muted">{label}</div>
          </div>
        ))}
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 mb-8"
      >
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-light-muted dark:text-dark-muted" />
          <input
            type="text"
            placeholder="Keresés caption, tag vagy fájlnév alapján..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-light-border dark:border-dark-border bg-light-card dark:bg-dark-card text-light-text dark:text-dark-text text-sm focus:outline-none focus:ring-2 focus:ring-vault-500/50 focus:border-vault-500"
          />
        </div>

        {/* Source filter */}
        <div className="flex items-center gap-1 bg-light-card dark:bg-dark-card rounded-xl border border-light-border dark:border-dark-border p-1">
          {(['all', 'viber', 'web'] as const).map((filter) => (
            <button
              key={filter}
              onClick={() => setSourceFilter(filter)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                sourceFilter === filter
                  ? 'bg-vault-500 text-white'
                  : 'text-light-muted dark:text-dark-muted hover:text-light-text dark:hover:text-dark-text'
              }`}
            >
              {filter === 'all' ? 'Mind' : filter === 'viber' ? 'Viber' : 'Web'}
            </button>
          ))}
        </div>

        {/* Sort */}
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-light-muted dark:text-dark-muted" />
          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value as 'newest' | 'oldest')}
            className="py-2 px-3 rounded-xl border border-light-border dark:border-dark-border bg-light-card dark:bg-dark-card text-light-text dark:text-dark-text text-sm focus:outline-none focus:ring-2 focus:ring-vault-500/50"
          >
            <option value="newest">Legújabb</option>
            <option value="oldest">Legrégebbi</option>
          </select>
        </div>
      </motion.div>

      {/* Photo count */}
      <div className="mb-4 text-sm text-light-muted dark:text-dark-muted">
        {photos.length} fotó
      </div>

      {/* Grid */}
      <PhotoGrid photos={photos} />
    </div>
  );
}

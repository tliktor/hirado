import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    target: 'es2022',
    minify: 'terser',
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'aws-vendor': ['aws-amplify', '@aws-amplify/ui-react', '@aws-amplify/auth', '@aws-amplify/storage', '@aws-amplify/data'],
          'ui-vendor': ['framer-motion', 'lucide-react', 'react-dropzone'],
        },
      },
    },
  },
})

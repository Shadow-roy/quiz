import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { fileURLToPath } from 'url';

// FIX: __dirname is not available in ES modules. This manually sets it for path resolution.
const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './'),
    },
  },

  // ✅ FIX CHUNK SIZE WARNING
  build: {
    chunkSizeWarningLimit: 2000, // you can increase this more if needed
  },
});

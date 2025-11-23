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

  // Reduce the chunk warning and split vendor code automatically
  build: {
    chunkSizeWarningLimit: 2000, // raise limit (kB) to silence warning if you choose
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            // make separate chunk per package (react, lodash, etc.)
            return id.toString().split('node_modules/')[1].split('/')[0].toString();
          }
        },
      },
    },
  },
});

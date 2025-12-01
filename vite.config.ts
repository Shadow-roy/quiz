import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { fileURLToPath } from 'url';

// FIX: __dirname is not available in ES modules. This manually sets it for path resolution.
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  // Set the third parameter to '' to load all env regardless of the `VITE_` prefix.
  const env = loadEnv(mode, (process as any).cwd(), '');

  return {
    plugins: [react()],
    define: {
      // Polyfill process.env.API_KEY so it can be used in the browser code
      'process.env.API_KEY': JSON.stringify(env.API_KEY),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './'),
      },
    },
  };
});
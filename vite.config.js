import { defineConfig } from 'vite';

export default defineConfig({
  root: '.',
  base: '/quran-app/', // IMPORTANT: Change this to your repo name
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false, // Disable for production to reduce size
    minify: 'terser',
    rollupOptions: {
      output: {
        manualChunks: undefined,
        // Ensure clean file names
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]'
      }
    }
  },
  server: {
    port: 3000,
    open: true
  }
});

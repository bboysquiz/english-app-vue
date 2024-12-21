import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  server: {
    proxy: {
      '/api': {
        target: 'https://english-app-vue-backend-2.onrender.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''), // Удаляет `/api` из пути
      },
    },
  },
  build: {
    rollupOptions: {
      output: {
        assetFileNames: 'assets/[name]-[hash][extname]',
        entryFileNames: 'assets/[name]-[hash].js',
      },
    },
  },
})

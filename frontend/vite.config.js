import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// 开发环境将 /api、/uploads、/rss.xml 等代理到 Flask（端口 7200）
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': { target: 'http://localhost:7200', changeOrigin: true },
      '/uploads': { target: 'http://localhost:7200', changeOrigin: true },
      '/rss.xml': { target: 'http://localhost:7200', changeOrigin: true },
      '/sitemap.xml': { target: 'http://localhost:7200', changeOrigin: true },
    },
  },
})

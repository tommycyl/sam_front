/**
 * API：生产构建读 .env.production 中的 VITE_API_BASE_URL（见 src/utils/request.js）。
 * 本地 dev 未设置时走相对路径 /api，由下方 proxy 转发到本机后端。
 */
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'node:path'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3000,
    host: '0.0.0.0',
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
    },
  },
})

import path from 'node:path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// 本地双击版专用构建配置：不挂妙搭分层 / CDN 插件，
// 产物直接落到 standalone/app（index.html + assets 同目录），由 standalone/server.js 本地起服务。
export default defineConfig({
  plugins: [react(), tailwindcss()],
  base: '/',
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, 'src'),
    },
  },
  build: {
    outDir: 'standalone/app',
    emptyOutDir: true,
  },
});

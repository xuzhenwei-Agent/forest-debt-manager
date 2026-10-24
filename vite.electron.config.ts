import path from 'node:path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// Electron 桌面版专用构建：
// - base 用相对路径，file:// 下资源可定位；
// - 路由切 HashRouter（define 注入 VITE_ROUTER=hash，由 src/index.tsx 读取）；
// - 产物落 standalone/app，供 Electron 主进程以 file:// 加载。
export default defineConfig({
  plugins: [react(), tailwindcss()],
  base: './',
  define: {
    'import.meta.env.VITE_ROUTER': JSON.stringify('hash'),
  },
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

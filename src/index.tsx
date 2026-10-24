import { StrictMode } from 'react';
import type { ReactNode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, HashRouter } from 'react-router-dom';
import { ErrorBoundary } from 'react-error-boundary';
import { ErrorFallback } from '@/components/ErrorFallback';
import StoreProvider from '@/lib/store';
import App from './app';
import './index.css';

// Electron 桌面构建（vite.electron.config.ts）注入 VITE_ROUTER=hash，用 HashRouter 适配 file://；
// 本地开发与网页构建默认 BrowserRouter。
const useHashRouter = import.meta.env.VITE_ROUTER === 'hash';

function RootRouter({ children }: { children: ReactNode }) {
  if (useHashRouter) {
    return <HashRouter>{children}</HashRouter>;
  }
  return (
    <BrowserRouter basename={import.meta.env.MIAODA_CLIENT_BASE_PATH || '/'}>
      {children}
    </BrowserRouter>
  );
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RootRouter>
      <ErrorBoundary FallbackComponent={ErrorFallback}>
        <StoreProvider>
          <App />
        </StoreProvider>
      </ErrorBoundary>
    </RootRouter>
  </StrictMode>,
);

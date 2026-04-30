import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './utils/flexible'
import App from './App.tsx'
import AppRouter from './AppRouter'

// 开发环境下加载 eruda 调试工具
if (import.meta.env.DEV) {
  import('eruda').then((eruda) => {
    eruda.default.init();
  });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App>
      <AppRouter />
    </App>
  </StrictMode>,
);

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './utils/flexible'
import App from './App.tsx'
import AppRouter from './AppRouter'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App>
      <AppRouter />
    </App>
  </StrictMode>,
);

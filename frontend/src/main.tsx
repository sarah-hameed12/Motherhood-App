import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { BrowserRouter } from 'react-router-dom'
import App from './App.tsx'
import { AuthProvider } from './context/authContext.tsx';
import { UiContextProvider } from './context/uiContext.tsx'


createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <UiContextProvider>
          <App />
        </UiContextProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
)

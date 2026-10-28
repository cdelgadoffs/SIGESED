import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { AuthProvider } from './context/AuthContext.jsx'
import { RegistrosProvider } from './context/RegistrosContext.jsx'
import { AjustesVisualesProvider } from './context/AjustesVisualesContext.jsx'
import { UIProvider } from './context/UIContext.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <RegistrosProvider>
        <AjustesVisualesProvider>
          <UIProvider>
            <App />
          </UIProvider>
        </AjustesVisualesProvider>
      </RegistrosProvider>
    </AuthProvider>
  </StrictMode>,
)

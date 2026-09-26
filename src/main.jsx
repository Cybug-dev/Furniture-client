import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClient } from './query/queryClient.js'
import './index.scss'
import App from './App.jsx'
import { BrowserRouter } from 'react-router'
import { SimulatedNotificationsProvider } from './commerce/notifications/SimulatedNotifications.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
    <QueryClientProvider client={queryClient}>
      <SimulatedNotificationsProvider>
      <App />
      </SimulatedNotificationsProvider>
    </QueryClientProvider>
    </BrowserRouter>
  </StrictMode>,
)

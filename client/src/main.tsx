import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.tsx'
import { UsersProvider } from './contexts/UsersContext.tsx'
import { ConversationsProvider } from './contexts/ConversationsContext.tsx'


createRoot(document.getElementById('root')!).render(
  <UsersProvider>
    <ConversationsProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </ConversationsProvider>
  </UsersProvider>
)

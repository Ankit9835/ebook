import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import {HeroUIProvider} from '@heroui/react'
import { BrowserRouter } from "react-router-dom";
import './index.css'
import App from './App.tsx'
import { Provider } from 'react-redux';
import store from './store/index.ts';
import AuthProvider from './context/AuthProvider.tsx';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
    <Provider store={store}>
      <AuthProvider>
        <HeroUIProvider>
          <App />
        </HeroUIProvider>
      </AuthProvider>
    </Provider>
    </BrowserRouter>
  </StrictMode>,
)

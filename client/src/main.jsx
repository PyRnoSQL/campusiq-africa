import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import './i18n';
import './styles/index.css';
import App from './App';
import { AuthProvider } from './context/AuthContext';
import { InstitutionProvider } from './context/InstitutionContext';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <InstitutionProvider>
          <App />
        </InstitutionProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);

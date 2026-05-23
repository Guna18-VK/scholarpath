import React from 'react';
import ReactDOM from 'react-dom/client';
import './styles/global.css';
import App from './App';
import './i18n';
import { startKeepAlive } from './utils/keepAlive';

// Keep Render backend alive — prevents 30-50s cold start on free tier
startKeepAlive();

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

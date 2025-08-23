// src/main.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// make sure root element exists
let rootEl = document.getElementById('root');
if (!rootEl) {
  rootEl = document.createElement('div');
  rootEl.id = 'root';
  document.body.prepend(rootEl);
}

ReactDOM.createRoot(rootEl).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

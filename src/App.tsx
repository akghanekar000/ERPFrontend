// src/App.tsx
import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './components/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import ErrorBoundary from './components/ErrorBoundary';
import './index.css'; // ensures global safe styles (see file below)

/**
 * Try to load real pages; if import fails (file missing) we fall back
 * to an inline placeholder so the app never crashes on missing page files.
 */
const LazyHome = React.lazy(() =>
  import('./pages/Home').catch(() =>
    Promise.resolve({
      default: () => (
        <div style={{ padding: 20 }}>Home page not found — placeholder</div>
      ),
    })
  )
);

const LazyLogin = React.lazy(() =>
  import('./pages/LoginPage').catch(() =>
    Promise.resolve({
      default: () => (
        <div style={{ padding: 20 }}>Login page not found — placeholder</div>
      ),
    })
  )
);

const NotFound = () => (
  <div style={{ padding: 20 }}>
    <h2>404 — Not Found</h2>
  </div>
);

const App: React.FC = () => {
  return (
    <AuthProvider>
      <ErrorBoundary>
        <Router>
          <div
            id="app-root-container"
            style={{ minHeight: '100vh', position: 'relative' }}
          >
            <Suspense
              fallback={<div style={{ padding: 20 }}>Loading page…</div>}
            >
              <Routes>
                <Route path="/login" element={<LazyLogin />} />
                <Route
                  path="/"
                  element={
                    <ProtectedRoute>
                      <LazyHome />
                    </ProtectedRoute>
                  }
                />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </div>
        </Router>
      </ErrorBoundary>
    </AuthProvider>
  );
};

export default App;

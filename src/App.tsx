import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Authenticator } from '@aws-amplify/ui-react';
import { Suspense, lazy } from 'react';
import { ErrorBoundary } from './components/ErrorBoundary';
import Layout from './components/Layout';
import { useTheme } from './hooks/useTheme';

// Lazy load pages for code splitting
const Gallery = lazy(() => import('./pages/Gallery'));
const Upload = lazy(() => import('./pages/Upload'));
const Albums = lazy(() => import('./pages/Albums'));
const AlbumDetail = lazy(() => import('./pages/AlbumDetail'));

function LoadingFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-light-bg dark:bg-dark-bg">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-vault-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="mt-4 text-light-muted dark:text-dark-muted">Loading...</p>
      </div>
    </div>
  );
}

function AuthenticatedRoutes() {
  const { isDark, toggle } = useTheme();

  return (
    <Authenticator>
      {({ signOut, user }) => (
        <Routes>
          <Route element={<Layout isDark={isDark} toggleTheme={toggle} signOut={signOut} displayName={user?.signInDetails?.loginId} />}>
            <Route index element={
              <Suspense fallback={<LoadingFallback />}>
                <Gallery />
              </Suspense>
            } />
            <Route path="upload" element={
              <Suspense fallback={<LoadingFallback />}>
                <Upload />
              </Suspense>
            } />
            <Route path="albums" element={
              <Suspense fallback={<LoadingFallback />}>
                <Albums />
              </Suspense>
            } />
            <Route path="albums/:id" element={
              <Suspense fallback={<LoadingFallback />}>
                <AlbumDetail />
              </Suspense>
            } />
          </Route>
        </Routes>
      )}
    </Authenticator>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <Routes>
          <Route path="/*" element={<AuthenticatedRoutes />} />
        </Routes>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

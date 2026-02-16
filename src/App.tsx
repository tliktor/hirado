import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Authenticator } from '@aws-amplify/ui-react';
import Layout from './components/Layout';
import Gallery from './pages/Gallery';
import Upload from './pages/Upload';
import Albums from './pages/Albums';
import AlbumDetail from './pages/AlbumDetail';
import SharedGallery from './pages/SharedGallery';
import { useTheme } from './hooks/useTheme';

function AuthenticatedRoutes() {
  const { isDark, toggle } = useTheme();

  return (
    <Authenticator>
      {({ signOut, user }) => (
        <Routes>
          <Route element={<Layout isDark={isDark} toggleTheme={toggle} signOut={signOut} displayName={user?.signInDetails?.loginId} />}>
            <Route index element={<Gallery />} />
            <Route path="upload" element={<Upload />} />
            <Route path="albums" element={<Albums />} />
            <Route path="albums/:id" element={<AlbumDetail />} />
          </Route>
        </Routes>
      )}
    </Authenticator>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/share/:id" element={<SharedGallery />} />
        <Route path="/*" element={<AuthenticatedRoutes />} />
      </Routes>
    </BrowserRouter>
  );
}

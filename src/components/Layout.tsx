import { Outlet } from 'react-router-dom';
import Header from './Header';
import { Heart } from 'lucide-react';

interface LayoutProps {
  isDark: boolean;
  toggleTheme: () => void;
  signOut?: () => void;
  displayName?: string;
}

export default function Layout({ isDark, toggleTheme, signOut, displayName }: LayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-light-bg dark:bg-dark-bg">
      <Header isDark={isDark} toggleTheme={toggleTheme} signOut={signOut} displayName={displayName} />
      <main className="flex-1">
        <Outlet />
      </main>
      <footer className="border-t border-light-border dark:border-dark-border py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-center text-sm text-light-muted dark:text-dark-muted">
          <div className="flex items-center gap-1">
            Made with <Heart className="w-4 h-4 text-red-500 fill-red-500" /> PhotoVault
          </div>
        </div>
      </footer>
    </div>
  );
}

import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Camera, Upload, FolderOpen, Images, Menu, X, LogOut } from 'lucide-react';
import ThemeToggle from './ThemeToggle';

interface HeaderProps {
  isDark: boolean;
  toggleTheme: () => void;
  signOut?: () => void;
  displayName?: string;
}

const navLinks = [
  { to: '/', label: 'Galéria', icon: Images },
  { to: '/albums', label: 'Albumok', icon: FolderOpen },
  { to: '/upload', label: 'Feltöltés', icon: Upload },
];

export default function Header({ isDark, toggleTheme, signOut, displayName }: HeaderProps) {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 backdrop-blur-xl bg-light-surface/80 dark:bg-dark-surface/80 border-b border-light-border dark:border-dark-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="p-2 rounded-xl bg-gradient-to-br from-vault-500 to-vault-700 text-white group-hover:shadow-lg group-hover:shadow-vault-500/25 transition-shadow">
              <Camera className="w-5 h-5" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-vault-500 to-vault-700 bg-clip-text text-transparent">
              PhotoVault
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map(({ to, label, icon: Icon }) => {
              const active = location.pathname === to;
              return (
                <Link
                  key={to}
                  to={to}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    active
                      ? 'bg-vault-500/10 text-vault-600 dark:text-vault-400'
                      : 'text-light-muted dark:text-dark-muted hover:text-light-text dark:hover:text-dark-text hover:bg-light-border/50 dark:hover:bg-dark-border/50'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {label}
                </Link>
              );
            })}
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-2">
            {displayName && (
              <span className="hidden sm:block text-sm text-light-muted dark:text-dark-muted truncate max-w-[150px]">
                {displayName}
              </span>
            )}
            <ThemeToggle isDark={isDark} toggle={toggleTheme} />
            {signOut && (
              <button
                onClick={signOut}
                className="p-2 rounded-lg hover:bg-light-border dark:hover:bg-dark-border transition-colors text-light-muted dark:text-dark-muted hover:text-red-500"
                aria-label="Kijelentkezés"
                title="Kijelentkezés"
              >
                <LogOut className="w-5 h-5" />
              </button>
            )}
            <button
              className="md:hidden p-2 rounded-lg hover:bg-light-border dark:hover:bg-dark-border transition-colors"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Menü"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile nav */}
        {mobileOpen && (
          <nav className="md:hidden pb-4 space-y-1">
            {navLinks.map(({ to, label, icon: Icon }) => {
              const active = location.pathname === to;
              return (
                <Link
                  key={to}
                  to={to}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                    active
                      ? 'bg-vault-500/10 text-vault-600 dark:text-vault-400'
                      : 'text-light-muted dark:text-dark-muted hover:bg-light-border/50 dark:hover:bg-dark-border/50'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {label}
                </Link>
              );
            })}
            {signOut && (
              <button
                onClick={signOut}
                className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-red-500 hover:bg-red-500/10 w-full transition-colors"
              >
                <LogOut className="w-5 h-5" />
                Kijelentkezés
              </button>
            )}
          </nav>
        )}
      </div>
    </header>
  );
}

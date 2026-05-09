import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useWalletStore } from '@/stores/appStore';
import { Button } from '@/components/ui';
import {
  CaretDown,
  Shapes,
  List,
  X,
} from '@phosphor-icons/react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const NAV_LINKS = [
  { label: 'Template', path: '/builder' },
  { label: 'Form', path: '/builder' },
  { label: 'Dashboard', path: '/dashboard' },
];

export function Navbar() {
  const location = useLocation();
  const { address, connect, disconnect, isConnecting } = useWalletStore();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const isLandingPage = location.pathname === '/';

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-[100] transition-all duration-300',
        isScrolled ? 'py-3' : 'py-5',
        isScrolled && !isLandingPage ? 'bg-[#f0eeeb]/60 backdrop-blur-md' : 'bg-transparent'
      )}
    >
      <div className="max-w-[1440px] mx-auto px-6 md:px-12">
        <nav className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <Shapes weight="fill" className="w-6 h-6 text-black transition-transform duration-500 group-hover:rotate-[10deg]" />
            <span className="text-[1.25rem] font-bold tracking-tight text-black">
              FormSeal
            </span>
          </Link>

          {/* Desktop Links */}
          <div className="hidden lg:flex items-center gap-8">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.label}
                to={link.path || '#'}
                className="flex items-center gap-1.5 text-[0.9375rem] font-medium text-black/60 hover:text-black transition-colors"
              >
                {link.label}
                {link.hasDropdown && (
                  <CaretDown weight="bold" className="w-3 h-3 opacity-40" />
                )}
              </Link>
            ))}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-8">
            <Link 
              to="#" 
              onClick={connect}
              className="hidden sm:block text-[0.9375rem] font-bold text-black/80 hover:text-black transition-colors"
            >
              Log in
            </Link>
            
            <Button
              variant="primary"
              size="sm"
              onClick={connect}
              loading={isConnecting}
              className="rounded-full px-6 h-10 text-[0.875rem] font-bold bg-black text-white hover:bg-black/90 transition-all shadow-lg shadow-black/10"
            >
              Sign up
            </Button>

            {/* Mobile Menu Trigger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden w-10 h-10 rounded-xl bg-black/[0.04] flex items-center justify-center text-text-primary"
            >
              {mobileMenuOpen ? <X weight="bold" /> : <List weight="bold" />}
            </button>
          </div>
        </nav>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="absolute top-full left-0 right-0 px-6 pt-2 lg:hidden"
          >
            <div className="bg-[#f0eeeb] border border-black/[0.08] shadow-2xl rounded-2xl p-4 space-y-2">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.label}
                  to={link.path || '#'}
                  className="flex items-center justify-between p-4 rounded-xl text-lg font-bold text-text-secondary hover:bg-black/[0.04] transition-all"
                >
                  {link.label}
                  {link.hasDropdown && <CaretDown weight="bold" className="w-4 h-4 opacity-40" />}
                </Link>
              ))}
              <div className="pt-4 border-t border-black/[0.05] grid grid-cols-2 gap-4">
                <Button
                  variant="outline"
                  onClick={connect}
                  className="w-full rounded-xl"
                >
                  Log in
                </Button>
                <Button
                  variant="primary"
                  onClick={connect}
                  className="w-full rounded-xl bg-black text-white"
                >
                  Sign up
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}


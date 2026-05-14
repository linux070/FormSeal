import { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ConnectModal, useCurrentAccount, useDisconnectWallet } from '@mysten/dapp-kit';
import { useWalletStore } from '@/stores/appStore';
import { Button } from '@/components/ui';
import {
  List,
  X,
  Check,
} from '@phosphor-icons/react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const NAV_LINKS = [
  { label: 'Templates', path: '/templates' },
  { label: 'Form Builder', path: '/builder' },
  { label: 'Dashboard', path: '/dashboard' },
];

export function Navbar() {
  const location = useLocation();
  const currentAccount = useCurrentAccount();
  const { mutate: disconnectWallet } = useDisconnectWallet();
  const { network, isConnecting, switchNetwork } = useWalletStore();
  
  // Real physical browser extension public coordinate acts as primary authority
  const activeAddress = currentAccount?.address || null;
  const [walletDropdownOpen, setWalletDropdownOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleNetworkSwitchTrigger = (targetNetwork: 'Sui Testnet' | 'Sui Mainnet') => {
    switchNetwork(targetNetwork);
    setWalletDropdownOpen(false);
    const label = targetNetwork.includes('Testnet') ? 'Testnet' : 'Mainnet';
    setToastMessage(`Switched to ${label}`);
    setTimeout(() => setToastMessage(null), 2500);
  };

  // Close dropdown on outside mousedown clicks
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setWalletDropdownOpen(false);
      }
    };
    if (walletDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [walletDropdownOpen]);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-[100] transition-all duration-300',
        isScrolled ? 'py-3 bg-transparent' : 'py-5 bg-transparent',
        isScrolled && 'backdrop-blur-sm bg-white/5'
      )}
    >
      <div className="max-w-[1440px] mx-auto px-6 md:px-12">
        <nav className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center group">
            <img 
              src="/formseal kit/formseal_header.svg" 
              alt="FormSeal" 
              className="h-12 w-auto" 
            />
          </Link>

          {/* Desktop Links */}
          <div className="hidden lg:flex items-center gap-8">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.label}
                to={link.path}
                className="flex items-center gap-1.5 text-[0.9375rem] font-medium text-black/60 hover:text-black transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-8">
            {activeAddress ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setWalletDropdownOpen(!walletDropdownOpen)}
                  className="flex items-center gap-2 px-3.5 h-10 rounded-xl bg-[#f0eeeb] border border-black/10 hover:border-black/20 transition-all text-left shadow-sm"
                >
                  <span className="text-sm font-mono font-medium text-black tracking-tight">
                    {activeAddress.slice(0, 6)}...{activeAddress.slice(-4)}
                  </span>
                  <svg className="w-3.5 h-3.5 text-black/40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M7 15L12 20L17 15M7 9L12 4L17 9" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>

                <AnimatePresence>
                  {walletDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.98 }}
                      transition={{ duration: 0.15, ease: 'easeOut' }}
                      className="absolute right-0 mt-2 w-56 bg-[#f0eeeb] rounded-xl shadow-xl border border-black/10 overflow-hidden z-50"
                    >
                      {/* Streamlined Network Selectors */}
                      <div className="p-1.5 space-y-0.5 bg-[#f0eeeb]">
                        <button
                          onClick={() => handleNetworkSwitchTrigger('Sui Testnet')}
                          className={cn(
                            "w-full px-3 py-2.5 rounded-lg flex items-center justify-between text-left transition-all",
                            network.includes('Testnet') ? "bg-black/[0.04] font-bold text-black" : "text-black/60 hover:text-black hover:bg-black/[0.02]"
                          )}
                        >
                          <span className="text-xs tracking-wide">Testnet</span>
                          {network.includes('Testnet') && <Check weight="bold" className="w-3.5 h-3.5 text-black" />}
                        </button>

                        <button
                          onClick={() => handleNetworkSwitchTrigger('Sui Mainnet')}
                          className={cn(
                            "w-full px-3 py-2.5 rounded-lg flex items-center justify-between text-left transition-all",
                            network.includes('Mainnet') ? "bg-black/[0.04] font-bold text-black" : "text-black/60 hover:text-black hover:bg-black/[0.02]"
                          )}
                        >
                          <span className="text-xs tracking-wide">Mainnet</span>
                          {network.includes('Mainnet') && <Check weight="bold" className="w-3.5 h-3.5 text-black" />}
                        </button>
                      </div>

                      {/* Integrated Flat Disconnect Bounding Card */}
                      <div className="p-1.5 bg-[#f0eeeb] border-t border-black/[0.05]">
                        <button
                          onClick={() => { disconnectWallet(); setWalletDropdownOpen(false); }}
                          className="w-full px-3 py-2 rounded-lg bg-transparent hover:bg-black/[0.05] transition-colors text-left text-xs font-medium text-black/70 border-none outline-none focus:outline-none"
                        >
                          Disconnect
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Studio-Grade Micro-Interaction Network Toast Notification */}
                <AnimatePresence>
                  {toastMessage && (
                    <motion.div
                      initial={{ opacity: 0, y: -8, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -8, scale: 0.96 }}
                      transition={{ duration: 0.2 }}
                      className="absolute right-0 top-12 z-[110] px-3.5 py-2 rounded-xl bg-[#f0eeeb] border border-black/10 shadow-md flex items-center gap-2 pointer-events-none w-max"
                    >
                      <Check weight="bold" className="w-3.5 h-3.5 text-black" />
                      <span className="text-xs font-bold text-black tracking-wide">
                        {toastMessage}
                      </span>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <ConnectModal
                trigger={
                  <Button
                    variant="primary"
                    size="sm"
                    loading={isConnecting}
                    className="rounded-full px-7 h-10 text-[0.875rem] font-bold bg-black text-white hover:bg-black/90 transition-all shadow-md shadow-black/10 tracking-wide"
                  >
                    Connect Wallet
                  </Button>
                }
              />
            )}

            {/* Mobile Menu Trigger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden w-10 h-10 rounded-xl bg-black/[0.04] flex items-center justify-center text-black"
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
            <div className="bg-white/80 backdrop-blur-xl border border-black/[0.08] shadow-2xl rounded-2xl p-4 space-y-2">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.label}
                  to={link.path}
                  className="flex items-center justify-between p-4 rounded-xl text-lg font-bold text-black/60 hover:text-black hover:bg-black/[0.04] transition-all"
                >
                  {link.label}
                </Link>
              ))}
              <div className="pt-4 border-t border-black/[0.05] flex flex-col gap-2">
                {activeAddress ? (
                  <div className="p-3 bg-black/[0.02] rounded-xl flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-black/60">
                      {activeAddress.slice(0, 6)}...{activeAddress.slice(-4)}
                    </span>
                    <button 
                      onClick={() => { disconnectWallet(); setMobileMenuOpen(false); }}
                      className="text-xs font-bold text-red-600 uppercase"
                    >
                      Disconnect
                    </button>
                  </div>
                ) : (
                  <ConnectModal
                    trigger={
                      <Button
                        variant="primary"
                        className="w-full rounded-xl bg-black text-white h-11 text-sm font-bold tracking-wide"
                      >
                        Connect Wallet
                      </Button>
                    }
                  />
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}


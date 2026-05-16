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
  SignOut,
  CaretUpDown,
  Globe,
  Wallet,
} from '@phosphor-icons/react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const NAV_LINKS = [
  { label: 'Templates', path: '/templates' },
  { label: 'Form', path: '/builder' },
  { label: 'Dashboard', path: '/dashboard' },
];

export function Navbar() {
  const location = useLocation();
  const currentAccount = useCurrentAccount();
  const { mutate: disconnectWallet } = useDisconnectWallet();
  const { network, isConnecting, switchNetwork } = useWalletStore();

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
          <div className="hidden lg:flex items-center gap-6">
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
          <div className="flex items-center gap-4">
            {activeAddress ? (
              <div className="relative" ref={dropdownRef}>
                {/* ─── Wallet Trigger Button ─── */}
                <button
                  onClick={() => setWalletDropdownOpen(!walletDropdownOpen)}
                  className={cn(
                    "flex items-center gap-2.5 px-5 h-12 rounded-md transition-all text-left bg-white/60 backdrop-blur-md border border-black/[0.04]",
                    "text-black hover:bg-white/80",
                    "active:scale-[0.98]",
                    walletDropdownOpen && "bg-white/80 shadow-sm"
                  )}
                >
                  <span className="text-[0.875rem] font-mono font-normal tracking-tight">
                    {activeAddress.slice(0, 6)}...{activeAddress.slice(-4)}
                  </span>
                  <CaretUpDown weight="bold" className="w-4 h-4 opacity-20" />
                </button>

                {/* ─── Wallet Dropdown Modal ─── */}
                <AnimatePresence>
                  {walletDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 6, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 6, scale: 0.98 }}
                      transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
                      className="absolute right-0 mt-2 w-[280px] bg-[#fafaf9]/90 backdrop-blur-xl rounded-xl border border-black/[0.05] shadow-[0_20px_40px_-12px_rgba(0,0,0,0.15)] overflow-hidden z-50 p-1"
                    >
                      {/* Account Section */}
                      <div className="p-1">
                        <div className="px-3 py-3 rounded-lg flex items-center gap-3 transition-colors hover:bg-black/[0.04] group cursor-pointer">
                          <Check weight="bold" className="w-4 h-4 text-black/40" />
                          <span className="text-[0.875rem] font-normal text-black/60 tracking-tight truncate">
                            {activeAddress.slice(0, 6)}...{activeAddress.slice(-4)}
                          </span>
                        </div>
                      </div>

                      <div className="h-px bg-black/[0.05] mx-[-4px] my-1" />

                      {/* Network Selectors */}
                      <div className="p-1 space-y-0.5">
                        <button
                          onClick={() => handleNetworkSwitchTrigger('Sui Testnet')}
                          className={cn(
                            "w-full px-3 h-10 rounded-lg flex items-center justify-between text-left transition-all duration-200",
                            network.includes('Testnet')
                              ? "bg-black/[0.03] font-normal text-black"
                              : "text-black/50 hover:bg-black/[0.02] hover:text-black"
                          )}
                        >
                          <div className="flex items-center gap-2.5">
                            <Globe weight="bold" className="w-4 h-4 opacity-30" />
                            <span className="text-[0.875rem] font-normal tracking-tight">Testnet</span>
                          </div>
                          {network.includes('Testnet') && <Check weight="bold" className="w-3.5 h-3.5 text-black/40" />}
                        </button>

                        <button
                          onClick={() => handleNetworkSwitchTrigger('Sui Mainnet')}
                          className={cn(
                            "w-full px-3 h-10 rounded-lg flex items-center justify-between text-left transition-all duration-200",
                            network.includes('Mainnet')
                              ? "bg-black/[0.03] font-normal text-black"
                              : "text-black/50 hover:bg-black/[0.02] hover:text-black"
                          )}
                        >
                          <div className="flex items-center gap-2.5">
                            <Globe weight="bold" className="w-4 h-4 opacity-30" />
                            <span className="text-[0.875rem] font-normal tracking-tight">Mainnet</span>
                          </div>
                          {network.includes('Mainnet') && <Check weight="bold" className="w-3.5 h-3.5 text-black/40" />}
                        </button>
                      </div>

                      <div className="h-px bg-black/[0.05] mx-[-4px] my-1" />

                      {/* Disconnect */}
                      <div className="p-1">
                        <button
                          onClick={() => { disconnectWallet(); setWalletDropdownOpen(false); }}
                          className="w-full px-3 h-10 rounded-lg flex items-center text-left text-[0.875rem] font-normal text-black/50 hover:bg-black/[0.03] transition-all duration-200"
                        >
                          Disconnect
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Network Toast */}
                <AnimatePresence>
                  {toastMessage && (
                    <motion.div
                      initial={{ opacity: 0, y: -8, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -8, scale: 0.96 }}
                      transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                      className="absolute right-0 top-12 z-[110] px-3.5 py-2 rounded-lg bg-white border border-black/[0.08] shadow-[0_4px_16px_rgba(0,0,0,0.06)] flex items-center gap-2 pointer-events-none w-max"
                    >
                      <Check weight="bold" className="w-3.5 h-3.5 text-black" />
                      <span className="text-[0.75rem] font-bold text-black tracking-wide">
                        {toastMessage}
                      </span>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <ConnectModal
                trigger={
                  <button
                    disabled={isConnecting}
                    className={cn(
                      "flex items-center gap-2.5 px-5 h-12 rounded-md transition-all text-left bg-white/60 backdrop-blur-md border border-black/[0.08]",
                      "text-black hover:bg-white/80 hover:shadow-[0_4px_12px_rgba(0,0,0,0.04)]",
                      "active:scale-[0.98] disabled:opacity-50 w-full sm:w-auto"
                    )}
                  >
                    <Wallet weight="bold" className="w-5 h-5 opacity-30" />
                    <span className="text-[0.875rem] font-normal tracking-tight">Connect Wallet</span>
                  </button>
                }
              />
            )}

            {/* Mobile Menu Trigger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden w-10 h-10 rounded-lg bg-black/[0.04] flex items-center justify-center text-black active:scale-[0.97] transition-transform"
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
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="absolute top-full left-0 right-0 px-6 pt-2 lg:hidden"
          >
            <div className="bg-white/95 backdrop-blur-xl border border-black/[0.08] shadow-[0_8px_32px_-4px_rgba(0,0,0,0.08)] rounded-2xl p-4 space-y-1">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.label}
                  to={link.path}
                  className="flex items-center justify-between py-3 px-4 text-[1rem] font-medium text-black/60 hover:text-black transition-all active:scale-[0.98]"
                >
                  {link.label}
                </Link>
              ))}
              <div className="pt-3 border-t border-black/[0.05] flex flex-col gap-2">
                {activeAddress ? (
                  <div className="space-y-2">
                    <div className="px-4 py-2 flex items-center justify-between">
                      <span className="text-[0.75rem] font-mono font-bold text-black/60">
                        {activeAddress.slice(0, 6)}...{activeAddress.slice(-4)}
                      </span>
                      <button
                        onClick={() => { disconnectWallet(); setMobileMenuOpen(false); }}
                        className="flex items-center gap-1.5 text-[0.75rem] font-bold text-black/40 hover:text-black transition-colors"
                      >
                        <SignOut weight="bold" className="w-3 h-3" />
                        Disconnect
                      </button>
                    </div>
                  </div>
                ) : (
                  <ConnectModal
                    trigger={
                      <button className="text-[1rem] font-bold text-black/60 hover:text-black transition-colors px-4 py-4 w-full text-left">
                        Connect Wallet
                      </button>
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

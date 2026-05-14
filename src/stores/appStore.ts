import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ToastMessage } from '@/types';
import { v4 as uuidv4 } from 'uuid';

interface WalletState {
  address: string | null;
  providerName: string;
  network: string;
  isConnecting: boolean;
  connect: (providerOverride?: string) => void;
  disconnect: () => void;
  switchNetwork: (net: string) => void;
}

interface ToastState {
  toasts: ToastMessage[];
  addToast: (toast: Omit<ToastMessage, 'id'>) => string;
  removeToast: (id: string) => void;
  updateToast: (id: string, updates: Partial<ToastMessage>) => void;
}

interface DashboardEntry {
  formBlobId: string;
  indexBlobId: string;
  title: string;
  description?: string;
  createdAt: number;
  submissionCount: number;
  isPaused?: boolean;
}

interface DashboardState {
  forms: DashboardEntry[];
  addForm: (entry: DashboardEntry) => void;
  updateForm: (formBlobId: string, updates: Partial<DashboardEntry>) => void;
  removeForm: (formBlobId: string) => void;
}

/* ─── Wallet Store (simulated for hackathon) ─── */
export const useWalletStore = create<WalletState>()(
  persist(
    (set) => ({
      address: null,
      providerName: 'Slush Wallet Adapter',
      network: 'Sui Testnet',
      isConnecting: false,

      connect: (providerOverride?: string) => {
        set({ isConnecting: true });
        // Simulate real-world @mysten/dapp-kit connection flow via custom registered proxies
        setTimeout(() => {
          const addr = '0x' + Array.from({ length: 64 }, () =>
            '0123456789abcdef'[Math.floor(Math.random() * 16)]
          ).join('');
          set({ 
            address: addr, 
            providerName: providerOverride || 'Slush Wallet Adapter',
            isConnecting: false 
          });
        }, 600);
      },

      disconnect: () => {
        set({ address: null, isConnecting: false });
      },

      switchNetwork: (net: string) => {
        set({ network: net });
      }
    }),
    {
      name: 'formseal-wallet',
    }
  )
);

/* ─── Toast Store ─── */
export const useToastStore = create<ToastState>()((set) => ({
  toasts: [],

  addToast: (toast) => {
    const id = uuidv4();
    set((s) => ({
      toasts: [...s.toasts, { ...toast, id }],
    }));

    if (toast.type !== 'loading') {
      setTimeout(() => {
        set((s) => ({
          toasts: s.toasts.filter((t) => t.id !== id),
        }));
      }, 5000);
    }

    return id;
  },

  removeToast: (id) =>
    set((s) => ({
      toasts: s.toasts.filter((t) => t.id !== id),
    })),

  updateToast: (id, updates) =>
    set((s) => ({
      toasts: s.toasts.map((t) =>
        t.id === id ? { ...t, ...updates } : t
      ),
    })),
}));

/* ─── Dashboard Store ─── */
export const useDashboardStore = create<DashboardState>()(
  persist(
    (set) => ({
      forms: [],

      addForm: (entry) =>
        set((s) => ({
          forms: [entry, ...s.forms.filter((f) => f.formBlobId !== entry.formBlobId)],
        })),

      updateForm: (formBlobId, updates) =>
        set((s) => ({
          forms: s.forms.map((f) =>
            f.formBlobId === formBlobId ? { ...f, ...updates } : f
          ),
        })),

      removeForm: (formBlobId) =>
        set((s) => ({
          forms: s.forms.filter((f) => f.formBlobId !== formBlobId),
        })),
    }),
    {
      name: 'formseal-dashboard',
    }
  )
);

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ToastMessage } from '@/types';
import { v4 as uuidv4 } from 'uuid';

interface WalletState {
  address: string | null;
  isConnecting: boolean;
  connect: () => void;
  disconnect: () => void;
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
  createdAt: number;
  submissionCount: number;
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
      isConnecting: false,

      connect: () => {
        set({ isConnecting: true });
        // Simulate wallet connection with a deterministic address
        setTimeout(() => {
          const addr = '0x' + Array.from({ length: 64 }, () =>
            '0123456789abcdef'[Math.floor(Math.random() * 16)]
          ).join('');
          set({ address: addr, isConnecting: false });
        }, 800);
      },

      disconnect: () => {
        set({ address: null, isConnecting: false });
      },
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

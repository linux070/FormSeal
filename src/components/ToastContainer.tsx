import { useToastStore } from '@/stores/appStore';
import { CircleNotch, CheckCircle, XCircle, Info, ArrowSquareOut } from '@phosphor-icons/react';
import { getExplorerUrl } from '@/lib/walrus';

const iconMap = {
  success: <CheckCircle weight="fill" className="w-5 h-5 text-accent" />,
  error: <XCircle weight="fill" className="w-5 h-5 text-danger" />,
  info: <Info weight="fill" className="w-5 h-5 text-info" />,
  loading: <CircleNotch weight="bold" className="w-5 h-5 text-accent animate-spin-slow" />,
};

const borderMap = {
  success: 'border-accent/20',
  error: 'border-danger/20',
  info: 'border-info/20',
  loading: 'border-accent/10',
};

export function ToastContainer() {
  const { toasts, removeToast } = useToastStore();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-[200] flex flex-col gap-3 w-full max-w-sm pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`
            pointer-events-auto bg-bg-secondary border
            ${borderMap[toast.type]}
            rounded-[var(--radius-xl)] p-4 shadow-elevated
            animate-fade-in-scale
          `}
        >
          <div className="flex items-start gap-3">
            <span className="flex-shrink-0 mt-0.5">{iconMap[toast.type]}</span>
            <div className="flex-1 min-w-0">
              <p className="text-[0.875rem] font-semibold text-text-primary">
                {toast.title}
              </p>
              {toast.description && (
                <p className="text-[0.8125rem] text-text-muted mt-0.5">
                  {toast.description}
                </p>
              )}
              {toast.blobId && (
                <a
                  href={getExplorerUrl(toast.blobId)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 mt-2 text-[0.75rem] text-accent hover:text-accent-hover transition-colors duration-200"
                >
                  <span className="font-mono truncate max-w-[180px]">
                    {toast.blobId.slice(0, 16)}...
                  </span>
                  <ArrowSquareOut weight="bold" className="w-3 h-3 flex-shrink-0" />
                </a>
              )}
            </div>
            {toast.type !== 'loading' && (
              <button
                onClick={() => removeToast(toast.id)}
                className="flex-shrink-0 w-6 h-6 rounded-full bg-bg-hover flex items-center justify-center text-text-muted hover:text-text-primary transition-colors duration-200"
                aria-label="Dismiss notification"
              >
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                  <path d="M1 1l8 8M9 1L1 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

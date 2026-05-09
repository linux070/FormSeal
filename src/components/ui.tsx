import { type ReactNode, type ButtonHTMLAttributes, forwardRef } from 'react';
import { CircleNotch, WarningCircle, Info } from '@phosphor-icons/react';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/* ─── Button ─── */
interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  icon?: ReactNode;
  children: ReactNode;
}

const variantClasses: Record<string, string> = {
  primary:
    'bg-accent text-white hover:brightness-105 shadow-[0_4px_12px_rgba(16,185,129,0.15),inset_0_1px_0_rgba(255,255,255,0.2)]',
  secondary:
    'bg-black/[0.03] text-text-primary border border-black/[0.05] hover:bg-black/[0.06]',
  ghost:
    'bg-transparent text-text-secondary hover:text-text-primary hover:bg-black/[0.03]',
  danger:
    'bg-danger/10 text-danger border border-danger/20 hover:bg-danger/20',
};

const sizeClasses: Record<string, string> = {
  sm: 'px-4 py-2 text-[0.8125rem] gap-2',
  md: 'px-5 py-3 text-[0.875rem] gap-2.5',
  lg: 'px-8 py-4 text-[1rem] gap-3',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      loading = false,
      icon,
      children,
      className = '',
      disabled,
      ...props
    },
    ref
  ) => (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={cn(
        'inline-flex items-center justify-center font-bold',
        'rounded-2xl transition-all duration-300',
        'ease-[var(--ease-out-expo)] select-none',
        'active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed',
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
      {...props}
    >
      {loading ? (
        <CircleNotch weight="bold" className="w-4 h-4 animate-spin" />
      ) : icon ? (
        <span className="flex-shrink-0 transition-transform group-hover:scale-110">{icon}</span>
      ) : null}
      {children}
    </button>
  )
);
Button.displayName = 'Button';

/* ─── Input ─── */
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helper?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helper, className = '', id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');
    return (
      <div className="flex flex-col gap-2">
        {label && (
          <label
            htmlFor={inputId}
            className="text-[0.75rem] font-bold text-text-muted uppercase tracking-[0.1em]"
          >
            {label}
          </label>
        )}
        <div className="relative group">
          <input
            ref={ref}
            id={inputId}
            className={cn(
              'w-full px-4 py-3 bg-black/[0.03] text-text-primary',
              'border border-black/[0.08] rounded-xl',
              'text-[1rem] placeholder:text-text-muted/70 placeholder:transition-all placeholder:duration-300',
              'transition-all duration-300 ease-[var(--ease-out-expo)]',
              'focus:border-accent/40 focus:bg-white',
              'focus:outline-none',
              error ? 'border-danger focus:border-danger focus:ring-danger/5' : '',
              className
            )}
            {...props}
          />
          <div className="absolute inset-0 rounded-xl pointer-events-none border border-black/[0.05] opacity-0 group-focus-within:opacity-100 transition-opacity" />
        </div>
        {error ? (
          <div className="flex items-center gap-1.5 text-[0.75rem] text-danger font-medium animate-fade-in">
            <WarningCircle weight="fill" className="w-3.5 h-3.5" />
            {error}
          </div>
        ) : helper ? (
          <div className="flex items-center gap-1.5 text-[0.75rem] text-text-muted font-medium">
            <Info weight="bold" className="w-3.5 h-3.5" />
            {helper}
          </div>
        ) : null}
      </div>
    );
  }
);
Input.displayName = 'Input';

/* ─── Textarea ─── */
interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, className = '', id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');
    return (
      <div className="flex flex-col gap-2">
        {label && (
          <label
            htmlFor={inputId}
            className="text-[0.75rem] font-bold text-text-muted uppercase tracking-[0.1em]"
          >
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={inputId}
          className={cn(
            'w-full px-4 py-3 bg-black/[0.01] text-text-primary',
            'border border-black/[0.08] rounded-xl',
            'text-[1rem] placeholder:text-text-muted/40 placeholder:transition-all placeholder:duration-300',
            'transition-all duration-300 ease-[var(--ease-out-expo)]',
            'focus:border-accent focus:bg-white',
            'focus:outline-none',
            'resize-y min-h-[120px]',
            error ? 'border-danger focus:border-danger focus:ring-danger/5' : '',
            className
          )}
          {...props}
        />
        {error && (
          <div className="flex items-center gap-1.5 text-[0.75rem] text-danger font-medium animate-fade-in">
            <WarningCircle weight="fill" className="w-3.5 h-3.5" />
            {error}
          </div>
        )}
      </div>
    );
  }
);
Textarea.displayName = 'Textarea';

/* ─── Toggle ─── */
interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  description?: string;
  id?: string;
}

export function Toggle({
  checked,
  onChange,
  label,
  description,
  id,
}: ToggleProps) {
  const toggleId = id || label?.toLowerCase().replace(/\s+/g, '-');
  return (
    <label
      htmlFor={toggleId}
      className="flex items-start gap-4 cursor-pointer group"
    >
      <button
        id={toggleId}
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={cn(
          'relative w-11 h-6 rounded-full transition-all duration-500 flex-shrink-0 mt-0.5',
          'border border-black/[0.05]',
          checked ? 'bg-accent shadow-[0_0_12px_rgba(16,185,129,0.2)] border-accent/20' : 'bg-black/10'
        )}
      >
        <motion.span
          initial={false}
          animate={{ x: checked ? 20 : 2 }}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          className="absolute top-[3px] left-0 w-4 h-4 rounded-full bg-white shadow-sm flex items-center justify-center"
        />
      </button>
      {(label || description) && (
        <div className="flex flex-col gap-0.5">
          {label && (
            <span className="text-[0.875rem] font-bold text-text-primary tracking-tight">
              {label}
            </span>
          )}
          {description && (
            <span className="text-[0.75rem] text-text-muted leading-relaxed">
              {description}
            </span>
          )}
        </div>
      )}
    </label>
  );
}

/* ─── Badge ─── */
interface BadgeProps {
  children: ReactNode;
  variant?: 'default' | 'accent' | 'danger' | 'warning' | 'info';
  size?: 'sm' | 'md';
}

const badgeVariants: Record<string, string> = {
  default: 'bg-black/[0.04] text-text-secondary border-black/[0.05]',
  accent: 'bg-accent/10 text-accent border-accent/20',
  danger: 'bg-danger/10 text-danger border-danger/20',
  warning: 'bg-warning/10 text-warning border-warning/20',
  info: 'bg-accent/10 text-accent border-accent/20', // Defaulting info to accent for simplicity
};

export function Badge({ children, variant = 'default', size = 'sm' }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center font-bold border rounded-lg uppercase tracking-widest transition-all duration-300',
        'shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]',
        badgeVariants[variant],
        size === 'sm' ? 'px-2 py-0.5 text-[0.625rem]' : 'px-3 py-1 text-[0.6875rem]'
      )}
    >
      {children}
    </span>
  );
}

/* ─── Skeleton ─── */
export function Skeleton({ className = '' }: { className?: string }) {
  return (
    <div
      className={cn(
        'bg-black/[0.03] rounded-xl overflow-hidden relative',
        'after:absolute after:inset-0 after:bg-gradient-to-r after:from-transparent after:via-white/[0.2] after:to-transparent after:animate-shimmer',
        className
      )}
    />
  );
}

/* ─── Empty State ─── */
export function EmptyState({ icon, title, description, action }: {
  icon: ReactNode;
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-24 px-6 text-center"
    >
      <div className="w-20 h-20 rounded-3xl bg-black/[0.02] border border-black/[0.05] flex items-center justify-center mb-8 text-accent shadow-sm">
        <div className="scale-150">{icon}</div>
      </div>
      <h3 className="text-2xl font-extrabold text-text-primary mb-3 tracking-tight">{title}</h3>
      <p className="text-[1rem] text-text-muted max-w-[40ch] mb-10 leading-relaxed">
        {description}
      </p>
      {action}
    </motion.div>
  );
}

/* ─── Modal ─── */
export function Modal({ open, onClose, title, children }: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}) {
  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onMouseDown={(e) => {
              if (e.target === e.currentTarget) {
                onClose();
              }
            }}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-xl bg-[#fafafa] rounded-[2rem] border border-black/10 shadow-2xl overflow-hidden h-fit"
          >
            <div className="flex items-center justify-between px-8 py-6 border-b border-black/[0.05] bg-white">
              <h2 className="text-xl font-bold text-text-primary tracking-tight">{title}</h2>
              <button
                onClick={onClose}
                className="w-10 h-10 rounded-xl bg-black/[0.04] flex items-center justify-center text-text-muted hover:text-text-primary transition-colors"
              >
                <X_SVG />
              </button>
            </div>
            <div className="px-8 py-3">{children}</div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

const X_SVG = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
    <path d="M1 1l12 12M13 1L1 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

/* ─── Tooltip Info ─── */
export function InfoTooltip({ content }: { content: string }) {
  return (
    <div className="relative group inline-flex ml-1">
      <Info weight="bold" className="w-3.5 h-3.5 text-text-muted hover:text-accent transition-colors cursor-help" />
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 px-4 py-3 bg-white border border-black/[0.1] rounded-xl text-[0.75rem] text-text-secondary w-64 text-center opacity-0 pointer-events-none group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0 shadow-xl z-[300]">
        {content}
        <div className="absolute top-full left-1/2 -translate-x-1/2 border-[6px] border-transparent border-t-white" />
      </div>
    </div>
  );
}

/* ─── Protocol Attribution ─── */
export function ProtocolAttribution({ compact = false }: { compact?: boolean }) {
  return (
    <div className={cn(
      "flex items-center justify-center gap-4 transition-all duration-700 animate-fade-in select-none",
      compact ? "py-4" : "py-12"
    )}>
      <span className={cn(
        "font-black uppercase tracking-[0.35em] text-black/60",
        compact ? "text-[0.6875rem]" : "text-[0.8125rem]"
      )}>
        Built on
      </span>
      
      <img 
        src="/walrus-symbol.png" 
        alt="Walrus" 
        className={cn(
          "w-auto",
          compact ? "h-5" : "h-7"
        )}
      />

      <span className={cn(
        "font-black uppercase tracking-[0.35em] text-black/80 italic",
        compact ? "text-[0.6875rem]" : "text-[0.8125rem]"
      )}>
        Walrus
      </span>
    </div>
  );
}










// ============================================
// DermaAI SkinVision — Reusable UI Components
// Button, Card, LoadingSpinner, Modal
// ============================================

import { motion } from 'framer-motion';

// ---- Button ----
export function Button({ children, variant = 'primary', size = 'md', icon, className = '', disabled, ...props }) {
  const variants = {
    primary: 'btn-primary',
    ghost: 'btn-ghost',
    danger: 'px-6 py-3 rounded-xl font-semibold text-sm text-white bg-gradient-to-r from-red-500 to-red-600 hover:from-red-400 hover:to-red-500 transition-all duration-300 shadow-lg shadow-red-500/25 active:scale-[0.98]',
  };

  const sizes = {
    sm: 'px-4 py-2 text-xs',
    md: '',
    lg: 'px-8 py-4 text-base',
  };

  return (
    <motion.button
      whileHover={{ scale: disabled ? 1 : 1.02 }}
      whileTap={{ scale: disabled ? 1 : 0.98 }}
      className={`${variants[variant]} ${sizes[size]} ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className} inline-flex items-center justify-center gap-2`}
      disabled={disabled}
      {...props}
    >
      {icon && <span className="w-5 h-5">{icon}</span>}
      {children}
    </motion.button>
  );
}

// ---- Card ----
export function Card({ children, className = '', hover = false, glow = false, ...props }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={`${hover ? 'glass-card-hover' : 'glass-card'} ${glow ? 'border-glow-blue' : ''} ${className}`}
      {...props}
    >
      {children}
    </motion.div>
  );
}

// ---- Loading Spinner ----
export function LoadingSpinner({ size = 'md', label = 'Loading...' }) {
  const sizes = {
    sm: 'w-5 h-5',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
  };

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative">
        <svg className={`${sizes[size]} animate-spin`} viewBox="0 0 50 50">
          <circle
            cx="25" cy="25" r="20"
            fill="none"
            stroke="rgba(37, 99, 235, 0.15)"
            strokeWidth="4"
          />
          <circle
            cx="25" cy="25" r="20"
            fill="none"
            stroke="#2563EB"
            strokeWidth="4"
            strokeLinecap="round"
            strokeDasharray="31.4 94.2"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-2 h-2 rounded-full bg-medical-blue-500 animate-pulse" />
        </div>
      </div>
      {label && <p className="text-xs text-slate-400 animate-pulse">{label}</p>}
    </div>
  );
}

// ---- Modal ----
export function Modal({ isOpen, onClose, title, children }) {
  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="relative glass-card p-6 rounded-2xl max-w-lg w-full max-h-[85vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        {title && (
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">{title}</h3>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white transition-colors p-1"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}
        {children}
      </motion.div>
    </motion.div>
  );
}

// ---- Progress Bar ----
export function ProgressBar({ value, max = 100, label, color = 'medical-blue' }) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));

  return (
    <div className="w-full">
      {label && (
        <div className="flex justify-between items-center mb-1.5">
          <span className="text-xs text-slate-400">{label}</span>
          <span className="text-xs font-mono text-slate-500">{pct.toFixed(0)}%</span>
        </div>
      )}
      <div className="h-1.5 bg-slate-700/50 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className={`h-full rounded-full bg-gradient-to-r from-${color}-500 to-${color}-400`}
        />
      </div>
    </div>
  );
}

import React from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export interface Toast {
  id: string;
  message: string;
  type: 'success' | 'info' | 'warning' | 'error';
}

interface ToastContainerProps {
  toasts?: Toast[];
  removeToast?: (id: string) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts = [], removeToast = () => {} }) => {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none px-4 sm:px-0">
      {toasts.map(toast => (
        <div 
          key={toast.id}
          className={`pointer-events-auto flex items-center justify-between p-4 rounded-xl shadow-xl border text-sm font-medium animate-fade-in backdrop-blur-md ${
            toast.type === 'success' 
              ? 'bg-obsidian-900/95 text-cream-100 border-gold-500/50' 
              : toast.type === 'error'
              ? 'bg-terracotta-600/95 text-white border-terracotta-500'
              : 'bg-indigo-900/95 text-cream-100 border-gold-500/30'
          }`}
        >
          <div className="flex items-center gap-3">
            {toast.type === 'success' && <CheckCircle2 className="w-5 h-5 text-gold-400 shrink-0" />}
            {toast.type === 'error' && <AlertCircle className="w-5 h-5 text-white shrink-0" />}
            {toast.type === 'info' && <Info className="w-5 h-5 text-gold-400 shrink-0" />}
            <span>{toast.message}</span>
          </div>
          <button 
            onClick={() => removeToast(toast.id)} 
            className="p-1 hover:opacity-75 transition-opacity"
            aria-label="Dismiss Notification"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
};

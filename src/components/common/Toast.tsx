import React from 'react';
import { useApp } from '../../context/AppContext';
import { CheckCircle2, AlertTriangle, Info, X } from 'lucide-react';

export const Toast: React.FC = () => {
  const { toast, hideToast } = useApp();

  if (!toast) return null;

  const icons = {
    success: <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />,
    error: <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />,
    info: <Info className="w-5 h-5 text-blue-600 shrink-0" />
  };

  const bgStyles = {
    success: 'bg-emerald-50 border-emerald-200 text-emerald-900',
    error: 'bg-rose-50 border-rose-200 text-rose-900',
    info: 'bg-blue-50 border-blue-200 text-blue-900'
  };

  return (
    <div className="fixed bottom-20 md:bottom-6 right-4 z-50 max-w-sm w-full animate-bounce-short">
      <div className={`flex items-center gap-3 p-3.5 rounded-xl border shadow-lg ${bgStyles[toast.type]}`}>
        {icons[toast.type]}
        <p className="text-sm font-medium flex-1 leading-snug">{toast.message}</p>
        <button
          onClick={hideToast}
          className="text-gray-400 hover:text-gray-700 p-1 rounded-lg transition-colors"
          aria-label="Close notification"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

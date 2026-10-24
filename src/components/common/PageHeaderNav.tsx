import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { ArrowLeft, Home } from 'lucide-react';

export interface PageHeaderNavProps {
  /**
   * Optional custom back function (e.g. for multi-step form workflows).
   * If provided, will be called instead of default browser/router navigation.
   */
  onBack?: () => void;

  /**
   * Safe fallback route if there is no previous history (default: '/')
   */
  fallbackPath?: string;

  /**
   * Custom back button label (defaults to 'वापस जाएं' in Hindi, 'Back' in English)
   */
  backLabel?: string;

  /**
   * Whether to show the Dashboard shortcut button (default: true)
   */
  showDashboard?: boolean;

  /**
   * Optional contextual badge or subtitle (e.g. 'चरण 2/10' or 'मंडी भाव')
   */
  badge?: string;

  /**
   * Optional extra actions or elements to render on the right side
   */
  children?: React.ReactNode;

  /**
   * Optional CSS classes
   */
  className?: string;
}

export const PageHeaderNav: React.FC<PageHeaderNavProps> = ({
  onBack,
  fallbackPath = '/',
  backLabel,
  showDashboard = true,
  badge,
  children,
  className = ''
}) => {
  const navigate = useNavigate();
  const { language } = useApp();
  const isHindi = language === 'hi' || language === 'cg';

  const handleBackClick = () => {
    if (onBack) {
      onBack();
      return;
    }

    // Smart history check: if user has previous internal history, go back;
    // otherwise fallback safely to dashboard or fallbackPath
    if (
      typeof window !== 'undefined' &&
      window.history.state &&
      typeof window.history.state.idx === 'number' &&
      window.history.state.idx > 0
    ) {
      navigate(-1);
    } else {
      navigate(fallbackPath);
    }
  };

  const defaultBackText = isHindi ? 'वापस जाएं' : 'Back';
  const dashboardText = isHindi ? 'डैशबोर्ड' : 'Dashboard';

  return (
    <nav
      aria-label="Page navigation"
      className={`flex items-center justify-between gap-2 mb-3.5 animate-in fade-in duration-150 ${className}`}
    >
      <div className="flex items-center gap-2 flex-wrap">
        {/* Back Button */}
        <button
          type="button"
          onClick={handleBackClick}
          aria-label={backLabel || defaultBackText}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-emerald-50 text-gray-700 hover:text-[#087A43] border border-gray-200/90 hover:border-emerald-300 shadow-2xs text-xs font-bold transition-all active:scale-95 cursor-pointer group"
          title={isHindi ? 'पिछले पेज पर वापस जाएं' : 'Go back to previous page'}
        >
          <ArrowLeft className="w-3.5 h-3.5 text-[#087A43] group-hover:-translate-x-0.5 transition-transform" />
          <span>{backLabel || defaultBackText}</span>
        </button>

        {/* Dashboard Shortcut Button */}
        {showDashboard && (
          <button
            type="button"
            onClick={() => navigate('/')}
            aria-label={dashboardText}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-emerald-50 text-gray-600 hover:text-[#087A43] border border-gray-200/90 hover:border-emerald-300 shadow-2xs text-xs font-semibold transition-all active:scale-95 cursor-pointer group"
            title={isHindi ? 'मुख्य डैशबोर्ड पर जाएं' : 'Go to main dashboard'}
          >
            <Home className="w-3.5 h-3.5 text-gray-500 group-hover:text-[#087A43] transition-colors" />
            <span>{dashboardText}</span>
          </button>
        )}

        {/* Optional Badge / Breadcrumb text */}
        {badge && (
          <span className="hidden sm:inline-flex items-center text-[11px] font-medium text-gray-400 border-l border-gray-200 pl-2">
            {badge}
          </span>
        )}
      </div>

      {/* Right side slot for extra page controls if passed */}
      {children && (
        <div className="flex items-center gap-2">
          {children}
        </div>
      )}
    </nav>
  );
};

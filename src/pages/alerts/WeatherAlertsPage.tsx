import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { KrishiAlert } from '../../types';
import { PageHeaderNav } from '../../components/common/PageHeaderNav';
import {
  CloudSun,
  AlertTriangle,
  Bug,
  TrendingUp,
  Droplets,
  Check,
  Trash2,
  Bell,
  ShieldAlert,
  ChevronRight,
  Sparkles,
  Info
} from 'lucide-react';

export const WeatherAlertsPage: React.FC = () => {
  const { alerts, markAlertRead, clearAllReadAlerts, language } = useApp();
  const isHindi = language === 'hi' || language === 'cg';

  const [selectedFilter, setSelectedFilter] = useState<'all' | 'weather' | 'pest' | 'market'>('all');
  const [selectedAlertModal, setSelectedAlertModal] = useState<KrishiAlert | null>(null);

  const typeIcons = {
    weather: <CloudSun className="w-5 h-5 text-sky-600" />,
    pest: <Bug className="w-5 h-5 text-rose-600" />,
    market: <TrendingUp className="w-5 h-5 text-emerald-600" />,
    irrigation: <Droplets className="w-5 h-5 text-blue-600" />
  };

  const severityBadges = {
    critical: 'bg-rose-100 text-rose-900 border-rose-200',
    warning: 'bg-amber-100 text-amber-900 border-amber-200',
    info: 'bg-blue-100 text-blue-900 border-blue-200'
  };

  const filteredAlerts = alerts.filter(a => {
    if (selectedFilter !== 'all' && a.type !== selectedFilter) return false;
    return true;
  });

  const unreadCount = alerts.filter(a => !a.read).length;

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Global Back Navigation & Dashboard Shortcut */}
      <PageHeaderNav fallbackPath="/" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2">
            <Bell className="w-7 h-7 text-[#087A43]" />
            <span>{isHindi ? 'मौसम एवं कृषि अलर्ट केंद्र' : 'Weather & Krishi Alerts'}</span>
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            समय पूर्व मौसमी चेतावनी, कीट प्रकोप सूचना और बाजार सलाह
          </p>
        </div>

        {alerts.some(a => a.read) && (
          <button
            onClick={clearAllReadAlerts}
            className="px-3.5 py-2 rounded-2xl border border-gray-300 hover:bg-gray-50 text-xs font-semibold text-gray-700 flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Trash2 className="w-4 h-4 text-gray-400" />
            <span>पढ़े गए अलर्ट हटाएं</span>
          </button>
        )}
      </div>

      {/* Filter Chips & Stats */}
      <div className="bg-white p-4 rounded-3xl border border-[#E5EBE1] shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          {[
            { id: 'all', label: 'सभी अलर्ट' },
            { id: 'weather', label: 'मौसम चेतावनी' },
            { id: 'pest', label: 'कीट अलर्ट' },
            { id: 'market', label: 'बाजार व बीज' }
          ].map(f => (
            <button
              key={f.id}
              onClick={() => setSelectedFilter(f.id as any)}
              className={`px-3 py-1.5 text-xs font-bold rounded-xl whitespace-nowrap transition-colors cursor-pointer ${
                selectedFilter === f.id
                  ? 'bg-[#087A43] text-white shadow-xs'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
          {unreadCount} अपठित अलर्ट मौजूद
        </span>
      </div>

      {/* Alerts Cards List */}
      <div className="space-y-3">
        {filteredAlerts.length === 0 ? (
          <div className="bg-white rounded-3xl p-10 text-center border border-dashed border-gray-300">
            <Check className="w-12 h-12 text-emerald-500 mx-auto mb-2" />
            <h3 className="text-base font-bold text-gray-800">कोई सक्रिय अलर्ट नहीं</h3>
            <p className="text-xs text-gray-500 mt-1">
              आपके चयनित क्षेत्र में सभी परिस्थितियां सामान्य हैं।
            </p>
          </div>
        ) : (
          filteredAlerts.map((alert) => (
            <div
              key={alert.id}
              onClick={() => {
                markAlertRead(alert.id);
                setSelectedAlertModal(alert);
              }}
              className={`bg-white rounded-3xl p-5 border transition-all cursor-pointer shadow-2xs hover:shadow-xs space-y-3 ${
                !alert.read
                  ? 'border-amber-300 bg-amber-50/20 ring-1 ring-amber-300/50'
                  : 'border-[#E5EBE1] hover:border-emerald-300'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="p-2.5 rounded-2xl bg-gray-100 shrink-0 mt-0.5">
                    {typeIcons[alert.type]}
                  </div>

                  <div>
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${severityBadges[alert.severity]}`}>
                        {alert.severity === 'critical' ? 'गंभीर चेतावनी' : alert.severity === 'warning' ? 'सावधानी' : 'सूचना'}
                      </span>
                      <span className="text-[11px] text-gray-400 font-medium">{alert.date}</span>
                      {!alert.read && (
                        <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                      )}
                    </div>

                    <h3 className="text-sm font-bold text-gray-900 leading-snug">
                      {alert.titleHi}
                    </h3>
                  </div>
                </div>

                <ChevronRight className="w-5 h-5 text-gray-400 shrink-0 self-center" />
              </div>

              <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed">
                {alert.messageHi}
              </p>

              {/* Actionable Step Pill */}
              <div className="bg-emerald-50/80 p-3 rounded-2xl border border-emerald-100 flex items-start gap-2">
                <Sparkles className="w-4 h-4 text-[#087A43] shrink-0 mt-0.5" />
                <p className="text-xs text-emerald-950 font-medium">
                  <strong>तुरंत क्या करें:</strong> {alert.actionRequiredHi}
                </p>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Alert Detail Modal */}
      {selectedAlertModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-gray-100 space-y-4">
            <div className="flex items-start justify-between border-b border-gray-100 pb-3">
              <div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${severityBadges[selectedAlertModal.severity]}`}>
                  {selectedAlertModal.severity.toUpperCase()}
                </span>
                <h3 className="text-base font-bold text-gray-900 mt-1">
                  {selectedAlertModal.titleHi}
                </h3>
                <p className="text-[11px] text-gray-400 mt-0.5">{selectedAlertModal.date}</p>
              </div>
              <button
                onClick={() => setSelectedAlertModal(null)}
                className="text-gray-400 hover:text-gray-600 p-1"
              >
                ✕
              </button>
            </div>

            <p className="text-xs sm:text-sm text-gray-800 leading-relaxed font-normal">
              {selectedAlertModal.messageHi}
            </p>

            <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-200 space-y-1.5">
              <h4 className="text-xs font-bold text-emerald-900 uppercase tracking-wider">
                {isHindi ? 'अनुशंसित कार्रवाई:' : 'Recommended Action:'}
              </h4>
              <p className="text-xs text-emerald-950 font-medium leading-relaxed">
                {isHindi ? selectedAlertModal.actionRequiredHi : selectedAlertModal.actionRequired}
              </p>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setSelectedAlertModal(null)}
                className="px-4 py-2 bg-[#087A43] hover:bg-[#075B35] text-white text-xs font-bold rounded-xl cursor-pointer"
              >
                {isHindi ? 'समझ गया' : 'Close'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

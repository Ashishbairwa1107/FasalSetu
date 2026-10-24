import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { t } from '../../utils/translations';
import { cleanLocationLabel } from '../../data/indianLocations';
import {
  Home,
  Tractor,
  Bot,
  TrendingUp,
  Receipt,
  Landmark,
  Users,
  CloudSun,
  Activity,
  Settings,
  HelpCircle,
  X,
  PhoneCall,
  Sparkles,
  ExternalLink,
  RotateCcw,
  Layers,
  Factory,
  LogOut,
  ArrowUpCircle,
  PlusCircle
} from 'lucide-react';

interface DesktopSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DesktopSidebar: React.FC<DesktopSidebarProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { profile, language, alerts, resetAllDemoData, showToast } = useApp();
  const [updateModalOpen, setUpdateModalOpen] = React.useState(false);

  const unreadAlerts = alerts.filter(a => !a.read).length;

  const mainNavItems = [
    {
      id: 'dashboard',
      label: t('navHome', language),
      icon: Home,
      path: '/'
    },
    {
      id: 'my-land',
      label: t('navMyLand', language),
      icon: Layers,
      path: '/my-land',
      badge: '9.1'
    },
    {
      id: 'add-land',
      label: t('navAddLand', language),
      icon: PlusCircle,
      path: '/add-land',
      badge: '8.1'
    },
    {
      id: 'nearby-mills',
      label: t('navNearbyMills', language),
      icon: Factory,
      path: '/nearby-mills',
      badge: '12'
    },
    {
      id: 'mandi',
      label: t('navMandiPrices', language),
      icon: TrendingUp,
      path: '/mandi'
    },
    {
      id: 'schemes',
      label: t('navGovtSchemes', language),
      icon: Landmark,
      path: '/schemes'
    },
    {
      id: 'ai-mitra',
      label: t('navAiMitra', language),
      icon: Bot,
      path: '/ai-mitra',
      badge: 'AI'
    },
    {
      id: 'expenses',
      label: t('navCropExpenses', language),
      icon: Receipt,
      path: '/expenses'
    },
    {
      id: 'community',
      label: t('navCommunity', language),
      icon: Users,
      path: '/community'
    },
    {
      id: 'alerts',
      label: t('navWeatherAlerts', language),
      icon: CloudSun,
      path: '/alerts',
      counter: unreadAlerts
    },
    {
      id: 'health-report',
      label: t('navKhetHealth', language),
      icon: Activity,
      path: '/health-report'
    }
  ];

  const secondaryNavItems = [
    {
      id: 'profile',
      label: t('navProfile', language),
      icon: Users,
      path: '/profile'
    },
    {
      id: 'help',
      label: t('navHelpCenter', language),
      icon: HelpCircle,
      path: '/help'
    },
    {
      id: 'updates',
      label: language === 'en' ? 'App Updates' : 'ऐप अपडेट्स',
      icon: ArrowUpCircle,
      isAction: true,
      onClick: () => setUpdateModalOpen(true)
    },
    {
      id: 'settings',
      label: t('navSettings', language),
      icon: Settings,
      path: '/settings'
    },
    {
      id: 'logout',
      label: language === 'en' ? 'Logout' : 'लॉग आउट',
      icon: LogOut,
      isAction: true,
      onClick: () => {
        showToast(language === 'en' ? 'Logged out successfully' : 'सफलतापूर्वक लॉग आउट किया गया', 'info');
        navigate('/onboarding');
        onClose();
      }
    }
  ];

  const handleNavClick = (path: string) => {
    navigate(path);
    onClose();
  };

  return (
    <>
      {/* Mobile Drawer Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-xs md:hidden transition-opacity"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed md:sticky top-0 z-50 md:z-20 h-screen w-72 bg-white border-r border-[#E3ECE1] flex flex-col justify-between transition-transform duration-300 ease-in-out shadow-xl md:shadow-none ${
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Sidebar Header */}
        <div className="p-4 border-b border-[#E3ECE1] flex items-center justify-between">
          <div
            onClick={() => handleNavClick('/')}
            className="flex items-center gap-3 cursor-pointer"
          >
            <div className="w-9 h-9 rounded-xl bg-[#087A43] text-white flex items-center justify-center font-bold shadow-sm">
              <svg className="w-5 h-5 fill-white" viewBox="0 0 24 24">
                <path d="M17 8C8 10 5.9 16.17 3.82 21.34l1.89.66.95-2.3c.48.17.98.3 1.34.3C19 20 22 3 22 3c-1 2-8 2.25-13 3.25S2 11.5 2 13.5s1.75 3.75 1.75 3.75C7 8 17 8 17 8z" />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-black text-[#075B35] tracking-tight">{t('appName', language)}</h2>
              <p className="text-[11px] text-gray-500 font-medium">{t('appTagline', language)}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="md:hidden p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Farmer Quick Glance in Sidebar */}
        <div className="px-4 py-3 bg-[#FAFBF7] border-b border-[#E3ECE1] flex items-center gap-3">
          <img
            src={profile.avatarUrl}
            alt={profile.name}
            className="w-10 h-10 rounded-full object-cover ring-2 ring-emerald-500"
          />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-gray-900 truncate">{profile.name}</p>
            <p className="text-[11px] text-gray-500 truncate">{cleanLocationLabel(profile.village, language)}, {cleanLocationLabel(profile.district, language)}</p>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="text-[10px] font-semibold text-emerald-800 bg-emerald-100 px-1.5 py-0.2 rounded">
                {profile.totalAcres} {t('acres', language)}
              </span>
            </div>
          </div>
        </div>

        {/* Scrollable Nav Items */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          <p className="px-3 text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">
            {language === 'en' ? 'Main Services' : 'मुख्य सेवाएं'}
          </p>

          {mainNavItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;

            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.path)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[#EAF6E9] text-[#075B35] font-bold shadow-2xs'
                    : 'text-gray-700 hover:bg-gray-100/80 hover:text-gray-900'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-4 h-4 ${
                      isActive ? 'text-[#087A43]' : 'text-gray-500'
                    }`}
                  />
                  <span>{item.label}</span>
                </div>

                <div className="flex items-center gap-1.5">
                  {item.badge && (
                    <span className="text-[10px] bg-emerald-600 text-white px-1.5 py-0.2 rounded-full font-bold">
                      {item.badge}
                    </span>
                  )}
                  {typeof item.counter === 'number' && item.counter > 0 && (
                    <span className="text-[10px] bg-amber-500 text-white px-1.5 py-0.2 rounded-full font-bold">
                      {item.counter}
                    </span>
                  )}
                </div>
              </button>
            );
          })}

          <div className="pt-4 mt-2 border-t border-gray-100">
            <p className="px-3 text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">
              {language === 'en' ? 'Account & Support' : 'खाता एवं सहायता'}
            </p>
            {secondaryNavItems.map((item: any) => {
              const isActive = !item.isAction && location.pathname === item.path;
              const Icon = item.icon;

              return (
                <button
                  key={item.id}
                  onClick={() => {
                    if (item.isAction && item.onClick) {
                      item.onClick();
                    } else if (item.path) {
                      handleNavClick(item.path);
                    }
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
                    isActive
                      ? 'bg-[#EAF6E9] text-[#075B35] font-bold'
                      : item.id === 'logout'
                      ? 'text-red-600 hover:bg-red-50'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${item.id === 'logout' ? 'text-red-500' : 'text-gray-400'}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.id === 'updates' && (
                    <span className="text-[9px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.5 rounded">
                      v2.4
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Sidebar Footer: Helpline Widget & Demo Reset */}
        <div className="p-3 border-t border-[#E3ECE1] bg-[#FAFBF7] space-y-2">
          {/* Toll Free Emergency Helpline Banner */}
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-2.5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-emerald-700 text-white">
                <PhoneCall className="w-3.5 h-3.5" />
              </div>
              <div>
                <p className="text-[11px] font-bold text-emerald-950">
                  {language === 'en' ? 'Kisan Call Centre' : 'किसान कॉल सेंटर'}
                </p>
                <p className="text-[10px] text-emerald-700 font-mono">1800-180-1551</p>
              </div>
            </div>
            <span className="text-[9px] font-bold bg-emerald-200 text-emerald-800 px-1.5 py-0.5 rounded">
              {language === 'en' ? 'Toll-Free' : 'निःशुल्क'}
            </span>
          </div>

          {/* Re-launch Onboarding or Reset Data trigger */}
          <div className="flex items-center gap-2 pt-1">
            <button
              onClick={() => handleNavClick('/onboarding')}
              className="flex-1 text-[11px] font-medium text-emerald-800 hover:text-emerald-950 hover:bg-emerald-100/60 py-1.5 px-2 rounded-lg text-center transition-colors border border-emerald-200 cursor-pointer"
            >
              {language === 'en' ? 'Onboarding Demo' : 'ऑनबोर्डिंग डेमो'}
            </button>
            <button
              onClick={resetAllDemoData}
              title="Reset seeded demo data"
              className="p-1.5 text-gray-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors border border-gray-200 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </aside>

      {/* App Updates Modal */}
      {updateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-gray-100 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-emerald-100 text-[#087A43]">
                  <ArrowUpCircle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-gray-900">{t('appUpdates', language)}</h3>
                  <p className="text-[11px] text-gray-500">FasalSetu Smart v2.4.0</p>
                </div>
              </div>
              <button
                onClick={() => setUpdateModalOpen(false)}
                className="p-1 rounded-lg text-gray-400 hover:bg-gray-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-gray-700">
              <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-2xl flex items-center gap-2.5">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-600 animate-pulse" />
                <span className="font-bold text-emerald-900">
                  {language === 'en' ? 'You are using the latest version' : 'आप नवीनतम संस्करण का उपयोग कर रहे हैं'}
                </span>
              </div>

              <div className="space-y-1.5">
                <p className="font-bold text-gray-900">
                  {language === 'en' ? 'Version 2.4 Highlights:' : 'संस्करण 2.4 के मुख्य नए फीचर्स:'}
                </p>
                <ul className="list-disc list-inside space-y-1 text-gray-600 pl-1">
                  {language === 'en' ? (
                    <>
                      <li>Complete UI translations across 8 Indian languages</li>
                      <li>Dynamic Indian State and District selectors</li>
                      <li>Polished natural agricultural onboarding flow</li>
                      <li>Farmer voice assistant for hands-free land registration</li>
                      <li>Farm health and productivity reports</li>
                    </>
                  ) : (
                    <>
                      <li>8 भाषाओं में संपूर्ण ऐप अनुवाद (हिंदी, छत्तीसगढ़ी, English, मराठी, आदि)</li>
                      <li>भारतीय राज्य एवं जिला डायनामिक ड्रॉपडाउन</li>
                      <li>नया ऑनबोर्डिंग स्वागत स्क्रीन (सटीक संदर्भ डिजाइन)</li>
                      <li>आवाज सहायक (बोलकर भूमि जोड़ें)</li>
                      <li>खेत स्वास्थ्य रिपोर्ट डाउनलोड</li>
                    </>
                  )}
                </ul>
              </div>
            </div>

            <button
              onClick={() => setUpdateModalOpen(false)}
              className="w-full py-2.5 bg-[#087A43] hover:bg-[#075B35] text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              {t('understood', language)}
            </button>
          </div>
        </div>
      )}
    </>
  );
};

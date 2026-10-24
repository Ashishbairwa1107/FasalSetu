import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { LANGUAGES, t } from '../../utils/translations';
import { cleanLocationLabel } from '../../data/indianLocations';
import { Language } from '../../types';
import {
  Menu,
  Bell,
  Search,
  Globe,
  MapPin,
  Sparkles,
  ChevronDown,
  Check,
  X,
  Home
} from 'lucide-react';

interface AppHeaderProps {
  onToggleSidebar?: () => void;
}

export const AppHeader: React.FC<AppHeaderProps> = ({ onToggleSidebar }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { profile, updateProfile, language, setLanguage, alerts } = useApp();
  const [districtDropdownOpen, setDistrictDropdownOpen] = useState(false);
  const [langModalOpen, setLangModalOpen] = useState(false);

  const unreadAlertsCount = alerts.filter(a => !a.read).length;

  const currentLangObj = LANGUAGES.find(l => l.code === language) || LANGUAGES[0];

  const districts = [
    { nameHi: 'रायपुर', nameEn: 'Raipur', stateHi: 'छत्तीसगढ़', stateEn: 'Chhattisgarh' },
    { nameHi: 'दुर्ग', nameEn: 'Durg', stateHi: 'छत्तीसगढ़', stateEn: 'Chhattisgarh' },
    { nameHi: 'बिलासपुर', nameEn: 'Bilaspur', stateHi: 'छत्तीसगढ़', stateEn: 'Chhattisgarh' },
    { nameHi: 'इंदौर', nameEn: 'Indore', stateHi: 'मध्य प्रदेश', stateEn: 'Madhya Pradesh' },
    { nameHi: 'करनाल', nameEn: 'Karnal', stateHi: 'हरियाणा', stateEn: 'Haryana' },
    { nameHi: 'भरतपुर', nameEn: 'Bharatpur', stateHi: 'राजस्थान', stateEn: 'Rajasthan' }
  ];

  const handleSelectDistrict = (dist: { nameHi: string; nameEn: string; stateHi: string; stateEn: string }) => {
    const dName = language === 'en' ? dist.nameEn : dist.nameHi;
    const sName = language === 'en' ? dist.stateEn : dist.stateHi;
    updateProfile({ district: dName, state: sName });
    setDistrictDropdownOpen(false);
  };

  const handleSelectLang = (code: Language) => {
    setLanguage(code);
    setLangModalOpen(false);
  };

  return (
    <header className="sticky top-0 z-30 bg-[#087A43] text-white shadow-md border-b border-[#075B35]">
      {/* Top Banner (Micro announcement) */}
      <div className="bg-[#075B35] px-4 py-1 text-xs text-emerald-100 flex items-center justify-between font-medium">
        <div className="flex items-center gap-1.5 truncate">
          <Sparkles className="w-3.5 h-3.5 text-amber-300 shrink-0" />
          <span className="truncate">
            {language === 'en'
              ? 'FasalSetu Smart Agri v2.4 — Rabi Crop Advisory Live'
              : 'फसलसेतु स्मार्ट कृषि संस्करण 2.4 — रबी फसल सलाह उपलब्ध'}
          </span>
        </div>
        <div className="hidden sm:flex items-center gap-3 shrink-0">
          <span className="text-[11px] bg-white/10 px-2 py-0.5 rounded-full">
            {t('kisanCallCentre', language)}: 1800-180-1551 ({t('tollFree', language)})
          </span>
        </div>
      </div>

      {/* Main Header Bar */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 h-16 flex items-center justify-between gap-2 sm:gap-4">
        {/* Left: Hamburger & Logo */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={onToggleSidebar}
            aria-label="Open menu"
            className="p-2 -ml-1 rounded-xl hover:bg-white/10 active:bg-white/20 transition-colors cursor-pointer text-white"
          >
            <Menu className="w-6 h-6" />
          </button>

          <div
            onClick={() => navigate('/')}
            className="flex items-center gap-2 cursor-pointer group"
          >
            {/* Leaf Logo Badge */}
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-white text-[#087A43] flex items-center justify-center font-black shadow-sm group-hover:scale-105 transition-transform">
              <svg className="w-6 h-6 fill-[#087A43]" viewBox="0 0 24 24">
                <path d="M17 8C8 10 5.9 16.17 3.82 21.34l1.89.66.95-2.3c.48.17.98.3 1.34.3C19 20 22 3 22 3c-1 2-8 2.25-13 3.25S2 11.5 2 13.5s1.75 3.75 1.75 3.75C7 8 17 8 17 8z" />
              </svg>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-lg sm:text-xl tracking-tight leading-tight">
                  {t('appName', language)}
                </span>
              </div>
              <p className="text-[10px] text-emerald-200 hidden sm:block leading-tight font-medium">
                {t('appTagline', language)}
              </p>
            </div>
          </div>

          {/* Consistent Dashboard Shortcut in Header (visible on feature pages) */}
          {location.pathname !== '/' && (
            <button
              onClick={() => navigate('/')}
              className="hidden md:inline-flex items-center gap-1.5 bg-white/10 hover:bg-white/20 active:bg-white/30 text-white px-2.5 py-1 rounded-full text-xs font-bold border border-white/20 transition-all cursor-pointer shadow-2xs ml-1"
              title={language === 'en' ? 'Go to Dashboard' : 'डैशबोर्ड पर जाएं'}
            >
              <Home className="w-3.5 h-3.5 text-amber-300" />
              <span>{language === 'en' ? 'Dashboard' : 'डैशबोर्ड'}</span>
            </button>
          )}
        </div>

        {/* Center: District & Location Selector */}
        <div className="relative">
          <button
            onClick={() => setDistrictDropdownOpen(!districtDropdownOpen)}
            className="flex items-center gap-1.5 bg-white/10 hover:bg-white/15 px-2.5 py-1.5 rounded-full text-xs font-medium text-white transition-colors cursor-pointer"
          >
            <MapPin className="w-3.5 h-3.5 text-amber-300 shrink-0" />
            <span className="truncate max-w-[110px] sm:max-w-[150px]">
              {cleanLocationLabel(profile.district, language)}
            </span>
            <ChevronDown className="w-3.5 h-3.5 opacity-80" />
          </button>

          {districtDropdownOpen && (
            <div className="absolute top-full mt-2 left-0 sm:left-auto sm:right-0 w-56 bg-white text-gray-800 rounded-xl shadow-2xl border border-gray-100 py-2 z-50">
              <div className="px-3 py-1.5 text-xs font-semibold text-gray-400 border-b border-gray-100 uppercase tracking-wider">
                {language === 'en' ? 'Select Location' : 'जिला / मंडी स्थान चुनें'}
              </div>
              {districts.map((d, idx) => {
                const name = language === 'en' ? d.nameEn : d.nameHi;
                const state = language === 'en' ? d.stateEn : d.stateHi;
                const isSelected = cleanLocationLabel(profile.district, language) === name;

                return (
                  <button
                    key={idx}
                    onClick={() => handleSelectDistrict(d)}
                    className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-emerald-50 transition-colors ${
                      isSelected ? 'font-bold text-[#087A43] bg-emerald-50/60' : 'text-gray-700'
                    }`}
                  >
                    <span>{name}</span>
                    <span className="text-[10px] text-gray-400">{state}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Right: Actions, Language Selector, Notifications & Profile Avatar */}
        <div className="flex items-center gap-1.5 sm:gap-2.5">
          {/* Global Search trigger */}
          <button
            onClick={() => navigate('/search')}
            aria-label="Search crops and schemes"
            className="p-2 rounded-full hover:bg-white/10 text-white transition-colors cursor-pointer"
          >
            <Search className="w-5 h-5" />
          </button>

          {/* Language Selector Pill */}
          <div className="relative">
            <button
              onClick={() => setLangModalOpen(!langModalOpen)}
              className="flex items-center gap-1.5 bg-emerald-800/80 hover:bg-emerald-850 px-2.5 py-1.5 rounded-full text-xs font-bold tracking-wide border border-emerald-600/60 shadow-xs transition-all cursor-pointer text-white"
              title={language === 'en' ? 'Select Language' : 'भाषा चुनें'}
            >
              <Globe className="w-3.5 h-3.5 text-amber-300" />
              <span>{currentLangObj.nativeName}</span>
              <ChevronDown className="w-3 h-3 opacity-80" />
            </button>

            {/* Language Selection Dropdown Menu */}
            {langModalOpen && (
              <div className="absolute right-0 top-full mt-2 w-64 bg-white text-gray-900 rounded-2xl shadow-2xl border border-gray-100 p-2 z-50 animate-in fade-in duration-150">
                <div className="px-3 py-1.5 border-b border-gray-100 flex items-center justify-between">
                  <span className="text-xs font-bold text-gray-700">
                    {t('changeLanguage', language)}
                  </span>
                  <button
                    onClick={() => setLangModalOpen(false)}
                    className="p-1 text-gray-400 hover:text-gray-700 rounded-lg cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="grid grid-cols-1 gap-1 mt-1 max-h-72 overflow-y-auto">
                  {LANGUAGES.map(lang => {
                    const isSelected = language === lang.code;
                    return (
                      <button
                        key={lang.code}
                        type="button"
                        onClick={() => handleSelectLang(lang.code)}
                        className={`w-full text-left px-3 py-2 rounded-xl flex items-center justify-between text-xs transition-colors cursor-pointer ${
                          isSelected
                            ? 'bg-[#EAF6E9] text-[#087A43] font-bold ring-1 ring-[#087A43]/30'
                            : 'hover:bg-gray-100 text-gray-800 font-medium'
                        }`}
                      >
                        <div className="flex flex-col">
                          <span className="text-sm font-bold">{lang.nativeName}</span>
                          <span className="text-[10px] text-gray-400">{lang.name} • {lang.region}</span>
                        </div>
                        {isSelected && (
                          <div className="w-4 h-4 rounded-full bg-[#087A43] text-white flex items-center justify-center shrink-0">
                            <Check className="w-2.5 h-2.5" />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Notifications / Alerts icon */}
          <button
            onClick={() => navigate('/alerts')}
            aria-label="View notifications"
            className="relative p-2 rounded-full hover:bg-white/10 transition-colors cursor-pointer"
          >
            <Bell className="w-5 h-5" />
            {unreadAlertsCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-amber-400 text-[#075B35] rounded-full text-[10px] font-bold flex items-center justify-center animate-pulse shadow">
                {unreadAlertsCount}
              </span>
            )}
          </button>

          {/* Farmer Profile Avatar & Greeting */}
          <div
            onClick={() => navigate('/profile')}
            className="flex items-center gap-2 pl-1.5 pr-2 py-1 rounded-full hover:bg-white/10 cursor-pointer transition-colors"
          >
            <img
              src={profile.avatarUrl}
              alt={profile.name}
              className="w-8 h-8 rounded-full object-cover ring-2 ring-emerald-300/80 shadow-xs"
            />
            <div className="hidden lg:block text-left leading-tight">
              <p className="text-xs font-bold truncate max-w-[120px]">
                {profile.name}
              </p>
              <p className="text-[10px] text-emerald-200">
                {profile.village}
              </p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

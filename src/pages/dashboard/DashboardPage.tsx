import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { MOCK_WEATHER, INITIAL_NEWS } from '../../data/mockData';
import { NewsArticle } from '../../types';
import { t } from '../../utils/translations';
import {
  CloudSun,
  Droplets,
  Wind,
  Bot,
  Bookmark,
  Share2,
  PlayCircle,
  AlertTriangle,
  ChevronRight,
  X,
  PlusCircle,
  Layers,
  Mic,
  ExternalLink
} from 'lucide-react';
import { SubscriptionPlansSection } from '../../components/subscription/SubscriptionPlansSection';

const FALLBACK_NEWS_IMAGE = '/images/solar_pump_fallback.jpg';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { profile, farms, lands, alerts, language, showToast, openVoiceAssistant } = useApp();

  const [newsFilter, setNewsFilter] = useState<'all' | 'advisory' | 'schemes' | 'video'>('all');
  const [selectedArticle, setSelectedArticle] = useState<NewsArticle | null>(null);
  const [bookmarkedArticles, setBookmarkedArticles] = useState<string[]>(['news-01', 'news-03']);

  const isHindi = language === 'hi' || language === 'cg';

  // Calculate quick workspace aggregates
  const totalAcreage = lands && lands.length > 0 
    ? lands.reduce((acc, l) => acc + (l.area || 0), 0)
    : farms.reduce((acc, f) => acc + f.area, 0);
  const totalLandsCount = lands && lands.length > 0 ? lands.length : farms.length;
  const criticalAlert = alerts.find(a => !a.read && (a.severity === 'critical' || a.severity === 'warning'));

  const toggleBookmark = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (bookmarkedArticles.includes(id)) {
      setBookmarkedArticles(prev => prev.filter(item => item !== id));
      showToast(isHindi ? 'समाचार बुकमार्क से हटाया गया' : 'Bookmark removed', 'info');
    } else {
      setBookmarkedArticles(prev => [...prev, id]);
      showToast(isHindi ? 'समाचार सुरक्षित किया गया' : 'Article bookmarked', 'success');
    }
  };

  const handleShare = (title: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (navigator.share) {
      navigator.share({ title: `फसलसेतु: ${title}`, url: window.location.href });
    } else {
      navigator.clipboard.writeText(window.location.href);
      showToast(isHindi ? 'लिंक क्लिपबोर्ड पर कॉपी किया गया' : 'Link copied to clipboard', 'info');
    }
  };

  const filteredNews = INITIAL_NEWS.filter(article => {
    if (newsFilter === 'all') return true;
    return article.category === newsFilter;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* 1. Farmer Welcome Greeting & Quick Profile Summary */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-gradient-to-r from-[#087A43] via-[#075B35] to-[#044326] text-white p-5 rounded-3xl shadow-sm relative overflow-hidden">
        {/* Subtle decorative leaf watermark */}
        <div className="absolute right-0 top-0 translate-x-8 -translate-y-6 opacity-10 pointer-events-none">
          <svg className="w-56 h-56 fill-white" viewBox="0 0 24 24">
            <path d="M17 8C8 10 5.9 16.17 3.82 21.34l1.89.66.95-2.3c.48.17.98.3 1.34.3C19 20 22 3 22 3c-1 2-8 2.25-13 3.25S2 11.5 2 13.5s1.75 3.75 1.75 3.75C7 8 17 8 17 8z" />
          </svg>
        </div>

        <div className="flex items-center gap-4 relative z-10">
          <img
            src={profile.avatarUrl}
            alt={profile.name}
            className="w-14 h-14 rounded-2xl object-cover ring-2 ring-emerald-300 shadow-md"
          />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black tracking-tight">
                {language === 'en' ? `Hello, ${profile.name}!` : language === 'cg' ? `जय जोहार, ${profile.name}!` : `नमस्ते, ${profile.name}!`}
              </h1>
              <span className="text-xs bg-amber-400 text-emerald-950 font-bold px-2 py-0.5 rounded-full shadow-xs">
                {language === 'en' ? 'Active' : 'सक्रिय'}
              </span>
            </div>
            <p className="text-xs text-emerald-100 mt-0.5 flex items-center gap-1.5 font-medium">
              <span>{profile.village}, {profile.district}</span>
              <span>•</span>
              <span>{profile.totalAcres} {t('acres', language)} {t('totalArea', language)}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 relative z-10 flex-wrap sm:flex-nowrap">
          <button
            onClick={() => openVoiceAssistant('register_land')}
            className="px-3.5 py-2 bg-amber-400 hover:bg-amber-300 text-emerald-950 rounded-xl font-black text-xs transition-all shadow-sm flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
            title="बोलकर काम करें"
          >
            <Mic className="w-4 h-4 text-emerald-950 animate-pulse" />
            <span>{language === 'en' ? 'Voice Assistant' : language === 'cg' ? 'गोठिया के बताओ' : 'बोलकर बताएं'}</span>
          </button>
          <button
            onClick={() => navigate('/ai-mitra')}
            className="flex-1 sm:flex-none px-4 py-2 bg-white text-[#075B35] rounded-xl font-bold text-xs hover:bg-emerald-50 transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer"
          >
            <Bot className="w-4 h-4 text-[#087A43]" />
            <span>{t('navAiMitra', language)}</span>
          </button>
          <button
            onClick={() => navigate('/farm')}
            className="px-3.5 py-2 bg-emerald-800/80 hover:bg-emerald-800 text-white rounded-xl font-medium text-xs border border-emerald-600/50 transition-all cursor-pointer"
          >
            {t('navMyLand', language)}
          </button>
        </div>
      </div>

      {/* 2. Critical Alert Banner (if any) */}
      {criticalAlert && (
        <div
          onClick={() => navigate('/alerts')}
          className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3 cursor-pointer hover:bg-amber-100/70 transition-colors shadow-2xs"
        >
          <div className="p-2 rounded-xl bg-amber-500 text-white shrink-0 mt-0.5">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-amber-900 bg-amber-200 px-2 py-0.5 rounded-full uppercase tracking-wider">
                कृषि चेतावनी
              </span>
              <span className="text-[11px] text-amber-700 font-medium">{criticalAlert.date}</span>
            </div>
            <h4 className="text-sm font-bold text-amber-950 mt-1 truncate">
              {criticalAlert.title}
            </h4>
            <p className="text-xs text-amber-800 mt-0.5 line-clamp-1">
              सलाह: {criticalAlert.actionRequired}
            </p>
          </div>
          <ChevronRight className="w-5 h-5 text-amber-700 shrink-0 self-center" />
        </div>
      )}

      {/* 2.5 Dedicated Farmer Voice Assistant Card — Primary Entry Point for Farmers */}
      <div className="bg-gradient-to-r from-emerald-900 via-[#075B35] to-[#087A43] text-white p-5 sm:p-6 rounded-3xl shadow-sm border border-emerald-600/40 relative overflow-hidden">
        {/* Subtle decorative leaf watermark */}
        <div className="absolute right-0 top-0 translate-x-8 -translate-y-6 opacity-10 pointer-events-none">
          <svg className="w-56 h-56 fill-white" viewBox="0 0 24 24">
            <path d="M17 8C8 10 5.9 16.17 3.82 21.34l1.89.66.95-2.3c.48.17.98.3 1.34.3C19 20 22 3 22 3c-1 2-8 2.25-13 3.25S2 11.5 2 13.5s1.75 3.75 1.75 3.75C7 8 17 8 17 8z" />
          </svg>
        </div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 relative z-10">
          <div className="flex items-center gap-4">
            <button
              onClick={() => openVoiceAssistant('register_land')}
              className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-amber-400 hover:bg-amber-300 text-emerald-950 flex items-center justify-center font-black shadow-lg shrink-0 cursor-pointer transition-transform hover:scale-105 active:scale-95 group"
              title="माइक दबाकर बोलें"
            >
              <Mic className="w-8 h-8 text-emerald-950 group-hover:scale-110 transition-transform animate-pulse" />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black tracking-tight text-white">
                  {language === 'en' ? 'Voice Farm Assistant' : 'बोलकर खेती का काम करें'}
                </h3>
                <span className="text-[10px] bg-amber-400 text-emerald-950 font-extrabold px-2 py-0.5 rounded-full shadow-xs">
                  {t('voiceButtonTitle', language)}
                </span>
              </div>
              <p className="text-xs text-emerald-100 mt-1 max-w-xl leading-relaxed">
                {language === 'en'
                  ? 'Speak to register land, listen to calendar tasks, track expenses, or check mandi prices.'
                  : 'हिंदी या छत्तीसगढ़ी में बोलकर नया खेत पंजीकृत करें, कैलेंडर कार्य सुनें, खर्च जांचें या मंडी भाव जानें। बिना लिखे-पढ़े आसान समाधान।'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap shrink-0">
            <button
              onClick={() => openVoiceAssistant('register_land')}
              className="px-4 py-2.5 bg-white text-[#075B35] hover:bg-emerald-50 rounded-xl font-bold text-xs shadow-md transition-all flex items-center gap-2 cursor-pointer active:scale-95"
            >
              <Layers className="w-4 h-4 text-[#087A43]" />
              <span>{t('voiceAddLand', language)}</span>
            </button>
            <button
              onClick={() => openVoiceAssistant('voice_nav')}
              className="px-4 py-2.5 bg-emerald-800/90 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs border border-emerald-500/60 transition-all flex items-center gap-2 cursor-pointer active:scale-95"
            >
              <Mic className="w-4 h-4 text-amber-300" />
              <span>{t('voiceAppNav', language)}</span>
            </button>
          </div>
        </div>
      </div>
      <div className="bg-white rounded-3xl p-5 border border-[#E5EBE1] shadow-xs">
        <div className="flex items-center justify-between border-b border-gray-100 pb-3 mb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-sky-100 text-[#0284C7]">
              <CloudSun className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-900">
                {t('weatherTitle', language)}
              </h3>
              <p className="text-[11px] text-gray-500">
                स्थान: {MOCK_WEATHER.location}, {MOCK_WEATHER.state}
              </p>
            </div>
          </div>

          <span className="text-[10px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-1 rounded-md border border-emerald-200">
            डेमो वेदर डेटा
          </span>
        </div>

        {/* Current Weather Highlight */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
          <div className="flex items-center gap-4">
            <div className="text-4xl sm:text-5xl font-black text-gray-900 tracking-tight">
              {MOCK_WEATHER.currentTemp}°<span className="text-2xl font-bold text-gray-500">C</span>
            </div>
            <div>
              <p className="text-sm font-bold text-gray-800">{MOCK_WEATHER.conditionHi}</p>
              <p className="text-xs text-gray-500">महसूस: {MOCK_WEATHER.feelsLike}°C</p>
            </div>
          </div>

          {/* Metrics */}
          <div className="flex items-center justify-between sm:justify-start gap-4 text-xs text-gray-600 bg-[#FAFBF7] p-3 rounded-2xl border border-gray-100">
            <div className="flex items-center gap-2">
              <Droplets className="w-4 h-4 text-sky-600" />
              <div>
                <p className="text-[10px] text-gray-400">वर्षा संभावना</p>
                <p className="font-bold text-gray-800">{MOCK_WEATHER.rainProbability}%</p>
              </div>
            </div>
            <div className="h-6 w-px bg-gray-200" />
            <div className="flex items-center gap-2">
              <Wind className="w-4 h-4 text-teal-600" />
              <div>
                <p className="text-[10px] text-gray-400">हवा की गति</p>
                <p className="font-bold text-gray-800">{MOCK_WEATHER.windSpeedKmH} किमी/घंटा</p>
              </div>
            </div>
            <div className="h-6 w-px bg-gray-200" />
            <div>
              <p className="text-[10px] text-gray-400">आर्द्रता</p>
              <p className="font-bold text-gray-800">{MOCK_WEATHER.humidity}%</p>
            </div>
          </div>

          {/* Today's advisory summary */}
          <div className="bg-emerald-50/70 p-3 rounded-2xl border border-emerald-100">
            <p className="text-[10px] font-bold text-[#087A43] uppercase tracking-wider">
              आज की कृषि सलाह:
            </p>
            <p className="text-xs text-emerald-950 font-medium mt-0.5 leading-snug">
              {MOCK_WEATHER.todayForecastHi}
            </p>
          </div>
        </div>

        {/* 5-Day Mini Forecast Strip */}
        <div className="mt-4 pt-3 border-t border-gray-100 grid grid-cols-5 gap-2 text-center">
          {MOCK_WEATHER.dailyForecast.map((day, idx) => (
            <div
              key={idx}
              className={`p-2 rounded-xl transition-colors ${
                idx === 0 ? 'bg-emerald-50/60 font-semibold' : 'hover:bg-gray-50'
              }`}
            >
              <p className="text-[11px] text-gray-600">{day.dayHi}</p>
              <div className="my-1 flex justify-center">
                <CloudSun className="w-4 h-4 text-amber-500" />
              </div>
              <p className="text-xs font-bold text-gray-800">
                {day.tempMax}° / <span className="text-gray-400 font-normal">{day.tempMin}°</span>
              </p>
              <span className="text-[9px] text-sky-600 font-medium">💧 {day.rainProb}%</span>
            </div>
          ))}
        </div>
      </div>

      {/* 4. Workspace Hero Banner (Section 5 Requirement & Updated UI/UX) */}
      <div className="bg-gradient-to-r from-emerald-950 via-[#075B35] to-[#087A43] text-white rounded-3xl p-6 shadow-sm relative overflow-hidden">
        {/* Subtle decorative leaf watermark */}
        <div className="absolute right-0 top-0 translate-x-8 -translate-y-6 opacity-10 pointer-events-none">
          <svg className="w-56 h-56 fill-white" viewBox="0 0 24 24">
            <path d="M17 8C8 10 5.9 16.17 3.82 21.34l1.89.66.95-2.3c.48.17.98.3 1.34.3C19 20 22 3 22 3c-1 2-8 2.25-13 3.25S2 11.5 2 13.5s1.75 3.75 1.75 3.75C7 8 17 8 17 8z" />
          </svg>
        </div>

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 relative z-10">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-800 text-emerald-200 px-2.5 py-0.5 rounded-full inline-block">
                {t('workspaceTitle', language)}
              </span>
              <span className="text-xs text-amber-300 font-semibold">
                {totalAcreage.toFixed(1)} {t('acres', language)} • {totalLandsCount} {language === 'en' ? 'Lands' : 'भूमियां'}
              </span>
            </div>
            <h3 className="text-lg sm:text-xl font-bold tracking-tight text-white">
              {t('workspaceSubtitle', language)}
            </h3>
            <p className="text-xs text-emerald-100 max-w-xl">
              10-चरणीय भूमि पंजीकरण, AI मृदा विश्लेषण, फसल अनुशंसा व मौसमी बही-खाता।
            </p>
          </div>

          <div className="flex items-center gap-2.5 sm:gap-3 flex-wrap">
            <button
              onClick={() => navigate('/add-land')}
              className="px-4 py-2.5 bg-white text-[#075B35] hover:bg-emerald-50 rounded-xl font-bold text-xs shadow-md transition-all flex items-center gap-2 cursor-pointer group"
            >
              <PlusCircle className="w-4 h-4 text-[#087A43] group-hover:scale-110 transition-transform" />
              <span>{t('navAddLand', language)}</span>
            </button>
            <button
              onClick={() => navigate('/my-land')}
              className="px-4 py-2.5 bg-emerald-800/90 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs border border-emerald-500/60 transition-all flex items-center gap-2 cursor-pointer"
            >
              <Layers className="w-4 h-4 text-emerald-300" />
              <span>{t('navMyLand', language)}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 5. Agriculture News, Video Guides & Advisory */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3 px-1">
          <div>
            <h2 className="text-base font-bold text-gray-900">
              {t('newsTitle', language)}
            </h2>
            <p className="text-xs text-gray-500">
              {language === 'en'
                ? 'Latest government schemes, MSP updates and scientific farming videos'
                : 'नवीनतम सरकारी योजनाएं, एमएसपी अपडेट और वैज्ञानिक वीडियो'}
            </p>
          </div>

          {/* Category Filter Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
            {[
              { id: 'all', label: language === 'en' ? 'All' : 'सभी' },
              { id: 'schemes', label: language === 'en' ? 'Schemes' : 'योजनाएं' },
              { id: 'advisory', label: language === 'en' ? 'Advisory' : 'सलाह' },
              { id: 'video', label: language === 'en' ? 'Videos' : 'वीडियो' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setNewsFilter(tab.id as any)}
                className={`px-3 py-1 text-xs font-semibold rounded-full transition-colors shrink-0 cursor-pointer ${
                  newsFilter === tab.id
                    ? 'bg-[#087A43] text-white shadow-xs'
                    : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* News Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {filteredNews.map((article) => {
            const isBookmarked = bookmarkedArticles.includes(article.id);
            const isVideo = article.category === 'video';

            const handleCardClick = () => {
              if (isVideo && article.videoUrl) {
                window.open(article.videoUrl, '_blank', 'noopener,noreferrer');
              } else if (article.articleUrl) {
                window.open(article.articleUrl, '_blank', 'noopener,noreferrer');
              } else {
                setSelectedArticle(article);
              }
            };

            return (
              <div
                key={article.id}
                role="button"
                tabIndex={0}
                onClick={handleCardClick}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleCardClick();
                  }
                }}
                aria-label={`${language === 'en' ? article.title : article.titleHi} (${isVideo ? 'Video' : 'Article'})`}
                className="bg-white rounded-2xl border border-[#E5EBE1] hover:border-emerald-400 hover:shadow-md shadow-2xs overflow-hidden flex flex-col justify-between cursor-pointer group transition-all focus:outline-hidden focus:ring-2 focus:ring-[#087A43]"
              >
                <div>
                  <div className="relative h-40 overflow-hidden bg-gray-100">
                    <img
                      src={article.imageUrl}
                      alt={language === 'en' ? article.title : article.titleHi}
                      onError={(e) => {
                        const target = e.currentTarget;
                        if (!target.src.includes('solar_pump_fallback.jpg')) {
                          target.src = FALLBACK_NEWS_IMAGE;
                        }
                      }}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    {isVideo && (
                      <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                        <div className="w-12 h-12 rounded-full bg-white/95 text-emerald-800 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                          <PlayCircle className="w-7 h-7 text-red-600" />
                        </div>
                      </div>
                    )}
                    <span className="absolute top-2.5 left-2.5 bg-black/60 backdrop-blur-xs text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                      {article.category === 'video'
                        ? (language === 'en' ? 'Video' : 'वीडियो')
                        : article.category === 'schemes'
                          ? (language === 'en' ? 'Scheme' : 'योजना')
                          : (language === 'en' ? 'Advisory' : 'सलाह')}
                    </span>
                  </div>

                  <div className="p-4">
                    <div className="flex items-center justify-between text-[11px] text-gray-400 mb-1.5">
                      <span>{article.author}</span>
                      <span>{article.publishedDate}</span>
                    </div>
                    <h3 className="text-sm font-bold text-gray-900 group-hover:text-[#087A43] transition-colors line-clamp-2 leading-snug">
                      {language === 'en' ? article.title : article.titleHi}
                    </h3>
                    <p className="text-xs text-gray-600 mt-1.5 line-clamp-2 leading-relaxed">
                      {language === 'en' ? article.summary : article.summaryHi}
                    </p>
                  </div>
                </div>

                <div className="px-4 py-3 border-t border-gray-100 bg-[#FAFBF7] flex items-center justify-between">
                  <span className="text-[11px] text-emerald-800 font-semibold flex items-center gap-1.5">
                    {isVideo ? (
                      <>
                        <PlayCircle className="w-3.5 h-3.5 text-red-600" />
                        <span>{language === 'en' ? 'Watch on YouTube' : 'यूट्यूब पर देखें'}</span>
                        <ExternalLink className="w-3 h-3 text-red-600" />
                      </>
                    ) : (
                      <>
                        <span>{article.readTime}</span>
                        <span className="text-gray-300">•</span>
                        <span className="text-[#087A43] flex items-center gap-0.5 font-bold">
                          {language === 'en' ? 'Read Article' : 'लेख पढ़ें'}
                          <ExternalLink className="w-3 h-3" />
                        </span>
                      </>
                    )}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={(e) => toggleBookmark(article.id, e)}
                      className="p-1.5 text-gray-400 hover:text-[#087A43] rounded-lg transition-colors cursor-pointer"
                      title={language === 'en' ? 'Bookmark' : 'बुकमार्क'}
                      aria-label={language === 'en' ? 'Bookmark' : 'बुकमार्क'}
                    >
                      <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-[#087A43] text-[#087A43]' : ''}`} />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => handleShare(language === 'en' ? article.title : article.titleHi, e)}
                      className="p-1.5 text-gray-400 hover:text-gray-700 rounded-lg transition-colors cursor-pointer"
                      title={language === 'en' ? 'Share' : 'शेयर करें'}
                      aria-label={language === 'en' ? 'Share' : 'शेयर करें'}
                    >
                      <Share2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Subscription Plans & Status Section */}
      <SubscriptionPlansSection />

      {/* Article Detail Modal */}
      {selectedArticle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-100 flex flex-col">
            <div className="relative h-56 shrink-0 bg-gray-900">
              <img
                src={selectedArticle.imageUrl}
                alt={language === 'en' ? selectedArticle.title : selectedArticle.titleHi}
                onError={(e) => {
                  const target = e.currentTarget;
                  if (!target.src.includes('solar_pump_fallback.jpg')) {
                    target.src = FALLBACK_NEWS_IMAGE;
                  }
                }}
                className="w-full h-full object-cover opacity-90"
              />
              <button
                type="button"
                onClick={() => setSelectedArticle(null)}
                aria-label={language === 'en' ? 'Close' : 'बंद करें'}
                className="absolute top-3 right-3 p-2 bg-black/60 hover:bg-black/80 text-white rounded-full transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="absolute bottom-3 left-4 right-4">
                <span className="text-[10px] bg-emerald-600 text-white font-bold px-2 py-0.5 rounded">
                  {selectedArticle.category.toUpperCase()}
                </span>
                <h2 className="text-lg font-bold text-white mt-1 leading-snug drop-shadow-sm">
                  {language === 'en' ? selectedArticle.title : selectedArticle.titleHi}
                </h2>
              </div>
            </div>

            <div className="p-6 space-y-4 flex-1">
              <div className="flex items-center justify-between text-xs text-gray-500 border-b border-gray-100 pb-3">
                <p>
                  {language === 'en' ? 'Source / Author:' : 'स्रोत / लेखक:'}{' '}
                  <strong>{selectedArticle.author}</strong>
                </p>
                <p>{selectedArticle.publishedDate} • {selectedArticle.readTime}</p>
              </div>

              <div className="text-sm text-gray-800 leading-relaxed space-y-3 font-normal">
                <p className="font-semibold text-emerald-900 bg-emerald-50 p-3 rounded-xl border border-emerald-100">
                  {language === 'en' ? selectedArticle.summary : selectedArticle.summaryHi}
                </p>
                <p>{language === 'en' ? selectedArticle.content : selectedArticle.contentHi}</p>
              </div>

              {/* Tags */}
              <div className="flex items-center gap-1.5 flex-wrap pt-2">
                {selectedArticle.tags.map((tg, idx) => (
                  <span key={idx} className="text-[11px] bg-gray-100 text-gray-700 px-2 py-0.5 rounded-md font-medium">
                    #{tg}
                  </span>
                ))}
              </div>
            </div>

            <div className="p-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => setSelectedArticle(null)}
                className="px-4 py-2 text-xs font-semibold text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-100 cursor-pointer"
              >
                {language === 'en' ? 'Close' : 'बंद करें'}
              </button>
              <div className="flex items-center gap-2">
                {selectedArticle.articleUrl && (
                  <a
                    href={selectedArticle.articleUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 text-xs font-bold text-white bg-[#087A43] hover:bg-[#075B35] rounded-xl flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <span>{language === 'en' ? 'Read Official Source' : 'आधिकारिक स्रोत पढ़ें'}</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
                {selectedArticle.videoUrl && (
                  <a
                    href={selectedArticle.videoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <span>{language === 'en' ? 'Watch on YouTube' : 'यूट्यूब पर देखें'}</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
                <button
                  type="button"
                  onClick={(e) => handleShare(language === 'en' ? selectedArticle.title : selectedArticle.titleHi, e)}
                  className="px-3.5 py-2 text-xs font-bold text-emerald-900 bg-emerald-100 hover:bg-emerald-200 rounded-xl flex items-center gap-1.5 cursor-pointer"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>{language === 'en' ? 'Share' : 'शेयर करें'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

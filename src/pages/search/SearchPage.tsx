import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { INITIAL_MANDI_PRICES, INITIAL_SCHEMES, INITIAL_NEWS } from '../../data/mockData';
import { PageHeaderNav } from '../../components/common/PageHeaderNav';
import {
  Search,
  ArrowRight,
  TrendingUp,
  Landmark,
  FileText,
  Tractor,
  X
} from 'lucide-react';

export const SearchPage: React.FC = () => {
  const navigate = useNavigate();
  const { language } = useApp();
  const isHindi = language === 'hi' || language === 'cg';

  const [query, setQuery] = useState('');

  // Search Results
  const matchingMandis = INITIAL_MANDI_PRICES.filter(m =>
    m.cropNameHi.includes(query) || m.cropName.toLowerCase().includes(query.toLowerCase()) || m.marketName.includes(query)
  );

  const matchingSchemes = INITIAL_SCHEMES.filter(s =>
    s.nameHi.includes(query) || s.name.toLowerCase().includes(query.toLowerCase()) || s.shortDescriptionHi.includes(query)
  );

  const matchingNews = INITIAL_NEWS.filter(n =>
    n.titleHi.includes(query) || n.title.toLowerCase().includes(query.toLowerCase())
  );

  const hasResults = query.trim().length > 0;

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in duration-200">
      {/* Global Back Navigation & Dashboard Shortcut */}
      <PageHeaderNav fallbackPath="/" />

      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2">
          <Search className="w-7 h-7 text-[#087A43]" />
          <span>{isHindi ? 'फसलसेतु समग्र खोज' : 'Global Agriculture Search'}</span>
        </h1>
        <p className="text-xs text-gray-500 mt-1">
          फसल, मंडी भाव, सरकारी योजनाएं, मौसम और सलाह एक साथ खोजें
        </p>
      </div>

      {/* Search Input Bar */}
      <div className="relative">
        <Search className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          autoFocus
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="उदा. धान, गेहूं, पीएम-किसान, सोलर पंप, यूरिया..."
          className="w-full pl-12 pr-10 py-3.5 text-sm font-semibold bg-white rounded-3xl border border-[#E5EBE1] shadow-xs focus:outline-hidden focus:border-[#087A43] focus:ring-2 focus:ring-[#087A43]/20"
        />
        {query && (
          <button
            onClick={() => setQuery('')}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Suggested Fast Searches */}
      {!hasResults && (
        <div className="space-y-3">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">लोकप्रिय खोजें:</p>
          <div className="flex flex-wrap gap-2">
            {[
              isHindi ? 'धान' : 'Paddy',
              isHindi ? 'गेहूं एमएसपी' : 'Wheat MSP',
              isHindi ? 'पीएम कुसुम सोलर पंप' : 'PM KUSUM Solar Pump',
              isHindi ? 'पत्ती झुलसा उपचार' : 'Leaf Blight Remedy',
              isHindi ? 'सोयाबीन मंडी भाव' : 'Soybean Mandi Rates'
            ].map((tag, idx) => (
              <button
                key={idx}
                onClick={() => setQuery(tag.split(' ')[0])}
                className="px-3 py-1.5 bg-white text-xs font-medium text-gray-700 rounded-full border border-gray-200 hover:border-emerald-300 hover:text-[#087A43] transition-colors"
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Results Groups */}
      {hasResults && (
        <div className="space-y-5">
          {/* Mandi Results */}
          {matchingMandis.length > 0 && (
            <div className="bg-white rounded-3xl p-5 border border-[#E5EBE1] space-y-3">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-blue-600" />
                <span>मंडी भाव परिणाम ({matchingMandis.length})</span>
              </h3>
              <div className="space-y-2">
                {matchingMandis.map(m => (
                  <div
                    key={m.id}
                    onClick={() => navigate('/mandi')}
                    className="p-3 rounded-2xl hover:bg-gray-50 flex items-center justify-between cursor-pointer border border-gray-100"
                  >
                    <div>
                      <p className="text-xs font-bold text-gray-900">{m.cropNameHi} ({m.marketName})</p>
                      <p className="text-[11px] text-gray-500">{m.district}, {m.state}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-black text-[#087A43]">₹{m.modalPrice}</span>
                      <span className="text-[10px] text-gray-400 block">/क्विंटल</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Scheme Results */}
          {matchingSchemes.length > 0 && (
            <div className="bg-white rounded-3xl p-5 border border-[#E5EBE1] space-y-3">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                <Landmark className="w-4 h-4 text-purple-600" />
                <span>सरकारी योजनाएं परिणाम ({matchingSchemes.length})</span>
              </h3>
              <div className="space-y-2">
                {matchingSchemes.map(s => (
                  <div
                    key={s.id}
                    onClick={() => navigate('/schemes')}
                    className="p-3 rounded-2xl hover:bg-gray-50 flex items-center justify-between cursor-pointer border border-gray-100"
                  >
                    <div>
                      <p className="text-xs font-bold text-gray-900">{s.nameHi}</p>
                      <p className="text-[11px] text-gray-500 line-clamp-1">{s.shortDescriptionHi}</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-gray-400 shrink-0 ml-2" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* News / Advisory Results */}
          {matchingNews.length > 0 && (
            <div className="bg-white rounded-3xl p-5 border border-[#E5EBE1] space-y-3">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-emerald-600" />
                <span>समाचार एवं सलाह परिणाम ({matchingNews.length})</span>
              </h3>
              <div className="space-y-2">
                {matchingNews.map(n => (
                  <div
                    key={n.id}
                    onClick={() => navigate('/')}
                    className="p-3 rounded-2xl hover:bg-gray-50 flex items-center justify-between cursor-pointer border border-gray-100"
                  >
                    <div>
                      <p className="text-xs font-bold text-gray-900">{n.titleHi}</p>
                      <p className="text-[11px] text-gray-500">{n.publishedDate} • {n.author}</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-gray-400 shrink-0 ml-2" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {matchingMandis.length === 0 && matchingSchemes.length === 0 && matchingNews.length === 0 && (
            <div className="bg-white rounded-3xl p-10 text-center border border-dashed border-gray-300">
              <p className="text-sm font-bold text-gray-700">"{query}" के लिए कोई परिणाम नहीं मिला</p>
              <p className="text-xs text-gray-400 mt-1">कृपया भिन्न शब्द या फसल का नाम खोजें।</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

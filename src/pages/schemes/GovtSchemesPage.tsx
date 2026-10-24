import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { GovtScheme, SchemeCategory, ApplicationStatus } from '../../types';
import { PageHeaderNav } from '../../components/common/PageHeaderNav';
import {
  Landmark,
  Search,
  Filter,
  Bookmark,
  ExternalLink,
  CheckCircle2,
  Clock,
  FileText,
  ShieldCheck,
  ChevronRight,
  Sparkles,
  Info,
  Layers
} from 'lucide-react';

export const GovtSchemesPage: React.FC = () => {
  const { schemes, toggleSchemeBookmark, updateSchemeStatus, language, showToast } = useApp();
  const isHindi = language === 'hi' || language === 'cg';

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedState, setSelectedState] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<'all' | 'saved' | 'my_applications'>('all');
  const [selectedSchemeDetail, setSelectedSchemeDetail] = useState<GovtScheme | null>(null);

  const categoryNames: Record<SchemeCategory, string> = {
    financial: 'प्रत्यक्ष आर्थिक सहायता',
    subsidy: 'सब्सिडी व अनुदान',
    insurance: 'फसल बीमा सुरक्षा',
    irrigation: 'सूक्ष्म सिंचाई (ड्रिप/स्प्रिंकलर)',
    solar: 'सोलर ऊर्जा व पंप',
    equipment: 'कृषि यंत्र व ट्रैक्टर'
  };

  const statusBadges: Record<ApplicationStatus, { labelHi: string; color: string }> = {
    not_applied: { labelHi: 'आवेदन नहीं किया', color: 'bg-gray-100 text-gray-700' },
    applied: { labelHi: 'आवेदन जमा', color: 'bg-blue-100 text-blue-800' },
    under_review: { labelHi: 'जांच प्रक्रिया में', color: 'bg-amber-100 text-amber-800' },
    approved: { labelHi: 'स्वीकृत', color: 'bg-emerald-100 text-emerald-800' },
    disbursed: { labelHi: 'राशि बैंक में अंतरित', color: 'bg-purple-100 text-purple-800' }
  };

  const filteredSchemes = schemes.filter(scheme => {
    if (activeTab === 'saved' && !scheme.bookmarked) return false;
    if (activeTab === 'my_applications' && scheme.applicationStatus === 'not_applied') return false;

    const matchesSearch =
      scheme.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      scheme.nameHi.toLowerCase().includes(searchQuery.toLowerCase()) ||
      scheme.shortDescriptionHi.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCat = selectedCategory === 'all' || scheme.category === selectedCategory;
    const matchesState = selectedState === 'all' || scheme.applicableState.includes(selectedState);

    return matchesSearch && matchesCat && matchesState;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Global Back Navigation & Dashboard Shortcut */}
      <PageHeaderNav fallbackPath="/" />

      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <div className="p-2.5 rounded-2xl bg-purple-100 text-purple-800">
            <Landmark className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2">
              <span>{isHindi ? 'सरकारी कृषि योजनाएं' : 'Government Agricultural Schemes'}</span>
              <span className="text-xs font-bold bg-purple-100 text-purple-900 px-2 py-0.5 rounded-full">
                {isHindi ? 'डीबीटी व सब्सिडी' : 'DBT & Subsidies'}
              </span>
            </h1>
            <p className="text-xs text-gray-500">
              केंद्रीय एवं राज्य सरकार की कृषि योजनाएं, पात्रता शर्तें, दस्तावेज सूची व आवेदन स्थिति
            </p>
          </div>
        </div>
      </div>

      {/* Tabs & Search Strip */}
      <div className="bg-white p-4 rounded-3xl border border-[#E5EBE1] shadow-2xs space-y-3">
        {/* Top Tab Bar: All / Saved / My Applications */}
        <div className="flex items-center gap-2 border-b border-gray-100 pb-2">
          {[
            { id: 'all', label: isHindi ? 'सभी योजनाएं' : 'All Schemes', count: schemes.length },
            { id: 'saved', label: isHindi ? 'सहेजी गई योजनाएं' : 'Saved Schemes', count: schemes.filter(s => s.bookmarked).length },
            { id: 'my_applications', label: isHindi ? 'मेरे आवेदन' : 'My Applications', count: schemes.filter(s => s.applicationStatus !== 'not_applied').length }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-[#087A43] text-white shadow-xs'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <span>{tab.label}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                activeTab === tab.id ? 'bg-white/20 text-white' : 'bg-gray-200 text-gray-700'
              }`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Search & Category Filter */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="योजना का नाम, सब्सिडी या पात्रता खोजें..."
              className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm bg-gray-50 rounded-2xl border border-gray-200 focus:bg-white focus:outline-hidden focus:border-[#087A43]"
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 text-xs rounded-xl border border-gray-300 bg-gray-50 focus:bg-white focus:outline-hidden"
            >
              <option value="all">{isHindi ? 'सभी श्रेणियां' : 'All Categories'}</option>
              <option value="financial">{isHindi ? 'प्रत्यक्ष वित्तीय सहायता' : 'Financial Aid'}</option>
              <option value="insurance">{isHindi ? 'फसल बीमा' : 'Crop Insurance'}</option>
              <option value="irrigation">{isHindi ? 'सिंचाई सब्सिडी' : 'Irrigation Subsidy'}</option>
              <option value="solar">{isHindi ? 'सोलर पंप योजना' : 'Solar Pump Scheme'}</option>
            </select>
          </div>
        </div>
      </div>

      {/* Schemes Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredSchemes.map((scheme) => {
          const statusInfo = statusBadges[scheme.applicationStatus];

          return (
            <div
              key={scheme.id}
              className="bg-white rounded-3xl p-5 border border-[#E5EBE1] hover:border-purple-300 shadow-2xs hover:shadow-sm transition-all space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-3">
                {/* Header & Badges */}
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[10px] font-bold bg-purple-100 text-purple-900 px-2 py-0.5 rounded-md">
                        {categoryNames[scheme.category]}
                      </span>
                      <span className="text-[10px] text-gray-500 font-medium">
                        {scheme.applicableState}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-gray-900 leading-snug">
                      {scheme.nameHi}
                    </h3>
                    <p className="text-[11px] text-gray-500 font-medium">
                      {scheme.name}
                    </p>
                  </div>

                  <button
                    onClick={() => toggleSchemeBookmark(scheme.id)}
                    className="p-2 rounded-xl text-gray-400 hover:text-purple-600 hover:bg-purple-50 transition-colors"
                    title="Bookmark Scheme"
                  >
                    <Bookmark className={`w-5 h-5 ${scheme.bookmarked ? 'fill-purple-600 text-purple-600' : ''}`} />
                  </button>
                </div>

                <p className="text-xs text-gray-600 leading-relaxed">
                  {scheme.shortDescriptionHi}
                </p>

                {/* Key Benefits Preview */}
                <div className="bg-[#FAFBF7] p-3 rounded-2xl border border-gray-100 space-y-1.5">
                  <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block">
                    {isHindi ? 'प्रमुख लाभ:' : 'Key Benefits:'}
                  </span>
                  {scheme.benefitsHi.slice(0, 2).map((b, idx) => (
                    <p key={idx} className="text-xs text-gray-700 flex items-start gap-1.5 font-medium">
                      <span className="text-[#087A43] font-bold">✓</span>
                      <span>{b}</span>
                    </p>
                  ))}
                </div>

                {/* Application Status Dropdown Selector */}
                <div className="bg-gray-50 p-3 rounded-2xl border border-gray-200 flex items-center justify-between">
                  <span className="text-xs font-semibold text-gray-700">आवेदन स्थिति:</span>
                  <select
                    value={scheme.applicationStatus}
                    onChange={(e) => updateSchemeStatus(scheme.id, e.target.value as ApplicationStatus)}
                    className={`text-xs font-bold px-2.5 py-1 rounded-xl border border-gray-300 focus:outline-hidden ${statusInfo.color}`}
                  >
                    <option value="not_applied">{isHindi ? 'आवेदन नहीं किया' : 'Not Applied'}</option>
                    <option value="applied">{isHindi ? 'आवेदन जमा कर दिया' : 'Applied'}</option>
                    <option value="under_review">{isHindi ? 'दस्तावेज जांच जारी' : 'Under Review'}</option>
                    <option value="approved">{isHindi ? 'स्वीकृत' : 'Approved'}</option>
                    <option value="disbursed">{isHindi ? 'लाभ राशि प्राप्त' : 'Disbursed'}</option>
                  </select>
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="pt-2 border-t border-gray-100 flex items-center justify-between">
                <button
                  onClick={() => setSelectedSchemeDetail(scheme)}
                  className="text-xs font-bold text-[#087A43] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <span>पात्रता व दस्तावेज विवरण</span>
                  <ChevronRight className="w-4 h-4" />
                </button>

                <a
                  href={scheme.officialUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-[11px] font-semibold text-gray-500 hover:text-gray-900 flex items-center gap-1 bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-xl transition-colors"
                >
                  <span>आधिकारिक पोर्टल</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          );
        })}
      </div>

      {/* Full Scheme Detail Modal (Eligibility, Documents, Application Steps) */}
      {selectedSchemeDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-xl w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl border border-gray-100 space-y-5">
            <div className="flex items-start justify-between border-b border-gray-100 pb-3">
              <div>
                <span className="text-[10px] font-bold bg-purple-100 text-purple-900 px-2 py-0.5 rounded">
                  {selectedSchemeDetail.applicableState}
                </span>
                <h2 className="text-lg font-bold text-gray-900 mt-1">
                  {selectedSchemeDetail.nameHi}
                </h2>
                <p className="text-xs text-gray-500">{selectedSchemeDetail.name}</p>
              </div>
              <button
                onClick={() => setSelectedSchemeDetail(null)}
                className="text-gray-400 hover:text-gray-600 p-1"
              >
                ✕
              </button>
            </div>

            {/* Eligibility Checklist */}
            <div>
              <h4 className="text-xs font-bold text-gray-800 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-[#087A43]" />
                <span>{isHindi ? 'पात्रता मानदंड:' : 'Eligibility Criteria:'}</span>
              </h4>
              <ul className="space-y-1.5 text-xs text-gray-700 bg-emerald-50/50 p-3.5 rounded-2xl border border-emerald-100">
                {selectedSchemeDetail.eligibilityCriteriaHi.map((e, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-[#087A43] font-bold">✓</span>
                    <span>{e}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Required Documents */}
            <div>
              <h4 className="text-xs font-bold text-gray-800 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-amber-600" />
                <span>{isHindi ? 'आवश्यक दस्तावेज:' : 'Required Documents:'}</span>
              </h4>
              <ul className="space-y-1.5 text-xs text-gray-700 bg-amber-50/50 p-3.5 rounded-2xl border border-amber-100">
                {selectedSchemeDetail.requiredDocumentsHi.map((doc, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-amber-700 font-bold">•</span>
                    <span>{doc}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Step-by-Step Application Steps */}
            <div>
              <h4 className="text-xs font-bold text-gray-800 uppercase tracking-wider mb-2">
                {isHindi ? 'आवेदन कैसे करें:' : 'How to Apply:'}
              </h4>
              <ol className="space-y-2 text-xs text-gray-700 bg-[#FAFBF7] p-3.5 rounded-2xl border border-gray-100">
                {selectedSchemeDetail.applicationStepsHi.map((step, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="w-5 h-5 rounded-full bg-emerald-800 text-white text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <span>{step}</span>
                  </li>
                ))}
              </ol>
            </div>

            {/* Official Website Button */}
            <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
              <button
                onClick={() => setSelectedSchemeDetail(null)}
                className="px-4 py-2 text-xs font-bold text-gray-600 bg-gray-100 rounded-xl"
              >
                बंद करें
              </button>

              <a
                href={selectedSchemeDetail.officialUrl}
                target="_blank"
                rel="noreferrer"
                className="px-4 py-2 bg-[#087A43] hover:bg-[#075B35] text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-sm"
              >
                <span>आधिकारिक पोर्टल पर आवेदन करें</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Check,
  Sparkles,
  ShieldCheck,
  Receipt,
  Clock,
  ArrowRight,
  Crown,
  KeyRound,
  Calendar,
  AlertCircle,
  HelpCircle,
  PhoneCall,
  CheckCircle2,
  RefreshCw
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { SubscriptionPlanId } from '../../types';
import { SubscriptionCheckoutModal } from './SubscriptionCheckoutModal';
import { SubscriptionDetailsModal } from './SubscriptionDetailsModal';
import { PaymentHistoryModal } from './PaymentHistoryModal';
import { GatewaySetupGuideModal } from './GatewaySetupGuideModal';
import { ExpertConsultationModal } from './ExpertConsultationModal';

export const SubscriptionPlansSection: React.FC = () => {
  const navigate = useNavigate();
  const {
    subscription,
    isPremium,
    isBasic,
    hasActiveSubscription,
    gatewayConfig,
    language,
    onboarding,
    refreshSubscription
  } = useApp();

  const isHindi = language === 'hi' || language === 'cg';

  // Modal states
  const [selectedPlanForCheckout, setSelectedPlanForCheckout] = useState<SubscriptionPlanId | null>(null);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [historyModalOpen, setHistoryModalOpen] = useState(false);
  const [setupGuideOpen, setSetupGuideOpen] = useState(false);
  const [consultationModalOpen, setConsultationModalOpen] = useState(false);

  const isExpired = subscription?.status === 'expired' || (subscription?.daysRemaining !== undefined && subscription.daysRemaining <= 0);

  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    const checkoutParam = searchParams.get('checkout') || searchParams.get('plan');
    if (checkoutParam === 'basic' || checkoutParam === 'premium') {
      setSelectedPlanForCheckout(checkoutParam);
      // Clean up the URL parameter without reloading
      searchParams.delete('checkout');
      searchParams.delete('plan');
      setSearchParams(searchParams, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  const handlePurchaseClick = (planId: SubscriptionPlanId) => {
    // If user is not logged in / completed onboarding, redirect to onboarding with plan preserved
    if (!onboarding.completed) {
      sessionStorage.setItem('pending_checkout_plan', planId);
      navigate(`/onboarding?plan=${planId}&redirect=checkout`);
      return;
    }

    setSelectedPlanForCheckout(planId);
  };

  const formatDate = (isoString?: string) => {
    if (!isoString) return '—';
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString(isHindi ? 'hi-IN' : 'en-IN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return isoString;
    }
  };

  return (
    <section className="mt-8 pt-6 border-t border-[#E5EBE1] space-y-6">
      {/* 1. Header with Brand Styling */}
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#087A43] bg-emerald-50 border border-emerald-200/80 px-3.5 py-1 rounded-full shadow-2xs">
          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          <span>{isHindi ? 'फसलसेतु कृषि मौसम योजनाएं' : 'FasalSetu Seasonal Plans'}</span>
        </span>
        <h2 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
          {isHindi ? 'अपनी फसलसेतु योजना चुनें' : 'Choose Your FasalSetu Plan'}
        </h2>
        <p className="text-xs sm:text-sm text-gray-600 leading-relaxed font-normal">
          {isHindi
            ? 'सटीक कृषि मार्गदर्शन प्राप्त करें और अपने खेत के लिए बेहतर निर्णय लें।'
            : 'Get personalized farming guidance and make smarter decisions for your farm.'}
        </p>
      </div>

      {/* 2. Active Subscription Card (If user has an active or expired subscription) */}
      {hasActiveSubscription && subscription && (
        <div className="bg-gradient-to-br from-[#F2F8F4] via-[#F8FAF6] to-[#EAF5EE] border border-emerald-300 rounded-3xl p-5 sm:p-6 shadow-sm relative overflow-hidden">
          {/* Subtle watermark */}
          <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none translate-x-6 translate-y-6">
            <Crown className="w-48 h-48 text-[#087A43]" />
          </div>

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
            <div className="space-y-2">
              <div className="flex items-center gap-2 flex-wrap">
                <span
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold shadow-2xs ${
                    isExpired
                      ? 'bg-red-100 text-red-800 border border-red-200'
                      : 'bg-[#087A43] text-white'
                  }`}
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>
                    {isExpired
                      ? (isHindi ? 'सदस्यता समाप्त' : 'Subscription Expired')
                      : isPremium
                      ? (isHindi ? 'प्रीमियम प्लान — सक्रिय' : 'Premium Plan — Active')
                      : (isHindi ? 'बेसिक प्लान — सक्रिय' : 'Basic Plan — Active')}
                  </span>
                </span>

                {isPremium && (
                  <span className="bg-amber-400 text-emerald-950 text-xs font-black px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-2xs">
                    <Crown className="w-3.5 h-3.5" />
                    <span>PREMIUM</span>
                  </span>
                )}

                {subscription.season && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-900 border border-amber-200">
                    <span>{subscription.season === 'kharif' ? '🌱' : subscription.season === 'rabi' ? '☀️' : '🌾'}</span>
                    <span>
                      {isHindi
                        ? `${subscription.seasonNameHi || subscription.season} ${subscription.agriYear || ''}`.trim()
                        : `${subscription.seasonName || subscription.season} ${subscription.agriYear || ''}`.trim()}
                    </span>
                    {subscription.cropCycle && (
                      <span className="text-amber-700 font-medium hidden sm:inline">({subscription.cropCycle})</span>
                    )}
                  </span>
                )}
              </div>

              <div className="text-xs text-gray-700 flex flex-wrap items-center gap-x-4 gap-y-1 font-medium pt-1">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-gray-500" />
                  <span>
                    {isHindi ? 'मौसम अवधि:' : 'Season Period:'}{' '}
                    <strong className="text-gray-900">
                      {formatDate(subscription.startDate)} – {formatDate(subscription.expiryDate)}
                    </strong>
                  </span>
                </span>
                <span className="text-gray-300 hidden sm:inline">•</span>
                <span className={`flex items-center gap-1 font-bold ${isExpired ? 'text-red-700' : 'text-emerald-800'}`}>
                  <Clock className="w-3.5 h-3.5" />
                  <span>
                    {isExpired
                      ? (isHindi ? 'मौसम समाप्त' : 'Season Expired')
                      : `${subscription.daysRemaining !== undefined ? subscription.daysRemaining : 0} ${isHindi ? 'दिन शेष' : 'days remaining'}`}
                  </span>
                </span>
              </div>

              {isExpired && (
                <div className="mt-2 text-xs text-red-700 bg-red-50 border border-red-200 rounded-xl px-3 py-2 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                  <span>
                    {isHindi
                      ? 'इस कृषि मौसम की वैधता समाप्त हो चुकी है। कृपया आगामी मौसम के लिए योजना चुनें या नवीनीकृत करें।'
                      : 'This farming season subscription has ended. Please choose or renew your plan for the upcoming season.'}
                  </span>
                </div>
              )}
            </div>

            {/* Quick Action Buttons for Active Member */}
            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={() => setDetailsModalOpen(true)}
                className="px-3.5 py-2 text-xs font-bold text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 rounded-xl transition-all shadow-2xs cursor-pointer"
              >
                {isHindi ? 'सदस्यता विवरण देखें' : 'View Subscription Details'}
              </button>

              <button
                type="button"
                onClick={() => setHistoryModalOpen(true)}
                className="px-3.5 py-2 text-xs font-bold text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 rounded-xl transition-all shadow-2xs cursor-pointer flex items-center gap-1.5"
              >
                <Receipt className="w-3.5 h-3.5 text-[#087A43]" />
                <span>{isHindi ? 'भुगतान इतिहास' : 'Payment History'}</span>
              </button>

              {/* Upgrade option for Basic members */}
              {isBasic && !isExpired && (
                <button
                  type="button"
                  onClick={() => handlePurchaseClick('premium')}
                  className="px-4 py-2 text-xs font-black text-white bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 rounded-xl transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{isHindi ? 'प्रीमियम में अपग्रेड करें (₹200)' : 'Upgrade to Premium (₹200)'}</span>
                </button>
              )}

              {/* Expert Consultation button for Premium members */}
              {isPremium && !isExpired && (
                <button
                  type="button"
                  onClick={() => setConsultationModalOpen(true)}
                  className="px-4 py-2 text-xs font-bold text-white bg-[#087A43] hover:bg-[#075B35] rounded-xl transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <PhoneCall className="w-3.5 h-3.5 text-amber-300" />
                  <span>{isHindi ? 'विशेषज्ञ परामर्श अनुरोध' : 'Request Consultation'}</span>
                </button>
              )}

              {/* Renewal if expired or expiring soon */}
              {(isExpired || (subscription.daysRemaining !== undefined && subscription.daysRemaining <= 30)) && (
                <button
                  type="button"
                  onClick={() => handlePurchaseClick(subscription.planId)}
                  className="px-4 py-2 text-xs font-bold text-white bg-[#087A43] hover:bg-[#075B35] rounded-xl transition-all shadow-xs cursor-pointer"
                >
                  {isHindi ? 'नवीनीकृत करें' : 'Renew Plan'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 3. Side-by-Side (Desktop) / Stacked (Mobile) Plan Comparison Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch max-w-5xl mx-auto">
        {/* ================= PLAN 1: BASIC PLAN (₹299/year) ================= */}
        <div
          className={`bg-white rounded-3xl border transition-all flex flex-col justify-between overflow-hidden shadow-xs hover:shadow-md ${
            isBasic && !isExpired
              ? 'border-emerald-500 ring-2 ring-emerald-500/20'
              : 'border-[#E5EBE1] hover:border-emerald-300'
          }`}
        >
          <div className="p-6 sm:p-7 space-y-5">
            {/* Header / Badge */}
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 border border-emerald-100 px-3 py-1 rounded-full inline-block mb-2">
                  {isHindi ? 'व्यक्तिगत किसान' : 'Individual Farmer'}
                </span>
                <h3 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">
                  {isHindi ? 'बेसिक प्लान' : 'Basic Plan'}
                </h3>
                <p className="text-xs text-gray-600 mt-1">
                  {isHindi
                    ? 'व्यक्तिगत किसानों के लिए आवश्यक कृषि मार्गदर्शन एवं अलर्ट।'
                    : 'Essential farm guidance and crop intelligence for everyday farming.'}
                </p>
              </div>

              {isBasic && !isExpired && (
                <span className="text-[11px] font-bold bg-emerald-100 text-[#087A43] px-2.5 py-1 rounded-full shrink-0">
                  {isHindi ? 'सक्रिय' : 'Current'}
                </span>
              )}
            </div>

            {/* Pricing Section */}
            <div className="pt-2 pb-1 border-y border-gray-100">
              <div className="flex items-baseline gap-1.5">
                <span className="text-3xl sm:text-4xl font-black text-gray-900 tracking-tight">₹299</span>
                <span className="text-sm font-semibold text-gray-500">
                  / {isHindi ? 'कृषि मौसम (1 फसल चक्र)' : 'farming season (1 Crop Season)'}
                </span>
              </div>
              <p className="text-[11px] text-gray-500 mt-0.5">
                {isHindi ? 'पारदर्शी मूल्य • 1 कृषि मौसम वैधता • कोई अतिरिक्त छुपा शुल्क नहीं' : 'Transparent pricing • 1 Farming season validity • No hidden charges'}
              </p>
            </div>

            {/* Features Checklist */}
            <div className="space-y-3 pt-1">
              <p className="text-[11px] font-bold uppercase tracking-wider text-gray-500">
                {isHindi ? 'शामिल विशेषताएं:' : 'Included Features:'}
              </p>
              <ul className="space-y-2.5 text-xs text-gray-700">
                <li className="flex items-start gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-emerald-100 text-[#087A43] flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </div>
                  <span className="leading-snug">
                    {isHindi ? 'एआई-आधारित फसल सिफारिशें' : 'AI-Based Crop Recommendations'}
                  </span>
                </li>

                <li className="flex items-start gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-emerald-100 text-[#087A43] flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </div>
                  <span className="leading-snug">
                    {isHindi ? 'सरकारी योजनाएं एवं पात्रता मार्गदर्शन' : 'Government Schemes and Eligibility Guidance'}
                  </span>
                </li>

                <li className="flex items-start gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-emerald-100 text-[#087A43] flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </div>
                  <span className="leading-snug">
                    {isHindi ? 'मौसम अपडेट एवं कृषि अलर्ट' : 'Weather Updates and Farming Alerts'}
                  </span>
                </li>

                <li className="flex items-start gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-emerald-100 text-[#087A43] flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </div>
                  <span className="leading-snug">
                    {isHindi ? 'फसल कैलेंडर एवं व्यय ट्रैकिंग' : 'Crop Calendar and Expense Tracking'}
                  </span>
                </li>
              </ul>
            </div>
          </div>

          {/* Button Section */}
          <div className="p-6 sm:p-7 pt-0 bg-white">
            <button
              type="button"
              onClick={() => handlePurchaseClick('basic')}
              disabled={isBasic && !isExpired}
              className={`w-full py-3.5 px-4 rounded-2xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs ${
                isBasic && !isExpired
                  ? 'bg-gray-100 text-gray-500 cursor-not-allowed border border-gray-200'
                  : 'bg-white hover:bg-emerald-50 text-[#087A43] border-2 border-[#087A43] active:scale-[0.99]'
              }`}
            >
              {isBasic && !isExpired ? (
                <span>{isHindi ? 'बेसिक प्लान सक्रिय है' : 'Current Active Plan'}</span>
              ) : (
                <span>
                  {isHindi
                    ? 'बेसिक प्लान चुनें — ₹299/मौसम'
                    : 'Purchase Basic Plan — ₹299/season'}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* ================= PLAN 2: PREMIUM PLAN (₹499/year) ================= */}
        <div
          className={`bg-white rounded-3xl border-2 transition-all flex flex-col justify-between overflow-hidden relative shadow-md hover:shadow-lg ${
            isPremium && !isExpired
              ? 'border-emerald-600 ring-2 ring-emerald-500/30'
              : 'border-[#087A43]'
          }`}
        >
          {/* Subtle Top Golden Accent Bar & Popular Badge */}
          <div className="bg-gradient-to-r from-[#087A43] via-[#075B35] to-[#B45309] text-white px-5 py-1.5 flex items-center justify-between text-[11px] font-bold">
            <span className="flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>{isHindi ? 'अनुशंसित • सर्वाधिक लोकप्रिय' : 'Recommended • Most Popular'}</span>
            </span>
            <span className="bg-amber-400 text-emerald-950 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider">
              {isHindi ? 'सर्वश्रेष्ठ मूल्य' : 'Best Value'}
            </span>
          </div>

          <div className="p-6 sm:p-7 space-y-5">
            {/* Header */}
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-amber-900 bg-amber-50 border border-amber-200 px-3 py-1 rounded-full inline-block mb-2">
                  {isHindi ? 'व्यापक कृषि समाधान' : 'Comprehensive Farm Intelligence'}
                </span>

                {isPremium && !isExpired && (
                  <span className="text-[11px] font-bold bg-amber-100 text-amber-900 px-2.5 py-1 rounded-full">
                    {isHindi ? 'सक्रिय' : 'Current'}
                  </span>
                )}
              </div>

              <h3 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2">
                <span>{isHindi ? 'प्रीमियम प्लान' : 'Premium Plan'}</span>
                <Crown className="w-5 h-5 text-amber-500 shrink-0" />
              </h3>
              <p className="text-xs text-gray-600 mt-1">
                {isHindi
                  ? 'विशेषज्ञ परामर्श, मिट्टी परीक्षण और ऑन-फील्ड सहायता के साथ संपूर्ण समाधान।'
                  : 'All-inclusive guidance with agronomist consultation, soil reports & insurance assistance.'}
              </p>
            </div>

            {/* Pricing Section */}
            <div className="pt-2 pb-1 border-y border-gray-100">
              <div className="flex items-baseline gap-1.5">
                <span className="text-3xl sm:text-4xl font-black text-[#087A43] tracking-tight">₹499</span>
                <span className="text-sm font-semibold text-gray-500">
                  / {isHindi ? 'कृषि मौसम (1 फसल चक्र)' : 'farming season (1 Crop Season)'}
                </span>
              </div>
              <p className="text-[11px] text-emerald-800 font-semibold mt-0.5">
                {isBasic && !isExpired
                  ? (isHindi ? 'समान मौसम में अपग्रेड: केवल ₹200 का अंतर' : 'Same season upgrade: Only ₹200 upgrade fee')
                  : (isHindi ? 'पारदर्शी मूल्य • 1 कृषि मौसम वैधता • कोई अतिरिक्त छुपा शुल्क नहीं' : 'Transparent pricing • 1 Farming season validity • No hidden charges')}
              </p>
            </div>

            {/* Features Checklist */}
            <div className="space-y-3 pt-1">
              <p className="text-[11px] font-bold uppercase tracking-wider text-gray-500">
                {isHindi ? 'शामिल विशेषताएं:' : 'Included Features:'}
              </p>
              <ul className="space-y-2.5 text-xs text-gray-700">
                <li className="flex items-start gap-2.5 font-bold text-gray-900 bg-emerald-50/70 p-2 rounded-xl">
                  <div className="w-5 h-5 rounded-full bg-[#087A43] text-white flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </div>
                  <span className="leading-snug">
                    {isHindi ? 'सभी बेसिक प्लान सुविधाएं शामिल' : 'All Basic Plan Features'}
                  </span>
                </li>

                <li className="flex items-start gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </div>
                  <div className="leading-snug">
                    <span className="font-semibold text-gray-900">
                      {isHindi ? 'विशेषज्ञ परामर्श एवं ऑन-फील्ड मार्गदर्शन' : 'Expert Consultation and On-Field Guidance'}
                    </span>
                    <p className="text-[10px] text-gray-500">
                      {isHindi ? '(KVK/ICAR मान्यता प्राप्त वैज्ञानिकों से सीधा संपर्क)' : '(Direct contact with certified agronomists)'}
                    </p>
                  </div>
                </li>

                <li className="flex items-start gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </div>
                  <span className="leading-snug font-medium text-gray-900">
                    {isHindi ? 'फसल, मिट्टी एवं खेत पैरामीटर विश्लेषण' : 'Crop, Soil and Farm Parameter Analysis'}
                  </span>
                </li>

                <li className="flex items-start gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </div>
                  <div className="leading-snug">
                    <span className="font-semibold text-gray-900">
                      {isHindi ? 'बीमा मार्गदर्शन एवं दावा सहायता' : 'Insurance Guidance and Claim Assistance'}
                    </span>
                    <p className="text-[10px] text-gray-500">
                      {isHindi ? '(PMFBY फसल बीमा दावा फॉर्म एवं दस्तावेज सहायता)' : '(PMFBY claim checklist & document assistance)'}
                    </p>
                  </div>
                </li>

                <li className="flex items-start gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </div>
                  <span className="leading-snug font-medium text-gray-900">
                    {isHindi ? 'व्यक्तिगत कृषि सिफारिशें' : 'Personalized Farming Recommendations'}
                  </span>
                </li>
              </ul>
            </div>
          </div>

          {/* Button Section */}
          <div className="p-6 sm:p-7 pt-0 bg-white">
            <button
              type="button"
              onClick={() => handlePurchaseClick('premium')}
              disabled={isPremium && !isExpired}
              className={`w-full py-3.5 px-4 rounded-2xl text-xs sm:text-sm font-black transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md ${
                isPremium && !isExpired
                  ? 'bg-gray-100 text-gray-500 cursor-not-allowed border border-gray-200'
                  : 'bg-gradient-to-r from-[#087A43] via-[#075B35] to-[#044326] hover:from-[#075B35] hover:to-[#044326] text-white active:scale-[0.99]'
              }`}
            >
              {isPremium && !isExpired ? (
                <span>{isHindi ? 'प्रीमियम प्लान सक्रिय है' : 'Current Active Plan'}</span>
              ) : isBasic && !isExpired ? (
                <span>
                  {isHindi
                    ? 'प्रीमियम में अपग्रेड करें — अंतर ₹200'
                    : 'Upgrade to Premium Plan — ₹200 Upgrade'}
                </span>
              ) : (
                <span>
                  {isHindi
                    ? 'प्रीमियम प्लान चुनें — ₹499/मौसम'
                    : 'Purchase Premium Plan — ₹499/season'}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* 4. Trust, Security & Gateway Setup Notice Footer */}
      <div className="bg-[#FAFBF7] border border-[#E5EBE1] rounded-2xl p-4 max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-600">
        <div className="flex items-center gap-3">
          <ShieldCheck className="w-5 h-5 text-[#087A43] shrink-0" />
          <span>
            {isHindi
              ? 'सुरक्षित भुगतान: आधिकारिक रेज़रपे (Razorpay) गेटवे के माध्यम से 256-बिट SSL एन्क्रिप्टेड लेन-देन।'
              : 'Secure Payment: 256-bit SSL encrypted transactions powered by Razorpay gateway.'}
          </span>
        </div>

        <button
          type="button"
          onClick={() => setSetupGuideOpen(true)}
          className="text-xs font-bold text-[#087A43] hover:text-[#075B35] underline cursor-pointer shrink-0"
        >
          {isHindi ? 'गेटवे सेटअप आवश्यकताएं' : 'Gateway Setup Guide'}
        </button>
      </div>

      {/* Modals */}
      {selectedPlanForCheckout && (
        <SubscriptionCheckoutModal
          isOpen={Boolean(selectedPlanForCheckout)}
          onClose={() => setSelectedPlanForCheckout(null)}
          planId={selectedPlanForCheckout}
          onSuccess={() => {
            refreshSubscription();
          }}
        />
      )}

      <SubscriptionDetailsModal
        isOpen={detailsModalOpen}
        onClose={() => setDetailsModalOpen(false)}
        subscription={subscription}
        onUpgrade={() => {
          setDetailsModalOpen(false);
          handlePurchaseClick('premium');
        }}
        onRenew={() => {
          setDetailsModalOpen(false);
          if (subscription) handlePurchaseClick(subscription.planId);
        }}
        onOpenHistory={() => {
          setDetailsModalOpen(false);
          setHistoryModalOpen(true);
        }}
      />

      <PaymentHistoryModal
        isOpen={historyModalOpen}
        onClose={() => setHistoryModalOpen(false)}
      />

      <GatewaySetupGuideModal
        isOpen={setupGuideOpen}
        onClose={() => setSetupGuideOpen(false)}
      />

      <ExpertConsultationModal
        isOpen={consultationModalOpen}
        onClose={() => setConsultationModalOpen(false)}
      />
    </section>
  );
};

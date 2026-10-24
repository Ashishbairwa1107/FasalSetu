import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { LANGUAGES, t } from '../../utils/translations';
import { Language } from '../../types';
import { StateDistrictDropdowns } from '../../components/common/StateDistrictDropdowns';
import { cleanLocationLabel } from '../../data/indianLocations';
import {
  Sprout,
  ArrowRight,
  ArrowLeft,
  Check,
  ShieldCheck,
  Phone,
  Mail,
  User,
  MapPin,
  Tractor,
  Wheat,
  Sparkles,
  Layers,
  Leaf
} from 'lucide-react';

export const OnboardingFlow: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const planParam = searchParams.get('plan');
  const { profile, updateProfile, language, setLanguage, completeOnboarding } = useApp();

  const [currentStep, setCurrentStep] = useState<number>(1);
  const [selectedLang, setSelectedLang] = useState<Language>(language || 'hi');

  // Preserve pending checkout plan in sessionStorage if present
  useEffect(() => {
    if (planParam) {
      sessionStorage.setItem('pending_checkout_plan', planParam);
    }
  }, [planParam]);

  // Sync selectedLang with global language
  useEffect(() => {
    setSelectedLang(language || 'hi');
  }, [language]);

  // Auth state
  const [authMode, setAuthMode] = useState<'phone' | 'email'>('phone');
  const [phoneNumber, setPhoneNumber] = useState('9876543210');
  const [emailAddress, setEmailAddress] = useState('ramkumar.verma@fasalsetu.in');
  const [authError, setAuthError] = useState('');

  // OTP state
  const [otp, setOtp] = useState<string[]>(['1', '2', '3', '4', '5', '6']);
  const [resendTimer, setResendTimer] = useState(30);
  const [otpError, setOtpError] = useState('');
  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Profile creation state with clean single-language defaults
  const [farmerName, setFarmerName] = useState(profile.name || 'राम कुमार वर्मा');
  const [village, setVillage] = useState(
    cleanLocationLabel(profile.village || 'आरंग', selectedLang)
  );
  const [district, setDistrict] = useState(
    cleanLocationLabel(profile.district || 'रायपुर', selectedLang)
  );
  const [state, setState] = useState(
    cleanLocationLabel(profile.state || 'छत्तीसगढ़', selectedLang)
  );
  const [selectedAvatar, setSelectedAvatar] = useState(profile.avatarUrl);

  // Farming type state
  const [farmType, setFarmType] = useState<'small' | 'medium' | 'large'>('small');
  const [exactAcres, setExactAcres] = useState(4.5);

  // Countdown timer for OTP
  useEffect(() => {
    let interval: any;
    if (currentStep === 4 && resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [currentStep, resendTimer]);

  const handleSelectLanguage = (langCode: Language) => {
    setSelectedLang(langCode);
    setLanguage(langCode);
  };

  const handleNext = () => {
    if (currentStep === 2) {
      setLanguage(selectedLang);
    } else if (currentStep === 3) {
      if (authMode === 'phone' && phoneNumber.length < 10) {
        setAuthError(selectedLang === 'en' ? 'Please enter a valid 10-digit mobile number' : 'कृपया मान्य 10-अंकों का मोबाइल नंबर दर्ज करें');
        return;
      }
      setAuthError('');
      setResendTimer(30);
    } else if (currentStep === 4) {
      const code = otp.join('');
      if (code !== '123456' && code.length < 6) {
        setOtpError(selectedLang === 'en' ? 'Please enter the 6-digit demo code (123456)' : 'कृपया मान्य 6-अंकों का डेमो कोड (123456) दर्ज करें');
        return;
      }
      setOtpError('');
    } else if (currentStep === 5) {
      if (!farmerName.trim()) {
        alert(selectedLang === 'en' ? 'Please enter your full name' : 'कृपया अपना पूरा नाम दर्ज करें');
        return;
      }
      updateProfile({
        name: farmerName,
        village: cleanLocationLabel(village, selectedLang),
        district: cleanLocationLabel(district, selectedLang),
        state: cleanLocationLabel(state, selectedLang),
        avatarUrl: selectedAvatar,
        language: selectedLang
      });
    } else if (currentStep === 6) {
      updateProfile({
        landholdingCategory: farmType,
        totalAcres: exactAcres
      });
      completeOnboarding();
      const pendingPlan = sessionStorage.getItem('pending_checkout_plan') || planParam;
      if (pendingPlan) {
        sessionStorage.removeItem('pending_checkout_plan');
        navigate(`/?checkout=${pendingPlan}`);
      } else {
        navigate('/');
      }
      return;
    }

    setCurrentStep(prev => prev + 1);
  };

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) {
      value = value.slice(-1);
    }
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-advance
    if (value && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  const avatarOptions = [
    'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&q=80&w=256',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=256',
    'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=256',
    'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=256'
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#F2F8F4] via-[#F7FAF6] to-[#EAF4ED] flex flex-col justify-between py-6 px-4 sm:px-6">
      {/* Top Header / Skip */}
      <div className="max-w-md w-full mx-auto flex items-center justify-between pb-2">
        {currentStep > 1 ? (
          <button
            onClick={() => setCurrentStep(prev => prev - 1)}
            className="flex items-center gap-1.5 text-xs font-semibold text-gray-600 hover:text-gray-900 transition-colors p-2 -ml-2 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{t('back', selectedLang)}</span>
          </button>
        ) : (
          <div className="w-8" />
        )}

        {/* Step Progress Indicators */}
        <div className="flex items-center gap-1.5">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div
              key={i}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === currentStep
                  ? 'w-6 bg-[#087A43]'
                  : i < currentStep
                  ? 'w-2 bg-emerald-400'
                  : 'w-2 bg-gray-200'
              }`}
            />
          ))}
        </div>

        <button
          onClick={() => {
            completeOnboarding();
            const pendingPlan = sessionStorage.getItem('pending_checkout_plan') || planParam;
            if (pendingPlan) {
              sessionStorage.removeItem('pending_checkout_plan');
              navigate(`/?checkout=${pendingPlan}`);
            } else {
              navigate('/');
            }
          }}
          className="text-xs font-semibold text-[#087A43] hover:text-[#075B35] transition-colors cursor-pointer"
        >
          {t('skip', selectedLang)}
        </button>
      </div>

      {/* Main Step Content */}
      <div className="max-w-md w-full mx-auto my-auto py-2">
        {/* ================= STEP 1: WELCOME SCREEN (POLISHED AGRICULTURAL DESIGN WITHOUT PHONE FRAME) ================= */}
        {currentStep === 1 && (
          <div className="animate-in fade-in duration-300 flex flex-col items-center">
            {/* Natural Agricultural Hero Card blending with background */}
            <div className="w-full bg-gradient-to-b from-[#CBE8FA] via-[#DBEFF9] to-[#F1F8F4] rounded-3xl shadow-md border border-[#D5EBF8] overflow-hidden flex flex-col items-center pt-6 pb-2 text-center relative">
              
              {/* 3 Green Leaves Sprout Logo matching Screenshot 5 */}
              <div className="relative mb-2">
                <svg className="w-16 h-16 mx-auto drop-shadow-xs" viewBox="0 0 100 100" fill="none">
                  {/* Center Upright Leaf */}
                  <path
                    d="M50 8 C62 25 65 48 50 64 C35 48 38 25 50 8 Z"
                    fill="#15803d"
                  />
                  <path
                    d="M50 14 L50 60"
                    stroke="#ffffff"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  />
                  <path
                    d="M50 28 L57 24 M50 38 L58 34 M50 48 L56 45"
                    stroke="#ffffff"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                  />

                  {/* Left Angled Leaf */}
                  <path
                    d="M48 64 C32 62 16 48 18 30 C34 32 46 48 48 64 Z"
                    fill="#166534"
                  />
                  <path
                    d="M24 35 C33 44 42 54 48 64"
                    stroke="#ffffff"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  />
                  <path
                    d="M30 41 L27 48 M37 47 L35 54 M43 54 L42 59"
                    stroke="#ffffff"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                  />

                  {/* Right Angled Leaf */}
                  <path
                    d="M52 64 C68 62 84 48 82 30 C66 32 54 48 52 64 Z"
                    fill="#166534"
                  />
                  <path
                    d="M76 35 C67 44 58 54 52 64"
                    stroke="#ffffff"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  />
                  <path
                    d="M70 41 L73 48 M63 47 L65 54 M57 54 L58 59"
                    stroke="#ffffff"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                  />

                  {/* Base Stem */}
                  <path
                    d="M50 64 L50 72"
                    stroke="#14532d"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                  />
                </svg>
              </div>

              {/* Brand Typography matching Screenshot 5 */}
              <div className="px-6 mb-3">
                <h1 className="text-3xl font-black text-[#075B35] tracking-tight leading-tight">
                  FasalSetu
                </h1>
                <h2 className="text-2xl font-bold text-[#075B35] leading-tight -mt-0.5">
                  फसलसेतु
                </h2>
                <p className="mt-1.5 text-sm font-semibold text-[#0a6639] tracking-tight">
                  आपके खेत का अपना साथी
                </p>
              </div>

              {/* High-Resolution Farmer In Field Illustration */}
              <div className="w-full relative overflow-hidden px-3">
                <img
                  src="/images/onboarding_farmer_highres.jpg"
                  alt="Farmer standing proudly in a green agricultural field at sunrise"
                  className="w-full h-auto max-h-[360px] object-cover object-top rounded-2xl shadow-sm block mx-auto"
                />
              </div>
            </div>
          </div>
        )}

        {/* ================= STEP 2: LANGUAGE SELECTION WITH SUBTLE AGRICULTURAL ACCENTS ================= */}
        {currentStep === 2 && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div className="text-center">
              <span className="text-xs font-bold text-[#087A43] uppercase tracking-wider bg-emerald-100 px-3 py-1 rounded-full inline-flex items-center gap-1.5">
                <Leaf className="w-3.5 h-3.5 text-[#087A43]" />
                <span>{selectedLang === 'en' ? 'Step 1 of 5' : 'चरण 1 / 5'}</span>
              </span>
              <h2 className="mt-2 text-2xl font-black text-gray-900 tracking-tight">
                {t('stepLanguageTitle', selectedLang)}
              </h2>
              <p className="text-xs text-gray-500 mt-1">
                {t('stepLanguageSubtitle', selectedLang)}
              </p>
            </div>

            {/* 2-Column Grid of Languages with Subtle Leaf Accents */}
            <div className="grid grid-cols-2 gap-3 max-h-[390px] overflow-y-auto pr-1">
              {LANGUAGES.map((lang) => {
                const isSelected = selectedLang === lang.code;

                return (
                  <button
                    key={lang.code}
                    type="button"
                    onClick={() => handleSelectLanguage(lang.code)}
                    className={`p-3.5 rounded-2xl border text-left transition-all relative flex flex-col justify-between cursor-pointer ${
                      isSelected
                        ? 'border-[#087A43] bg-[#EAF6E9] ring-2 ring-[#087A43]/40 shadow-xs'
                        : 'border-gray-200 bg-white hover:border-emerald-300'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-base font-bold text-gray-900">
                          {lang.nativeName}
                        </span>
                        {isSelected && (
                          <div className="w-5 h-5 rounded-full bg-[#087A43] text-white flex items-center justify-center shadow-xs">
                            <Check className="w-3.5 h-3.5" />
                          </div>
                        )}
                      </div>
                      <p className="text-[11px] text-gray-500 mt-0.5 font-medium">{lang.name}</p>
                    </div>

                    <div className="mt-3 flex items-center justify-between">
                      <span className="text-[9.5px] text-gray-400 truncate max-w-[130px]">
                        {lang.region}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="text-center pt-1">
              <span className="text-[11px] text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full font-medium border border-emerald-100">
                🌱 {selectedLang === 'en' ? 'Tailored for farmers across Indian agricultural regions' : 'भारत के सभी प्रमुख कृषि क्षेत्रों के लिए अनुकूलित'}
              </span>
            </div>
          </div>
        )}

        {/* ================= STEP 3: ACCOUNT AUTHENTICATION WITH FARMER TRUST ASSURANCE ================= */}
        {currentStep === 3 && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div className="text-center">
              <span className="text-xs font-bold text-[#087A43] uppercase tracking-wider bg-emerald-100 px-3 py-1 rounded-full inline-flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-[#087A43]" />
                <span>{selectedLang === 'en' ? 'Step 2 of 5' : 'चरण 2 / 5'}</span>
              </span>
              <h2 className="mt-2 text-2xl font-black text-gray-900 tracking-tight">
                {t('stepAuthTitle', selectedLang)}
              </h2>
              <p className="text-xs text-gray-500 mt-1">
                {t('stepAuthSubtitle', selectedLang)}
              </p>
            </div>

            {/* Phone / Email Mode Toggle */}
            <div className="flex rounded-xl bg-gray-200/70 p-1">
              <button
                type="button"
                onClick={() => setAuthMode('phone')}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  authMode === 'phone'
                    ? 'bg-white text-[#087A43] shadow-xs'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Phone className="w-3.5 h-3.5" />
                <span>{t('mobileNumber', selectedLang)}</span>
              </button>
              <button
                type="button"
                onClick={() => setAuthMode('email')}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  authMode === 'email'
                    ? 'bg-white text-[#087A43] shadow-xs'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Mail className="w-3.5 h-3.5" />
                <span>{t('emailAddress', selectedLang)}</span>
              </button>
            </div>

            {/* Input Form */}
            <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm space-y-4">
              {authMode === 'phone' ? (
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                    {t('mobileNumber', selectedLang)}
                  </label>
                  <div className="flex rounded-xl border border-gray-300 focus-within:border-[#087A43] focus-within:ring-2 focus-within:ring-[#087A43]/20 overflow-hidden">
                    <span className="px-3 bg-gray-100 text-gray-700 text-xs font-bold flex items-center border-r border-gray-300">
                      🇮🇳 +91
                    </span>
                    <input
                      type="tel"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, '').slice(0, 10))}
                      placeholder="98765 43210"
                      className="w-full px-3 py-2.5 text-sm text-gray-900 font-semibold focus:outline-hidden"
                    />
                  </div>
                </div>
              ) : (
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                    {t('emailAddress', selectedLang)}
                  </label>
                  <input
                    type="email"
                    value={emailAddress}
                    onChange={(e) => setEmailAddress(e.target.value)}
                    placeholder="kisan@example.com"
                    className="w-full px-3 py-2.5 text-sm text-gray-900 rounded-xl border border-gray-300 focus:outline-hidden focus:border-[#087A43] focus:ring-2 focus:ring-[#087A43]/20"
                  />
                </div>
              )}

              {authError && (
                <p className="text-xs text-rose-600 font-medium">{authError}</p>
              )}

              <div className="text-[11px] text-gray-600 bg-emerald-50/80 p-3 rounded-xl border border-emerald-100 flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                <span>
                  {selectedLang === 'en'
                    ? 'Demo Mode: No real SMS will be sent. Use verification code 123456 in the next step.'
                    : 'डेमो मोड: कोई वास्तविक एसएमएस नहीं भेजा जाएगा। अगले चरण में कोड 123456 का उपयोग करें।'}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* ================= STEP 4: OTP VERIFICATION WITH GOLDEN GRAIN ASSURANCE ================= */}
        {currentStep === 4 && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div className="text-center">
              <span className="text-xs font-bold text-[#087A43] uppercase tracking-wider bg-emerald-100 px-3 py-1 rounded-full inline-flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#087A43]" />
                <span>{selectedLang === 'en' ? 'Step 3 of 5' : 'चरण 3 / 5'}</span>
              </span>
              <h2 className="mt-2 text-2xl font-black text-gray-900 tracking-tight">
                {t('stepOtpTitle', selectedLang)}
              </h2>
              <p className="text-xs text-gray-500 mt-1">
                {t('stepOtpSubtitle', selectedLang)} <strong className="text-gray-700">+91 {phoneNumber}</strong>
              </p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm space-y-5">
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-center">
                <p className="text-xs text-amber-900 font-medium">
                  {selectedLang === 'en' ? 'Demo Verification Code:' : 'डेमो सत्यापन कोड:'}{' '}
                  <span className="font-mono font-bold text-base text-[#075B35] tracking-widest">
                    1 2 3 4 5 6
                  </span>
                </p>
              </div>

              {/* 6 OTP boxes */}
              <div className="flex items-center justify-center gap-2 sm:gap-3">
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => { otpInputRefs.current[index] = el; }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(index, e)}
                    className="w-11 h-12 text-center text-lg font-bold text-gray-900 bg-gray-50 rounded-xl border border-gray-300 focus:bg-white focus:border-[#087A43] focus:ring-2 focus:ring-[#087A43]/20 focus:outline-hidden"
                  />
                ))}
              </div>

              {otpError && (
                <p className="text-center text-xs text-rose-600 font-medium">{otpError}</p>
              )}

              <div className="text-center">
                {resendTimer > 0 ? (
                  <p className="text-xs text-gray-400 font-medium">
                    {selectedLang === 'en' ? 'Resend code in:' : 'पुनः कोड भेजें:'}{' '}
                    <span className="text-gray-700 font-bold">
                      {resendTimer} {selectedLang === 'en' ? 'sec' : 'सेकंड'}
                    </span>
                  </p>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setResendTimer(30);
                      setOtp(['1', '2', '3', '4', '5', '6']);
                    }}
                    className="text-xs font-bold text-[#087A43] hover:underline cursor-pointer"
                  >
                    {selectedLang === 'en' ? 'Resend OTP' : 'नया ओटीपी भेजें'}
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ================= STEP 5: FARMER PROFILE WITH STATE & DISTRICT DROPDOWNS ================= */}
        {currentStep === 5 && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div className="text-center">
              <span className="text-xs font-bold text-[#087A43] uppercase tracking-wider bg-emerald-100 px-3 py-1 rounded-full inline-flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-[#087A43]" />
                <span>{selectedLang === 'en' ? 'Step 4 of 5' : 'चरण 4 / 5'}</span>
              </span>
              <h2 className="mt-1 text-2xl font-black text-gray-900 tracking-tight">
                {t('stepProfileTitle', selectedLang)}
              </h2>
              <p className="text-xs text-gray-500">
                {t('stepProfileSubtitle', selectedLang)}
              </p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm space-y-4 max-h-[420px] overflow-y-auto">
              {/* Avatar Selector */}
              <div className="text-center">
                <p className="text-xs font-semibold text-gray-700 mb-2">
                  {selectedLang === 'en' ? 'Choose Profile Photo' : 'प्रोफाइल फोटो चुनें'}
                </p>
                <div className="flex items-center justify-center gap-3">
                  {avatarOptions.map((url, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setSelectedAvatar(url)}
                      className={`relative rounded-full transition-all cursor-pointer ${
                        selectedAvatar === url
                          ? 'ring-3 ring-[#087A43] scale-105'
                          : 'opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img
                        src={url}
                        alt="Farmer Avatar"
                        className="w-12 h-12 rounded-full object-cover"
                      />
                      {selectedAvatar === url && (
                        <div className="absolute bottom-0 right-0 bg-[#087A43] text-white p-0.5 rounded-full">
                          <Check className="w-3 h-3" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Full Name */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  {t('fullName', selectedLang)} *
                </label>
                <input
                  type="text"
                  value={farmerName}
                  onChange={(e) => setFarmerName(e.target.value)}
                  placeholder={selectedLang === 'en' ? 'e.g. Ram Kumar Verma' : 'उदा. राम कुमार वर्मा'}
                  className="w-full px-3 py-2 text-sm text-gray-900 rounded-xl border border-gray-300 focus:outline-hidden focus:border-[#087A43] focus:ring-1 focus:ring-[#087A43]"
                />
              </div>

              {/* Village & Town */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  {t('villageOrTown', selectedLang)}
                </label>
                <input
                  type="text"
                  value={village}
                  onChange={(e) => setVillage(e.target.value)}
                  placeholder={selectedLang === 'en' ? 'e.g. Arang' : 'उदा. आरंग'}
                  className="w-full px-3 py-2 text-sm text-gray-900 rounded-xl border border-gray-300 focus:outline-hidden focus:border-[#087A43] focus:ring-1 focus:ring-[#087A43]"
                />
              </div>

              {/* State & District Dropdowns using Single Language */}
              <StateDistrictDropdowns
                selectedState={state}
                selectedDistrict={district}
                onStateChange={setState}
                onDistrictChange={setDistrict}
                stateLabel={t('state', selectedLang)}
                districtLabel={t('district', selectedLang)}
              />
            </div>
          </div>
        )}

        {/* ================= STEP 6: FARMING TYPE & SCALE SELECTION ================= */}
        {currentStep === 6 && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div className="text-center">
              <span className="text-xs font-bold text-[#087A43] uppercase tracking-wider bg-emerald-100 px-3 py-1 rounded-full inline-flex items-center gap-1.5">
                <Tractor className="w-3.5 h-3.5 text-[#087A43]" />
                <span>{selectedLang === 'en' ? 'Final Step (5 of 5)' : 'अंतिम चरण (5 / 5)'}</span>
              </span>
              <h2 className="mt-1 text-2xl font-black text-gray-900 tracking-tight">
                {t('stepFarmTypeTitle', selectedLang)}
              </h2>
              <p className="text-xs text-gray-500">
                {t('stepFarmTypeSubtitle', selectedLang)}
              </p>
            </div>

            <div className="space-y-3">
              {/* Option 1: Small scale */}
              <button
                type="button"
                onClick={() => {
                  setFarmType('small');
                  setExactAcres(3.5);
                }}
                className={`w-full p-4 rounded-2xl border text-left transition-all flex items-start gap-3.5 cursor-pointer ${
                  farmType === 'small'
                    ? 'border-[#087A43] bg-[#EAF6E9] ring-2 ring-[#087A43]/30 shadow-xs'
                    : 'border-gray-200 bg-white hover:border-emerald-300'
                }`}
              >
                <div className="p-2.5 rounded-xl bg-emerald-100 text-[#087A43] shrink-0">
                  <Sprout className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-gray-900">
                      {selectedLang === 'en' ? 'Small & Marginal Farmer' : 'लघु एवं सीमांत किसान'}
                    </h3>
                    {farmType === 'small' && <Check className="w-5 h-5 text-[#087A43]" />}
                  </div>
                  <p className="text-xs text-[#087A43] font-semibold mt-0.5">
                    {selectedLang === 'en' ? '0 – 5 Acres Land' : '0 – 5 एकड़ भूमि'}
                  </p>
                  <p className="text-[11px] text-gray-500 mt-1 leading-snug">
                    {selectedLang === 'en'
                      ? 'Ideal for family farming, crop diversification, subsidies and micro-irrigation.'
                      : 'पारिवारिक खेती, फसल विविधीकरण, सब्सिडी और सूक्ष्म सिंचाई के लिए आदर्श'}
                  </p>
                </div>
              </button>

              {/* Option 2: Medium scale */}
              <button
                type="button"
                onClick={() => {
                  setFarmType('medium');
                  setExactAcres(12.0);
                }}
                className={`w-full p-4 rounded-2xl border text-left transition-all flex items-start gap-3.5 cursor-pointer ${
                  farmType === 'medium'
                    ? 'border-[#087A43] bg-[#EAF6E9] ring-2 ring-[#087A43]/30 shadow-xs'
                    : 'border-gray-200 bg-white hover:border-emerald-300'
                }`}
              >
                <div className="p-2.5 rounded-xl bg-amber-100 text-amber-700 shrink-0">
                  <Wheat className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-gray-900">
                      {selectedLang === 'en' ? 'Medium-Scale Farmer' : 'मध्यम किसान'}
                    </h3>
                    {farmType === 'medium' && <Check className="w-5 h-5 text-[#087A43]" />}
                  </div>
                  <p className="text-xs text-amber-700 font-semibold mt-0.5">
                    {selectedLang === 'en' ? '5 – 25 Acres Land' : '5 – 25 एकड़ भूमि'}
                  </p>
                  <p className="text-[11px] text-gray-500 mt-1 leading-snug">
                    {selectedLang === 'en'
                      ? 'Suitable for mechanization, mandi price tracking, crop rotation and labour management.'
                      : 'मशीनीकरण, मंडी मूल्य निगरानी, फसल चक्र और लेबर प्रबंधन के लिए अनुकूल'}
                  </p>
                </div>
              </button>

              {/* Option 3: Large scale */}
              <button
                type="button"
                onClick={() => {
                  setFarmType('large');
                  setExactAcres(35.0);
                }}
                className={`w-full p-4 rounded-2xl border text-left transition-all flex items-start gap-3.5 cursor-pointer ${
                  farmType === 'large'
                    ? 'border-[#087A43] bg-[#EAF6E9] ring-2 ring-[#087A43]/30 shadow-xs'
                    : 'border-gray-200 bg-white hover:border-emerald-300'
                }`}
              >
                <div className="p-2.5 rounded-xl bg-blue-100 text-blue-700 shrink-0">
                  <Tractor className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-gray-900">
                      {selectedLang === 'en' ? 'Large-Scale Farmer' : 'बड़े किसान'}
                    </h3>
                    {farmType === 'large' && <Check className="w-5 h-5 text-[#087A43]" />}
                  </div>
                  <p className="text-xs text-blue-700 font-semibold mt-0.5">
                    {selectedLang === 'en' ? 'More than 25 Acres' : '25 एकड़ से अधिक'}
                  </p>
                  <p className="text-[11px] text-gray-500 mt-1 leading-snug">
                    {selectedLang === 'en'
                      ? 'Suitable for bulk mandi marketing, drip automation, custom hiring and corporate farming.'
                      : 'थोक मंडी विपणन, ड्रिप ऑटोमेशन, कस्टम हायरिंग और कॉर्पोरेट फार्मिंग'}
                  </p>
                </div>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Action Button */}
      <div className="max-w-md w-full mx-auto pt-3">
        <button
          type="button"
          onClick={handleNext}
          className="w-full py-3.5 px-6 rounded-2xl bg-[#087A43] hover:bg-[#075B35] active:scale-[0.99] text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-900/20 transition-all cursor-pointer"
        >
          <span>
            {currentStep === 1
              ? (selectedLang === 'en' ? 'Continue to Select Language' : 'भाषा चयन के लिए आगे बढ़ें')
              : currentStep === 6
              ? (selectedLang === 'en' ? 'Start FasalSetu Dashboard' : 'फसलसेतु डैशबोर्ड शुरू करें')
              : t('continue', selectedLang)}
          </span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

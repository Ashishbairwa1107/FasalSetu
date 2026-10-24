import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  X,
  ShieldCheck,
  Lock,
  CheckCircle2,
  AlertTriangle,
  ArrowLeft,
  KeyRound,
  Loader2,
  Sparkles,
  CreditCard,
  QrCode,
  Building2,
  Calendar,
  Sprout,
  Clock,
  Info,
  MapPin
} from 'lucide-react';
import { SubscriptionPlanId, SeasonId } from '../../types';
import { useApp } from '../../context/AppContext';
import { createSubscriptionOrder, verifyPayment } from '../../services/apiService';
import { loadRazorpayScript } from '../../utils/razorpayLoader';
import {
  calculateSeasonValidity,
  getSelectableSeasonsForState,
  SEASONS_CATALOG,
  SeasonValiditySchedule
} from '../../utils/seasonCalendar';
import { GatewaySetupGuideModal } from './GatewaySetupGuideModal';

interface SubscriptionCheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  planId: SubscriptionPlanId;
  initialSeason?: SeasonId;
  initialAgriYear?: string;
  onSuccess?: () => void;
}

export const SubscriptionCheckoutModal: React.FC<SubscriptionCheckoutModalProps> = ({
  isOpen,
  onClose,
  planId,
  initialSeason = 'rabi',
  initialAgriYear = '2026-27',
  onSuccess
}) => {
  const navigate = useNavigate();
  const {
    profile,
    onboarding,
    language,
    subscription,
    isBasic,
    refreshSubscription,
    refreshTransactions,
    showToast
  } = useApp();

  const isHindi = language === 'hi' || language === 'cg';

  // Farmer profile states
  const [farmerName, setFarmerName] = useState(profile.name || '');
  const [mobileNumber, setMobileNumber] = useState(profile.mobile || '');
  const [emailAddress, setEmailAddress] = useState(profile.email || '');
  const [stateName, setStateName] = useState(profile.state || 'छत्तीसगढ़');
  const [districtName, setDistrictName] = useState(profile.district || 'रायपुर');
  const [cropCycle, setCropCycle] = useState('गेहूं (Wheat) / चना (Gram)');
  const [termsAccepted, setTermsAccepted] = useState(true);

  // Farming season selection state
  const [selectedSeason, setSelectedSeason] = useState<SeasonId>(initialSeason);
  const [selectedAgriYear, setSelectedAgriYear] = useState<string>(initialAgriYear);

  // Available season options configured for this farmer's state
  const availableSeasons = useMemo(() => {
    return getSelectableSeasonsForState(stateName, new Date());
  }, [stateName]);

  // Current calculated season validity schedule
  const activeSeasonSchedule = useMemo(() => {
    return calculateSeasonValidity(selectedSeason, stateName, selectedAgriYear, new Date());
  }, [selectedSeason, stateName, selectedAgriYear]);

  // Flow states
  const [isProcessing, setIsProcessing] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [gatewayNotConfigured, setGatewayNotConfigured] = useState(false);
  const [showSetupGuide, setShowSetupGuide] = useState(false);
  const [paymentSuccessData, setPaymentSuccessData] = useState<{
    orderId: string;
    paymentId: string;
    planName: string;
    seasonLabel: string;
    amount: number;
    startDate: string;
    expiryDate: string;
    daysRemaining: number;
  } | null>(null);

  // Sync state with profile
  useEffect(() => {
    if (profile) {
      setFarmerName(profile.name || '');
      setMobileNumber(profile.mobile || '');
      setEmailAddress(profile.email || '');
      setStateName(profile.state || 'छत्तीसगढ़');
      setDistrictName(profile.district || 'रायपुर');
    }
  }, [profile]);

  if (!isOpen) return null;

  // Determine upgrade status for this specific season
  const isUpgradeToPremium =
    planId === 'premium' &&
    isBasic &&
    subscription?.status === 'active' &&
    subscription?.season === selectedSeason;

  const planName =
    planId === 'premium'
      ? (isHindi ? 'प्रीमियम प्लान' : 'Premium Plan')
      : (isHindi ? 'बेसिक प्लान' : 'Basic Plan');

  const basePrice = planId === 'premium' ? 499 : 299;
  const upgradeDiscount = isUpgradeToPremium ? 299 : 0;
  const payableAmount = isUpgradeToPremium ? 200 : basePrice;
  const totalAmount = payableAmount;

  const features =
    planId === 'premium'
      ? [
          isHindi ? 'सभी बेसिक प्लान सुविधाएं शामिल' : 'All Basic Plan Features',
          isHindi ? 'विशेषज्ञ परामर्श एवं ऑन-फील्ड मार्गदर्शन' : 'Expert Consultation and On-Field Guidance',
          isHindi ? 'फसल, मिट्टी एवं खेत पैरामीटर विश्लेषण' : 'Crop, Soil and Farm Parameter Analysis',
          isHindi ? 'बीमा मार्गदर्शन एवं दावा सहायता' : 'Insurance Guidance and Claim Assistance',
          isHindi ? 'व्यक्तिगत कृषि सिफारिशें' : 'Personalized Farming Recommendations'
        ]
      : [
          isHindi ? 'एआई-आधारित फसल सिफारिशें (AI Crop Recommendations)' : 'AI-Based Crop Recommendations',
          isHindi ? 'सरकारी योजनाएं एवं पात्रता मार्गदर्शन' : 'Government Schemes and Eligibility Guidance',
          isHindi ? 'मौसम अपडेट एवं कृषि अलर्ट' : 'Weather Updates and Farming Alerts',
          isHindi ? 'फसल कैलेंडर एवं व्यय ट्रैकिंग' : 'Crop Calendar and Expense Tracking'
        ];

  // Validation
  const validateForm = () => {
    if (!farmerName.trim()) {
      setErrorMessage(isHindi ? 'कृपया किसान का नाम दर्ज करें' : 'Please confirm your full name');
      return false;
    }
    const cleanMobile = mobileNumber.replace(/\D/g, '');
    if (cleanMobile.length < 10) {
      setErrorMessage(isHindi ? 'कृपया 10-अंकों का वैध मोबाइल नंबर दर्ज करें' : 'Please enter a valid 10-digit mobile number');
      return false;
    }
    if (!termsAccepted) {
      setErrorMessage(isHindi ? 'कृपया नियम एवं शर्तें स्वीकार करें' : 'Please accept the Terms & Conditions');
      return false;
    }
    setErrorMessage(null);
    return true;
  };

  // Checkout process with Razorpay
  const handleProceedToPayment = async () => {
    if (!onboarding.completed) {
      sessionStorage.setItem('pending_checkout_plan', planId);
      sessionStorage.setItem('pending_checkout_season', selectedSeason);
      sessionStorage.setItem('pending_checkout_agriyear', selectedAgriYear);
      navigate(`/onboarding?plan=${planId}&redirect=checkout`);
      return;
    }

    if (!validateForm()) return;

    setIsProcessing(true);
    setErrorMessage(null);
    setStatusMessage(isHindi ? 'सीजन भुगतान ऑर्डर तैयार किया जा रहा है...' : 'Creating seasonal payment order...');

    try {
      // 1. Call backend order generation with season parameters
      const orderRes = await createSubscriptionOrder(planId, {
        userId: profile.id || 'farmer-001',
        farmerName,
        email: emailAddress,
        mobile: mobileNumber,
        season: selectedSeason,
        agriYear: selectedAgriYear,
        cropCycle,
        state: stateName
      });

      if (!orderRes.success) {
        if (orderRes.code === 'PAYMENT_GATEWAY_NOT_CONFIGURED') {
          setGatewayNotConfigured(true);
          setErrorMessage(
            isHindi
              ? 'रेज़रपे भुगतान गेटवे क्रेडेंशियल सर्वर पर कॉन्फ़िगर नहीं हैं। लाइव/टेस्ट चेकआउट के लिए .env फ़ाइल में RAZORPAY_KEY_ID और RAZORPAY_KEY_SECRET जोड़ें।'
              : 'Payment Gateway is not configured. Please add RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET to the server .env file.'
          );
          setIsProcessing(false);
          return;
        }

        setErrorMessage(orderRes.error || orderRes.message || 'Order creation failed');
        setIsProcessing(false);
        return;
      }

      // 2. Load official Razorpay Checkout SDK
      setStatusMessage(isHindi ? 'रेज़रपे पेमेंट इंटरफेस लोड हो रहा है...' : 'Loading official payment interface...');
      const sdkLoaded = await loadRazorpayScript();
      if (!sdkLoaded) {
        throw new Error(
          isHindi
            ? 'रेज़रपे SDK लोड नहीं हो सका। कृपया इंटरनेट जांचें।'
            : 'Could not load Razorpay SDK. Please check your internet connection.'
        );
      }

      // 3. Open Razorpay Checkout Modal
      const seasonTitle = `${activeSeasonSchedule.icon} ${isHindi ? activeSeasonSchedule.seasonNameHi : activeSeasonSchedule.seasonNameEn} (${selectedAgriYear})`;
      const options = {
        key: orderRes.keyId,
        amount: orderRes.amount, // in paise
        currency: orderRes.currency || 'INR',
        name: 'FasalSetu (फसलसेतु)',
        description: `${planName} — ${seasonTitle}`,
        image: '/images/favicon.png',
        order_id: orderRes.orderId,
        prefill: {
          name: farmerName,
          email: emailAddress || 'farmer@fasalsetu.in',
          contact: mobileNumber.replace(/\D/g, '').slice(-10)
        },
        theme: {
          color: '#087A43'
        },
        modal: {
          ondismiss: () => {
            setIsProcessing(false);
            setStatusMessage('');
            showToast(isHindi ? 'भुगतान रद्द कर दिया गया' : 'Payment cancelled by user', 'info');
          }
        },
        handler: async (response: {
          razorpay_payment_id: string;
          razorpay_order_id: string;
          razorpay_signature: string;
        }) => {
          // 4. Server-side signature verification & seasonal activation
          setStatusMessage(isHindi ? 'सीजन भुगतान सत्यापित किया जा रहा है...' : 'Verifying cryptographic payment signature...');
          try {
            const verifyRes = await verifyPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              planId,
              userId: profile.id || 'farmer-001',
              season: selectedSeason,
              agriYear: selectedAgriYear,
              cropCycle,
              state: stateName
            });

            if (verifyRes.success && verifyRes.subscription) {
              await refreshSubscription();
              await refreshTransactions();
              setPaymentSuccessData({
                orderId: response.razorpay_order_id,
                paymentId: response.razorpay_payment_id,
                planName,
                seasonLabel: seasonTitle,
                amount: totalAmount,
                startDate: verifyRes.subscription.startDate,
                expiryDate: verifyRes.subscription.expiryDate,
                daysRemaining: verifyRes.subscription.daysRemaining || activeSeasonSchedule.daysRemaining
              });
              showToast(isHindi ? 'भुगतान सफल एवं सीजन सदस्यता सक्रिय!' : 'Payment verified! Season subscription activated.', 'success');
              if (onSuccess) onSuccess();
            } else {
              setErrorMessage(verifyRes.error || (isHindi ? 'भुगतान सत्यापन विफल रहा।' : 'Payment verification failed.'));
            }
          } catch (err: any) {
            setErrorMessage(err.message || 'Payment verification failed');
          } finally {
            setIsProcessing(false);
          }
        }
      };

      const rzpInstance = new (window as any).Razorpay(options);
      rzpInstance.on('payment.failed', (failRes: any) => {
        setIsProcessing(false);
        const reason = failRes.error?.description || 'Payment failed';
        setErrorMessage(isHindi ? `भुगतान विफल: ${reason}` : `Payment failed: ${reason}`);
        showToast(isHindi ? 'भुगतान विफल' : 'Payment failed', 'error');
      });

      rzpInstance.open();
    } catch (err: any) {
      console.error('[Checkout] Error:', err);
      setErrorMessage(err.message || 'Payment initiation failed');
      setIsProcessing(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
        <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-gray-100 overflow-hidden flex flex-col max-h-[92vh]">
          {/* Header */}
          <div className="p-5 bg-gradient-to-r from-[#087A43] via-[#075B35] to-[#044326] text-white flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="p-1.5 hover:bg-white/10 rounded-full transition-colors cursor-pointer text-white/80 hover:text-white"
                title={isHindi ? 'वापस जाएं' : 'Back'}
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h2 className="text-lg font-bold flex items-center gap-2">
                  <span>{isHindi ? 'फसलसेतु कृषि मौसम चेकआउट' : 'FasalSetu Season Checkout'}</span>
                  <span className="text-[10px] bg-amber-400 text-emerald-950 px-2 py-0.5 rounded-full font-black">
                    {activeSeasonSchedule.icon} {isHindi ? '1 कृषि मौसम' : '1 Farming Season'}
                  </span>
                </h2>
                <p className="text-xs text-emerald-100">
                  {isHindi
                    ? `${stateName} कृषि कैलेंडर • चुने गए सीजन तक वैध`
                    : `${stateName} Agri-Calendar • Valid for selected season`}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-full text-white/80 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="p-6 overflow-y-auto space-y-5 flex-1">
            {/* SUCCESS STATE */}
            {paymentSuccessData ? (
              <div className="py-8 text-center space-y-4 animate-in zoom-in-95 duration-200">
                <div className="w-16 h-16 rounded-full bg-emerald-100 text-[#087A43] flex items-center justify-center mx-auto shadow-md">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-gray-900">
                    {isHindi ? 'भुगतान सफल एवं सीजन सदस्यता सक्रिय!' : 'Payment Verified & Season Plan Activated!'}
                  </h3>
                  <p className="text-xs text-gray-600 mt-1 max-w-sm mx-auto">
                    {isHindi
                      ? `बधाई हो! आपकी फसलसेतु ${paymentSuccessData.planName} योजना (${paymentSuccessData.seasonLabel}) सफलतापूर्वक सक्रिय कर दी गई है।`
                      : `Congratulations! Your FasalSetu ${paymentSuccessData.planName} (${paymentSuccessData.seasonLabel}) has been activated.`}
                  </p>
                </div>

                {/* Receipt Card */}
                <div className="max-w-md mx-auto bg-[#FAFBF7] border border-[#E5EBE1] rounded-2xl p-4 text-xs space-y-2 text-left">
                  <div className="flex items-center justify-between pb-2 border-b border-gray-200">
                    <span className="text-gray-500">{isHindi ? 'योजना:' : 'Plan:'}</span>
                    <span className="font-bold text-gray-900">{paymentSuccessData.planName}</span>
                  </div>
                  <div className="flex items-center justify-between pb-2 border-b border-gray-200">
                    <span className="text-gray-500">{isHindi ? 'सीजन एवं वर्ष:' : 'Farming Season:'}</span>
                    <span className="font-bold text-emerald-900">{paymentSuccessData.seasonLabel}</span>
                  </div>
                  <div className="flex items-center justify-between pb-2 border-b border-gray-200">
                    <span className="text-gray-500">{isHindi ? 'भुगतान राशि:' : 'Amount Paid:'}</span>
                    <span className="font-black text-[#087A43] text-sm">₹{paymentSuccessData.amount}</span>
                  </div>
                  <div className="flex items-center justify-between pb-2 border-b border-gray-200">
                    <span className="text-gray-500">{isHindi ? 'सीजन समाप्ति तिथि:' : 'Season Expiry:'}</span>
                    <span className="font-bold text-gray-900">
                      {new Date(paymentSuccessData.expiryDate).toLocaleDateString(isHindi ? 'hi-IN' : 'en-IN', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </span>
                  </div>
                  <div className="flex items-center justify-between pb-2 border-b border-gray-200">
                    <span className="text-gray-500">{isHindi ? 'शेष दिन:' : 'Days Remaining:'}</span>
                    <span className="font-bold text-emerald-800">
                      {paymentSuccessData.daysRemaining} {isHindi ? 'दिन' : 'days'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500">{isHindi ? 'पेमेंट संदर्भ ID:' : 'Payment ID:'}</span>
                    <span className="font-mono text-gray-800 select-all font-semibold">{paymentSuccessData.paymentId}</span>
                  </div>
                </div>

                <div className="pt-4 flex justify-center gap-3">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-6 py-2.5 bg-[#087A43] hover:bg-[#075B35] text-white text-xs font-bold rounded-xl transition-all shadow-md cursor-pointer"
                  >
                    {isHindi ? 'डैशबोर्ड पर जारी रखें' : 'Continue to Dashboard'}
                  </button>
                </div>
              </div>
            ) : (
              <>
                {/* Gateway Configuration Alert if credentials missing */}
                {gatewayNotConfigured && (
                  <div className="bg-amber-50 border border-amber-300 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-in fade-in duration-200">
                    <div className="flex items-start gap-3">
                      <KeyRound className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                      <div className="text-xs text-amber-900">
                        <p className="font-bold">
                          {isHindi ? 'गेटवे क्रेडेंशियल कॉन्फ़िगरेशन आवश्यक' : 'Gateway Configuration Required'}
                        </p>
                        <p className="mt-0.5 text-amber-800 leading-relaxed">
                          {isHindi
                            ? 'वास्तविक भुगतान प्राप्त करने के लिए .env फ़ाइल में RAZORPAY_KEY_ID एवं RAZORPAY_KEY_SECRET दर्ज करें।'
                            : 'To process real payments, set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in .env.'}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowSetupGuide(true)}
                      className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl transition-colors shrink-0 cursor-pointer shadow-xs"
                    >
                      {isHindi ? 'सेटअप गाइड देखें' : 'View Setup Guide'}
                    </button>
                  </div>
                )}

                {/* ================= SECTION A: FARMING SEASON & CROP CYCLE SELECTION ================= */}
                <div className="border border-emerald-200 bg-[#F7FAF6] rounded-2xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-black text-gray-900 text-xs sm:text-sm flex items-center gap-1.5">
                      <Calendar className="w-4 h-4 text-[#087A43]" />
                      <span>{isHindi ? 'खेती का सीजन (फसल चक्र) चुनें' : 'Select Farming Season & Crop Cycle'}</span>
                    </h4>
                    <span className="text-[10px] text-gray-500 font-medium flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-[#087A43]" />
                      <span>{stateName}</span>
                    </span>
                  </div>

                  {/* Season Cards Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    {[
                      { id: 'rabi', labelEn: 'Rabi Season', labelHi: 'रबी सीजन (शीतकालीन)', icon: '☀️' },
                      { id: 'kharif', labelEn: 'Kharif Season', labelHi: 'खरीफ सीजन (मानसून)', icon: '🌾' },
                      { id: 'zaid', labelEn: 'Zaid Season', labelHi: 'जायद सीजन (गर्मी)', icon: '💧' }
                    ].map((s) => {
                      const isSelected = selectedSeason === s.id;
                      const sSchedule = calculateSeasonValidity(s.id as SeasonId, stateName, selectedAgriYear, new Date());

                      return (
                        <button
                          key={s.id}
                          type="button"
                          onClick={() => setSelectedSeason(s.id as SeasonId)}
                          className={`p-3 rounded-xl border text-left transition-all cursor-pointer relative ${
                            isSelected
                              ? 'border-[#087A43] bg-emerald-100/70 ring-2 ring-[#087A43]/20 shadow-xs'
                              : 'border-gray-200 hover:border-emerald-200 bg-white'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xl">{s.icon}</span>
                            {isSelected && (
                              <span className="w-4 h-4 rounded-full bg-[#087A43] text-white text-[10px] flex items-center justify-center font-bold">
                                ✓
                              </span>
                            )}
                          </div>
                          <p className="text-xs font-bold text-gray-900">
                            {isHindi ? s.labelHi : s.labelEn}
                          </p>
                          <p className="text-[10px] text-gray-500 mt-0.5">
                            {isHindi ? sSchedule.displayRangeHi : sSchedule.displayRangeEn}
                          </p>
                        </button>
                      );
                    })}
                  </div>

                  {/* Agricultural Year & Crop Cycle selection */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    <div>
                      <label className="block text-[11px] font-bold text-gray-700 mb-1">
                        {isHindi ? 'कृषि वर्ष:' : 'Agricultural Year:'}
                      </label>
                      <select
                        value={selectedAgriYear}
                        onChange={(e) => setSelectedAgriYear(e.target.value)}
                        className="w-full px-3 py-2 text-xs border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#087A43] focus:border-transparent outline-hidden bg-white font-medium"
                      >
                        <option value="2026-27">2026-27 ({isHindi ? 'वर्तमान कृषि वर्ष' : 'Current Year'})</option>
                        <option value="2027-28">2027-28 ({isHindi ? 'आगामी कृषि वर्ष' : 'Upcoming Year'})</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-gray-700 mb-1">
                        {isHindi ? 'लक्षित फसल (फसल चक्र):' : 'Target Crop Cycle:'}
                      </label>
                      <input
                        type="text"
                        value={cropCycle}
                        onChange={(e) => setCropCycle(e.target.value)}
                        placeholder={isHindi ? 'उदा. गेहूं, चना, सरसों या धान' : 'e.g. Wheat, Gram, Mustard or Paddy'}
                        className="w-full px-3 py-2 text-xs border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#087A43] focus:border-transparent outline-hidden bg-white font-medium"
                      />
                    </div>
                  </div>

                  {/* Calculated Season Validity Details Banner */}
                  <div className="bg-white border border-emerald-200 rounded-xl p-3 text-xs space-y-1">
                    <div className="flex items-center justify-between text-emerald-950 font-bold">
                      <span className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-[#087A43]" />
                        <span>{isHindi ? 'सीजन वैधता अवधि:' : 'Configured Season Validity:'}</span>
                      </span>
                      <span>{isHindi ? activeSeasonSchedule.displayRangeHi : activeSeasonSchedule.displayRangeEn}</span>
                    </div>
                    <div className="flex items-center justify-between text-gray-500 text-[11px]">
                      <span>{activeSeasonSchedule.regionName} ({stateName})</span>
                      <span className="font-semibold text-emerald-800">
                        {activeSeasonSchedule.daysRemaining} {isHindi ? 'दिन की कुल वैधता' : 'days total validity'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Selected Plan Summary Box */}
                <div className="bg-gradient-to-br from-[#F4F9F5] to-[#EBF5EE] border border-emerald-200 rounded-2xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="w-8 h-8 rounded-xl bg-[#087A43] text-white flex items-center justify-center font-black shadow-xs">
                        {planId === 'premium' ? <Sparkles className="w-4 h-4 text-amber-300" /> : '₹'}
                      </span>
                      <div>
                        <h3 className="text-sm font-black text-gray-900">{planName}</h3>
                        <p className="text-[11px] text-emerald-800 font-semibold">
                          {activeSeasonSchedule.icon} {isHindi ? activeSeasonSchedule.seasonNameHi : activeSeasonSchedule.seasonNameEn} ({selectedAgriYear})
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-lg font-black text-[#087A43]">
                        ₹{totalAmount}
                        <span className="text-[11px] font-normal text-gray-500">
                          {' '}/ {isHindi ? 'कृषि मौसम' : 'farming season'}
                        </span>
                      </div>
                      {isUpgradeToPremium && (
                        <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded-full">
                          {isHindi ? 'बेसिक से अपग्रेड (₹200)' : 'Basic Upgrade Credit (₹200)'}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Included features pill */}
                  <div className="space-y-1.5 pt-2 border-t border-emerald-200/60">
                    <p className="text-[11px] font-bold text-gray-600 uppercase tracking-wider">
                      {isHindi ? 'इस सीजन प्लान में शामिल:' : 'Included in this season plan:'}
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-xs text-gray-700">
                      {features.map((feat, idx) => (
                        <div key={idx} className="flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#087A43] shrink-0" />
                          <span className="truncate">{feat}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Transparent Price Breakdown */}
                <div className="border border-gray-200 rounded-2xl p-4 space-y-2 text-xs text-gray-700">
                  <h4 className="font-bold text-gray-900 uppercase tracking-wider text-[11px] mb-2 flex items-center justify-between">
                    <span>{isHindi ? 'मूल्य विवरण' : 'Price Breakdown'}</span>
                    <span className="text-[10px] font-semibold text-emerald-700 flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>{isHindi ? 'पारदर्शी मूल्य निर्धारण' : 'Transparent Pricing'}</span>
                    </span>
                  </h4>
                  <div className="flex items-center justify-between">
                    <span>
                      {isHindi ? 'सीजन सदस्यता शुल्क:' : 'Season Subscription Fee:'} (
                      {isHindi ? activeSeasonSchedule.seasonNameHi : activeSeasonSchedule.seasonNameEn})
                    </span>
                    <span className="font-semibold">₹{basePrice}</span>
                  </div>
                  {isUpgradeToPremium && (
                    <div className="flex items-center justify-between text-amber-700 font-medium">
                      <span>{isHindi ? 'सक्रिय बेसिक प्लान समायोजन (छूट):' : 'Active Basic Plan Credit:'}</span>
                      <span>-₹{upgradeDiscount}</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <span>{isHindi ? 'लागू कर (GST):' : 'Applicable Taxes (GST):'}</span>
                    <span className="text-gray-500 font-medium">₹0 ({isHindi ? 'समेकित' : 'Inclusive'})</span>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-gray-200 text-sm font-black text-gray-900">
                    <span>{isHindi ? 'कुल देय राशि:' : 'Total Payable Amount:'}</span>
                    <span className="text-[#087A43] text-base">₹{totalAmount}</span>
                  </div>
                </div>

                {/* Farmer Confirmation Details */}
                <div className="border border-gray-200 rounded-2xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-gray-900 uppercase tracking-wider text-[11px]">
                      {isHindi ? 'किसान प्रोफाइल विवरण की पुष्टि' : 'Confirm Farmer Details'}
                    </h4>
                    <span className="text-[10px] text-gray-400">
                      {isHindi ? 'प्रोफ़ाइल से स्वचालित' : 'Auto-filled from profile'}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div>
                      <label className="block text-gray-600 mb-1 font-medium">
                        {isHindi ? 'पूरा नाम:' : 'Full Name:'}
                      </label>
                      <input
                        type="text"
                        value={farmerName}
                        onChange={(e) => setFarmerName(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#087A43] focus:border-transparent outline-hidden font-medium text-gray-800"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-gray-600 mb-1 font-medium">
                        {isHindi ? 'मोबाइल नंबर:' : 'Mobile Number:'}
                      </label>
                      <input
                        type="tel"
                        value={mobileNumber}
                        onChange={(e) => setMobileNumber(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#087A43] focus:border-transparent outline-hidden font-medium text-gray-800"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-gray-600 mb-1 font-medium">
                        {isHindi ? 'ईमेल (रसीद हेतु):' : 'Email (for invoice receipt):'}
                      </label>
                      <input
                        type="email"
                        value={emailAddress}
                        onChange={(e) => setEmailAddress(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#087A43] focus:border-transparent outline-hidden font-medium text-gray-800"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-600 mb-1 font-medium">
                        {isHindi ? 'राज्य एवं जिला:' : 'State & District:'}
                      </label>
                      <input
                        type="text"
                        value={`${districtName ? districtName + ', ' : ''}${stateName}`}
                        readOnly
                        className="w-full px-3 py-2 border border-gray-200 bg-gray-50 rounded-xl text-gray-600 outline-hidden cursor-not-allowed"
                      />
                    </div>
                  </div>
                </div>

                {/* Accepted Payment Methods Badges */}
                <div className="bg-[#FAFBF7] border border-[#E5EBE1] rounded-2xl p-3.5 space-y-2">
                  <p className="text-[11px] font-bold text-gray-600 uppercase tracking-wider flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-[#087A43]" />
                    <span>{isHindi ? 'समर्थित सुरक्षित भुगतान विधियां:' : 'Supported Payment Methods (Razorpay):'}</span>
                  </p>
                  <div className="flex items-center gap-2 flex-wrap text-xs text-gray-700">
                    <span className="bg-white border border-gray-200 px-2.5 py-1 rounded-lg font-medium flex items-center gap-1 shadow-2xs">
                      <QrCode className="w-3.5 h-3.5 text-indigo-600" />
                      <span>UPI (GPay / PhonePe / Paytm / BHIM)</span>
                    </span>
                    <span className="bg-white border border-gray-200 px-2.5 py-1 rounded-lg font-medium flex items-center gap-1 shadow-2xs">
                      <CreditCard className="w-3.5 h-3.5 text-blue-600" />
                      <span>Debit & Credit Cards</span>
                    </span>
                    <span className="bg-white border border-gray-200 px-2.5 py-1 rounded-lg font-medium flex items-center gap-1 shadow-2xs">
                      <Building2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>NetBanking (50+ Banks)</span>
                    </span>
                  </div>
                </div>

                {/* Terms and Conditions Acceptance */}
                <div className="flex items-start gap-2.5 pt-1">
                  <input
                    type="checkbox"
                    id="termsAccept"
                    checked={termsAccepted}
                    onChange={(e) => setTermsAccepted(e.target.checked)}
                    className="mt-0.5 w-4 h-4 text-[#087A43] focus:ring-[#087A43] rounded cursor-pointer"
                  />
                  <label htmlFor="termsAccept" className="text-xs text-gray-600 cursor-pointer leading-relaxed">
                    {isHindi ? (
                      <>
                        मैं फसलसेतु के <span className="text-[#087A43] font-semibold underline">नियम एवं शर्तों</span> से सहमत हूँ।
                        यह सदस्यता केवल चुने गए कृषि मौसम (<strong>{activeSeasonSchedule.displayRangeHi}</strong>) के लिए मान्य रहेगी।
                      </>
                    ) : (
                      <>
                        I agree to FasalSetu’s <span className="text-[#087A43] font-semibold underline">Terms & Conditions</span>.
                        This subscription is strictly valid for the selected farming season (<strong>{activeSeasonSchedule.displayRangeEn}</strong>).
                      </>
                    )}
                  </label>
                </div>

                {/* Error Banner */}
                {errorMessage && (
                  <div className="bg-red-50 border border-red-200 text-red-800 rounded-2xl p-3 text-xs flex items-start gap-2 animate-in fade-in">
                    <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                    <p className="leading-relaxed">{errorMessage}</p>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Footer Actions */}
          {!paymentSuccessData && (
            <div className="p-4 bg-gray-50 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-3">
              <button
                type="button"
                onClick={onClose}
                disabled={isProcessing}
                className="w-full sm:w-auto px-4 py-2.5 text-xs font-semibold text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer disabled:opacity-50"
              >
                {isHindi ? 'डैशबोर्ड पर लौटें' : 'Back to Dashboard'}
              </button>

              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                <button
                  type="button"
                  onClick={handleProceedToPayment}
                  disabled={isProcessing || !termsAccepted}
                  className="w-full sm:w-auto px-6 py-2.5 bg-gradient-to-r from-[#087A43] to-[#075B35] hover:from-[#075B35] hover:to-[#044326] text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>{statusMessage || (isHindi ? 'प्रक्रिया चल रही है...' : 'Processing...')}</span>
                    </>
                  ) : (
                    <>
                      <Lock className="w-3.5 h-3.5 text-amber-300" />
                      <span>
                        {isHindi
                          ? `सीजन भुगतान करें — ₹${totalAmount}`
                          : `Pay for Season — ₹${totalAmount}`}
                      </span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Gateway Setup Guide Modal */}
      <GatewaySetupGuideModal
        isOpen={showSetupGuide}
        onClose={() => setShowSetupGuide(false)}
      />
    </>
  );
};

import React from 'react';
import {
  X,
  ShieldCheck,
  Calendar,
  Clock,
  Receipt,
  Sparkles,
  CheckCircle2,
  ArrowRight,
  ExternalLink,
  Crown,
  FileText
} from 'lucide-react';
import { SubscriptionRecord, SubscriptionPlanId } from '../../types';
import { useApp } from '../../context/AppContext';

interface SubscriptionDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  subscription: SubscriptionRecord | null;
  onUpgrade?: () => void;
  onRenew?: () => void;
  onOpenHistory?: () => void;
}

export const SubscriptionDetailsModal: React.FC<SubscriptionDetailsModalProps> = ({
  isOpen,
  onClose,
  subscription,
  onUpgrade,
  onRenew,
  onOpenHistory
}) => {
  const { language } = useApp();
  const isHindi = language === 'hi' || language === 'cg';

  if (!isOpen || !subscription) return null;

  const isPremium = subscription.planId === 'premium';
  const isExpired = subscription.status === 'expired' || (subscription.daysRemaining !== undefined && subscription.daysRemaining <= 0);

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

  const basicFeatures = [
    isHindi ? 'एआई-आधारित फसल सिफारिशें (AI Crop Recommendations)' : 'AI-Based Crop Recommendations',
    isHindi ? 'सरकारी योजनाएं एवं पात्रता मार्गदर्शन' : 'Government Schemes and Eligibility Guidance',
    isHindi ? 'मौसम अपडेट एवं कृषि अलर्ट' : 'Weather Updates and Farming Alerts',
    isHindi ? 'फसल कैलेंडर एवं व्यय ट्रैकिंग' : 'Crop Calendar and Expense Tracking'
  ];

  const premiumExtraFeatures = [
    isHindi ? 'विशेषज्ञ परामर्श एवं ऑन-फील्ड मार्गदर्शन' : 'Expert Consultation and On-Field Guidance',
    isHindi ? 'फसल, मिट्टी एवं खेत पैरामीटर विश्लेषण' : 'Crop, Soil and Farm Parameter Analysis',
    isHindi ? 'बीमा मार्गदर्शन एवं दावा सहायता' : 'Insurance Guidance and Claim Assistance',
    isHindi ? 'व्यक्तिगत कृषि सिफारिशें' : 'Personalized Farming Recommendations'
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-xl w-full shadow-2xl border border-gray-100 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div
          className={`p-6 text-white relative overflow-hidden ${
            isPremium
              ? 'bg-gradient-to-r from-[#087A43] via-[#075B35] to-[#B45309]'
              : 'bg-gradient-to-r from-[#087A43] via-[#075B35] to-[#044326]'
          }`}
        >
          {/* Subtle gold badge for premium */}
          {isPremium && (
            <div className="absolute right-4 top-4">
              <span className="bg-amber-400 text-emerald-950 font-black text-xs px-3 py-1 rounded-full flex items-center gap-1 shadow-md">
                <Crown className="w-3.5 h-3.5" />
                <span>{isHindi ? 'प्रीमियम' : 'PREMIUM'}</span>
              </span>
            </div>
          )}

          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs uppercase tracking-wider text-emerald-100 font-bold bg-white/10 px-2.5 py-0.5 rounded-full inline-block mb-1.5">
                {isHindi ? 'सक्रिय सदस्यता विवरण' : 'Active Subscription Details'}
              </span>
              <h2 className="text-2xl font-black">
                {isHindi ? subscription.planNameHi || subscription.planName : subscription.planName}
              </h2>
              <p className="text-xs text-emerald-100 mt-1">
                {isHindi ? 'मौसम आधारित सदस्यता • 1 कृषि मौसम वैधता' : 'Seasonal Subscription • 1 Farming Season Validity'}
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-full text-white/80 hover:text-white transition-colors cursor-pointer self-start"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Status Metrics Banner */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="bg-[#FAFBF7] border border-[#E5EBE1] rounded-2xl p-3.5 text-center">
              <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                {isHindi ? 'स्थिति' : 'Status'}
              </p>
              <span
                className={`inline-block mt-1 px-2.5 py-0.5 rounded-full text-xs font-bold ${
                  isExpired
                    ? 'bg-red-100 text-red-800'
                    : 'bg-emerald-100 text-[#087A43]'
                }`}
              >
                {isExpired
                  ? (isHindi ? 'समाप्त' : 'Expired')
                  : (isHindi ? 'सक्रिय' : 'Active')}
              </span>
            </div>

            <div className="bg-[#FAFBF7] border border-[#E5EBE1] rounded-2xl p-3.5 text-center">
              <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                {isHindi ? 'शेष दिन' : 'Days Left'}
              </p>
              <p className="text-lg font-black text-gray-900 mt-0.5">
                {subscription.daysRemaining !== undefined ? subscription.daysRemaining : 365}{' '}
                <span className="text-xs font-normal text-gray-500">{isHindi ? 'दिन' : 'days'}</span>
              </p>
            </div>

            <div className="bg-[#FAFBF7] border border-[#E5EBE1] rounded-2xl p-3.5 text-center col-span-2 sm:col-span-1">
              <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                {isHindi ? 'मौसम शुल्क' : 'Season Fee'}
              </p>
              <p className="text-lg font-black text-[#087A43] mt-0.5">
                ₹{subscription.amount}
              </p>
            </div>
          </div>

          {/* Seasonal & Agro-Climatic Validity */}
          <div className="bg-emerald-50/70 border border-emerald-100 rounded-2xl p-4 space-y-2.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-600 font-medium">
                {isHindi ? 'कृषि मौसम एवं वर्ष:' : 'Season & Agri Year:'}
              </span>
              <span className="font-bold text-emerald-900 bg-emerald-100/80 px-2 py-0.5 rounded-md flex items-center gap-1">
                <span>{subscription.season === 'kharif' ? '🌱' : subscription.season === 'rabi' ? '☀️' : '🌾'}</span>
                <span>
                  {isHindi
                    ? `${subscription.seasonNameHi || subscription.season || 'रबी'} (${subscription.agriYear || '2026-27'})`
                    : `${subscription.seasonName || subscription.season || 'Rabi'} (${subscription.agriYear || '2026-27'})`}
                </span>
              </span>
            </div>

            {subscription.cropCycle && (
              <div className="flex items-center justify-between text-xs border-t border-emerald-100/70 pt-2">
                <span className="text-gray-600 font-medium">
                  {isHindi ? 'फसल चक्र:' : 'Crop Cycle:'}
                </span>
                <span className="font-semibold text-gray-800">{subscription.cropCycle}</span>
              </div>
            )}

            {subscription.state && (
              <div className="flex items-center justify-between text-xs border-t border-emerald-100/70 pt-2">
                <span className="text-gray-600 font-medium">
                  {isHindi ? 'लागू राज्य/कैलेंडर:' : 'Region/State Calendar:'}
                </span>
                <span className="font-semibold text-gray-800">{subscription.state}</span>
              </div>
            )}

            <div className="flex items-center justify-between text-xs border-t border-emerald-100/70 pt-2">
              <span className="text-gray-600 flex items-center gap-1.5 font-medium">
                <Calendar className="w-4 h-4 text-[#087A43]" />
                <span>{isHindi ? 'मौसम शुरुआत तारीख:' : 'Season Start Date:'}</span>
              </span>
              <span className="font-bold text-gray-900">{formatDate(subscription.startDate)}</span>
            </div>

            <div className="flex items-center justify-between text-xs border-t border-emerald-100/70 pt-2">
              <span className="text-gray-600 flex items-center gap-1.5 font-medium">
                <Clock className="w-4 h-4 text-amber-600" />
                <span>{isHindi ? 'मौसम समाप्ति तारीख:' : 'Season Expiry Date:'}</span>
              </span>
              <span className="font-bold text-gray-900">{formatDate(subscription.expiryDate)}</span>
            </div>
          </div>

          {/* Technical Order References */}
          <div className="border border-gray-100 rounded-2xl p-4 bg-gray-50 space-y-2 text-xs text-gray-600">
            <div className="flex items-center justify-between">
              <span className="text-gray-500">{isHindi ? 'ऑर्डर संदर्भ:' : 'Order Reference:'}</span>
              <span className="font-mono text-gray-800 select-all font-semibold">{subscription.orderId || '—'}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-500">{isHindi ? 'भुगतान संदर्भ:' : 'Payment Reference:'}</span>
              <span className="font-mono text-gray-800 select-all font-semibold">{subscription.paymentId || '—'}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-500">{isHindi ? 'सत्यापन स्थिति:' : 'Verification:'}</span>
              <span className="inline-flex items-center gap-1 text-emerald-700 font-bold">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>{isHindi ? 'सर्वर द्वारा सत्यापित (HMAC SHA256)' : 'Cryptographically Verified'}</span>
              </span>
            </div>
          </div>

          {/* Entitled Features Checklist */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2.5">
              {isHindi ? 'शामिल सुविधाएं एवं अधिकार' : 'Included Plan Entitlements'}
            </h3>
            <ul className="space-y-2">
              {basicFeatures.map((feat, idx) => (
                <li key={idx} className="flex items-start gap-2.5 text-xs text-gray-800">
                  <CheckCircle2 className="w-4 h-4 text-[#087A43] shrink-0 mt-0.5" />
                  <span>{feat}</span>
                </li>
              ))}
              {isPremium &&
                premiumExtraFeatures.map((feat, idx) => (
                  <li key={`p-${idx}`} className="flex items-start gap-2.5 text-xs text-emerald-950 font-semibold bg-emerald-50/60 p-1.5 rounded-lg">
                    <Sparkles className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                    <span>{feat}</span>
                  </li>
                ))}
            </ul>
          </div>
        </div>

        {/* Footer actions */}
        <div className="p-4 bg-gray-50 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-3">
          {onOpenHistory && (
            <button
              type="button"
              onClick={onOpenHistory}
              className="text-xs font-bold text-[#087A43] hover:text-[#075B35] flex items-center gap-1.5 cursor-pointer order-2 sm:order-1"
            >
              <Receipt className="w-4 h-4" />
              <span>{isHindi ? 'भुगतान इतिहास देखें' : 'View Payment History'}</span>
            </button>
          )}

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end order-1 sm:order-2">
            {!isPremium && onUpgrade && (
              <button
                type="button"
                onClick={onUpgrade}
                className="w-full sm:w-auto px-4 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{isHindi ? 'प्रीमियम में अपग्रेड करें (₹200)' : 'Upgrade to Premium (₹200)'}</span>
              </button>
            )}

            {isExpired && onRenew && (
              <button
                type="button"
                onClick={onRenew}
                className="w-full sm:w-auto px-4 py-2.5 bg-[#087A43] hover:bg-[#075B35] text-white text-xs font-bold rounded-xl transition-all cursor-pointer shadow-xs"
              >
                {isHindi ? 'नवीनीकृत करें' : 'Renew Plan'}
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 bg-white border border-gray-200 text-gray-700 hover:bg-gray-100 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
            >
              {isHindi ? 'बंद करें' : 'Close'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

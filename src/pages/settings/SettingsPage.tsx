import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { LANGUAGES } from '../../utils/translations';
import { ConfirmationDialog } from '../../components/common/ConfirmationDialog';
import { PageHeaderNav } from '../../components/common/PageHeaderNav';
import {
  Settings,
  Globe,
  Eye,
  ShieldCheck,
  FileText,
  RotateCcw,
  LogOut,
  ChevronRight,
  Check
} from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const { language, setLanguage, resetAllDemoData, resetOnboarding, showToast } = useApp();
  const isHindi = language === 'hi' || language === 'cg';

  const [textSize, setTextSize] = useState<'normal' | 'large'>('normal');
  const [highContrast, setHighContrast] = useState(false);
  const [voiceGuidance, setVoiceGuidance] = useState(true);

  // Dialog states
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);
  const [isLogoutConfirmOpen, setIsLogoutConfirmOpen] = useState(false);
  const [isPrivacyModalOpen, setIsPrivacyModalOpen] = useState(false);
  const [isTermsModalOpen, setIsTermsModalOpen] = useState(false);

  const handleResetData = () => {
    resetAllDemoData();
    setIsResetConfirmOpen(false);
  };

  const handleLogout = () => {
    setIsLogoutConfirmOpen(false);
    resetOnboarding();
    window.location.href = '/onboarding';
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in duration-200">
      {/* Global Back Navigation & Dashboard Shortcut */}
      <PageHeaderNav fallbackPath="/" />

      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2">
          <Settings className="w-7 h-7 text-[#087A43]" />
          <span>{isHindi ? 'ऐप सेटिंग्स एवं प्राथमिकताएं' : 'App Settings & Preferences'}</span>
        </h1>
        <p className="text-xs text-gray-500 mt-1">
          भाषा, दृश्यता विकल्प, गोपनीयता नीति और डेमो डेटा प्रबंधन
        </p>
      </div>

      <div className="bg-white rounded-3xl border border-[#E5EBE1] shadow-2xs divide-y divide-gray-100 overflow-hidden">
        {/* Language Selection */}
        <div className="p-5 space-y-3">
          <div className="flex items-center gap-2">
            <Globe className="w-5 h-5 text-[#087A43]" />
            <h3 className="text-sm font-bold text-gray-900">
              {isHindi ? 'भाषा प्राथमिकता' : 'Language Preference'}
            </h3>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {LANGUAGES.map((l) => (
              <button
                key={l.code}
                onClick={() => setLanguage(l.code)}
                className={`p-2.5 rounded-xl border text-left transition-colors cursor-pointer ${
                  language === l.code
                    ? 'border-[#087A43] bg-emerald-50 text-[#075B35] font-bold'
                    : 'border-gray-200 hover:bg-gray-50 text-gray-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs">{l.nativeName}</span>
                  {language === l.code && <Check className="w-3.5 h-3.5 text-[#087A43]" />}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Accessibility Preferences */}
        <div className="p-5 space-y-4">
          <div className="flex items-center gap-2">
            <Eye className="w-5 h-5 text-blue-600" />
            <h3 className="text-sm font-bold text-gray-900">
              {isHindi ? 'सुगमता एवं दृश्यता' : 'Accessibility Preferences'}
            </h3>
          </div>

          <div className="space-y-3 text-xs">
            {/* Font size toggle */}
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-gray-800">
                  {isHindi ? 'बड़ा टेक्स्ट आकार' : 'Large Text Size'}
                </p>
                <p className="text-gray-400">
                  {isHindi ? 'आसानी से पढ़ने हेतु फॉन्ट आकार बढ़ाएं' : 'Increase font size for easier reading'}
                </p>
              </div>
              <button
                onClick={() => setTextSize(textSize === 'normal' ? 'large' : 'normal')}
                className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
                  textSize === 'large' ? 'bg-[#087A43]' : 'bg-gray-300'
                }`}
              >
                <div className={`w-5 h-5 rounded-full bg-white shadow absolute top-0.5 transition-transform ${
                  textSize === 'large' ? 'right-0.5' : 'left-0.5'
                }`} />
              </button>
            </div>

            {/* Voice Guidance Toggle */}
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-gray-800">
                  {isHindi ? 'बोलकर सलाह' : 'Voice Guidance'}
                </p>
                <p className="text-gray-400">
                  {isHindi ? 'AI मित्र व मौसम को ऑडियो में सुनें' : 'Listen to AI assistant and weather in audio'}
                </p>
              </div>
              <button
                onClick={() => setVoiceGuidance(!voiceGuidance)}
                className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
                  voiceGuidance ? 'bg-[#087A43]' : 'bg-gray-300'
                }`}
              >
                <div className={`w-5 h-5 rounded-full bg-white shadow absolute top-0.5 transition-transform ${
                  voiceGuidance ? 'right-0.5' : 'left-0.5'
                }`} />
              </button>
            </div>
          </div>
        </div>

        {/* Legal & Policy Links */}
        <div className="p-5 space-y-3">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
            {isHindi ? 'कानूनी व सुरक्षा' : 'Legal & Security'}
          </h3>

          <div className="space-y-2">
            <button
              onClick={() => setIsPrivacyModalOpen(true)}
              className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-gray-50 text-xs font-semibold text-gray-700 transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <ShieldCheck className="w-4 h-4 text-emerald-700" />
                <span>{isHindi ? 'गोपनीयता नीति' : 'Privacy Policy'}</span>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-400" />
            </button>

            <button
              onClick={() => setIsTermsModalOpen(true)}
              className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-gray-50 text-xs font-semibold text-gray-700 transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <FileText className="w-4 h-4 text-gray-500" />
                <span>{isHindi ? 'उपयोग की शर्तें' : 'Terms of Service'}</span>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-400" />
            </button>
          </div>
        </div>

        {/* Demo Actions: Reset & Re-onboard */}
        <div className="p-5 space-y-3 bg-[#FAFBF7]">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
            {isHindi ? 'डेमो सिस्टम प्रबंधन' : 'Demo Management'}
          </h3>

          <div className="flex flex-col sm:flex-row items-center gap-3">
            <button
              onClick={() => setIsResetConfirmOpen(true)}
              className="w-full sm:flex-1 py-2.5 px-3 rounded-2xl border border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100 text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>{isHindi ? 'डेमो डेटा रीसेट करें' : 'Reset All Demo Data'}</span>
            </button>

            <button
              onClick={() => setIsLogoutConfirmOpen(true)}
              className="w-full sm:flex-1 py-2.5 px-3 rounded-2xl border border-gray-300 hover:bg-gray-100 text-gray-700 text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>{isHindi ? 'लॉगआउट' : 'Log Out'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Reset Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={isResetConfirmOpen}
        title="डेमो डेटा रीसेट करें?"
        message="इससे आपके द्वारा जोड़े गए सभी नए खेत, खर्च और कैलेंडर कार्य मूल नमूना स्थिति में रीसेट हो जाएंगे।"
        confirmLabel="हां, डेटा रीसेट करें"
        cancelLabel="रद्द करें"
        isDestructive
        onConfirm={handleResetData}
        onCancel={() => setIsResetConfirmOpen(false)}
      />

      {/* Logout Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={isLogoutConfirmOpen}
        title="खाते से बाहर निकलें?"
        message="क्या आप ऑनबोर्डिंग स्क्रीन पर वापस जाना चाहते हैं?"
        confirmLabel="लॉगआउट"
        cancelLabel="रहने दें"
        isDestructive={false}
        onConfirm={handleLogout}
        onCancel={() => setIsLogoutConfirmOpen(false)}
      />

      {/* Privacy Policy Modal */}
      {isPrivacyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-gray-100 space-y-4">
            <h3 className="text-base font-bold text-gray-900">
              {isHindi ? 'फसलसेतु गोपनीयता नीति' : 'FasalSetu Privacy Policy'}
            </h3>
            <p className="text-xs text-gray-600 leading-relaxed">
              {isHindi
                ? 'यह ऐप एक स्थानीय सुरक्षित कृषि प्लेटफॉर्म है। आपका कोई भी व्यक्तिगत डेटा, फोन नंबर या कृषि आंकड़े अनधिकृत बाहरी सर्वर पर नहीं भेजे जाते। सभी जानकारी केवल आपके स्थानीय डिवाइस में सुरक्षित रहती है।'
                : 'This app is a privacy-first platform. Your personal information and farm records are stored securely on your local device.'}
            </p>
            <div className="flex justify-end pt-2">
              <button
                onClick={() => setIsPrivacyModalOpen(false)}
                className="px-4 py-2 bg-[#087A43] hover:bg-[#075B35] text-white text-xs font-bold rounded-xl cursor-pointer"
              >
                {isHindi ? 'स्वीकार करें' : 'Accept'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Terms Modal */}
      {isTermsModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-gray-100 space-y-4">
            <h3 className="text-base font-bold text-gray-900">
              {isHindi ? 'उपयोग की शर्तें' : 'Terms of Use'}
            </h3>
            <p className="text-xs text-gray-600 leading-relaxed">
              {isHindi
                ? 'फसलसेतु पर प्रदर्शित मौसम, रोग निदान और मंडी भाव कृषि परामर्श एवं शैक्षणिक उद्देश्यों के लिए हैं। किसी भी रासायनिक निर्णय से पहले स्थानीय कृषि अधिकारी या KVK से परामर्श करें।'
                : 'Weather, disease diagnosis and market rates are for agricultural guidance and educational purposes.'}
            </p>
            <div className="flex justify-end pt-2">
              <button
                onClick={() => setIsTermsModalOpen(false)}
                className="px-4 py-2 bg-[#087A43] hover:bg-[#075B35] text-white text-xs font-bold rounded-xl cursor-pointer"
              >
                {isHindi ? 'समझ गया' : 'Understood'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

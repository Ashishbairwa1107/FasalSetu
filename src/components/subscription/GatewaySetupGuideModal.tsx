import React, { useState } from 'react';
import { X, KeyRound, ExternalLink, Copy, Check, ShieldCheck, Terminal, AlertCircle } from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface GatewaySetupGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GatewaySetupGuideModal: React.FC<GatewaySetupGuideModalProps> = ({ isOpen, onClose }) => {
  const { language, showToast } = useApp();
  const isHindi = language === 'hi' || language === 'cg';
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const sampleEnv = `RAZORPAY_KEY_ID=rzp_test_YourTestKeyIdHere
RAZORPAY_KEY_SECRET=YourTestKeySecretHere
RAZORPAY_WEBHOOK_SECRET=YourWebhookSecretHere`;

  const copyEnvSnippet = () => {
    navigator.clipboard.writeText(sampleEnv);
    setCopied(true);
    showToast(isHindi ? 'कॉन्फ़िगरेशन कॉपी किया गया' : 'Snippet copied to clipboard', 'success');
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-xl w-full shadow-2xl border border-gray-100 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-[#087A43] via-[#075B35] to-[#044326] text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center backdrop-blur-xs">
              <KeyRound className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h2 className="text-lg font-bold">
                {isHindi ? 'रेज़रपे (Razorpay) गेटवे सेटअप गाइड' : 'Razorpay Gateway Setup Guide'}
              </h2>
              <p className="text-xs text-emerald-100">
                {isHindi ? 'सुरक्षित भुगतान के लिए API क्रेडेंशियल कॉन्फ़िगर करें' : 'Configure API credentials for live or sandbox payments'}
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

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-5 text-sm text-gray-700">
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="text-xs text-amber-900 leading-relaxed">
              <p className="font-bold">
                {isHindi ? 'सुरक्षा नियम: कोई कृत्रिम या फर्जी भुगतान नहीं' : 'Security Rule: No Simulated Payments'}
              </p>
              <p className="mt-1">
                {isHindi
                  ? 'फसलसेतु केवल वास्तविक भुगतान सत्यापन का समर्थन करता है। परीक्षण मोड (Sandbox Test Mode) के लिए रेज़रपे टेस्ट कीज जोड़ें।'
                  : 'FasalSetu only verifies payments via official backend cryptographic signatures. Use Razorpay Sandbox Test keys to test end-to-end checkout.'}
              </p>
            </div>
          </div>

          <div>
            <h3 className="font-bold text-gray-900 flex items-center gap-2 mb-2">
              <span className="w-5 h-5 rounded-full bg-emerald-100 text-[#087A43] text-xs flex items-center justify-center font-bold">1</span>
              <span>{isHindi ? 'मुफ्त टेस्ट कीज प्राप्त करें' : 'Get Free Sandbox Test Keys'}</span>
            </h3>
            <p className="text-xs text-gray-600 leading-relaxed pl-7">
              {isHindi
                ? 'रेज़रपे डैशबोर्ड पर लॉगिन करें, Settings → API Keys में जाएं और "Generate Test Key" पर क्लिक करें।'
                : 'Log in to your Razorpay Dashboard, navigate to Settings → API Keys, and click "Generate Test Key".'}
            </p>
            <div className="pl-7 mt-2">
              <a
                href="https://dashboard.razorpay.com/app/keys"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-[#087A43] hover:text-[#075B35] underline"
              >
                <span>{isHindi ? 'रेज़रपे डैशबोर्ड खोलें' : 'Open Razorpay Dashboard (dashboard.razorpay.com)'}</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          <div>
            <h3 className="font-bold text-gray-900 flex items-center gap-2 mb-2">
              <span className="w-5 h-5 rounded-full bg-emerald-100 text-[#087A43] text-xs flex items-center justify-center font-bold">2</span>
              <span>{isHindi ? 'अपने .env फ़ाइल में जोड़ें' : 'Add to Server .env File'}</span>
            </h3>
            <p className="text-xs text-gray-600 leading-relaxed pl-7 mb-2">
              {isHindi
                ? 'प्रोजेक्ट डायरेक्टरी में मौजूद `.env` फ़ाइल में निम्नलिखित वैरिएबल्स दर्ज करें:'
                : 'Add these environment variables to the `.env` file in the project root:'}
            </p>
            <div className="pl-7">
              <div className="bg-gray-900 text-gray-100 rounded-xl p-3 font-mono text-xs relative overflow-x-auto shadow-inner">
                <pre>{sampleEnv}</pre>
                <button
                  type="button"
                  onClick={copyEnvSnippet}
                  className="absolute top-2 right-2 p-1.5 bg-gray-800 hover:bg-gray-700 text-gray-200 rounded-lg text-xs flex items-center gap-1 cursor-pointer transition-colors"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? (isHindi ? 'कॉपी हुआ' : 'Copied') : (isHindi ? 'कॉपी करें' : 'Copy')}</span>
                </button>
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-bold text-gray-900 flex items-center gap-2 mb-2">
              <span className="w-5 h-5 rounded-full bg-emerald-100 text-[#087A43] text-xs flex items-center justify-center font-bold">3</span>
              <span>{isHindi ? 'सर्वर पुनः प्रारंभ करें' : 'Restart the Backend Server'}</span>
            </h3>
            <p className="text-xs text-gray-600 leading-relaxed pl-7">
              {isHindi
                ? 'कुंजियाँ जोड़ने के बाद, बैकएंड सर्वर को रीस्टार्ट करें (`npm run server`)। चेकआउट बटन तुरंत आधिकारिक भुगतान विंडो खोलेगा।'
                : 'Restart the backend server (`npm run server`). The checkout will immediately load the live/test Razorpay payment interface.'}
            </p>
          </div>

          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-center gap-3">
            <ShieldCheck className="w-5 h-5 text-emerald-700 shrink-0" />
            <p className="text-xs text-emerald-900">
              {isHindi
                ? 'गोपनीयता सुरक्षा: गुप्त कुंजी (Key Secret) केवल बैकएंड पर सुरक्षित रहती है और कभी भी फ्रंटएंड या ब्राउज़र में उजागर नहीं होती।'
                : 'Security Assurance: Key Secret is stored strictly on the server and is never exposed in frontend code.'}
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 bg-[#087A43] hover:bg-[#075B35] text-white text-xs font-bold rounded-xl transition-all cursor-pointer shadow-xs"
          >
            {isHindi ? 'समझ गया' : 'Got It'}
          </button>
        </div>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { X, PhoneCall, Sparkles, User, Calendar, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { requestExpertConsultation } from '../../services/apiService';

interface ExpertConsultationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ExpertConsultationModal: React.FC<ExpertConsultationModalProps> = ({ isOpen, onClose }) => {
  const { profile, language, isPremium, showToast } = useApp();
  const isHindi = language === 'hi' || language === 'cg';

  const [cropName, setCropName] = useState('धान (Paddy)');
  const [queryTopic, setQueryTopic] = useState('');
  const [contactNumber, setContactNumber] = useState(profile.mobile || '');
  const [preferredTime, setPreferredTime] = useState('morning');
  const [submitting, setSubmitting] = useState(false);
  const [successResult, setSuccessResult] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!queryTopic.trim()) {
      showToast(isHindi ? 'कृपया अपनी समस्या या विषय दर्ज करें' : 'Please enter your question topic', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const res = await requestExpertConsultation({
        userId: profile.id || 'farmer-001',
        cropName,
        queryTopic,
        contactNumber,
        preferredTime
      });

      if (res.success) {
        setSuccessResult(res.message || (isHindi ? 'अनुरोध सफलतापूर्वक दर्ज हुआ।' : 'Request submitted successfully.'));
        showToast(isHindi ? 'परामर्श अनुरोध दर्ज हुआ' : 'Consultation request placed', 'success');
      } else {
        showToast(res.error || 'Request failed', 'error');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-gray-100 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-[#087A43] via-[#075B35] to-[#B45309] text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center backdrop-blur-xs">
              <PhoneCall className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h2 className="text-lg font-bold">
                  {isHindi ? 'कृषि विशेषज्ञ परामर्श अनुरोध' : 'Expert Consultation Request'}
                </h2>
                <span className="bg-amber-400 text-emerald-950 text-[10px] font-black px-1.5 py-0.5 rounded">
                  PREMIUM
                </span>
              </div>
              <p className="text-xs text-emerald-100">
                {isHindi ? 'KVK/ICAR मान्यता प्राप्त कृषि वैज्ञानिकों से सीधा संपर्क' : 'Direct advisory with ICAR/KVK agronomists'}
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
        <div className="p-6 overflow-y-auto">
          {successResult ? (
            <div className="py-8 text-center space-y-4">
              <div className="w-14 h-14 rounded-full bg-emerald-100 text-[#087A43] flex items-center justify-center mx-auto shadow-sm">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-base font-bold text-gray-900">
                  {isHindi ? 'अनुरोध सफलतापूर्वक दर्ज किया गया' : 'Consultation Scheduled'}
                </h3>
                <p className="text-xs text-gray-600 mt-2 max-w-sm mx-auto leading-relaxed">
                  {successResult}
                </p>
              </div>
              <div className="p-3 bg-emerald-50 rounded-2xl text-xs text-emerald-900 font-medium">
                {isHindi
                  ? 'अपेक्षित प्रतिक्रिया समय: 24 से 48 घंटे कार्यदिवस में।'
                  : 'Expected response window: 24 to 48 hours on working days.'}
              </div>
              <button
                type="button"
                onClick={onClose}
                className="mt-4 px-6 py-2.5 bg-[#087A43] hover:bg-[#075B35] text-white text-xs font-bold rounded-xl transition-all shadow-xs cursor-pointer"
              >
                {isHindi ? 'डैशबोर्ड पर लौटें' : 'Back to Dashboard'}
              </button>
            </div>
          ) : !isPremium ? (
            <div className="py-6 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center mx-auto">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-gray-900">
                {isHindi ? 'प्रीमियम सदस्यता आवश्यक' : 'Premium Plan Required'}
              </h3>
              <p className="text-xs text-gray-600 max-w-sm mx-auto">
                {isHindi
                  ? 'विशेषज्ञ परामर्श एवं ऑन-फील्ड सहायता सुविधा केवल फसलसेतु प्रीमियम सदस्यों के लिए उपलब्ध है।'
                  : 'Agronomist consultation and field visit guidance are reserved exclusively for Premium plan subscribers.'}
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="bg-amber-50/80 border border-amber-200/80 rounded-2xl p-3 text-[11px] text-amber-900 leading-relaxed flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <p>
                  {isHindi
                    ? 'सेवा उपलब्धता सूचना: वर्तमान में यह पायलट चरण में है। हमारे कृषि विशेषज्ञ आपके विवरण की समीक्षा कर 24-48 घंटे के भीतर फ़ोन कॉल पर परामर्श देंगे।'
                    : 'Pilot Service Availability: An ICAR-certified partner agronomist will review your field data and contact you via phone within 24-48 hours.'}
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  {isHindi ? 'फसल का नाम:' : 'Target Crop:'}
                </label>
                <input
                  type="text"
                  value={cropName}
                  onChange={(e) => setCropName(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#087A43] focus:border-transparent outline-hidden"
                  placeholder={isHindi ? 'उदा. धान, गेहूं, टमाटर' : 'e.g., Paddy, Wheat, Tomato'}
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  {isHindi ? 'समस्या या परामर्श का विषय:' : 'Describe the Farming Query / Symptom:'}
                </label>
                <textarea
                  value={queryTopic}
                  onChange={(e) => setQueryTopic(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 text-xs border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#087A43] focus:border-transparent outline-hidden resize-none"
                  placeholder={
                    isHindi
                      ? 'पत्तियों का पीला पड़ना, कीटनाशक की मात्रा, या खाद प्रबंधन संबंधी विवरण लिखें...'
                      : 'Provide details about soil condition, pest symptoms, fertilizer queries...'
                  }
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    {isHindi ? 'संपर्क मोबाइल:' : 'Contact Phone:'}
                  </label>
                  <input
                    type="tel"
                    value={contactNumber}
                    onChange={(e) => setContactNumber(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#087A43] focus:border-transparent outline-hidden"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    {isHindi ? 'पसंदीदा समय:' : 'Preferred Time:'}
                  </label>
                  <select
                    value={preferredTime}
                    onChange={(e) => setPreferredTime(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#087A43] focus:border-transparent outline-hidden bg-white"
                  >
                    <option value="morning">{isHindi ? 'सुबह (9 AM - 12 PM)' : 'Morning (9 AM - 12 PM)'}</option>
                    <option value="afternoon">{isHindi ? 'दोपहर (12 PM - 3 PM)' : 'Afternoon (12 PM - 3 PM)'}</option>
                    <option value="evening">{isHindi ? 'शाम (3 PM - 6 PM)' : 'Evening (3 PM - 6 PM)'}</option>
                  </select>
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors cursor-pointer"
                >
                  {isHindi ? 'रद्द करें' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 text-xs font-bold text-white bg-[#087A43] hover:bg-[#075B35] rounded-xl flex items-center gap-1.5 transition-all shadow-xs cursor-pointer disabled:opacity-50"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>{isHindi ? 'अनुरोध भेजा जा रहा है...' : 'Submitting...'}</span>
                    </>
                  ) : (
                    <span>{isHindi ? 'अनुरोध भेजें' : 'Submit Consultation Request'}</span>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

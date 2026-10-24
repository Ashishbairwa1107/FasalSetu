import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { PageHeaderNav } from '../../components/common/PageHeaderNav';
import {
  HelpCircle,
  PhoneCall,
  Mail,
  ChevronDown,
  Sparkles,
  ExternalLink,
  MessageSquare,
  BookOpen,
  ShieldCheck,
  Check
} from 'lucide-react';

export const HelpCenterPage: React.FC = () => {
  const { language } = useApp();
  const isHindi = language === 'hi' || language === 'cg';

  const [expandedFaq, setExpandedFaq] = useState<number | null>(0);

  const faqs = [
    {
      q: 'फसलसेतु क्या है और यह किसान की कैसे सहायता करता है?',
      a: 'फसलसेतु भारतीय किसानों के लिए एक ऑल-इन-वन स्मार्ट कृषि साथी है। यह आपको खेत प्रबंधन, दैनिक मंडी भाव, मौसम पूर्वानुमान, फसल कैलेंडर, AI कृषि मित्र और सरकारी योजनाओं की जानकारी एक ही स्थान पर उपलब्ध कराता है।'
    },
    {
      q: 'क्या ऐप में प्रदर्शित मौसम और मंडी भाव वास्तविक हैं?',
      a: 'यह एक फ्रंटेंड प्रोटोटाइप संस्करण है। वर्तमान में प्रदर्शित मौसम और मंडी भाव यथार्थवादी नमूना (डेमो) डेटा पर आधारित हैं। वास्तविक उत्पादन संस्करण में यह सरकारी एगमार्कनेट और मौसम विज्ञान विभाग के एपीआई से जुड़ेगा।'
    },
    {
      q: 'रोग पहचान AI कैसे काम करता है?',
      a: 'आप अपनी बीमार फसल के पत्ते की तस्वीर खींचकर अपलोड करते हैं या दिए गए नमूनों में से चुनते हैं। हमारा सिम्युलेटेड मॉडल 90%+ विश्वास स्कोर के साथ बीमारी का नाम और सुरक्षित जैविक/रासायनिक उपचार सुझाता है।'
    },
    {
      q: 'क्या मेरे द्वारा जोड़े गए खेत और खर्च सुरक्षित रहते हैं?',
      a: 'हाँ! आपके सभी जोड़े गए खेत, फसल कैलेंडर कार्य और खर्च प्रविष्टियां आपके ब्राउज़र के लोकल स्टोरेज (localStorage) में सुरक्षित रहती हैं और पेज रिफ्रेश करने पर भी नष्ट नहीं होती हैं।'
    },
    {
      q: 'सरकारी योजना में आवेदन की स्थिति कैसे ट्रैक करें?',
      a: 'सरकारी योजना स्क्रीन में जाकर आप किसी भी योजना (जैसे पीएम-किसान या कुसुम सोलर) के अंतर्गत अपनी आवेदन स्थिति (Applied, Under Review, Approved) सीधे अपडेट और ट्रैक कर सकते हैं।'
    }
  ];

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in duration-200">
      {/* Global Back Navigation & Dashboard Shortcut */}
      <PageHeaderNav fallbackPath="/" />

      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2">
          <HelpCircle className="w-7 h-7 text-[#087A43]" />
          <span>{isHindi ? 'सहायता केंद्र एवं अक्सर पूछे जाने वाले सवाल' : 'Help Center & FAQs'}</span>
        </h1>
        <p className="text-xs text-gray-500 mt-1">
          फसलसेतु उपयोग निर्देश, हेल्पलाइन नंबर व तकनीकी सहायता
        </p>
      </div>

      {/* Emergency Helpline Banner */}
      <div className="bg-gradient-to-r from-emerald-800 to-[#075B35] text-white p-5 rounded-3xl shadow-sm space-y-3">
        <div className="flex items-center gap-2 text-xs font-bold text-amber-300 uppercase tracking-wider">
          <PhoneCall className="w-4 h-4" />
          <span>राष्ट्रीय किसान कॉल सेंटर (Toll-Free)</span>
        </div>
        <div className="flex items-baseline gap-3">
          <span className="text-3xl font-black font-mono">1800-180-1551</span>
          <span className="text-xs text-emerald-200">सुबह 6:00 से रात 10:00 बजे तक (सभी दिन)</span>
        </div>
        <p className="text-xs text-emerald-100 leading-relaxed">
          फसल रोग, कीट प्रकोप, उर्वरक मात्रा व सरकारी योजनाओं की तत्काल सलाह हेतु कृषि वैज्ञानिकों से सीधे बात करें।
        </p>
      </div>

      {/* FAQ Accordion List */}
      <div className="bg-white rounded-3xl border border-[#E5EBE1] p-5 shadow-2xs space-y-3">
        <h3 className="text-sm font-bold text-gray-900 mb-2">अक्सर पूछे जाने वाले सवाल (FAQs)</h3>

        <div className="divide-y divide-gray-100">
          {faqs.map((faq, idx) => {
            const isExpanded = expandedFaq === idx;

            return (
              <div key={idx} className="py-3">
                <button
                  onClick={() => setExpandedFaq(isExpanded ? null : idx)}
                  className="w-full flex items-center justify-between text-left text-xs sm:text-sm font-bold text-gray-800 hover:text-[#087A43] transition-colors"
                >
                  <span>{faq.q}</span>
                  <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                </button>

                {isExpanded && (
                  <p className="mt-2 text-xs text-gray-600 leading-relaxed bg-[#FAFBF7] p-3 rounded-xl border border-gray-100 animate-in fade-in duration-150">
                    {faq.a}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* App Version & Credits */}
      <div className="bg-white rounded-3xl border border-[#E5EBE1] p-5 shadow-2xs flex items-center justify-between text-xs">
        <div>
          <p className="font-bold text-gray-900">फसलसेतु (FasalSetu) ऐप संस्करण</p>
          <p className="text-gray-500 text-[11px] mt-0.5">v2.4.0 • स्मार्ट भारत कृषि संस्करण</p>
        </div>
        <span className="text-[10px] font-bold bg-emerald-100 text-[#075B35] px-2.5 py-1 rounded-full">
          नवीनतम अपडेट ✓
        </span>
      </div>
    </div>
  );
};

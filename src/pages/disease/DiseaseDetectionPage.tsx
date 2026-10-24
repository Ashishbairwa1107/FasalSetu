import React, { useState, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { CropDiagnosis } from '../../types';
import { PageHeaderNav } from '../../components/common/PageHeaderNav';
import {
  ScanLine,
  Upload,
  Camera,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  ShieldAlert,
  PhoneCall,
  History,
  FileCheck,
  Info
} from 'lucide-react';

export const DiseaseDetectionPage: React.FC = () => {
  const { cropDiagnoses, addDiagnosis, language } = useApp();
  const isHindi = language === 'hi' || language === 'cg';

  const [selectedCrop, setSelectedCrop] = useState('धान (Paddy)');
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>(['पत्तियों का पीला पड़ना']);
  const [imagePreview, setImagePreview] = useState<string | null>(
    'https://images.unsplash.com/photo-1586771107445-d3ca888129ff?auto=format&fit=crop&q=80&w=600'
  );
  const [isScanning, setIsScanning] = useState(false);
  const [currentResult, setCurrentResult] = useState<CropDiagnosis | null>(cropDiagnoses[0] || null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const sampleImages = [
    {
      title: isHindi ? 'धान - पत्ती झुलसा रोग' : 'Paddy - Bacterial Leaf Blight',
      crop: isHindi ? 'धान' : 'Paddy',
      url: 'https://images.unsplash.com/photo-1586771107445-d3ca888129ff?auto=format&fit=crop&q=80&w=600',
      disease: 'Bacterial Leaf Blight',
      diseaseHi: 'जीवाणु पत्ती झुलसा रोग',
      confidence: 94,
      severity: 'moderate' as const,
      remedy: 'प्रति एकड़ 30 ग्राम स्ट्रेप्टोसाइक्लिन + 500 ग्राम कॉपर ऑक्सीक्लोराइड 200 लीटर पानी में छिड़कें। खेत से अतिरिक्त पानी निकालें।'
    },
    {
      title: isHindi ? 'गेहूं - पीला रतुआ रोग' : 'Wheat - Yellow Rust',
      crop: isHindi ? 'गेहूं' : 'Wheat',
      url: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&q=80&w=600',
      disease: 'Yellow Stripe Rust',
      diseaseHi: 'पीला रतुआ रोग',
      confidence: 91,
      severity: 'severe' as const,
      remedy: 'प्रोपिकोनाज़ोल 25% ईसी (200 मिली प्रति एकड़) का छिड़काव सुबह के समय करें।'
    },
    {
      title: isHindi ? 'टमाटर - अगेती झुलसा' : 'Tomato - Early Blight',
      crop: isHindi ? 'टमाटर' : 'Tomato',
      url: 'https://images.unsplash.com/photo-1592841200221-a6898f307baa?auto=format&fit=crop&q=80&w=600',
      disease: 'Early Blight',
      diseaseHi: 'अगेती झुलसा रोग',
      confidence: 88,
      severity: 'mild' as const,
      remedy: 'नीचे की प्रभावित पत्तियां तोड़ें, मैंकोजेब (2.5 ग्राम/लीटर) या 5% नीम तेल का छिड़काव करें।'
    }
  ];

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setImagePreview(event.target?.result as string);
        setCurrentResult(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSelectSample = (sample: typeof sampleImages[0]) => {
    setImagePreview(sample.url);
    setSelectedCrop(sample.crop);
    setCurrentResult(null);
  };

  const handleToggleSymptom = (symptom: string) => {
    if (selectedSymptoms.includes(symptom)) {
      setSelectedSymptoms(selectedSymptoms.filter(s => s !== symptom));
    } else {
      setSelectedSymptoms([...selectedSymptoms, symptom]);
    }
  };

  const handleAnalyze = () => {
    if (!imagePreview) return;

    setIsScanning(true);
    setCurrentResult(null);

    setTimeout(() => {
      setIsScanning(false);

      // Match or generate diagnosis based on selected crop
      let mockDiag: CropDiagnosis;
      if (selectedCrop.includes('गेहूं') || selectedCrop.includes('Wheat')) {
        mockDiag = {
          id: `diag-${Date.now()}`,
          cropName: 'गेहूं (Wheat)',
          cropNameHi: 'गेहूं',
          imageUrl: imagePreview,
          detectedDisease: 'Yellow Stripe Rust (पीला रतुआ)',
          detectedDiseaseHi: 'पीला रतुआ / हल्दी रोग',
          confidence: 92,
          severity: 'severe',
          symptoms: ['Yellow powder strips parallel to veins', 'Severe chlorosis'],
          symptomsHi: ['पत्तियों की नसों के समानांतर चमकीली पीली पाउडरनुमा धारियां', 'पौधों का तेजी से पीला पड़ना'],
          safeRemedies: ['Propiconazole 25% EC (200ml/acre)', 'Morning spray with clean water'],
          safeRemediesHi: ['प्रोपिकोनाज़ोल 25% ईसी 200 मिली प्रति एकड़ छिड़कें', 'सुबह के समय धूप निकलने से पहले छिड़काव करें'],
          preventiveMeasures: ['Sow rust-resistant varieties HD-3086, DBW-187'],
          preventiveMeasuresHi: ['रोग प्रतिरोधी किस्मों (HD-3086, DBW-187) की बुवाई करें'],
          kvkAdvisory: 'सिम्युलेटेड एआई रिपोर्ट। रसायन प्रयोग से पूर्व स्थानीय कृषि विस्तार अधिकारी से सलाह लें।',
          kvkAdvisoryHi: 'सिम्युलेटेड एआई रिपोर्ट। रसायन प्रयोग से पूर्व स्थानीय कृषि विस्तार अधिकारी से सलाह लें।',
          date: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
        };
      } else if (selectedCrop.includes('टमाटर') || selectedCrop.includes('Tomato')) {
        mockDiag = {
          id: `diag-${Date.now()}`,
          cropName: 'टमाटर (Tomato)',
          cropNameHi: 'टमाटर',
          imageUrl: imagePreview,
          detectedDisease: 'Early Blight (अगेती झुलसा)',
          detectedDiseaseHi: 'अगेती झुलसा रोग',
          confidence: 89,
          severity: 'mild',
          symptoms: ['Concentric dark brown rings on lower leaves'],
          symptomsHi: ['निचली पुरानी पत्तियों पर गोल चक्राकार गहरे भूरे धब्बे'],
          safeRemedies: ['Remove lower leaves', 'Spray Mancozeb 75% WP @ 2.5g/L'],
          safeRemediesHi: ['संक्रमित पत्तियां तोड़कर नष्ट करें', 'मैंकोजेब 75% WP (2.5 ग्राम/लीटर) या 5% नीम तेल छिड़कें'],
          preventiveMeasures: ['Use drip irrigation and avoid splashing leaf surfaces'],
          preventiveMeasuresHi: ['ड्रिप विधि से सिंचाई करें ताकि पत्तियों पर नमी न ठहरे'],
          kvkAdvisory: 'सिम्युलेटेड विश्लेषण। कृपया जैविक उपायों को प्राथमिकता दें।',
          kvkAdvisoryHi: 'सिम्युलेटेड विश्लेषण। कृपया जैविक उपायों को प्राथमिकता दें।',
          date: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
        };
      } else {
        mockDiag = {
          id: `diag-${Date.now()}`,
          cropName: 'धान (Paddy)',
          cropNameHi: 'धान',
          imageUrl: imagePreview,
          detectedDisease: 'Bacterial Leaf Blight (जीवाणु झुलसा रोग)',
          detectedDiseaseHi: 'जीवाणु झुलसा रोग (BLB)',
          confidence: 94,
          severity: 'moderate',
          symptoms: ['Yellowish to grayish-white lesions on leaf tips', 'Wavy margins'],
          symptomsHi: ['पत्तियों के सिरों पर मटमैले पीले धब्बे', 'पत्ती के किनारों का लहरदार सूखना'],
          safeRemedies: ['Streptocycline 30g + Copper Oxychloride 500g in 200L water/acre', 'Drain standing field water'],
          safeRemediesHi: ['प्रति एकड़ 30 ग्राम स्ट्रेप्टोसाइक्लिन + 500 ग्राम कॉपर ऑक्सीक्लोराइड का छिड़काव करें', 'खेत से 2-3 दिन के लिए पानी निकालें व यूरिया रोकें'],
          preventiveMeasures: ['Use disease-resistant certified seeds and balanced potash'],
          preventiveMeasuresHi: ['प्रमाणित बीजों का प्रयोग करें और पोटाश का संतुलित छिड़काव रखें'],
          kvkAdvisory: 'यह परिणाम फ्रंटेंड AI मॉडल द्वारा सिम्युलेटेड (डेमो) है। निकटतम KVK से पुष्टि करें।',
          kvkAdvisoryHi: 'यह परिणाम फ्रंटेंड AI मॉडल द्वारा सिम्युलेटेड (डेमो) है। निकटतम KVK से पुष्टि करें।',
          date: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
        };
      }

      setCurrentResult(mockDiag);
      addDiagnosis(mockDiag);
    }, 1800);
  };

  const handleReset = () => {
    setImagePreview(null);
    setCurrentResult(null);
    setSelectedSymptoms([]);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Global Back Navigation & Dashboard Shortcut */}
      <PageHeaderNav fallbackPath="/" />

      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <div className="p-2.5 rounded-2xl bg-teal-100 text-teal-800">
            <ScanLine className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2">
              <span>{isHindi ? 'फसल रोग पहचान AI' : 'Crop Disease Detection AI'}</span>
              <span className="text-xs font-bold bg-teal-100 text-teal-900 px-2 py-0.5 rounded-full">
                {isHindi ? 'सिम्युलेटेड AI' : 'Simulated AI'}
              </span>
            </h1>
            <p className="text-xs text-gray-500">
              प्रभावित पत्ती की तस्वीर अपलोड करें अथवा नमूना छवि चुनकर तत्काल विश्लेषण प्राप्त करें
            </p>
          </div>
        </div>
      </div>

      {/* Main Grid: Upload & Analysis Controls (Left) vs Diagnosis Results (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Image Selector & Form (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white p-5 rounded-3xl border border-[#E5EBE1] shadow-2xs space-y-4">
            <h3 className="text-sm font-bold text-gray-900">
              1. प्रभावित फसल व तस्वीर चुनें
            </h3>

            {/* Quick Sample Selector */}
            <div>
              <p className="text-xs text-gray-500 mb-2">त्वरित परीक्षण हेतु नमूना चुनें:</p>
              <div className="grid grid-cols-3 gap-2">
                {sampleImages.map((s, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSelectSample(s)}
                    className="p-1.5 rounded-xl border border-gray-200 hover:border-[#087A43] bg-[#FAFBF7] text-left transition-colors cursor-pointer group"
                  >
                    <img
                      src={s.url}
                      alt={s.title}
                      className="w-full h-14 object-cover rounded-lg group-hover:scale-105 transition-transform"
                    />
                    <p className="text-[10px] font-bold text-gray-800 mt-1 truncate">
                      {s.crop}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            {/* Image Preview Box with Scanning Radar Animation */}
            <div className="relative rounded-2xl overflow-hidden border-2 border-dashed border-gray-300 bg-gray-50 min-h-[220px] flex items-center justify-center">
              {imagePreview ? (
                <div className="relative w-full h-56">
                  <img
                    src={imagePreview}
                    alt="Leaf for analysis"
                    className="w-full h-full object-cover"
                  />

                  {/* Scanning Animation Overlay */}
                  {isScanning && (
                    <div className="absolute inset-0 bg-[#087A43]/20 flex flex-col items-center justify-center backdrop-blur-2xs">
                      <div className="w-16 h-16 rounded-full border-4 border-white border-t-emerald-500 animate-spin" />
                      <p className="text-white text-xs font-bold mt-3 drop-shadow bg-black/60 px-3 py-1 rounded-full">
                        एआई न्यूरल मॉडल पत्ती का विश्लेषण कर रहा है...
                      </p>
                    </div>
                  )}

                  {/* Bounding box marker when diagnosis ready */}
                  {currentResult && !isScanning && (
                    <div className="absolute top-1/4 left-1/4 w-1/2 h-1/2 border-2 border-amber-400 bg-amber-400/20 rounded-lg pointer-events-none animate-pulse flex items-start justify-end p-1">
                      <span className="text-[9px] bg-amber-500 text-white font-bold px-1.5 py-0.2 rounded">
                        संक्रमित क्षेत्र {currentResult.confidence}%
                      </span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-6 text-center text-gray-400 space-y-2">
                  <Camera className="w-10 h-10 mx-auto text-gray-300" />
                  <p className="text-xs font-medium">कोई फोटो नहीं चुनी गई है</p>
                </div>
              )}
            </div>

            {/* Upload from Device / Reset */}
            <div className="flex items-center gap-2">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageUpload}
                accept="image/*"
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex-1 py-2.5 px-3 rounded-xl border border-gray-300 hover:bg-gray-50 text-xs font-bold text-gray-700 flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <Upload className="w-4 h-4 text-gray-500" />
                <span>गैलरी / कैमरा से अपलोड करें</span>
              </button>

              {imagePreview && (
                <button
                  type="button"
                  onClick={handleReset}
                  className="p-2.5 rounded-xl border border-gray-200 text-gray-500 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                  title="रीसेट करें"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Crop Selector */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                फसल प्रकार
              </label>
              <select
                value={selectedCrop}
                onChange={(e) => setSelectedCrop(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-gray-300 focus:outline-hidden focus:border-[#087A43]"
              >
                <option value="धान (Paddy)">धान (Paddy)</option>
                <option value="गेहूं (Wheat)">गेहूं (Wheat)</option>
                <option value="टमाटर (Tomato)">टमाटर (Tomato)</option>
                <option value="सोयाबीन (Soybean)">सोयाबीन (Soybean)</option>
                <option value="कपास (Cotton)">कपास (Cotton)</option>
                <option value="मक्का (Maize)">मक्का (Maize)</option>
                <option value="सरसों (Mustard)">सरसों (Mustard)</option>
              </select>
            </div>

            {/* Observed Symptoms Chips */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                दिखने वाले लक्षण (वैकल्पिक)
              </label>
              <div className="flex flex-wrap gap-1.5">
                {[
                  'पत्तियों का पीला पड़ना',
                  'भूरे-काले धब्बे',
                  'पत्तियां मुड़ना (Curling)',
                  'तने का सड़ना',
                  'हल्दी जैसा पाउडर'
                ].map((symptom, idx) => {
                  const isChecked = selectedSymptoms.includes(symptom);
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleToggleSymptom(symptom)}
                      className={`text-[11px] px-2.5 py-1 rounded-full transition-colors cursor-pointer ${
                        isChecked
                          ? 'bg-[#EAF6E9] text-[#075B35] font-bold border border-emerald-300'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {symptom}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Analyze Action Button */}
            <button
              type="button"
              disabled={!imagePreview || isScanning}
              onClick={handleAnalyze}
              className="w-full py-3 px-4 bg-[#087A43] hover:bg-[#075B35] disabled:opacity-50 text-white rounded-2xl font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-emerald-900/10 transition-all cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>{isScanning ? 'एआई जांच जारी है...' : 'फसल स्वास्थ्य का AI विश्लेषण करें'}</span>
            </button>
          </div>
        </div>

        {/* Right Column: Diagnosis Report Card (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          {currentResult ? (
            <div className="bg-white p-6 rounded-3xl border border-[#E5EBE1] shadow-sm space-y-5 animate-in fade-in zoom-in-95 duration-200">
              {/* Header: Disease Name & Confidence Badge */}
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 border-b border-gray-100 pb-4">
                <div>
                  <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full uppercase tracking-wider">
                    संभावित रोग पहचान परिणाम
                  </span>
                  <h2 className="text-xl font-black text-gray-900 mt-1">
                    {currentResult.detectedDiseaseHi}
                  </h2>
                  <p className="text-xs text-gray-500 font-medium">
                    {currentResult.detectedDisease} • {currentResult.cropNameHi}
                  </p>
                </div>

                <div className="text-right sm:text-right shrink-0">
                  <div className="inline-flex items-center gap-1.5 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-2xl">
                    <CheckCircle2 className="w-4 h-4 text-[#087A43]" />
                    <div>
                      <p className="text-[10px] text-gray-500 font-medium leading-none">AI विश्वास स्कोर</p>
                      <p className="text-sm font-black text-[#087A43] leading-none mt-0.5">
                        {currentResult.confidence}%
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Severity Gauge */}
              <div className="bg-[#FAFBF7] p-3.5 rounded-2xl border border-gray-100 flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold text-gray-600">गंभीरता स्तर (Severity):</span>
                  <p className="text-sm font-bold capitalize text-amber-700 mt-0.5">
                    {currentResult.severity === 'severe' ? 'उच्च / गंभीर' : currentResult.severity === 'moderate' ? 'मध्यम' : 'प्रारंभिक / हल्का'}
                  </p>
                </div>
                <span className="text-[11px] text-gray-500">
                  तारीख: {currentResult.date}
                </span>
              </div>

              {/* Symptoms Identified */}
              <div>
                <h4 className="text-xs font-bold text-gray-800 uppercase tracking-wider mb-2">
                  पहचाने गए मुख्य लक्षण:
                </h4>
                <ul className="space-y-1.5">
                  {currentResult.symptomsHi.map((symptom, idx) => (
                    <li key={idx} className="text-xs text-gray-700 flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                      <span>{symptom}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Safe Recommended Next Steps */}
              <div className="bg-emerald-50/80 p-4 rounded-2xl border border-emerald-200 space-y-2">
                <h4 className="text-xs font-bold text-[#075B35] flex items-center gap-1.5 uppercase tracking-wider">
                  <CheckCircle2 className="w-4 h-4 text-[#087A43]" />
                  <span>अनुशंसित सुरक्षित कदम व उपाय:</span>
                </h4>
                <ul className="space-y-2 text-xs text-emerald-950 font-medium">
                  {currentResult.safeRemediesHi.map((remedy, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="font-bold text-[#087A43]">{idx + 1}.</span>
                      <span>{remedy}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Preventive Measures */}
              <div>
                <h4 className="text-xs font-bold text-gray-800 uppercase tracking-wider mb-2">
                  भविष्य की रोकथाम के उपाय:
                </h4>
                <ul className="space-y-1.5 text-xs text-gray-600">
                  {currentResult.preventiveMeasuresHi.map((measure, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-emerald-700">✓</span>
                      <span>{measure}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Expert Consultation Disclaimer Notice */}
              <div className="bg-amber-50/80 p-3.5 rounded-2xl border border-amber-200 flex items-start gap-3">
                <ShieldAlert className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
                <div className="text-xs text-amber-900 leading-relaxed">
                  <p className="font-bold">विशेषज्ञ संस्तुति आवश्यक:</p>
                  <p className="mt-0.5">{currentResult.kvkAdvisoryHi}</p>
                  <p className="mt-1 font-semibold text-emerald-900">
                    किसान कॉल सेंटर: <span className="font-mono text-emerald-950">1800-180-1551</span> (निःशुल्क)
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white p-12 rounded-3xl border border-[#E5EBE1] text-center space-y-3">
              <div className="w-16 h-16 rounded-full bg-emerald-50 text-[#087A43] flex items-center justify-center mx-auto">
                <ScanLine className="w-8 h-8" />
              </div>
              <h3 className="text-base font-bold text-gray-800">
                विश्लेषण परिणाम यहाँ दिखाई देगा
              </h3>
              <p className="text-xs text-gray-500 max-w-sm mx-auto">
                बाईं ओर से फसल का नमूना चुनें या अपनी फसल की फोटो अपलोड कर "AI विश्लेषण करें" बटन दबाएं।
              </p>
            </div>
          )}

          {/* Previous Diagnosis History */}
          <div className="bg-white p-5 rounded-3xl border border-[#E5EBE1] space-y-3">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
              <History className="w-3.5 h-3.5" />
              <span>पिछला विश्लेषण इतिहास (localStorage)</span>
            </h3>

            <div className="space-y-2">
              {cropDiagnoses.slice(0, 3).map((item) => (
                <div
                  key={item.id}
                  onClick={() => setCurrentResult(item)}
                  className="flex items-center justify-between p-2.5 rounded-2xl hover:bg-emerald-50/50 border border-gray-100 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={item.imageUrl}
                      alt={item.cropName}
                      className="w-10 h-10 rounded-xl object-cover border border-gray-200"
                    />
                    <div>
                      <p className="text-xs font-bold text-gray-900">{item.detectedDiseaseHi}</p>
                      <p className="text-[11px] text-gray-500">{item.cropNameHi} • {item.date}</p>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-[#087A43]">
                    {item.confidence}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

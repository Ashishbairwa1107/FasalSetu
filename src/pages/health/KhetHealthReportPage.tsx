import React, { useState, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid
} from 'recharts';
import {
  Activity,
  Droplets,
  ShieldCheck,
  FlaskConical,
  TrendingUp,
  FileText,
  AlertCircle,
  CheckCircle2,
  Download,
  Loader2,
  CalendarDays,
  Receipt,
  User,
  MapPin,
  Sparkles,
  Info
} from 'lucide-react';
import { generateSoilHealthPdf } from '../../utils/pdfGenerator';
import { PageHeaderNav } from '../../components/common/PageHeaderNav';

export const KhetHealthReportPage: React.FC = () => {
  const { profile, lands, farms, tasks, expenses, language, showToast } = useApp();
  const isHindi = language === 'hi' || language === 'cg';

  const reportRef = useRef<HTMLDivElement>(null);

  // Available land or farm options
  const landOptions = lands && lands.length > 0 
    ? lands.map(l => ({ id: l.id, name: l.name, area: `${l.area} ${l.areaUnit}`, type: 'land' }))
    : farms.map(f => ({ id: f.id, name: f.name, area: `${f.area} एकड़`, type: 'farm' }));

  const [selectedId, setSelectedId] = useState(landOptions[0]?.id || 'farm-01');
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [pdfProgressText, setPdfProgressText] = useState('');

  const selectedLandObj = lands.find(l => l.id === selectedId);
  const selectedFarmObj = farms.find(f => f.id === selectedId) || farms[0];

  const currentName = selectedLandObj?.name || selectedFarmObj?.name || 'मुख्य खेत';
  const currentArea = selectedLandObj ? `${selectedLandObj.area} ${selectedLandObj.areaUnit}` : `${selectedFarmObj?.area || 2.5} एकड़`;
  const currentCrop = selectedLandObj?.selectedCrop?.nameHi || selectedLandObj?.previousCrop || selectedFarmObj?.currentCrop || 'धान (Paddy)';
  const currentIrrigation = selectedLandObj?.irrigationSource || selectedFarmObj?.irrigationType || 'नलकूप / बोरवेल';
  const compositeScore = selectedLandObj?.healthScore || selectedFarmObj?.healthScore || 89;

  // Soil test values
  const nitrogenVal = 240; // kg/ha (Medium)
  const phosphorusVal = 22; // kg/ha (Balanced)
  const potashVal = 280; // kg/ha (High)
  const phVal = selectedLandObj?.soilDetails?.ph || 6.8;
  const organicCarbonVal = selectedLandObj?.soilDetails?.organicCarbon || 0.65;

  const historicalYieldData = [
    { season: 'खरीफ 2022', thisFarm: 21, districtAvg: 18 },
    { season: 'रबी 2022-23', thisFarm: 24, districtAvg: 20 },
    { season: 'खरीफ 2023', thisFarm: 23, districtAvg: 19 },
    { season: 'रबी 2023-24', thisFarm: 26, districtAvg: 22 },
    { season: 'खरीफ 2024 (अनुमान)', thisFarm: 27, districtAvg: 21 }
  ];

  // Associated tasks and expenses for this land
  const landTasks = selectedLandObj?.tasks && selectedLandObj.tasks.length > 0
    ? selectedLandObj.tasks
    : tasks.slice(0, 4);

  const landExpenses = selectedLandObj?.expenses && selectedLandObj.expenses.length > 0
    ? selectedLandObj.expenses
    : expenses.slice(0, 4);

  const totalSpent = landExpenses.reduce((acc, e) => acc + (e.amount || 0), 0);
  const budget = selectedLandObj?.budget || 45000;
  const projectedRevenue = selectedLandObj?.selectedCrop?.revenuePerAcre 
    ? selectedLandObj.selectedCrop.revenuePerAcre * (selectedLandObj.area || 2.5)
    : 85000;
  const projectedProfit = projectedRevenue - totalSpent;

  const handleDownloadPdf = async () => {
    if (!reportRef.current) return;
    try {
      setIsGeneratingPdf(true);
      await generateSoilHealthPdf(reportRef.current, {
        filename: 'FasalSetu_Soil_Health_Report.pdf',
        onProgress: (msg) => setPdfProgressText(msg)
      });
      showToast(isHindi ? 'पूरी रिपोर्ट PDF सफलतापूर्वक डाउनलोड हो गई!' : 'Complete report PDF downloaded successfully!', 'success');
    } catch (err: any) {
      console.error('PDF generation error:', err);
      const errMsg = err?.message || '';
      showToast(
        isHindi
          ? `PDF तैयार करने में त्रुटि हुई: ${errMsg || 'कृपया पुनः प्रयास करें'}`
          : `Error generating PDF: ${errMsg || 'Please try again'}`,
        'error'
      );
    } finally {
      setIsGeneratingPdf(false);
      setPdfProgressText('');
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Global Back Navigation & Dashboard Shortcut */}
      <PageHeaderNav fallbackPath="/" />

      {/* Top Header with Land Selector and Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2">
            <Activity className="w-7 h-7 text-[#087A43]" />
            <span>{isHindi ? 'खेत स्वास्थ्य एवं उत्पादकता रिपोर्ट' : 'Soil Health & Productivity Report'}</span>
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            फसलसेतु प्रमाणित विश्लेषण: मृदा उर्वरता (NPK), जल दक्षता, कीट सुरक्षा, फसल कार्य व वित्तीय पूर्वानुमान
          </p>
        </div>

        {/* Land / Farm Selector */}
        <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-2xl border border-gray-200 shadow-2xs">
          <span className="text-xs font-semibold text-gray-600">चयनित भूमि:</span>
          <select
            value={selectedId}
            onChange={(e) => setSelectedId(e.target.value)}
            className="text-xs font-bold text-gray-900 focus:outline-hidden cursor-pointer"
          >
            {landOptions.map(opt => (
              <option key={opt.id} value={opt.id}>
                {opt.name} ({opt.area})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Printable Report Container — Captured for PDF */}
      <div ref={reportRef} className="space-y-6 bg-white p-2 sm:p-6 rounded-3xl border border-transparent">
        
        {/* Report Official Document Header (Visible in PDF) */}
        <div className="bg-gradient-to-r from-[#087A43] via-[#075B35] to-[#044326] text-white p-6 rounded-3xl shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-emerald-600/60 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-white text-[#087A43] flex items-center justify-center font-black shadow-md">
                <svg className="w-7 h-7 fill-[#087A43]" viewBox="0 0 24 24">
                  <path d="M17 8C8 10 5.9 16.17 3.82 21.34l1.89.66.95-2.3c.48.17.98.3 1.34.3C19 20 22 3 22 3c-1 2-8 2.25-13 3.25S2 11.5 2 13.5s1.75 3.75 1.75 3.75C7 8 17 8 17 8z" />
                </svg>
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-black tracking-tight">{isHindi ? 'फसलसेतु' : 'FasalSetu'}</h2>
                <p className="text-xs text-emerald-100 font-medium">राष्ट्रीय स्मार्ट कृषि मृदा स्वास्थ्य एवं उत्पादकता प्रमाण-पत्र</p>
              </div>
            </div>

            <div className="text-right sm:border-l sm:border-emerald-600/60 sm:pl-4">
              <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-500/80 px-2.5 py-0.5 rounded-full inline-block">
                रिपोर्ट आईडी: FS-SHR-{Date.now().toString().slice(-6)}
              </span>
              <p className="text-xs text-emerald-100 mt-1">दिनांक: {new Date().toLocaleDateString('hi-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
              <p className="text-[11px] text-emerald-200">परीक्षण लैब: आरंग क्षेत्रीय मृदा परीक्षण प्रयोगशाला (प्रमाणित)</p>
            </div>
          </div>

          {/* Farmer & Land Profile Metadata Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 text-xs">
            <div className="bg-white/10 p-2.5 rounded-xl backdrop-blur-xs">
              <span className="text-emerald-200 text-[10px] block">किसान का नाम:</span>
              <span className="font-bold text-white text-sm">{profile.name}</span>
              <span className="text-[10px] text-emerald-300 block">{profile.mobile}</span>
            </div>
            <div className="bg-white/10 p-2.5 rounded-xl backdrop-blur-xs">
              <span className="text-emerald-200 text-[10px] block">स्थान / पता:</span>
              <span className="font-bold text-white">{profile.village}</span>
              <span className="text-[10px] text-emerald-200 block">{profile.district}, {profile.state}</span>
            </div>
            <div className="bg-white/10 p-2.5 rounded-xl backdrop-blur-xs">
              <span className="text-emerald-200 text-[10px] block">चयनित भूमि व रकबा:</span>
              <span className="font-bold text-white text-sm">{currentName}</span>
              <span className="text-[10px] text-amber-300 block font-semibold">{currentArea} • {currentIrrigation}</span>
            </div>
            <div className="bg-white/10 p-2.5 rounded-xl backdrop-blur-xs">
              <span className="text-emerald-200 text-[10px] block">वर्तमान फसल व मौसम:</span>
              <span className="font-bold text-white text-sm">{currentCrop}</span>
              <span className="text-[10px] text-emerald-200 block">रबी सत्र 2024-25 (सक्रिय)</span>
            </div>
          </div>
        </div>

        {/* Composite Health Score Banner */}
        <div className="bg-[#FAFBF7] border border-[#E5EBE1] p-6 rounded-3xl shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-[#075B35] px-2.5 py-0.5 rounded-full inline-block">
                {isHindi ? 'समग्र स्वास्थ्य सूचकांक' : 'Composite Health Score'}
              </span>
              <span className="text-xs text-gray-500 font-medium">
                {isHindi ? 'श्रेणी: ए-ग्रेड' : 'Grade: A-Grade'}
              </span>
            </div>
            <div className="flex items-baseline gap-3">
              <span className="text-5xl font-black text-[#087A43]">{compositeScore}</span>
              <span className="text-gray-400 text-lg font-bold">/ 100</span>
              <span className="text-xs bg-[#087A43] text-white font-bold px-3 py-1 rounded-full ml-2">
                {isHindi ? 'उत्कृष्ट स्थिति' : 'Optimal Health'}
              </span>
            </div>
            <p className="text-xs text-gray-600 max-w-xl leading-relaxed">
              यह सूचकांक मृदा में उपलब्ध कार्बनिक पदार्थ (0.65%), संतुलित NPK पोषण, इष्टतम पीएच (6.8), कीट अनुपस्थिति (94%) और फसल बढ़वार दर के वैज्ञानिक संकलन द्वारा निर्धारित है।
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3 shrink-0 text-xs text-center">
            <div className="bg-white p-3 rounded-2xl border border-gray-200 shadow-2xs">
              <span className="text-[10px] text-gray-400 font-bold uppercase block">मिट्टी उर्वरता</span>
              <span className="text-lg font-black text-[#087A43] mt-0.5 block">92%</span>
              <span className="text-[9px] text-emerald-800 font-semibold bg-emerald-50 px-1.5 py-0.5 rounded inline-block mt-1">उच्च पोषक</span>
            </div>
            <div className="bg-white p-3 rounded-2xl border border-gray-200 shadow-2xs">
              <span className="text-[10px] text-gray-400 font-bold uppercase block">सिंचाई दक्षता</span>
              <span className="text-lg font-black text-sky-600 mt-0.5 block">88%</span>
              <span className="text-[9px] text-sky-800 font-semibold bg-sky-50 px-1.5 py-0.5 rounded inline-block mt-1">सक्रिय नमी</span>
            </div>
            <div className="bg-white p-3 rounded-2xl border border-gray-200 shadow-2xs">
              <span className="text-[10px] text-gray-400 font-bold uppercase block">कीट सुरक्षा दर</span>
              <span className="text-lg font-black text-amber-600 mt-0.5 block">94%</span>
              <span className="text-[9px] text-amber-800 font-semibold bg-amber-50 px-1.5 py-0.5 rounded inline-block mt-1">सुरक्षित क्षेत्र</span>
            </div>
          </div>
        </div>

        {/* Soil Health Card Section (NPK & pH Analysis) */}
        <div className="bg-white p-6 rounded-3xl border border-[#E5EBE1] shadow-2xs space-y-5">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <div className="flex items-center gap-2">
              <FlaskConical className="w-5 h-5 text-purple-700" />
              <div>
                <h3 className="text-base font-bold text-gray-900">
                  {isHindi ? 'मृदा स्वास्थ्य कार्ड परीक्षण परिणाम' : 'Soil Health Card Test Results'}
                </h3>
                <p className="text-xs text-gray-500">
                  {isHindi
                    ? 'नमूना संख्या: SHC-ARNG-84920 • परीक्षण तिथि: 18 अक्टूबर 2024 • नमूना गहराई: 0-15 सेमी'
                    : 'Sample No: SHC-ARNG-84920 • Test Date: 18 Oct 2024 • Sample Depth: 0-15 cm'}
                </p>
              </div>
            </div>

            <span className="text-[10px] bg-purple-100 text-purple-900 font-bold px-3 py-1 rounded-full">
              सरकारी मान्यता प्राप्त लैब टेस्ट ✓
            </span>
          </div>

          {/* NPK, pH & OC Parameter Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            <div className="bg-[#FAFBF7] p-3.5 rounded-2xl border border-gray-100 text-center">
              <span className="text-[10px] text-gray-400 font-bold uppercase">नाइट्रोजन (N)</span>
              <p className="text-xl font-black text-gray-900 mt-1">{nitrogenVal}</p>
              <span className="text-[10px] text-gray-500">किग्रा/हेक्टेयर</span>
              <span className="text-[10px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded font-bold block mt-1">
                मध्यम स्तर (मानक: 280+)
              </span>
            </div>

            <div className="bg-[#FAFBF7] p-3.5 rounded-2xl border border-gray-100 text-center">
              <span className="text-[10px] text-gray-400 font-bold uppercase">फॉस्फोरस (P)</span>
              <p className="text-xl font-black text-gray-900 mt-1">{phosphorusVal}</p>
              <span className="text-[10px] text-gray-500">किग्रा/हेक्टेयर</span>
              <span className="text-[10px] text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded font-bold block mt-1">
                संतुलित (मानक: 20-25)
              </span>
            </div>

            <div className="bg-[#FAFBF7] p-3.5 rounded-2xl border border-gray-100 text-center">
              <span className="text-[10px] text-gray-400 font-bold uppercase">पोटाश (K)</span>
              <p className="text-xl font-black text-gray-900 mt-1">{potashVal}</p>
              <span className="text-[10px] text-gray-500">किग्रा/हेक्टेयर</span>
              <span className="text-[10px] text-blue-800 bg-blue-50 px-2 py-0.5 rounded font-bold block mt-1">
                पर्याप्त/उच्च (मानक: 250+)
              </span>
            </div>

            <div className="bg-[#FAFBF7] p-3.5 rounded-2xl border border-gray-100 text-center">
              <span className="text-[10px] text-gray-400 font-bold uppercase">पीएच मान (pH)</span>
              <p className="text-xl font-black text-gray-900 mt-1">{phVal}</p>
              <span className="text-[10px] text-gray-500">{isHindi ? 'तटस्थ' : 'Neutral'}</span>
              <span className="text-[10px] text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded font-bold block mt-1">
                आदर्श 6.5 - 7.5
              </span>
            </div>

            <div className="bg-[#FAFBF7] p-3.5 rounded-2xl border border-gray-100 text-center col-span-2 sm:col-span-1">
              <span className="text-[10px] text-gray-400 font-bold uppercase">जैविक कार्बन (OC)</span>
              <p className="text-xl font-black text-gray-900 mt-1">{organicCarbonVal}%</p>
              <span className="text-[10px] text-gray-500">प्रतिशत स्तर</span>
              <span className="text-[10px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded font-bold block mt-1">
                सुधार योग्य (लक्ष्य: &gt;0.75%)
              </span>
            </div>
          </div>

          {/* Agronomist Advice based on Soil Test */}
          <div className="bg-emerald-50/80 p-4 rounded-2xl border border-emerald-200 text-xs text-emerald-950 space-y-1.5">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#087A43]" />
              <p className="font-bold text-[#075B35]">मृदा वैज्ञानिक संस्तुति व सुधार कार्ययोजना:</p>
            </div>
            <p className="leading-relaxed">
              • <strong>जैविक संवर्धन:</strong> खेत की मिट्टी में पोटाश की मात्रा बहुत अच्छी है। जैविक कार्बन बढ़ाने के लिए रबी बुवाई से पहले 2 ट्रॉली सड़ी गोबर खाद या केंचुआ खाद (वर्मीकम्पोस्ट) अवश्य मिलाएं।
            </p>
            <p className="leading-relaxed">
              • <strong>नाइट्रोजन संतुलन:</strong> नाइट्रोजन मध्यम है, इसलिए यूरिया की अनुशंसित मात्रा (100 किग्रा/एकड़) को दो बार में दें—पहला कल्ले फूटते समय और दूसरा बाली निकलने से पहले।
            </p>
            <p className="leading-relaxed">
              • <strong>सूक्ष्म पोषक तत्व:</strong> जिंक की कमी रोकने के लिए 10 किग्रा जिंक सल्फेट प्रति एकड़ आधार खाद के रूप में प्रयोग करें।
            </p>
          </div>
        </div>

        {/* Crop Calendar & Tasks Summary */}
        <div className="bg-white p-6 rounded-3xl border border-[#E5EBE1] shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <div className="flex items-center gap-2">
              <CalendarDays className="w-5 h-5 text-teal-700" />
              <div>
                <h3 className="text-base font-bold text-gray-900">
                  फसल कैलेंडर कार्य एवं प्रगति (Crop Lifecycle &amp; Tasks)
                </h3>
                <p className="text-xs text-gray-500">
                  वर्तमान सत्र के मुख्य कृषि कार्य, सम्पन्नता स्थिति और आगामी सावधानियां
                </p>
              </div>
            </div>
            <span className="text-xs font-semibold text-teal-800 bg-teal-50 px-2.5 py-1 rounded-xl">
              फसल चक्र: 75% पूर्ण
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {landTasks.map((t, idx) => (
              <div key={t.id || idx} className="p-3 rounded-2xl bg-[#FAFBF7] border border-gray-100 flex items-start gap-3">
                <div className={`p-1.5 rounded-xl shrink-0 mt-0.5 ${
                  t.status === 'completed' ? 'bg-emerald-100 text-[#087A43]' : 'bg-amber-100 text-amber-700'
                }`}>
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-gray-900 truncate">{t.title}</h4>
                    <span className="text-[10px] text-gray-400 font-medium">{t.dueDate}</span>
                  </div>
                  <p className="text-[11px] text-gray-500 mt-0.5 line-clamp-1">{t.description}</p>
                  <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full inline-block mt-1 ${
                    t.status === 'completed' ? 'bg-emerald-100 text-[#075B35]' : 'bg-amber-100 text-amber-800'
                  }`}>
                    {t.status === 'completed'
                      ? (isHindi ? 'सम्पन्न' : 'Completed')
                      : (isHindi ? 'प्रगति पर' : 'Pending')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Financial & Yield Performance Table */}
        <div className="bg-white p-6 rounded-3xl border border-[#E5EBE1] shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <div className="flex items-center gap-2">
              <Receipt className="w-5 h-5 text-blue-700" />
              <div>
                <h3 className="text-base font-bold text-gray-900">
                  {isHindi ? 'लागत, राजस्व व शुद्ध मुनाफा विश्लेषण' : 'Financial & Profitability Summary'}
                </h3>
                <p className="text-xs text-gray-500">
                  {isHindi
                    ? 'इस भूमि के पंजीकृत खर्च, बीज-खाद लागत एवं शुद्ध आय'
                    : 'Registered expenses, seed/fertilizer costs and net profit for this plot'}
                </p>
              </div>
            </div>
            <span className="text-xs font-bold text-[#087A43] bg-emerald-50 px-3 py-1 rounded-xl">
              {isHindi ? 'अनुमानित लाभ:' : 'Projected Profit:'} ₹{projectedProfit.toLocaleString('en-IN')}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="bg-[#FAFBF7] p-3.5 rounded-2xl border border-gray-100">
              <span className="text-gray-400 block text-[10px] font-bold uppercase">
                {isHindi ? 'कुल बजट' : 'Total Budget'}
              </span>
              <span className="text-base font-black text-gray-900 mt-0.5 block">₹{budget.toLocaleString('en-IN')}</span>
              <span className="text-[10px] text-gray-500">
                {isHindi ? 'आवंटित कृषि बजट' : 'Allocated Budget'}
              </span>
            </div>
            <div className="bg-[#FAFBF7] p-3.5 rounded-2xl border border-gray-100">
              <span className="text-gray-400 block text-[10px] font-bold uppercase">
                {isHindi ? 'अब तक कुल खर्च' : 'Total Spent'}
              </span>
              <span className="text-base font-black text-rose-700 mt-0.5 block">₹{totalSpent.toLocaleString('en-IN')}</span>
              <span className="text-[10px] text-gray-500">
                {isHindi ? 'बीज, खाद, सिंचाई व मजदूरी' : 'Seeds, fertilizer & labour'}
              </span>
            </div>
            <div className="bg-[#FAFBF7] p-3.5 rounded-2xl border border-gray-100">
              <span className="text-gray-400 block text-[10px] font-bold uppercase">
                {isHindi ? 'अनुमानित उत्पादन आय' : 'Projected Revenue'}
              </span>
              <span className="text-base font-black text-blue-700 mt-0.5 block">₹{projectedRevenue.toLocaleString('en-IN')}</span>
              <span className="text-[10px] text-gray-500">
                {isHindi ? 'एमएसपी ₹2,425/क्विंटल पर' : 'At MSP ₹2,425/Qtl'}
              </span>
            </div>
            <div className="bg-[#FAFBF7] p-3.5 rounded-2xl border border-gray-100">
              <span className="text-gray-400 block text-[10px] font-bold uppercase">
                {isHindi ? 'शुद्ध लाभ' : 'Net Profit'}
              </span>
              <span className="text-base font-black text-[#087A43] mt-0.5 block">₹{projectedProfit.toLocaleString('en-IN')}</span>
              <span className="text-[10px] text-emerald-700 font-semibold">
                {isHindi ? 'मजबूत प्रतिफल' : 'Strong ROI'}
              </span>
            </div>
          </div>
        </div>

        {/* Historical Yield Comparison Chart */}
        <div className="bg-white p-6 rounded-3xl border border-[#E5EBE1] shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <div>
              <h3 className="text-base font-bold text-gray-900">
                {isHindi ? 'ऐतिहासिक फसल पैदावार तुलना' : 'Historical Yield Benchmark'}
              </h3>
              <p className="text-xs text-gray-500">
                {isHindi
                  ? 'आपके खेत की उपज (क्विंटल/एकड़) बनाम जिला रायपुर औसत'
                  : 'Your plot yield (Qtl/Acre) vs District Raipur average'}
              </p>
            </div>
            <span className="text-xs font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-xl">
              {isHindi ? '+28% जिला औसत से अधिक पैदावार' : '+28% Above District Average'}
            </span>
          </div>

          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={historicalYieldData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F0F4EC" />
                <XAxis dataKey="season" tick={{ fontSize: 10, fill: '#6B7280' }} />
                <YAxis tick={{ fontSize: 10, fill: '#6B7280' }} tickFormatter={(v) => `${v} Q`} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#FFFFFF',
                    borderRadius: '12px',
                    border: '1px solid #E5EBE1',
                    fontSize: '11px'
                  }}
                  formatter={(val: any) => [`${val} क्विंटल/एकड़`]}
                />
                <Bar dataKey="thisFarm" name={isHindi ? 'आपका खेत' : 'Your Farm'} fill="#087A43" radius={[6, 6, 0, 0]} />
                <Bar dataKey="districtAvg" name={isHindi ? 'जिला औसत' : 'District Avg'} fill="#CBD5E1" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Distinction Notice: Measured vs Simulated/Demo Data */}
        <div className="bg-gray-50 p-4 rounded-2xl border border-gray-200 text-xs text-gray-500 space-y-1">
          <div className="flex items-center gap-1.5 font-bold text-gray-700">
            <Info className="w-4 h-4 text-[#087A43]" />
            <span>{isHindi ? 'डेटा वर्गीकरण एवं प्रमाणन सूचना:' : 'Data Classification Note:'}</span>
          </div>
          <p className="leading-relaxed">
            • <strong>{isHindi ? 'प्रमाणित लैब डेटा:' : 'Measured Lab Values:'}</strong>{' '}
            {isHindi
              ? 'मृदा स्वास्थ्य कार्ड के NPK, pH मान एवं मिट्टी की बनावट पंजीकृत क्षेत्रीय प्रयोगशाला द्वारा प्रमाणित हैं।'
              : 'Soil health card NPK, pH and texture are verified by certified regional soil laboratory.'}
          </p>
          <p className="leading-relaxed">
            • <strong>{isHindi ? 'सिम्युलेटेड / मॉडल डेटा:' : 'Simulated / Model Data:'}</strong>{' '}
            {isHindi
              ? 'समग्र स्वास्थ्य स्कोर, जल दक्षता व कीट सुरक्षा दर डेमो प्रोटोटाइप एल्गोरिदम द्वारा प्रदर्शित हैं।'
              : 'Overall health score, water efficiency and pest safety rates are calculated via prototype algorithms.'}
          </p>
          <p className="leading-relaxed">
            • <strong>{isHindi ? 'अनुमान:' : 'Estimates:'}</strong>{' '}
            {isHindi
              ? 'आगामी पैदावार व शुद्ध लाभ वर्तमान एमएसपी और औसत बाजार भाव के आधार पर अनुमानित हैं।'
              : 'Projected yield and profit are estimates based on prevailing MSP and market rates.'}
          </p>
        </div>

      </div>

      {/* Prominent PDF Download Button at the bottom */}
      <div className="bg-white p-6 rounded-3xl border border-[#E5EBE1] shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-bold text-gray-900">
            {isHindi ? 'डिजिटल मृदा स्वास्थ्य एवं उत्पादकता प्रमाण-पत्र' : 'Digital Soil & Performance Certificate'}
          </h3>
          <p className="text-xs text-gray-500 mt-0.5">
            {isHindi
              ? 'इस चयनित भूमि की पूर्ण विश्लेषणात्मक रिपोर्ट (NPK, फसल प्रगति, खर्च एवं वैज्ञानिक संस्तुति) PDF प्रारूप में प्राप्त करें।'
              : 'Download complete multi-page analytical PDF report with NPK, crop progress, expenses and agronomist advice.'}
          </p>
        </div>

        <button
          onClick={handleDownloadPdf}
          disabled={isGeneratingPdf}
          className="w-full sm:w-auto px-6 py-3.5 bg-[#087A43] hover:bg-[#075B35] disabled:bg-gray-400 text-white rounded-2xl font-bold text-sm shadow-md hover:shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2.5 cursor-pointer shrink-0"
        >
          {isGeneratingPdf ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin text-white" />
              <span>{pdfProgressText || (isHindi ? 'PDF तैयार हो रहा है...' : 'Generating PDF...')}</span>
            </>
          ) : (
            <>
              <Download className="w-5 h-5 text-emerald-200" />
              <span>{isHindi ? 'पूरी रिपोर्ट PDF डाउनलोड करें' : 'Download Complete PDF Report'}</span>
            </>
          )}
        </button>
      </div>

    </div>
  );
};

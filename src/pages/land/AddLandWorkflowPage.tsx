import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { LandRecord, LandAreaUnit, RecommendedCrop } from '../../types';
import { convertArea, AREA_UNITS } from '../../utils/areaConverter';
import { RECOMMENDED_CROPS, INITIAL_SCHEMES } from '../../data/mockData';
import { StateDistrictDropdowns } from '../../components/common/StateDistrictDropdowns';
import { PageHeaderNav } from '../../components/common/PageHeaderNav';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  Camera,
  FileText,
  Upload,
  Sparkles,
  Droplets,
  Calendar,
  Layers,
  Sprout,
  X,
  ExternalLink,
  ChevronRight,
  TrendingUp,
  Landmark,
  ShieldCheck,
  MapPin,
  Clock
} from 'lucide-react';

export const AddLandWorkflowPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { lands, addLand, updateLand, currentDraftLand, saveDraftLand, clearDraftLand, showToast } = useApp();

  // Resume mode check
  const resumeLandId = searchParams.get('resume');
  const targetStepParam = searchParams.get('step');

  const existingLandToResume = resumeLandId ? lands.find(l => l.id === resumeLandId) : null;

  // Active step (1 to 10)
  const [currentStep, setCurrentStep] = useState<number>(() => {
    if (targetStepParam) return parseInt(targetStepParam, 10);
    if (existingLandToResume) return existingLandToResume.setupStep || 1;
    if (currentDraftLand?.setupStep) return currentDraftLand.setupStep;
    return 1;
  });

  // Step 1: Site & Location
  const [landName, setLandName] = useState(existingLandToResume?.name || currentDraftLand?.name || 'भूमि 1');
  const [areaAmount, setAreaAmount] = useState<number>(existingLandToResume?.area || currentDraftLand?.area || 2.0);
  const [areaUnit, setAreaUnit] = useState<LandAreaUnit>(existingLandToResume?.areaUnit || currentDraftLand?.areaUnit || 'acre');

  // Step 2: Irrigation & Previous Crop
  const [irrigationSource, setIrrigationSource] = useState(existingLandToResume?.irrigationSource || currentDraftLand?.irrigationSource || 'नहर');
  const [previousCrop, setPreviousCrop] = useState(existingLandToResume?.previousCrop || currentDraftLand?.previousCrop || 'धान');
  const [village, setVillage] = useState(existingLandToResume?.village || currentDraftLand?.village || 'बरतोरा');
  const [district, setDistrict] = useState(existingLandToResume?.district || currentDraftLand?.district || 'बिलासपुर');
  const [state, setState] = useState(existingLandToResume?.state || currentDraftLand?.state || 'छत्तीसगढ़');

  // Step 4: Soil Report Upload
  const [soilFileUploaded, setSoilFileUploaded] = useState(false);
  const [soilFileName, setSoilFileName] = useState('');

  // Step 5: AI Soil Analysis
  const [analysisPhase, setAnalysisPhase] = useState(1);

  // Step 6: Season & Budget
  const [season, setSeason] = useState<'kharif' | 'rabi' | 'zaid'>(existingLandToResume?.season || currentDraftLand?.season || 'kharif');
  const [budget, setBudget] = useState<number>(existingLandToResume?.budget || currentDraftLand?.budget || 50000);

  // Step 7: Crop Recommendations
  const [cropFilter, setCropFilter] = useState<'all' | 'low_water' | 'high_value' | 'easy_farming'>('all');
  const [selectedCrop, setSelectedCrop] = useState<RecommendedCrop | null>(
    existingLandToResume?.selectedCrop || currentDraftLand?.selectedCrop || RECOMMENDED_CROPS[0]
  );
  const [detailCrop, setDetailCrop] = useState<RecommendedCrop>(RECOMMENDED_CROPS[0]);

  // Step 9: Schemes
  const [schemeFilter, setSchemeFilter] = useState<'all' | 'central' | 'state'>('all');
  const [selectedSchemeIds, setSelectedSchemeIds] = useState<string[]>(['scheme-01', 'scheme-02']);

  // Dynamic conversion values
  const conversions = convertArea(areaAmount, areaUnit);

  // Auto-save draft on change
  useEffect(() => {
    saveDraftLand({
      name: landName,
      area: areaAmount,
      areaUnit,
      irrigationSource,
      previousCrop,
      village,
      district,
      state,
      season,
      budget,
      selectedCrop: selectedCrop || undefined,
      setupStep: currentStep
    });
  }, [landName, areaAmount, areaUnit, irrigationSource, previousCrop, village, district, state, season, budget, selectedCrop, currentStep]);

  // AI analysis progressive checklist animation
  useEffect(() => {
    if (currentStep === 5) {
      setAnalysisPhase(1);
      const timer1 = setTimeout(() => setAnalysisPhase(2), 500);
      const timer2 = setTimeout(() => setAnalysisPhase(3), 1000);
      const timer3 = setTimeout(() => setAnalysisPhase(4), 1500);
      const timer4 = setTimeout(() => setAnalysisPhase(5), 2000);
      return () => {
        clearTimeout(timer1);
        clearTimeout(timer2);
        clearTimeout(timer3);
        clearTimeout(timer4);
      };
    }
  }, [currentStep]);

  const handleNext = () => {
    if (currentStep === 1) {
      if (!landName.trim()) {
        showToast('कृपया भूमि का नाम दर्ज करें', 'error');
        return;
      }
      if (areaAmount <= 0) {
        showToast('कृपया मान्य क्षेत्रफल दर्ज करें', 'error');
        return;
      }
    }

    if (currentStep === 9) {
      // Finalize and save land record
      handleFinalizeLand();
      return;
    }

    setCurrentStep(prev => prev + 1);
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    } else {
      if (
        typeof window !== 'undefined' &&
        window.history.state &&
        typeof window.history.state.idx === 'number' &&
        window.history.state.idx > 0
      ) {
        navigate(-1);
      } else {
        navigate('/my-land');
      }
    }
  };

  const handleFinalizeLand = () => {
    const totalCost = (selectedCrop?.costPerAcre || 15000) * areaAmount;
    const totalRevenue = (selectedCrop?.revenuePerAcre || 40000) * areaAmount;
    const totalProfit = totalRevenue - totalCost;

    const landData: Omit<LandRecord, 'id'> = {
      name: landName,
      area: areaAmount,
      areaUnit,
      irrigationSource,
      previousCrop,
      village,
      district,
      state,
      season,
      year: '2024',
      budget,
      selectedCrop: selectedCrop || RECOMMENDED_CROPS[0],
      selectedSchemes: selectedSchemeIds,
      setupStep: 10,
      isComplete: true,
      status: 'पूर्ण (Complete)',
      completionPercentage: 100,
      createdAt: new Date().toLocaleDateString('hi-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
      cropProgress: 60,
      currentStage: 'कंसुआ / बालियां निकलना (Panicle Initiation)',
      healthScore: 92,
      nextActivity: { title: 'खाद डालना (यूरिया)', date: '12 जुलाई 2024' },
      tasks: [
        {
          id: `task-${Date.now()}-1`,
          farmId: '',
          cropName: selectedCrop?.nameHi || 'धान',
          title: 'खाद डालना (यूरिया)',
          titleHi: 'खाद डालना (यूरिया) - मात्रा: 50 kg/एकड़',
          description: 'खेत में पानी का स्तर 2-3 सेमी रखते हुए यूरिया की दूसरी खुराक दें।',
          descriptionHi: 'खेत में पानी का स्तर 2-3 सेमी रखते हुए यूरिया की दूसरी खुराक दें।',
          category: 'fertilizer',
          weekNumber: 6,
          dueDate: '2024-07-12',
          priority: 'high',
          status: 'pending',
          weatherDependent: true,
          weatherAdviceHi: 'बारिश थमने पर ही छिड़काव करें।'
        },
        {
          id: `task-${Date.now()}-2`,
          farmId: '',
          cropName: selectedCrop?.nameHi || 'धान',
          title: 'सिंचाई (अवधि: 2 घंटे)',
          titleHi: 'सिंचाई (अवधि: 2 घंटे)',
          description: 'नहर का पानी खोलें और खेत में नमी सुनिश्चित करें।',
          descriptionHi: 'नहर का पानी खोलें और खेत में नमी सुनिश्चित करें।',
          category: 'irrigation',
          weekNumber: 6,
          dueDate: '2024-07-14',
          priority: 'high',
          status: 'pending'
        },
        {
          id: `task-${Date.now()}-3`,
          cropName: selectedCrop?.nameHi || 'धान',
          farmId: '',
          title: 'खरपतवार जांच',
          titleHi: 'खरपतवार जांच - खेत का निरीक्षण करें',
          description: 'मेड़ों पर उग रहे खरपतवार निकालें।',
          descriptionHi: 'मेड़ों पर उग रहे खरपतवार निकालें।',
          category: 'weeding',
          weekNumber: 6,
          dueDate: '2024-07-16',
          priority: 'medium',
          status: 'completed'
        }
      ],
      expenses: [
        { id: `exp-${Date.now()}-1`, farmId: '', cropName: selectedCrop?.nameHi || 'धान', category: 'seeds', categoryHi: 'बीज खरीद', amount: 3200, date: '2024-06-15', season: 'kharif', notes: 'प्रमाणित बीज' },
        { id: `exp-${Date.now()}-2`, farmId: '', cropName: selectedCrop?.nameHi || 'धान', category: 'machinery', categoryHi: 'ट्रैक्टर जुताई', amount: 5500, date: '2024-06-20', season: 'kharif', notes: 'रोटावेटर' },
        { id: `exp-${Date.now()}-3`, farmId: '', cropName: selectedCrop?.nameHi || 'धान', category: 'labour', categoryHi: 'रोपाई मजदूरी', amount: 8600, date: '2024-06-28', season: 'kharif', notes: '10 मजदूर' },
        { id: `exp-${Date.now()}-4`, farmId: '', cropName: selectedCrop?.nameHi || 'धान', category: 'fertilizer', categoryHi: 'उर्वरक (डीएपी)', amount: 6000, date: '2024-07-02', season: 'kharif', notes: 'डीएपी' },
        { id: `exp-${Date.now()}-5`, farmId: '', cropName: selectedCrop?.nameHi || 'धान', category: 'fertilizer', categoryHi: 'खाद (यूरिया)', amount: 1200, date: '2024-07-12', season: 'kharif', notes: 'यूरिया 50 kg' },
        { id: `exp-${Date.now()}-6`, farmId: '', cropName: selectedCrop?.nameHi || 'धान', category: 'irrigation', categoryHi: 'सिंचाई खर्च', amount: 4000, date: '2024-07-14', season: 'kharif', notes: 'बिजली व रखरखाव' }
      ],
      harvestQuantityQuintals: Math.round(areaAmount * 15),
      actualRevenue: totalRevenue
    };

    let targetId = '';
    if (existingLandToResume) {
      updateLand(existingLandToResume.id, landData);
      targetId = existingLandToResume.id;
    } else {
      targetId = addLand(landData);
    }

    clearDraftLand();
    showToast('भूमि सेटअप सफलतापूर्वक पूर्ण हुआ!', 'success');
    navigate(`/land/${targetId}`);
  };

  const filteredCrops = RECOMMENDED_CROPS.filter(c => {
    if (cropFilter === 'all') return true;
    return c.category === cropFilter;
  });

  return (
    <div className="max-w-2xl mx-auto space-y-5 animate-in fade-in duration-200 pb-16">
      {/* Top Stepper Navigation Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-200 pb-3">
        <PageHeaderNav
          onBack={handleBack}
          backLabel={currentStep > 1 ? `पिछला चरण (${currentStep - 1})` : 'वापस जाएं'}
          fallbackPath="/my-land"
          className="mb-0"
        />

        <div className="flex items-center justify-between sm:justify-end gap-3">
          <span className="text-xs font-bold text-[#087A43] bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
            चरण {currentStep} / 10
          </span>

          <button
            onClick={() => {
              saveDraftLand({ setupStep: currentStep });
              showToast('प्रगति ड्राफ्ट के रूप में सुरक्षित कर ली गई है', 'info');
              navigate('/my-land');
            }}
            className="text-xs font-semibold text-gray-500 hover:text-[#087A43] px-2.5 py-1 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
          >
            ड्राफ्ट सहेजें
          </button>
        </div>
      </div>

      {/* ================= STEP 8.1: LAND DETAILS 1 ================= */}
      {currentStep === 1 && (
        <div className="space-y-5 animate-in fade-in duration-150">
          <div className="text-left">
            <h2 className="text-xl font-black text-gray-900 tracking-tight flex items-center gap-2">
              <Sprout className="w-5 h-5 text-[#087A43]" />
              <span>नई भूमि जोड़ें (1/2)</span>
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              अपनी कृषि भूमि का नाम और क्षेत्रफल दर्ज करें
            </p>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-[#E5EBE1] shadow-2xs space-y-4">
            {/* Land Name */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">
                भूमि का नाम *
              </label>
              <input
                type="text"
                required
                value={landName}
                onChange={(e) => setLandName(e.target.value)}
                placeholder="उदा. भूमि 1, बड़ा खेत, नहर वाला प्लाट"
                className="w-full px-3.5 py-2.5 text-sm font-semibold rounded-2xl border border-gray-300 focus:outline-hidden focus:border-[#087A43] focus:ring-2 focus:ring-[#087A43]/20"
              />
            </div>

            {/* Land Area & Unit Dropdown */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">
                भूमि का आकार *
              </label>
              <div className="flex rounded-2xl border border-gray-300 focus-within:border-[#087A43] focus-within:ring-2 focus-within:ring-[#087A43]/20 overflow-hidden bg-gray-50">
                <input
                  type="number"
                  step="0.1"
                  min="0.1"
                  required
                  value={areaAmount}
                  onChange={(e) => setAreaAmount(parseFloat(e.target.value) || 0)}
                  placeholder="2"
                  className="w-full px-3.5 py-2.5 text-base font-black text-gray-900 bg-white focus:outline-hidden"
                />
                <select
                  value={areaUnit}
                  onChange={(e) => setAreaUnit(e.target.value as LandAreaUnit)}
                  className="px-4 py-2.5 text-xs font-bold text-gray-800 bg-gray-100 border-l border-gray-300 focus:outline-hidden cursor-pointer"
                >
                  {AREA_UNITS.map((u) => (
                    <option key={u.id} value={u.id}>{u.labelHi}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Area Conversion Summary Card matching Reference 8.1 */}
            <div className="bg-emerald-50/60 p-4 rounded-2xl border border-emerald-200/80 space-y-1 font-mono text-xs text-emerald-950">
              <p className="font-bold text-[#087A43] font-sans text-xs mb-1">
                स्वचालित क्षेत्रफल रूपांतरण (Conversions):
              </p>
              <p>= {conversions.sqm.toLocaleString('en-IN')} m²</p>
              <p>= {conversions.hectare} hectare</p>
              <p>= {conversions.acre} acre (approx)</p>
            </div>

            {/* Quick unit chips matching Reference 8.1 */}
            <div>
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">अन्य इकाइयां:</p>
              <div className="flex flex-wrap gap-2">
                {AREA_UNITS.map(u => (
                  <button
                    key={u.id}
                    type="button"
                    onClick={() => setAreaUnit(u.id)}
                    className={`px-3 py-1 text-xs font-bold rounded-xl transition-colors cursor-pointer ${
                      areaUnit === u.id
                        ? 'bg-[#087A43] text-white shadow-xs'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {u.labelHi}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= STEP 8.2: LAND DETAILS 2 ================= */}
      {currentStep === 2 && (
        <div className="space-y-5 animate-in fade-in duration-150">
          <div className="text-left">
            <h2 className="text-xl font-black text-gray-900 tracking-tight flex items-center gap-2">
              <Droplets className="w-5 h-5 text-blue-600" />
              <span>भूमि की जानकारी (2/2)</span>
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              सिंचाई संसाधन, पिछली फसल और भौगोलिक स्थिति
            </p>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-[#E5EBE1] shadow-2xs space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">सिंचाई का स्रोत *</label>
              <select
                value={irrigationSource}
                onChange={(e) => setIrrigationSource(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm font-semibold rounded-2xl border border-gray-300 focus:outline-hidden focus:border-[#087A43]"
              >
                <option value="नहर">नहर (Canal)</option>
                <option value="नलकूप / बोरवेल">नलकूप / बोरवेल (Tube well)</option>
                <option value="ड्रिप सिंचाई">ड्रिप सिंचाई (Drip)</option>
                <option value="स्प्रिंकलर">स्प्रिंकलर (Sprinkler)</option>
                <option value="वर्षा आधारित">वर्षा आधारित (Rainfed)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">पिछली फसल *</label>
              <select
                value={previousCrop}
                onChange={(e) => setPreviousCrop(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm font-semibold rounded-2xl border border-gray-300 focus:outline-hidden focus:border-[#087A43]"
              >
                <option value="धान">धान (Paddy)</option>
                <option value="गेहूं">गेहूं (Wheat)</option>
                <option value="सोयाबीन">सोयाबीन (Soybean)</option>
                <option value="मक्का">मक्का (Maize)</option>
                <option value="चना">चना (Chickpea)</option>
                <option value="सब्जियां">सब्जियां (Vegetables)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">गाँव / क्षेत्र *</label>
              <input
                type="text"
                required
                value={village}
                onChange={(e) => setVillage(e.target.value)}
                placeholder="उदा. बरतोरा"
                className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-gray-300 focus:outline-hidden focus:border-[#087A43]"
              />
            </div>

            <StateDistrictDropdowns
              selectedState={state}
              selectedDistrict={district}
              onStateChange={setState}
              onDistrictChange={setDistrict}
            />
          </div>
        </div>
      )}

      {/* ================= STEP 8.3: REVIEW & SUBMIT ================= */}
      {currentStep === 3 && (
        <div className="space-y-5 animate-in fade-in duration-150">
          <div className="text-left">
            <h2 className="text-xl font-black text-gray-900 tracking-tight flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-[#087A43]" />
              <span>जानकारी की समीक्षा (Review & Submit)</span>
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              कृपया आगे बढ़ने से पहले दर्ज जानकारी की पुष्टि करें
            </p>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-[#E5EBE1] shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="text-base font-bold text-gray-900">{landName}</h3>
              <span className="text-xs bg-emerald-100 text-[#075B35] font-bold px-2.5 py-0.5 rounded-full">
                सत्यापित प्रविष्टि
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="flex items-start gap-3 bg-[#FAFBF7] p-3 rounded-2xl border border-gray-100">
                <span className="text-lg">📐</span>
                <div>
                  <span className="text-[10px] text-gray-400 font-medium block">भूमि आकार</span>
                  <span className="text-sm font-bold text-gray-900">
                    {areaAmount} {areaUnit} ({conversions.hectare} ha)
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-3 bg-[#FAFBF7] p-3 rounded-2xl border border-gray-100">
                <span className="text-lg">💧</span>
                <div>
                  <span className="text-[10px] text-gray-400 font-medium block">सिंचाई का स्रोत</span>
                  <span className="text-sm font-bold text-gray-900">{irrigationSource}</span>
                </div>
              </div>

              <div className="flex items-start gap-3 bg-[#FAFBF7] p-3 rounded-2xl border border-gray-100">
                <span className="text-lg">🌾</span>
                <div>
                  <span className="text-[10px] text-gray-400 font-medium block">पिछली फसल</span>
                  <span className="text-sm font-bold text-gray-900">{previousCrop}</span>
                </div>
              </div>

              <div className="flex items-start gap-3 bg-[#FAFBF7] p-3 rounded-2xl border border-gray-100">
                <span className="text-lg">🏡</span>
                <div>
                  <span className="text-[10px] text-gray-400 font-medium block">गाँव / क्षेत्र</span>
                  <span className="text-sm font-bold text-gray-900">{village}</span>
                </div>
              </div>

              <div className="flex items-start gap-3 bg-[#FAFBF7] p-3 rounded-2xl border border-gray-100">
                <span className="text-lg">📍</span>
                <div>
                  <span className="text-[10px] text-gray-400 font-medium block">जिला</span>
                  <span className="text-sm font-bold text-gray-900">{district}</span>
                </div>
              </div>

              <div className="flex items-start gap-3 bg-[#FAFBF7] p-3 rounded-2xl border border-gray-100">
                <span className="text-lg">🇮🇳</span>
                <div>
                  <span className="text-[10px] text-gray-400 font-medium block">राज्य</span>
                  <span className="text-sm font-bold text-gray-900">{state}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= STEP 8.4: UPLOAD SOIL REPORT ================= */}
      {currentStep === 4 && (
        <div className="space-y-5 animate-in fade-in duration-150">
          <div className="text-left">
            <h2 className="text-xl font-black text-gray-900 tracking-tight flex items-center gap-2">
              <FileText className="w-5 h-5 text-[#087A43]" />
              <span>मिट्टी रिपोर्ट अपलोड करें</span>
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              अपनी मृदा स्वास्थ्य कार्ड रिपोर्ट अपलोड करें अथवा सीधे आगे बढ़ें
            </p>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-[#E5EBE1] shadow-2xs space-y-5 text-center">
            {/* Two Action Tabs matching Reference 8.4 */}
            <div className="flex justify-center gap-3">
              <button
                type="button"
                onClick={() => {
                  setSoilFileUploaded(true);
                  setSoilFileName('Camera_Soil_Sample_Scan.jpg');
                }}
                className="px-4 py-2 rounded-xl border border-[#087A43] bg-emerald-50 text-[#075B35] font-bold text-xs flex items-center gap-1.5 cursor-pointer"
              >
                <Camera className="w-4 h-4 text-[#087A43]" />
                <span>फोटो खींचें</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setSoilFileUploaded(true);
                  setSoilFileName('Soil_Health_Card_Bilaspur.pdf');
                }}
                className="px-4 py-2 rounded-xl border border-gray-300 hover:bg-gray-50 text-gray-700 font-bold text-xs flex items-center gap-1.5 cursor-pointer"
              >
                <Upload className="w-4 h-4 text-gray-500" />
                <span>फाइल चुनें</span>
              </button>
            </div>

            {/* Big Dropzone */}
            <div
              onClick={() => {
                setSoilFileUploaded(true);
                setSoilFileName('Soil_Health_Card_Bilaspur.pdf');
              }}
              className="border-2 border-dashed border-gray-300 rounded-3xl p-8 hover:border-[#087A43] transition-colors cursor-pointer bg-gray-50 flex flex-col items-center justify-center space-y-3"
            >
              <div className="w-14 h-14 rounded-full bg-emerald-100 text-[#087A43] flex items-center justify-center">
                <Camera className="w-7 h-7" />
              </div>
              <div>
                <p className="text-sm font-bold text-gray-800">कैमरा से फोटो लें</p>
                <p className="text-xs text-gray-500 mt-0.5">या PDF / JPEG अपलोड करें (अधिकतम 10 MB)</p>
              </div>

              {soilFileUploaded && (
                <div className="bg-emerald-100 text-emerald-900 px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 mt-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                  <span>फाइल संलग्न है: {soilFileName}</span>
                </div>
              )}
            </div>

            <div className="flex justify-between items-center text-xs pt-1">
              <span className="text-gray-400">रिपोर्ट नहीं है? कोई बात नहीं</span>
              <button
                type="button"
                onClick={() => {
                  setSoilFileUploaded(false);
                  handleNext();
                }}
                className="text-emerald-800 font-bold hover:underline cursor-pointer"
              >
                छोड़ें (Skip for Now) →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= STEP 8.5: AI SOIL ANALYSIS ================= */}
      {currentStep === 5 && (
        <div className="space-y-5 animate-in fade-in duration-150">
          <div className="text-left">
            <h2 className="text-xl font-black text-gray-900 tracking-tight flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-500" />
              <span>AI विश्लेषण जारी है (AI Soil Analysis)</span>
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              आपकी मिट्टी और जलवायु के अनुकूल फसल विश्लेषण
            </p>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-[#E5EBE1] shadow-sm space-y-6 text-center">
            {/* Animated Sprout & Radar */}
            <div className="relative inline-block my-2">
              <div className="w-24 h-24 rounded-full bg-emerald-50 border-4 border-emerald-400/40 flex items-center justify-center mx-auto animate-pulse">
                <Sprout className="w-12 h-12 text-[#087A43]" />
              </div>
            </div>

            {/* Checklist matching Reference 8.5 */}
            <div className="max-w-md mx-auto space-y-3 text-left">
              {[
                { text: 'मिट्टी रिपोर्ट पढ़ी जा रही है...', phase: 1 },
                { text: 'मिट्टी के पोषक तत्व विश्लेषण (N, P, K, pH, OC)', phase: 2 },
                { text: 'आपके क्षेत्र के अनुकूल फसलें जांची जा रही हैं...', phase: 3 },
                { text: 'जल उपलब्धता का विश्लेषण', phase: 4 },
                { text: 'बाजार कीमतों का विश्लेषण', phase: 5 }
              ].map((item, idx) => {
                const isDone = analysisPhase >= item.phase;

                return (
                  <div
                    key={idx}
                    className={`flex items-center gap-3 p-3 rounded-2xl transition-all ${
                      isDone
                        ? 'bg-emerald-50 text-emerald-950 font-semibold border border-emerald-200'
                        : 'bg-gray-50 text-gray-400'
                    }`}
                  >
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${
                      isDone ? 'bg-[#087A43] text-white' : 'bg-gray-200 text-gray-400'
                    }`}>
                      {isDone ? '✓' : '...'}
                    </div>
                    <span className="text-xs">{item.text}</span>
                  </div>
                );
              })}
            </div>

            <p className="text-[10px] text-gray-400 italic">
              * यह परिणाम वैज्ञानिक संदर्भ डेटा और स्थानीय जलवायु मॉडल पर आधारित डेमो विश्लेषण है।
            </p>
          </div>
        </div>
      )}

      {/* ================= STEP 8.6: SEASON & BUDGET ================= */}
      {currentStep === 6 && (
        <div className="space-y-5 animate-in fade-in duration-150">
          <div className="text-left">
            <h2 className="text-xl font-black text-gray-900 tracking-tight flex items-center gap-2">
              <Calendar className="w-5 h-5 text-[#087A43]" />
              <span>खेती का सीजन और बजट चुनें</span>
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              मौसम और वित्तीय योजना के आधार पर सटीक फसल सिफारिशें
            </p>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-[#E5EBE1] shadow-2xs space-y-5">
            {/* Season Cards matching Reference 8.6 */}
            <div className="space-y-3">
              {[
                { id: 'kharif', label: 'खरीफ (Kharif)', months: 'जून - अक्टूबर', icon: '🌾' },
                { id: 'rabi', label: 'रबी (Rabi)', months: 'नवंबर - मार्च', icon: '☀️' },
                { id: 'zaid', label: 'जायद (Zaid)', months: 'मार्च - जून', icon: '💧' }
              ].map(s => {
                const isSelected = season === s.id;

                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setSeason(s.id as any)}
                    className={`w-full p-4 rounded-2xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                      isSelected
                        ? 'border-[#087A43] bg-[#EAF6E9] ring-2 ring-[#087A43]/20 shadow-xs'
                        : 'border-gray-200 hover:border-emerald-200 bg-white'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{s.icon}</span>
                      <div>
                        <p className="text-sm font-bold text-gray-900">{s.label}</p>
                        <p className="text-[11px] text-gray-500">{s.months}</p>
                      </div>
                    </div>
                    {isSelected && (
                      <div className="w-6 h-6 rounded-full bg-[#087A43] text-white flex items-center justify-center font-bold text-xs">
                        ✓
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Budget Input matching Reference 8.6 */}
            <div className="pt-2 border-t border-gray-100">
              <label className="block text-xs font-bold text-gray-700 mb-1.5">
                इस सीजन के लिए अनुमानित बजट (₹) *
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-gray-500">₹</span>
                <input
                  type="number"
                  step="1000"
                  value={budget}
                  onChange={(e) => setBudget(parseFloat(e.target.value) || 0)}
                  placeholder="50000"
                  className="w-full pl-8 pr-4 py-3 text-base font-black text-gray-900 rounded-2xl border border-gray-300 focus:outline-hidden focus:border-[#087A43]"
                />
              </div>
              <p className="text-[11px] text-emerald-800 font-semibold mt-1">
                (पूरी {areaAmount} {areaUnit} भूमि के लिए: ~ ₹{Math.round(budget / (areaAmount || 1)).toLocaleString('en-IN')}/एकड़)
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ================= STEP 8.7: CROP RECOMMENDATIONS ================= */}
      {currentStep === 7 && (
        <div className="space-y-5 animate-in fade-in duration-150">
          <div className="text-left">
            <h2 className="text-xl font-black text-gray-900 tracking-tight flex items-center gap-2">
              <Sprout className="w-5 h-5 text-[#087A43]" />
              <span>आपके लिए उपयुक्त फसलें (Recommendations)</span>
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              मिट्टी, मौसम व बजट के आधार पर अनुशंसित फसलें
            </p>
          </div>

          {/* Filter Chips matching Reference 8.7 */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
            {[
              { id: 'all', label: 'सभी' },
              { id: 'low_water', label: 'कम पानी' },
              { id: 'high_value', label: 'उच्च मूल्य' },
              { id: 'easy_farming', label: 'आसान खेती' }
            ].map(f => (
              <button
                key={f.id}
                type="button"
                onClick={() => setCropFilter(f.id as any)}
                className={`px-3 py-1.5 text-xs font-bold rounded-xl whitespace-nowrap transition-colors cursor-pointer ${
                  cropFilter === f.id
                    ? 'bg-[#087A43] text-white shadow-xs'
                    : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Crop Cards matching Reference 8.7 */}
          <div className="space-y-3">
            {filteredCrops.map(crop => {
              const isSelected = selectedCrop?.id === crop.id;
              const totalCost = crop.costPerAcre * areaAmount;
              const totalRev = crop.revenuePerAcre * areaAmount;

              return (
                <div
                  key={crop.id}
                  onClick={() => setSelectedCrop(crop)}
                  className={`bg-white rounded-3xl p-4 border transition-all cursor-pointer shadow-2xs hover:shadow-xs space-y-3 ${
                    isSelected
                      ? 'border-[#087A43] ring-2 ring-[#087A43]/20 bg-[#EAF6E9]/30'
                      : 'border-[#E5EBE1] hover:border-emerald-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={crop.image}
                      alt={crop.nameHi}
                      className="w-16 h-16 rounded-2xl object-cover border border-gray-100 shrink-0"
                    />

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h3 className="text-base font-black text-gray-900">{crop.nameHi}</h3>
                        <span className="text-xs text-gray-400 font-semibold">{crop.durationDays}</span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 mt-2 text-xs">
                        <div>
                          <span className="text-[10px] text-gray-400 block">अनुमानित लागत</span>
                          <span className="font-bold text-gray-800">₹ {totalCost.toLocaleString('en-IN')}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-gray-400 block">संभावित आय</span>
                          <span className="font-black text-[#087A43]">₹ {totalRev.toLocaleString('en-IN')}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Actions Bar matching Reference 8.7 */}
                  <div className="flex items-center justify-between pt-2 border-t border-gray-100 text-xs">
                    <label className="flex items-center gap-1.5 text-gray-500 cursor-pointer" onClick={(e) => e.stopPropagation()}>
                      <input type="checkbox" checked={isSelected} onChange={() => setSelectedCrop(crop)} className="w-3.5 h-3.5 text-[#087A43]" />
                      <span>तुलना</span>
                    </label>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setDetailCrop(crop);
                        setCurrentStep(8);
                      }}
                      className="px-3 py-1 bg-emerald-50 hover:bg-emerald-100 text-[#075B35] font-bold rounded-xl transition-colors"
                    >
                      विवरण देखें →
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ================= STEP 8.8: CROP DETAIL PAGE ================= */}
      {currentStep === 8 && (
        <div className="space-y-5 animate-in fade-in duration-150">
          <div className="text-left">
            <h2 className="text-xl font-black text-gray-900 tracking-tight flex items-center gap-2">
              <span>{detailCrop.nameHi} — संपूर्ण विवरण</span>
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              लागत, आय, पानी की आवश्यकता एवं फसल चक्र समय-सारणी
            </p>
          </div>

          <div className="bg-white rounded-3xl border border-[#E5EBE1] shadow-sm overflow-hidden space-y-4">
            <div className="h-44 w-full overflow-hidden relative">
              <img
                src={detailCrop.image}
                alt={detailCrop.nameHi}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end p-4">
                <span className="text-white text-lg font-black drop-shadow">
                  {detailCrop.nameHi} ({detailCrop.name})
                </span>
              </div>
            </div>

            <div className="p-5 space-y-4">
              {/* Specification Grid matching Reference 8.8 */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="bg-[#FAFBF7] p-3 rounded-2xl border border-gray-100">
                  <span className="text-[10px] text-gray-400 block font-medium">सीजन</span>
                  <span className="font-bold text-gray-900">{detailCrop.seasonHi}</span>
                </div>
                <div className="bg-[#FAFBF7] p-3 rounded-2xl border border-gray-100">
                  <span className="text-[10px] text-gray-400 block font-medium">अवधि</span>
                  <span className="font-bold text-gray-900">{detailCrop.durationDays}</span>
                </div>
                <div className="bg-[#FAFBF7] p-3 rounded-2xl border border-gray-100">
                  <span className="text-[10px] text-gray-400 block font-medium">अनुमानित लागत</span>
                  <span className="font-bold text-gray-900">₹ {detailCrop.costPerAcre.toLocaleString('en-IN')} / एकड़</span>
                </div>
                <div className="bg-[#FAFBF7] p-3 rounded-2xl border border-gray-100">
                  <span className="text-[10px] text-gray-400 block font-medium">अनुमानित आय</span>
                  <span className="font-black text-[#087A43]">₹ {detailCrop.revenuePerAcre.toLocaleString('en-IN')} / एकड़</span>
                </div>
                <div className="bg-[#FAFBF7] p-3 rounded-2xl border border-gray-100">
                  <span className="text-[10px] text-gray-400 block font-medium">पानी की आवश्यकता</span>
                  <span className="font-bold text-gray-900">{detailCrop.waterRequirement}</span>
                </div>
                <div className="bg-[#FAFBF7] p-3 rounded-2xl border border-gray-100">
                  <span className="text-[10px] text-gray-400 block font-medium">मिट्टी अनुकूलता</span>
                  <span className="font-bold text-emerald-800">{detailCrop.soilSuitability}</span>
                </div>
              </div>

              {/* Timeline */}
              {detailCrop.timeline && detailCrop.timeline.length > 0 && (
                <div className="bg-emerald-50/50 p-4 rounded-2xl border border-emerald-100 space-y-2">
                  <h4 className="text-xs font-bold text-emerald-950 uppercase tracking-wider">
                    फसल विकास समय-सारणी:
                  </h4>
                  <div className="space-y-1.5 text-xs text-emerald-900">
                    {detailCrop.timeline.map((item, idx) => (
                      <div key={idx} className="flex justify-between border-b border-emerald-100/60 pb-1">
                        <span>{item.stage}</span>
                        <span className="font-bold">{item.days}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Two Action Buttons matching Reference 8.8 */}
              <div className="space-y-2 pt-2">
                <button
                  type="button"
                  onClick={() => setCurrentStep(9)}
                  className="w-full py-2.5 px-4 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                >
                  <Landmark className="w-4 h-4" />
                  <span>सरकारी योजनाएं देखें</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setSelectedCrop(detailCrop);
                    setCurrentStep(9);
                  }}
                  className="w-full py-3 px-4 rounded-2xl bg-[#087A43] hover:bg-[#075B35] text-white font-bold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-md"
                >
                  <Check className="w-4 h-4" />
                  <span>इस फसल का चयन करें</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= STEP 8.9: GOVT SCHEMES ================= */}
      {currentStep === 9 && (
        <div className="space-y-5 animate-in fade-in duration-150">
          <div className="text-left">
            <h2 className="text-xl font-black text-gray-900 tracking-tight flex items-center gap-2">
              <Landmark className="w-5 h-5 text-purple-700" />
              <span>सरकारी योजनाएं ({selectedCrop?.nameHi || 'धान'})</span>
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              इस फसल और क्षेत्र के लिए उपलब्ध सब्सिडी व वित्तीय सहायता
            </p>
          </div>

          {/* Scheme Filters matching Reference 8.9 */}
          <div className="flex items-center gap-1.5">
            {[
              { id: 'all', label: 'सभी' },
              { id: 'central', label: 'केंद्र सरकार' },
              { id: 'state', label: 'राज्य सरकार' }
            ].map(f => (
              <button
                key={f.id}
                type="button"
                onClick={() => setSchemeFilter(f.id as any)}
                className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-colors cursor-pointer ${
                  schemeFilter === f.id
                    ? 'bg-[#087A43] text-white'
                    : 'bg-white text-gray-700 border border-gray-200'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Schemes list matching Reference 8.9 */}
          <div className="space-y-3">
            {INITIAL_SCHEMES.slice(0, 3).map(scheme => (
              <div
                key={scheme.id}
                className="bg-white p-4 rounded-3xl border border-[#E5EBE1] shadow-2xs space-y-2 flex items-center justify-between"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-gray-900">{scheme.nameHi}</h3>
                  </div>
                  <p className="text-[11px] text-gray-500 mt-0.5">
                    {scheme.level === 'central' ? 'केंद्र सरकार' : 'राज्य सरकार'} • {scheme.category}
                  </p>
                </div>

                <a
                  href={scheme.officialUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1.5 bg-emerald-50 text-[#075B35] hover:bg-emerald-100 rounded-xl text-xs font-bold transition-colors shrink-0"
                >
                  विवरण
                </a>
              </div>
            ))}
          </div>

          {/* Complete and go to dashboard button */}
          <div className="pt-2">
            <button
              type="button"
              onClick={handleFinalizeLand}
              className="w-full py-3.5 px-6 rounded-2xl bg-[#087A43] hover:bg-[#075B35] text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-900/20 cursor-pointer"
            >
              <span>भूमि डैशबोर्ड पर जाएं →</span>
            </button>
          </div>
        </div>
      )}

      {/* Bottom Main Navigation Action Bar (for steps 1-7) */}
      {currentStep !== 8 && currentStep !== 9 && (
        <div className="pt-4 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={handleBack}
            className="px-4 py-3 text-xs font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-2xl transition-colors cursor-pointer"
          >
            पीछे जाएं
          </button>

          <button
            type="button"
            onClick={handleNext}
            className="flex-1 py-3 px-6 rounded-2xl bg-[#087A43] hover:bg-[#075B35] text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md shadow-emerald-900/10 transition-all cursor-pointer"
          >
            <span>{currentStep === 3 ? 'जमा करें (आगे बढ़ें)' : 'आगे बढ़ें →'}</span>
          </button>
        </div>
      )}
    </div>
  );
};

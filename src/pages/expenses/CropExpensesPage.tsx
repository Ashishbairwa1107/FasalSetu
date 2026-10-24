import React, { useState, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { ExpenseRecord, ExpenseCategory, FarmingSeason, LandRecord } from '../../types';
import { ConfirmationDialog } from '../../components/common/ConfirmationDialog';
import { PageHeaderNav } from '../../components/common/PageHeaderNav';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import {
  Receipt,
  Plus,
  Download,
  Trash2,
  Edit2,
  TrendingUp,
  PieChart as PieIcon,
  X,
  Layers,
  ArrowRight,
  Sprout
} from 'lucide-react';

export const CropExpensesPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const {
    profile,
    lands,
    expenses,
    addLandExpense,
    updateLandExpense,
    deleteLandExpense,
    updateLand,
    language,
    showToast
  } = useApp();

  const isHindi = language === 'hi' || language === 'cg';

  // Identify active land from query param or default to first land
  const landParam = searchParams.get('landId');
  const initialLandId = useMemo(() => {
    if (landParam && lands.some(l => l.id === landParam)) {
      return landParam;
    }
    return lands[0]?.id || '';
  }, [landParam, lands]);

  const [selectedLandId, setSelectedLandId] = useState<string>(initialLandId);

  // Synchronize state if URL changes or lands change
  React.useEffect(() => {
    if (lands.length > 0) {
      if (!selectedLandId || !lands.some(l => l.id === selectedLandId)) {
        const nextId = lands[0].id;
        setSelectedLandId(nextId);
        setSearchParams({ landId: nextId });
      }
    }
  }, [lands, selectedLandId, setSearchParams]);

  const selectedLand: LandRecord | undefined = lands.find(l => l.id === selectedLandId) || lands[0];

  // Filters within selected plot
  const [selectedSeason, setSelectedSeason] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isRecordHarvestOpen, setIsRecordHarvestOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<ExpenseRecord | null>(null);
  const [expenseToDelete, setExpenseToDelete] = useState<string | null>(null);

  // Harvest record form state
  const [harvestFormQuintals, setHarvestFormQuintals] = useState<number>(
    selectedLand?.harvestQuantityQuintals || 0
  );
  const [harvestFormRevenue, setHarvestFormRevenue] = useState<number>(
    selectedLand?.actualRevenue || 0
  );

  // Simulator state (distinct hypothetical simulation)
  const [simulatedYield, setSimulatedYield] = useState<number>(30);
  const [simulatedRate, setSimulatedRate] = useState<number>(2300);

  // Clean single-language category mappings
  const categoryNames: Record<ExpenseCategory, { hi: string; en: string; color: string }> = {
    seeds: { hi: 'बीज खरीद', en: 'Seeds', color: '#10B981' },
    fertilizer: { hi: 'उर्वरक व खाद', en: 'Fertilizers', color: '#087A43' },
    labour: { hi: 'मजदूरी (रोपाई व कटाई)', en: 'Labour', color: '#D97706' },
    irrigation: { hi: 'सिंचाई व बिजली', en: 'Irrigation', color: '#0284C7' },
    machinery: { hi: 'ट्रैक्टर व जुताई', en: 'Machinery', color: '#8B5CF6' },
    pesticides: { hi: 'कीटनाशक व दवा', en: 'Pesticides', color: '#F43F5E' },
    transport: { hi: 'परिवहन व ढुलाई', en: 'Transport', color: '#F59E0B' },
    other: { hi: 'अन्य विविध खर्च', en: 'Other Costs', color: '#6B7280' }
  };

  // Form State for Expense Add/Edit
  const [formData, setFormData] = useState<Omit<ExpenseRecord, 'id'>>({
    farmId: selectedLand?.id || 'land-01',
    cropName: selectedLand?.selectedCrop?.nameHi || selectedLand?.previousCrop || 'धान',
    category: 'fertilizer',
    categoryHi: 'उर्वरक व खाद',
    amount: 1500,
    date: new Date().toISOString().split('T')[0],
    season: selectedLand?.season || 'kharif',
    notes: ''
  });

  const handleSelectLand = (landId: string) => {
    setSelectedLandId(landId);
    setSearchParams({ landId });
    const target = lands.find(l => l.id === landId);
    if (target) {
      setHarvestFormQuintals(target.harvestQuantityQuintals || 0);
      setHarvestFormRevenue(target.actualRevenue || 0);
    }
  };

  const handleOpenAdd = () => {
    const crop = selectedLand?.selectedCrop?.nameHi || selectedLand?.previousCrop || 'धान';
    setFormData({
      farmId: selectedLand?.id || 'land-01',
      cropName: crop,
      category: 'fertilizer',
      categoryHi: categoryNames.fertilizer[isHindi ? 'hi' : 'en'],
      amount: 1500,
      date: new Date().toISOString().split('T')[0],
      season: selectedLand?.season || 'kharif',
      notes: ''
    });
    setEditingExpense(null);
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (expense: ExpenseRecord) => {
    setEditingExpense(expense);
    setFormData({
      farmId: expense.farmId,
      cropName: expense.cropName,
      category: expense.category,
      categoryHi: expense.categoryHi,
      amount: expense.amount,
      date: expense.date,
      season: expense.season,
      notes: expense.notes || ''
    });
    setIsAddModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.amount <= 0) {
      showToast(isHindi ? 'कृपया मान्य खर्च राशि दर्ज करें' : 'Please enter a valid expense amount', 'error');
      return;
    }

    const payload = {
      ...formData,
      categoryHi: categoryNames[formData.category][isHindi ? 'hi' : 'en']
    };

    const targetLandId = formData.farmId || selectedLand?.id || 'land-01';

    if (editingExpense) {
      updateLandExpense(targetLandId, editingExpense.id, payload);
    } else {
      addLandExpense(targetLandId, payload);
    }
    setIsAddModalOpen(false);
  };

  const handleSaveHarvest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLand) return;

    updateLand(selectedLand.id, {
      harvestQuantityQuintals: harvestFormQuintals,
      actualRevenue: harvestFormRevenue
    });
    setIsRecordHarvestOpen(false);
    showToast(
      isHindi ? 'उपज व राजस्व विवरण सफलतापूर्वक दर्ज हुआ' : 'Harvest details recorded successfully',
      'success'
    );
  };

  // CSV Export for the selected land
  const handleExportCSV = () => {
    if (!selectedLand) return;

    const headers = isHindi
      ? ['खर्च_आईडी', 'खेत_नाम', 'फसल', 'खर्च_मद', 'राशि_रुपये', 'तारीख', 'मौसम', 'टिप्पणी']
      : ['Expense_ID', 'Plot_Name', 'Crop', 'Category', 'Amount_INR', 'Date', 'Season', 'Notes'];

    const plotExpenses = selectedLand.expenses && selectedLand.expenses.length > 0
      ? selectedLand.expenses
      : expenses.filter(e => e.farmId === selectedLand.id);

    const rows = plotExpenses.map(e => [
      e.id,
      `"${selectedLand.name}"`,
      `"${e.cropName}"`,
      `"${categoryNames[e.category] ? (isHindi ? categoryNames[e.category].hi : categoryNames[e.category].en) : e.category}"`,
      e.amount,
      e.date,
      e.season,
      `"${e.notes || ''}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `FasalSetu_${selectedLand.id}_Expenses_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast(isHindi ? 'खर्च CSV सफलतापूर्वक डाउनलोड हो गया' : 'CSV exported successfully', 'success');
  };

  // Empty State: No Lands Registered
  if (!lands || lands.length === 0) {
    return (
      <div className="space-y-6 animate-in fade-in duration-200">
        <PageHeaderNav fallbackPath="/" />
        <div className="bg-white rounded-3xl border border-[#E5EBE1] p-12 text-center max-w-xl mx-auto shadow-sm">
          <div className="w-16 h-16 bg-emerald-50 text-[#087A43] rounded-3xl flex items-center justify-center mx-auto mb-4 ring-8 ring-emerald-50/50">
            <Layers className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-black text-gray-900 mb-2">
            {isHindi ? 'कोई पंजीकृत भूमि नहीं मिली' : 'No Registered Land Found'}
          </h2>
          <p className="text-sm text-gray-600 mb-6 leading-relaxed">
            {isHindi
              ? 'फसल खर्च और मुनाफे का सही हिसाब रखने के लिए कृपया पहले अपनी भूमि पंजीकृत करें।'
              : 'Please register your land first to track plot-level crop expenses and profitability.'}
          </p>
          <button
            onClick={() => navigate('/add-land')}
            className="px-6 py-3 bg-[#087A43] hover:bg-[#075B35] text-white font-bold text-sm rounded-2xl shadow-md inline-flex items-center gap-2 cursor-pointer transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>{isHindi ? 'भूमि जोड़ें' : 'Add Land'}</span>
          </button>
        </div>
      </div>
    );
  }

  // Active plot expenses
  const rawPlotExpenses = (selectedLand.expenses && selectedLand.expenses.length > 0)
    ? selectedLand.expenses
    : expenses.filter(e => e.farmId === selectedLand.id);

  // Filtered expenses by season and category
  const filteredExpenses = rawPlotExpenses.filter(e => {
    if (selectedSeason !== 'all' && e.season !== selectedSeason) return false;
    if (selectedCategory !== 'all' && e.category !== selectedCategory) return false;
    return true;
  });

  // Financial aggregates
  const totalExpense = filteredExpenses.reduce((sum, e) => sum + e.amount, 0);
  const plotArea = selectedLand.area || 1;
  const costPerAcre = Math.round(totalExpense / plotArea);

  // Actual Harvest & Revenue verification
  const hasActualHarvest = typeof selectedLand.harvestQuantityQuintals === 'number' &&
    selectedLand.harvestQuantityQuintals > 0 &&
    typeof selectedLand.actualRevenue === 'number' &&
    selectedLand.actualRevenue > 0;

  const actualRevenue = hasActualHarvest ? selectedLand.actualRevenue! : 0;
  const actualNetProfit = hasActualHarvest ? actualRevenue - totalExpense : null;

  // Simulation calculations (distinct hypothetical calculator)
  const simulatedGross = simulatedYield * simulatedRate;
  const simulatedNet = simulatedGross - totalExpense;

  // Chart Data: Category Breakdown
  const categoryChartData = Object.entries(
    filteredExpenses.reduce((acc, curr) => {
      acc[curr.category] = (acc[curr.category] || 0) + curr.amount;
      return acc;
    }, {} as Record<string, number>)
  ).map(([cat, amount]) => ({
    name: categoryNames[cat as ExpenseCategory]
      ? (isHindi ? categoryNames[cat as ExpenseCategory].hi : categoryNames[cat as ExpenseCategory].en)
      : cat,
    amount,
    color: categoryNames[cat as ExpenseCategory]?.color || '#087A43'
  }));

  const cropDisplayName = selectedLand.selectedCrop
    ? (isHindi ? selectedLand.selectedCrop.nameHi : selectedLand.selectedCrop.name)
    : (selectedLand.previousCrop || (isHindi ? 'धान' : 'Paddy'));

  const seasonLabel = selectedLand.season === 'kharif'
    ? (isHindi ? 'खरीफ 2024' : 'Kharif 2024')
    : selectedLand.season === 'rabi'
      ? (isHindi ? 'रबी 2024-25' : 'Rabi 2024-25')
      : (isHindi ? 'जायद 2024' : 'Zaid 2024');

  const areaUnitLabel = selectedLand.areaUnit === 'bigha'
    ? (isHindi ? 'बीघा' : 'Bigha')
    : selectedLand.areaUnit === 'hectare'
      ? (isHindi ? 'हेक्टेयर' : 'Hectare')
      : (isHindi ? 'एकड़' : 'Acres');

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Global Back Navigation */}
      <PageHeaderNav fallbackPath="/" />

      {/* 1. Header with Active Farmer & Plot Information */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full w-fit mb-1 border border-emerald-100">
            <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
            <span>
              {isHindi ? 'सक्रिय किसान:' : 'Active Farmer:'} {profile.name} • {profile.village}, {profile.district}
            </span>
          </div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2">
            <Receipt className="w-7 h-7 text-[#087A43]" />
            <span>{isHindi ? 'फसल खर्च एवं मुनाफा' : 'Crop Expenses & Profitability'}</span>
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            {isHindi
              ? 'किसान के वास्तविक पंजीकृत खेत के आधार पर खाद, बीज, जुताई और शुद्ध लाभ की गणना'
              : 'Actual registered land records, category expenditure breakdown and verified net profit'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2.5 rounded-2xl border border-gray-300 hover:bg-gray-50 text-xs font-bold text-gray-700 flex items-center gap-2 transition-colors cursor-pointer"
            title={isHindi ? 'CSV डाउनलोड करें' : 'Download CSV'}
          >
            <Download className="w-4 h-4 text-gray-500" />
            <span>{isHindi ? 'CSV डाउनलोड' : 'Export CSV'}</span>
          </button>

          <button
            onClick={handleOpenAdd}
            className="px-4 py-2.5 bg-[#087A43] hover:bg-[#075B35] text-white rounded-2xl text-xs font-bold flex items-center gap-2 shadow-sm transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>{isHindi ? 'नया खर्च जोड़ें' : 'Add Expense'}</span>
          </button>
        </div>
      </div>

      {/* 2. Plot Selector & Selected Plot Metadata Card */}
      <div className="bg-white rounded-3xl border border-[#E5EBE1] p-5 shadow-2xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-gray-100 pb-3">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-[#087A43]" />
            <div>
              <h2 className="text-sm font-bold text-gray-900">
                {isHindi ? 'खेत का चयन करें' : 'Select Registered Plot'}
              </h2>
              <span className="text-[11px] text-gray-500">
                {isHindi
                  ? `कुल ${lands.length} पंजीकृत खेत उपलब्ध`
                  : `${lands.length} registered plots available`}
              </span>
            </div>
          </div>

          {/* Plot Switcher Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {lands.map((land) => {
              const isSelected = land.id === selectedLand.id;
              const landCrop = land.selectedCrop
                ? (isHindi ? land.selectedCrop.nameHi : land.selectedCrop.name)
                : (land.previousCrop || (isHindi ? 'धान' : 'Paddy'));

              return (
                <button
                  key={land.id}
                  onClick={() => handleSelectLand(land.id)}
                  className={`px-3.5 py-2 rounded-2xl text-xs font-bold shrink-0 transition-all flex items-center gap-2 cursor-pointer border ${
                    isSelected
                      ? 'bg-[#087A43] text-white border-[#087A43] shadow-xs'
                      : 'bg-[#FAFBF7] text-gray-700 border-gray-200 hover:border-emerald-300'
                  }`}
                >
                  <span>{land.name}</span>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full ${
                      isSelected ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {land.area} {isHindi ? 'एकड़' : 'Acres'} • {landCrop}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Plot Detailed Metadata Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-[#FAFBF7] p-3.5 rounded-2xl border border-gray-100 text-xs">
          <div>
            <span className="text-gray-400 block text-[10px] font-medium">
              {isHindi ? 'खेत का नाम व पहचान' : 'Plot Name & ID'}
            </span>
            <p className="font-bold text-gray-900 mt-0.5 truncate">{selectedLand.name}</p>
            <span className="text-[10px] text-gray-500 font-mono">ID: {selectedLand.id}</span>
          </div>

          <div>
            <span className="text-gray-400 block text-[10px] font-medium">
              {isHindi ? 'रकबा (क्षेत्रफल)' : 'Registered Area'}
            </span>
            <p className="font-black text-emerald-800 text-sm mt-0.5">
              {selectedLand.area} {areaUnitLabel}
            </p>
            <span className="text-[10px] text-gray-500">
              {isHindi ? 'सिंचाई:' : 'Irrigation:'} {selectedLand.irrigationSource || (isHindi ? 'उपलब्ध' : 'Available')}
            </span>
          </div>

          <div>
            <span className="text-gray-400 block text-[10px] font-medium">
              {isHindi ? 'संबद्ध फसल' : 'Associated Crop'}
            </span>
            <p className="font-bold text-gray-900 mt-0.5 flex items-center gap-1">
              <Sprout className="w-3.5 h-3.5 text-emerald-700" />
              <span>{cropDisplayName}</span>
            </p>
            <span className="text-[10px] text-gray-500 font-medium">{seasonLabel}</span>
          </div>

          <div>
            <span className="text-gray-400 block text-[10px] font-medium">
              {isHindi ? 'स्थिति / फसल चरण' : 'Crop Stage'}
            </span>
            <p className="font-bold text-gray-900 mt-0.5">
              {selectedLand.currentStage || (isHindi ? 'सक्रिय वृद्धि' : 'Active Growth')}
            </p>
            <span className="text-[10px] text-emerald-700 font-semibold">
              {selectedLand.cropProgress || 70}% {isHindi ? 'प्रगति' : 'Progress'}
            </span>
          </div>
        </div>
      </div>

      {/* 3. KPI Cards: Total Expenditure, Cost/Acre, Gross Revenue, Net Profit */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {/* Total Expense */}
        <div className="bg-white p-4 rounded-3xl border border-[#E5EBE1] shadow-2xs">
          <span className="text-xs text-gray-500 font-medium">
            {isHindi ? 'कुल कृषि खर्च' : 'Total Expenses'}
          </span>
          <p className="text-2xl font-black text-gray-900 mt-1">
            ₹{totalExpense.toLocaleString('en-IN')}
          </p>
          <span className="text-[10px] text-gray-500 mt-1 block">
            {filteredExpenses.length} {isHindi ? 'प्रविष्टियां दर्ज' : 'entries recorded'}
          </span>
        </div>

        {/* Cost Per Acre */}
        <div className="bg-white p-4 rounded-3xl border border-[#E5EBE1] shadow-2xs">
          <span className="text-xs text-gray-500 font-medium">
            {isHindi ? 'लागत प्रति एकड़' : 'Cost Per Acre'}
          </span>
          <p className="text-2xl font-black text-emerald-800 mt-1">
            ₹{costPerAcre.toLocaleString('en-IN')}
          </p>
          <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-semibold mt-1 inline-block">
            {selectedLand.area} {isHindi ? 'एकड़ के आधार पर' : 'Acres basis'}
          </span>
        </div>

        {/* Gross Revenue */}
        <div className="bg-white p-4 rounded-3xl border border-[#E5EBE1] shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500 font-medium">
                {isHindi ? 'सकल राजस्व' : 'Gross Revenue'}
              </span>
              {hasActualHarvest ? (
                <span className="text-[9px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded font-bold">
                  {isHindi ? 'वास्तविक दर्ज' : 'Actual'}
                </span>
              ) : (
                <span className="text-[9px] bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded font-bold">
                  {isHindi ? 'लंबित' : 'Pending'}
                </span>
              )}
            </div>
            {hasActualHarvest ? (
              <p className="text-2xl font-black text-blue-700 mt-1">
                ₹{actualRevenue.toLocaleString('en-IN')}
              </p>
            ) : (
              <p className="text-sm font-bold text-gray-400 mt-2">
                {isHindi ? 'उपज डेटा लंबित' : 'Harvest Pending'}
              </p>
            )}
          </div>
          <div className="mt-2">
            {hasActualHarvest ? (
              <span className="text-[10px] text-blue-800 bg-blue-50 px-2 py-0.5 rounded font-semibold inline-block">
                {selectedLand.harvestQuantityQuintals} {isHindi ? 'क्विंटल कुल उपज' : 'Quintals Harvested'}
              </span>
            ) : (
              <button
                onClick={() => setIsRecordHarvestOpen(true)}
                className="text-[11px] font-bold text-[#087A43] hover:underline cursor-pointer flex items-center gap-1"
              >
                <span>{isHindi ? 'कटाई उपज दर्ज करें' : 'Record Harvest'}</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>

        {/* Net Profit */}
        <div className="bg-white p-4 rounded-3xl border border-[#E5EBE1] shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500 font-medium">
                {isHindi ? 'शुद्ध मुनाफा' : 'Net Profit'}
              </span>
              {hasActualHarvest && (
                <span className="text-[9px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded font-bold">
                  {isHindi ? 'वास्तविक' : 'Actual'}
                </span>
              )}
            </div>
            {hasActualHarvest && actualNetProfit !== null ? (
              <p className={`text-2xl font-black mt-1 ${actualNetProfit >= 0 ? 'text-[#087A43]' : 'text-rose-600'}`}>
                ₹{actualNetProfit.toLocaleString('en-IN')}
              </p>
            ) : (
              <p className="text-sm font-bold text-gray-400 mt-2">
                {isHindi ? 'कटाई उपरांत उपलब्ध' : 'Post-Harvest'}
              </p>
            )}
          </div>
          <div className="mt-2">
            {hasActualHarvest && actualRevenue > 0 ? (
              <span className="text-[10px] text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded font-bold inline-block">
                {isHindi ? 'लाभ मार्जिन' : 'Margin'} ~ {Math.round((actualNetProfit! / actualRevenue) * 100)}%
              </span>
            ) : (
              <span className="text-[10px] text-gray-400 block">
                {isHindi ? 'वास्तविक बिक्री दर्ज होने पर' : 'Available when harvest is sold'}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* 4. Charts & Profit Simulation Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Pie Chart: Expenses by Category for this Plot */}
        <div className="lg:col-span-6 bg-white p-5 rounded-3xl border border-[#E5EBE1] shadow-2xs space-y-3">
          <div className="flex items-center justify-between border-b border-gray-100 pb-2">
            <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
              <PieIcon className="w-4 h-4 text-emerald-700" />
              <span>{isHindi ? 'मद-वार खर्च वितरण' : 'Expense Category Distribution'}</span>
            </h3>
            <span className="text-[11px] text-gray-400">
              {isHindi ? 'प्रतिशत शेयर' : 'Percentage Share'}
            </span>
          </div>

          {categoryChartData.length > 0 ? (
            <>
              <div className="h-56 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryChartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={75}
                      paddingAngle={4}
                      dataKey="amount"
                    >
                      {categoryChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value: any) => [`₹${Number(value).toLocaleString('en-IN')}`, isHindi ? 'खर्च राशि' : 'Amount']}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Legend */}
              <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                {categoryChartData.map((cat, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: cat.color }} />
                    <span className="text-gray-600 truncate">{cat.name}:</span>
                    <span className="font-bold text-gray-900">₹{cat.amount.toLocaleString('en-IN')}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="py-12 text-center text-gray-400 text-xs">
              <p>{isHindi ? 'इस खेत के लिए अभी कोई खर्च दर्ज नहीं है।' : 'No expenses recorded for this plot yet.'}</p>
              <button
                onClick={handleOpenAdd}
                className="mt-3 text-xs font-bold text-[#087A43] hover:underline cursor-pointer"
              >
                + {isHindi ? 'पहला खर्च जोड़ें' : 'Add First Expense'}
              </button>
            </div>
          )}
        </div>

        {/* Harvest & Profit Simulator Panel (Explicitly Distinct Hypothetical Tool) */}
        <div className="lg:col-span-6 bg-white p-5 rounded-3xl border border-[#E5EBE1] shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-gray-100 pb-2">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-blue-600" />
              <h3 className="text-sm font-bold text-gray-900">
                {isHindi ? 'अनुमानित लाभ सिमुलेटर' : 'Estimated Profit Simulator'}
              </h3>
            </div>
            <span className="text-[10px] bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full font-bold">
              {isHindi ? 'केवल सिमुलेशन' : 'Simulation Only'}
            </span>
          </div>

          <div className="space-y-3 text-xs">
            <p className="text-gray-500">
              {isHindi
                ? `खेत "${selectedLand.name}" (${selectedLand.area} एकड़) के लिए अपेक्षित उपज और संभावित मंडी भाव बदलकर अनुमानित शुद्ध लाभ जांचें:`
                : `Simulate expected yield and mandi rate for "${selectedLand.name}" to view estimated net profit:`}
            </p>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-gray-700 font-semibold mb-1">
                  {isHindi ? 'अपेक्षित कुल उपज (क्विंटल)' : 'Expected Yield (Quintals)'}
                </label>
                <input
                  type="number"
                  min="1"
                  value={simulatedYield}
                  onChange={(e) => setSimulatedYield(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 text-sm font-bold rounded-xl border border-gray-300 focus:outline-hidden focus:border-[#087A43]"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-1">
                  {isHindi ? 'संभावित विक्रय मूल्य (₹/क्विंटल)' : 'Expected Rate (₹/Quintal)'}
                </label>
                <input
                  type="number"
                  min="100"
                  value={simulatedRate}
                  onChange={(e) => setSimulatedRate(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 text-sm font-bold rounded-xl border border-gray-300 focus:outline-hidden focus:border-[#087A43]"
                />
              </div>
            </div>

            {/* Visual Profit Bar */}
            <div className="bg-[#FAFBF7] p-4 rounded-2xl border border-gray-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-gray-700">
                  {isHindi ? 'अनुमानित सकल बिक्री:' : 'Simulated Revenue:'}
                </span>
                <span className="font-bold text-blue-700">₹{simulatedGross.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex items-center justify-between text-rose-700">
                <span>{isHindi ? 'वास्तविक कुल खर्च (लागत):' : 'Actual Total Expense:'}</span>
                <span>-₹{totalExpense.toLocaleString('en-IN')}</span>
              </div>
              <div className="h-px bg-gray-200 my-1" />
              <div className="flex items-center justify-between text-base font-black text-[#087A43]">
                <span>{isHindi ? 'अनुमानित शुद्ध लाभ:' : 'Estimated Net Profit:'}</span>
                <span>₹{simulatedNet.toLocaleString('en-IN')}</span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1 text-[10px] text-gray-400">
              <span>
                {isHindi
                  ? '* यह सिमुलेशन वास्तविक दर्ज डेटा नहीं है।'
                  : '* This simulation is for estimation only.'}
              </span>
              <button
                type="button"
                onClick={() => setIsRecordHarvestOpen(true)}
                className="text-[#087A43] font-bold hover:underline cursor-pointer"
              >
                {hasActualHarvest
                  ? (isHindi ? 'वास्तविक उपज अपडेट करें' : 'Update Actual Harvest')
                  : (isHindi ? 'वास्तविक कटाई दर्ज करें' : 'Record Actual Harvest')}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 5. Expenses History Table for Selected Land */}
      <div className="bg-white rounded-3xl border border-[#E5EBE1] p-5 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-gray-900">
              {isHindi ? 'खर्च बही-खाता सूची' : 'Expense Ledger Entries'}
            </h3>
            <p className="text-xs text-gray-500">
              {isHindi
                ? `खेत: ${selectedLand.name} (${selectedLand.id}) के सभी दर्ज खर्च`
                : `All recorded expenses for plot: ${selectedLand.name}`}
            </p>
          </div>

          {/* Season Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-semibold text-gray-500">
              {isHindi ? 'मौसम:' : 'Season:'}
            </span>
            {[
              { id: 'all', label: isHindi ? 'सभी' : 'All' },
              { id: 'kharif', label: isHindi ? 'खरीफ 2024' : 'Kharif 2024' },
              { id: 'rabi', label: isHindi ? 'रबी 2024' : 'Rabi 2024' }
            ].map((s) => (
              <button
                key={s.id}
                onClick={() => setSelectedSeason(s.id)}
                className={`px-3 py-1 text-xs font-bold rounded-xl transition-colors cursor-pointer ${
                  selectedSeason === s.id
                    ? 'bg-[#087A43] text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {filteredExpenses.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-gray-200 text-gray-400 uppercase text-[10px] tracking-wider">
                  <th className="py-3 px-2">{isHindi ? 'तारीख' : 'Date'}</th>
                  <th className="py-3 px-2">{isHindi ? 'फसल व खेत' : 'Crop & Plot'}</th>
                  <th className="py-3 px-2">{isHindi ? 'खर्च मद' : 'Category'}</th>
                  <th className="py-3 px-2 text-right">{isHindi ? 'राशि (₹)' : 'Amount (₹)'}</th>
                  <th className="py-3 px-2">{isHindi ? 'टिप्पणी व विवरण' : 'Notes'}</th>
                  <th className="py-3 px-2 text-right">{isHindi ? 'कार्रवाई' : 'Actions'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredExpenses.map((exp) => (
                  <tr key={exp.id} className="hover:bg-gray-50/80 transition-colors">
                    <td className="py-3 px-2 font-mono text-gray-500 whitespace-nowrap">
                      {exp.date}
                    </td>
                    <td className="py-3 px-2 font-semibold text-gray-900 whitespace-nowrap">
                      <div>{exp.cropName}</div>
                      <div className="text-[10px] text-gray-400 font-normal">{selectedLand.name}</div>
                    </td>
                    <td className="py-3 px-2">
                      <span
                        className="px-2 py-0.5 rounded-md font-bold text-[10px] inline-block"
                        style={{
                          backgroundColor: `${categoryNames[exp.category]?.color || '#087A43'}15`,
                          color: categoryNames[exp.category]?.color || '#087A43'
                        }}
                      >
                        {categoryNames[exp.category]
                          ? (isHindi ? categoryNames[exp.category].hi : categoryNames[exp.category].en)
                          : exp.category}
                      </span>
                    </td>
                    <td className="py-3 px-2 text-right font-black text-gray-900 whitespace-nowrap">
                      ₹{exp.amount.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3 px-2 text-gray-500 max-w-xs truncate">
                      {exp.notes || '-'}
                    </td>
                    <td className="py-3 px-2 text-right whitespace-nowrap">
                      <button
                        onClick={() => handleOpenEdit(exp)}
                        className="p-1.5 text-gray-400 hover:text-gray-700 rounded-lg mr-1 cursor-pointer"
                        title={isHindi ? 'संपादित करें' : 'Edit'}
                        aria-label={isHindi ? 'संपादित करें' : 'Edit'}
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setExpenseToDelete(exp.id)}
                        className="p-1.5 text-gray-400 hover:text-rose-600 rounded-lg cursor-pointer"
                        title={isHindi ? 'हटाएं' : 'Delete'}
                        aria-label={isHindi ? 'हटाएं' : 'Delete'}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-12 text-center text-gray-500 text-xs">
            <Receipt className="w-10 h-10 text-gray-300 mx-auto mb-2" />
            <p className="font-semibold text-gray-700">
              {isHindi
                ? `खेत "${selectedLand.name}" के लिए अभी कोई खर्च दर्ज नहीं है।`
                : `No expense records found for plot "${selectedLand.name}".`}
            </p>
            <p className="text-gray-400 mt-1">
              {isHindi
                ? 'नया खर्च जोड़ने के लिए नीचे दिए गए बटन पर क्लिक करें।'
                : 'Click the button below to add your first expense record.'}
            </p>
            <button
              onClick={handleOpenAdd}
              className="mt-4 px-4 py-2 bg-[#087A43] hover:bg-[#075B35] text-white rounded-xl font-bold text-xs inline-flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{isHindi ? 'पहला खर्च जोड़ें' : 'Add First Expense'}</span>
            </button>
          </div>
        )}
      </div>

      {/* 6. Add / Edit Expense Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-gray-100 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3 mb-4">
              <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <Receipt className="w-5 h-5 text-[#087A43]" />
                <span>
                  {editingExpense
                    ? (isHindi ? 'खर्च प्रविष्टि संपादित करें' : 'Edit Expense Entry')
                    : (isHindi ? 'नया कृषि खर्च दर्ज करें' : 'Record New Expense')}
                </span>
              </h3>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 p-1 cursor-pointer"
                aria-label={isHindi ? 'बंद करें' : 'Close'}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Associated Land Selection */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  {isHindi ? 'संबंधित खेत (भूमि)' : 'Associated Plot'} *
                </label>
                <select
                  value={formData.farmId}
                  onChange={(e) => {
                    const l = lands.find(x => x.id === e.target.value);
                    const crop = l?.selectedCrop?.nameHi || l?.previousCrop || formData.cropName;
                    setFormData({
                      ...formData,
                      farmId: e.target.value,
                      cropName: crop,
                      season: l?.season || formData.season
                    });
                  }}
                  className="w-full px-3 py-2 text-xs font-bold rounded-xl border border-gray-300 focus:outline-hidden focus:border-[#087A43]"
                >
                  {lands.map(l => (
                    <option key={l.id} value={l.id}>
                      {l.name} ({l.area} {isHindi ? 'एकड़' : 'Acres'})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    {isHindi ? 'खर्च राशि (₹)' : 'Amount (₹)'} *
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
                    placeholder="2500"
                    className="w-full px-3 py-2 text-sm font-bold rounded-xl border border-gray-300 focus:outline-hidden focus:border-[#087A43]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    {isHindi ? 'तारीख' : 'Date'} *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-gray-300 focus:outline-hidden focus:border-[#087A43]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  {isHindi ? 'खर्च मद (श्रेणी)' : 'Expense Category'} *
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value as ExpenseCategory })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-gray-300 focus:outline-hidden focus:border-[#087A43]"
                >
                  {Object.entries(categoryNames).map(([key, val]) => (
                    <option key={key} value={key}>
                      {isHindi ? val.hi : val.en}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    {isHindi ? 'फसल' : 'Crop'}
                  </label>
                  <input
                    type="text"
                    value={formData.cropName}
                    onChange={(e) => setFormData({ ...formData, cropName: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-gray-300 focus:outline-hidden focus:border-[#087A43]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    {isHindi ? 'कृषि मौसम' : 'Farming Season'}
                  </label>
                  <select
                    value={formData.season}
                    onChange={(e) => setFormData({ ...formData, season: e.target.value as FarmingSeason })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-gray-300 focus:outline-hidden focus:border-[#087A43]"
                  >
                    <option value="kharif">{isHindi ? 'खरीफ' : 'Kharif'}</option>
                    <option value="rabi">{isHindi ? 'रबी' : 'Rabi'}</option>
                    <option value="zaid">{isHindi ? 'जायद' : 'Zaid'}</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  {isHindi ? 'विवरण या रसीद संख्या (वैकल्पिक)' : 'Notes / Receipt No. (Optional)'}
                </label>
                <textarea
                  rows={2}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder={isHindi ? 'उदा. 2 बोरी डीएपी क्रय की, रसीद नं. 4501' : 'e.g., 2 bags fertilizer, Bill #4501'}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-gray-300 focus:outline-hidden focus:border-[#087A43]"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 cursor-pointer"
                >
                  {isHindi ? 'रद्द करें' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-[#087A43] hover:bg-[#075B35] rounded-xl cursor-pointer shadow-xs"
                >
                  {isHindi ? 'खर्च सुरक्षित करें' : 'Save Expense'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 7. Actual Harvest & Revenue Record Modal */}
      {isRecordHarvestOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-gray-100">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3 mb-4">
              <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-blue-600" />
                <span>
                  {isHindi ? 'वास्तविक कटाई व राजस्व दर्ज करें' : 'Record Actual Harvest & Revenue'}
                </span>
              </h3>
              <button
                type="button"
                onClick={() => setIsRecordHarvestOpen(false)}
                className="text-gray-400 hover:text-gray-600 p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveHarvest} className="space-y-4">
              <p className="text-xs text-gray-500">
                {isHindi
                  ? `खेत "${selectedLand.name}" (${selectedLand.area} एकड़) के लिए वास्तविक प्राप्त उपज और कुल प्राप्त बिक्री राशि दर्ज करें:`
                  : `Enter the actual harvested yield and gross revenue received for plot "${selectedLand.name}":`}
              </p>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  {isHindi ? 'वास्तविक कुल उपज (क्विंटल) *' : 'Actual Total Harvest (Quintals) *'}
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.5"
                  required
                  value={harvestFormQuintals}
                  onChange={(e) => setHarvestFormQuintals(parseFloat(e.target.value) || 0)}
                  placeholder="30"
                  className="w-full px-3 py-2 text-sm font-bold rounded-xl border border-gray-300 focus:outline-hidden focus:border-[#087A43]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  {isHindi ? 'वास्तविक कुल बिक्री राशि (₹) *' : 'Actual Gross Revenue (₹) *'}
                </label>
                <input
                  type="number"
                  min="0"
                  required
                  value={harvestFormRevenue}
                  onChange={(e) => setHarvestFormRevenue(parseFloat(e.target.value) || 0)}
                  placeholder="65000"
                  className="w-full px-3 py-2 text-sm font-bold rounded-xl border border-gray-300 focus:outline-hidden focus:border-[#087A43]"
                />
              </div>

              {harvestFormRevenue > 0 && (
                <div className="bg-[#FAFBF7] p-3 rounded-xl border border-gray-200 text-xs space-y-1">
                  <div className="flex justify-between text-gray-600">
                    <span>{isHindi ? 'कुल कृषि खर्च:' : 'Total Expenses:'}</span>
                    <span>₹{totalExpense.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between font-bold text-[#087A43]">
                    <span>{isHindi ? 'शुद्ध वास्तविक मुनाफा:' : 'Net Verified Profit:'}</span>
                    <span>₹{(harvestFormRevenue - totalExpense).toLocaleString('en-IN')}</span>
                  </div>
                </div>
              )}

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsRecordHarvestOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 cursor-pointer"
                >
                  {isHindi ? 'रद्द करें' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-[#087A43] hover:bg-[#075B35] rounded-xl cursor-pointer shadow-xs"
                >
                  {isHindi ? 'विवरण सुरक्षित करें' : 'Save Details'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 8. Delete Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={!!expenseToDelete}
        title={isHindi ? 'खर्च रिकॉर्ड हटाएं?' : 'Delete Expense Record?'}
        message={
          isHindi
            ? 'क्या आप वाकई इस खर्च प्रविष्टि को हटाना चाहते हैं? यह इस खेत के बही-खाते से हमेशा के लिए हट जाएगी।'
            : 'Are you sure you want to delete this expense record? It will be permanently removed from this plot\'s ledger.'
        }
        confirmLabel={isHindi ? 'हां, हटाएं' : 'Yes, Delete'}
        cancelLabel={isHindi ? 'रद्द करें' : 'Cancel'}
        isDestructive
        onConfirm={() => {
          if (expenseToDelete && selectedLand) {
            deleteLandExpense(selectedLand.id, expenseToDelete);
            setExpenseToDelete(null);
          }
        }}
        onCancel={() => setExpenseToDelete(null)}
      />
    </div>
  );
};

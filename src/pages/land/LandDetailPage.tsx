import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { PageHeaderNav } from '../../components/common/PageHeaderNav';
import { CropCalendarTask, ExpenseRecord } from '../../types';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from 'recharts';
import {
  Tractor,
  Calendar as CalendarIcon,
  CheckCircle2,
  Circle,
  Plus,
  TrendingUp,
  Receipt,
  Bot,
  Activity,
  ArrowRight,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Mic,
  Send,
  Droplets,
  Sprout,
  ShieldCheck,
  AlertCircle,
  Clock,
  Sparkles,
  DollarSign
} from 'lucide-react';

export const LandDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const {
    lands,
    addLandTask,
    toggleLandTask,
    addLandExpense,
    sendUserChatMessage,
    chatMessages,
    showToast,
    language
  } = useApp();

  const isHindi = language === 'hi' || language === 'cg';

  const land = lands.find(l => l.id === id) || lands[0];

  // 10. Dashboard Top View Toggle: 'summary' | 'revenue' | 'profit'
  const [dashboardView, setDashboardView] = useState<'summary' | 'revenue' | 'profit'>('summary');

  // 11. Season Management Sub-Tab: 'calendar' | 'workplan' | 'expenses' | 'analytics' | 'ai'
  const [activeSeasonTab, setActiveSeasonTab] = useState<'calendar' | 'workplan' | 'expenses' | 'analytics' | 'ai'>('calendar');

  // Calendar State
  const [selectedMonth, setSelectedMonth] = useState('जुलाई 2024');
  const [selectedDateDay, setSelectedDateDay] = useState(12);

  // New task form state
  const [isAddTaskModalOpen, setIsAddTaskModalOpen] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskCategory, setNewTaskCategory] = useState<'fertilizer' | 'irrigation' | 'weeding' | 'pest_control'>('fertilizer');
  const [newTaskDate, setNewTaskDate] = useState('2024-07-18');

  // New expense form state (inside tab 11.3)
  const [expCategory, setExpCategory] = useState('fertilizer');
  const [expCategoryHi, setExpCategoryHi] = useState('खाद (यूरिया)');
  const [expAmount, setExpAmount] = useState(1200);
  const [expDate, setExpDate] = useState('2024-07-12');
  const [expNote, setExpNote] = useState('यूरिया 50 kg');

  // AI Chat state inside tab 11.5
  const [aiChatInput, setAiChatInput] = useState('');

  if (!land) {
    return (
      <div className="p-8 text-center bg-white rounded-3xl border border-gray-200">
        <p className="text-sm font-bold text-gray-700">भूमि नहीं मिली</p>
        <button onClick={() => navigate('/farm')} className="mt-3 px-4 py-2 bg-[#087A43] text-white rounded-xl text-xs">
          मेरी भूमि सूची पर जाएं
        </button>
      </div>
    );
  }

  // Financial Calculations for this land
  const landArea = land.area || 2;
  const cropCostPerAcre = land.selectedCrop?.costPerAcre || 15000;
  const cropRevPerAcre = land.selectedCrop?.revenuePerAcre || 40000;

  const totalInvestmentEst = cropCostPerAcre * landArea;
  const totalRevenueEst = cropRevPerAcre * landArea;
  const totalProfitEst = totalRevenueEst - totalInvestmentEst;

  const actualRecordedExpenses = (land.expenses || []).reduce((sum, e) => sum + e.amount, 0);
  const totalInvestedDisplay = actualRecordedExpenses > 0 ? actualRecordedExpenses : 28500;
  const estimatedRevenueDisplay = 65000;
  const estimatedProfitDisplay = estimatedRevenueDisplay - totalInvestedDisplay;

  // Analytics Chart Data
  const cropProgressChartData = [
    { month: 'जून', progress: 15, health: 85 },
    { month: 'जुलाई', progress: 60, health: 92 },
    { month: 'अगस्त', progress: 85, health: 90 }
  ];

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    addLandTask(land.id, {
      farmId: land.id,
      cropName: land.selectedCrop?.nameHi || 'धान',
      title: newTaskTitle,
      titleHi: newTaskTitle,
      description: `खेत: ${land.name}`,
      descriptionHi: `खेत: ${land.name}`,
      category: newTaskCategory,
      weekNumber: 7,
      dueDate: newTaskDate,
      priority: 'high',
      status: 'pending'
    });

    setNewTaskTitle('');
    setIsAddTaskModalOpen(false);
  };

  const handleAddExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (expAmount <= 0) return;

    addLandExpense(land.id, {
      farmId: land.id,
      cropName: land.selectedCrop?.nameHi || 'धान',
      category: expCategory as any,
      categoryHi: expCategoryHi,
      amount: expAmount,
      date: expDate,
      season: land.season || 'kharif',
      notes: expNote
    });

    setExpNote('');
  };

  const handleSendAiChat = (text: string) => {
    if (!text.trim()) return;
    sendUserChatMessage(text);
    setAiChatInput('');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200 pb-16">
      {/* Global Back Navigation & Dashboard Shortcut */}
      <PageHeaderNav fallbackPath="/my-land" />

      {/* Land Title matching Reference 10 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-200 pb-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">
            {land.name} - {land.selectedCrop?.nameHi || 'धान'} ({land.season === 'kharif' ? 'खरीफ 2024' : 'रबी 2024'})
          </h1>
          <p className="text-xs text-gray-500 font-medium">
            {land.area} {land.areaUnit} • {land.village}, {land.district} ({land.state})
          </p>
        </div>

        {/* 3 Views / Tabs matching Reference 10 */}
        <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-2xl">
          {[
            { id: 'summary', label: isHindi ? 'सारांश' : 'Summary' },
            { id: 'revenue', label: isHindi ? 'राजस्व' : 'Revenue' },
            { id: 'profit', label: isHindi ? 'अनुमानित लाभ' : 'Estimated Profit' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setDashboardView(tab.id as any)}
              className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                dashboardView === tab.id
                  ? 'bg-white text-[#087A43] shadow-xs'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* ================= 10. COMPLETED LAND DASHBOARD METRICS ================= */}
      <div className="bg-white rounded-3xl p-6 border border-[#E5EBE1] shadow-2xs space-y-5">
        {/* Metric Cards matching Reference 10 */}
        <div className="grid grid-cols-3 gap-3 text-center">
          <div className="bg-[#FAFBF7] p-3.5 rounded-2xl border border-gray-100">
            <span className="text-[10px] text-gray-400 font-semibold block uppercase tracking-wider">कुल निवेश</span>
            <span className="text-lg sm:text-xl font-black text-gray-900 block mt-0.5">
              ₹ {totalInvestedDisplay.toLocaleString('en-IN')}
            </span>
            <span className="text-[10px] text-gray-400 font-medium">(अब तक)</span>
          </div>

          <div className="bg-[#FAFBF7] p-3.5 rounded-2xl border border-gray-100">
            <span className="text-[10px] text-gray-400 font-semibold block uppercase tracking-wider">अनुमानित आय</span>
            <span className="text-lg sm:text-xl font-black text-blue-700 block mt-0.5">
              ₹ {estimatedRevenueDisplay.toLocaleString('en-IN')}
            </span>
            <span className="text-[10px] text-blue-600 font-medium">(संभावित)</span>
          </div>

          <div className="bg-[#FAFBF7] p-3.5 rounded-2xl border border-gray-100">
            <span className="text-[10px] text-[#087A43] font-bold block uppercase tracking-wider">अनुमानित लाभ</span>
            <span className="text-lg sm:text-xl font-black text-[#075B35] block mt-0.5">
              ₹ {estimatedProfitDisplay.toLocaleString('en-IN')}
            </span>
            <span className="text-[10px] text-emerald-700 font-medium">शुद्ध मुनाफा</span>
          </div>
        </div>

        {/* Crop Progress bar matching Reference 10 */}
        <div className="space-y-2 pt-1">
          <div className="flex items-center justify-between text-xs font-bold text-gray-800">
            <span>{isHindi ? 'सीजन प्रगति' : 'Season Progress'}</span>
            <span className="text-[#087A43] font-black">{land.cropProgress || 60}%</span>
          </div>
          <div className="w-full bg-gray-100 h-2.5 rounded-full overflow-hidden">
            <div
              className="bg-[#087A43] h-full rounded-full transition-all duration-500"
              style={{ width: `${land.cropProgress || 60}%` }}
            />
          </div>
        </div>

        {/* Next Scheduled Activity matching Reference 10 */}
        <div className="bg-amber-50/80 p-3.5 rounded-2xl border border-amber-200/80 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Clock className="w-4 h-4 text-amber-700 shrink-0" />
            <div>
              <span className="text-[10px] text-amber-800 uppercase font-bold block">अगला कार्य:</span>
              <span className="text-xs font-bold text-amber-950">
                {land.nextActivity?.title || 'खाद डालना (12 जुलाई 2024)'}
              </span>
            </div>
          </div>

          <button
            onClick={() => setActiveSeasonTab('workplan')}
            className="px-3 py-1 bg-[#087A43] text-white rounded-xl text-xs font-bold shadow-xs flex items-center gap-1 cursor-pointer"
          >
            <span>आगे बढ़ें →</span>
          </button>
        </div>
      </div>

      {/* ================= 11. SEASON MANAGEMENT (INSIDE LAND) ================= */}
      <div className="bg-white rounded-3xl border border-[#E5EBE1] shadow-2xs overflow-hidden">
        {/* 5 Sub-Tabs Navigation matching Reference 11 */}
        <div className="flex items-center border-b border-gray-200 overflow-x-auto bg-gray-50/60 p-1">
          {[
            { id: 'calendar', label: 'कैलेंडर', icon: CalendarIcon },
            { id: 'workplan', label: 'कार्य', icon: CheckCircle2 },
            { id: 'expenses', label: 'खर्च', icon: Receipt },
            { id: 'analytics', label: 'प्रगति', icon: TrendingUp },
            { id: 'ai', label: 'चैटबॉट', icon: Bot }
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeSeasonTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => setActiveSeasonTab(tab.id as any)}
                className={`flex-1 min-w-[75px] py-2.5 px-3 rounded-2xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  isActive
                    ? 'bg-white text-[#087A43] shadow-xs'
                    : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Content Area */}
        <div className="p-5">
          {/* TAB 11.1: CALENDAR VIEW */}
          {activeSeasonTab === 'calendar' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-gray-900 flex items-center gap-1.5">
                  <CalendarIcon className="w-4 h-4 text-[#087A43]" />
                  <span>कार्य कैलेंडर ({land.season === 'kharif' ? 'खरीफ 2024' : 'रबी 2024'})</span>
                </h3>

                <div className="flex items-center gap-2 text-xs font-bold text-gray-700 bg-gray-100 px-3 py-1 rounded-xl">
                  <button className="p-1 hover:text-[#087A43]"><ChevronLeft className="w-3.5 h-3.5" /></button>
                  <span>{selectedMonth}</span>
                  <button className="p-1 hover:text-[#087A43]"><ChevronRight className="w-3.5 h-3.5" /></button>
                </div>
              </div>

              {/* Calendar Grid Simulation matching Reference 11.1 */}
              <div className="bg-[#FAFBF7] p-4 rounded-3xl border border-gray-100">
                <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-bold text-gray-400 mb-2">
                  <span>सो</span><span>मं</span><span>बु</span><span>गुरु</span><span>शुक्र</span><span>शनि</span><span>रवि</span>
                </div>
                <div className="grid grid-cols-7 gap-1 text-center text-xs">
                  {[2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20].map(d => {
                    const isSelected = selectedDateDay === d;
                    const hasTask = d === 12 || d === 14 || d === 16;

                    return (
                      <button
                        key={d}
                        onClick={() => setSelectedDateDay(d)}
                        className={`h-9 rounded-xl flex flex-col items-center justify-center font-bold transition-all relative cursor-pointer ${
                          isSelected
                            ? 'bg-[#087A43] text-white shadow-xs'
                            : 'hover:bg-gray-200/60 text-gray-800'
                        }`}
                      >
                        <span>{d}</span>
                        {hasTask && !isSelected && (
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 absolute bottom-1" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Activities for the selected date matching Reference 11.1 */}
              <div className="space-y-2 pt-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                    इस सप्ताह का कार्य:
                  </h4>
                  <button
                    onClick={() => setIsAddTaskModalOpen(true)}
                    className="text-xs font-bold text-[#087A43] hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>नया कार्य जोड़ें</span>
                  </button>
                </div>

                <div className="space-y-2">
                  {(land.tasks && land.tasks.length > 0 ? land.tasks : [
                    { id: '1', titleHi: 'खाद डालना', dueDate: '12 जुलाई', category: 'fertilizer' },
                    { id: '2', titleHi: 'खरपतवार नियंत्रण', dueDate: '14 जुलाई', category: 'weeding' },
                    { id: '3', titleHi: 'निराई गुड़ाई', dueDate: '16 जुलाई', category: 'weeding' }
                  ]).map((t: any) => (
                    <div
                      key={t.id}
                      className="flex items-center justify-between p-3 rounded-2xl bg-[#FAFBF7] border border-gray-100 text-xs"
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="text-base">{t.category === 'fertilizer' ? '🧪' : '🌾'}</span>
                        <span className="font-bold text-gray-900">{t.titleHi || t.title}</span>
                      </div>
                      <span className="text-[11px] font-semibold text-gray-500">{t.dueDate}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 11.2: WORK PLAN (DAILY) */}
          {activeSeasonTab === 'workplan' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-gray-900">आज का कार्य (12 जुलाई)</h3>
                  <p className="text-xs text-gray-500">प्रतिदिन की प्राथमिक कृषि गतिविधियां</p>
                </div>
              </div>

              {/* Task cards matching Reference 11.2 */}
              <div className="space-y-3">
                {[
                  { id: 'wp-1', title: 'खाद डालना (यूरिया)', desc: 'मात्रा: 50 kg/एकड़', icon: '🧪', done: false },
                  { id: 'wp-2', title: 'सिंचाई', desc: 'अवधि: 2 घंटे', icon: '💧', done: false },
                  { id: 'wp-3', title: 'खरपतवार जांच', desc: 'खेत का निरीक्षण करें', icon: '🔍', done: true }
                ].map((task) => (
                  <div
                    key={task.id}
                    className="p-4 rounded-3xl border border-[#E5EBE1] bg-[#FAFBF7] flex items-center justify-between gap-3 shadow-2xs"
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-2xl mt-0.5">{task.icon}</span>
                      <div>
                        <h4 className="text-sm font-bold text-gray-900">{task.title}</h4>
                        <p className="text-xs text-gray-500 mt-0.5">{task.desc}</p>
                      </div>
                    </div>

                    <button
                      onClick={() => showToast('कार्य स्थिति अपडेट हुई', 'success')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
                        task.done
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-white border border-gray-300 text-gray-700 hover:bg-emerald-50 hover:text-[#087A43]'
                      }`}
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>{task.done ? 'पूर्ण' : 'पूर्ण हुआ'}</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 11.3: EXPENSE TRACKING */}
          {activeSeasonTab === 'expenses' && (
            <div className="space-y-5 animate-in fade-in duration-150">
              {/* Add Expense Form matching Reference 11.3 */}
              <form onSubmit={handleAddExpense} className="bg-[#FAFBF7] p-4 rounded-3xl border border-gray-200 space-y-3">
                <h4 className="text-xs font-bold text-gray-800 uppercase tracking-wider">खर्च जोड़ें</h4>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="block text-gray-600 font-semibold mb-1">तारीख</label>
                    <input
                      type="date"
                      value={expDate}
                      onChange={(e) => setExpDate(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-xl border border-gray-300 bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-600 font-semibold mb-1">खर्च का प्रकार</label>
                    <select
                      value={expCategory}
                      onChange={(e) => {
                        setExpCategory(e.target.value);
                        setExpCategoryHi(e.target.options[e.target.selectedIndex].text);
                      }}
                      className="w-full px-3 py-1.5 rounded-xl border border-gray-300 bg-white"
                    >
                      <option value="fertilizer">खाद / उर्वरक</option>
                      <option value="seeds">बीज</option>
                      <option value="labour">मजदूरी</option>
                      <option value="irrigation">सिंचाई</option>
                      <option value="machinery">मशीनरी</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="block text-gray-600 font-semibold mb-1">राशि (₹) *</label>
                    <input
                      type="number"
                      required
                      value={expAmount}
                      onChange={(e) => setExpAmount(parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-1.5 rounded-xl border border-gray-300 bg-white font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-600 font-semibold mb-1">नोट</label>
                    <input
                      type="text"
                      value={expNote}
                      onChange={(e) => setExpNote(e.target.value)}
                      placeholder="उदा. यूरिया 50 kg"
                      className="w-full px-3 py-1.5 rounded-xl border border-gray-300 bg-white"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-[#087A43] hover:bg-[#075B35] text-white font-bold text-xs rounded-xl transition-colors cursor-pointer"
                >
                  {isHindi ? 'खर्च जोड़ें' : 'Save Expense'}
                </button>
              </form>

              {/* Recorded Expenses List */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-gray-700">
                  <span>इस भूमि का दर्ज खर्च</span>
                  <span className="text-[#087A43]">कुल: ₹ {actualRecordedExpenses.toLocaleString('en-IN')}</span>
                </div>

                {(land.expenses || []).map((exp) => (
                  <div key={exp.id} className="p-3 rounded-2xl bg-white border border-gray-100 flex items-center justify-between text-xs">
                    <div>
                      <p className="font-bold text-gray-900">{exp.categoryHi}</p>
                      <p className="text-[11px] text-gray-400">{exp.date} • {exp.notes || 'विवरण नहीं'}</p>
                    </div>
                    <span className="text-sm font-black text-gray-900">₹ {exp.amount.toLocaleString('en-IN')}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 11.4: PROGRESS ANALYTICS */}
          {activeSeasonTab === 'analytics' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-gray-900">फसल प्रगति एवं स्वास्थ्य सूचकांक</h3>
                  <p className="text-xs text-gray-500">महीना-वार फसल वृद्धि और NDVI स्कोर</p>
                </div>
                <span className="text-xs font-bold bg-emerald-100 text-[#075B35] px-2.5 py-1 rounded-xl">
                  {land.cropProgress || 60}% प्रगति
                </span>
              </div>

              {/* Recharts LineChart matching Reference 11.4 */}
              <div className="h-52 w-full bg-[#FAFBF7] p-3 rounded-3xl border border-gray-100">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={cropProgressChartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5EBE1" />
                    <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#6B7280' }} />
                    <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#6B7280' }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#FFFFFF',
                        borderRadius: '12px',
                        border: '1px solid #E5EBE1',
                        fontSize: '11px',
                        fontWeight: 600
                      }}
                      formatter={(val: any) => [`${val}%`, 'प्रगति सूचकांक']}
                    />
                    <Line
                      type="monotone"
                      dataKey="progress"
                      stroke="#087A43"
                      strokeWidth={3}
                      dot={{ fill: '#087A43', r: 5 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Status Note matching Reference 11.4 */}
              <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-200 flex items-start gap-2.5">
                <Sparkles className="w-5 h-5 text-[#087A43] shrink-0 mt-0.5" />
                <div className="text-xs text-emerald-950">
                  <p className="font-bold">वर्तमान स्थिति:</p>
                  <p className="mt-0.5">फसल अच्छी स्थिति में है (NDVI आधारित AI विश्लेषण)। मिट्टी में आर्द्रता संतुलित है।</p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 11.5: CHATBOT (AI ASSISTANT) */}
          {activeSeasonTab === 'ai' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="flex items-center gap-2 border-b border-gray-100 pb-2">
                <Bot className="w-5 h-5 text-[#087A43]" />
                <div>
                  <h3 className="text-sm font-bold text-gray-900">FasalSetu सहायक</h3>
                  <p className="text-[11px] text-gray-500">इस भूमि व फसल से जुड़े किसी भी सवाल में मदद</p>
                </div>
              </div>

              {/* Messages feed */}
              <div className="bg-[#FAFBF7] p-4 rounded-3xl border border-gray-100 max-h-56 overflow-y-auto space-y-3">
                <div className="bg-white p-3 rounded-2xl border border-gray-200 text-xs text-gray-800 leading-relaxed shadow-2xs">
                  नमस्ते! मैं आपकी खेती से जुड़े किसी भी सवाल में मदद कर सकता हूँ।
                </div>

                {chatMessages.slice(-2).map((msg) => (
                  <div
                    key={msg.id}
                    className={`p-3 rounded-2xl text-xs max-w-[85%] ${
                      msg.sender === 'user'
                        ? 'ml-auto bg-[#087A43] text-white'
                        : 'bg-white border border-gray-200 text-gray-800'
                    }`}
                  >
                    {msg.text}
                  </div>
                ))}
              </div>

              {/* Quick suggestions matching Reference 11.5 */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
                {['धान में पीलापन क्यों आ रहा है?', 'कितनी सिंचाई करें?', 'खाद की मात्रा बताएं'].map((q, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSendAiChat(q)}
                    className="px-3 py-1 bg-emerald-50 hover:bg-emerald-100 text-[#075B35] font-semibold rounded-full whitespace-nowrap transition-colors border border-emerald-200 cursor-pointer"
                  >
                    {q}
                  </button>
                ))}
              </div>

              {/* Input box */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendAiChat(aiChatInput);
                }}
                className="flex items-center gap-2 pt-1"
              >
                <input
                  type="text"
                  value={aiChatInput}
                  onChange={(e) => setAiChatInput(e.target.value)}
                  placeholder="अपना प्रश्न लिखें..."
                  className="flex-1 px-4 py-2.5 text-xs rounded-2xl border border-gray-300 focus:outline-hidden focus:border-[#087A43]"
                />
                <button
                  type="button"
                  onClick={() => handleSendAiChat('धान में बालियां निकलते समय क्या सावधानी रखें?')}
                  className="p-2.5 rounded-2xl border border-gray-300 text-gray-500 hover:text-[#087A43] hover:bg-emerald-50"
                  title="बोलकर पूछें"
                >
                  <Mic className="w-4 h-4" />
                </button>
                <button
                  type="submit"
                  className="p-2.5 bg-[#087A43] hover:bg-[#075B35] text-white rounded-2xl shadow-xs"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          )}
        </div>
      </div>

      {/* Add Task Modal */}
      {isAddTaskModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-gray-100 space-y-4">
            <h3 className="text-base font-bold text-gray-900">नया कार्य जोड़ें</h3>
            <form onSubmit={handleCreateTask} className="space-y-3 text-xs">
              <div>
                <label className="block text-gray-700 font-semibold mb-1">कार्य का नाम *</label>
                <input
                  type="text"
                  required
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  placeholder="उदा. पोटाश छिड़काव"
                  className="w-full px-3 py-2 rounded-xl border border-gray-300"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-1">श्रेणी</label>
                <select
                  value={newTaskCategory}
                  onChange={(e) => setNewTaskCategory(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl border border-gray-300"
                >
                  <option value="fertilizer">खाद / उर्वरक</option>
                  <option value="irrigation">सिंचाई</option>
                  <option value="weeding">निराई / खरपतवार</option>
                  <option value="pest_control">कीट नियंत्रण</option>
                </select>
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-1">तारीख</label>
                <input
                  type="date"
                  value={newTaskDate}
                  onChange={(e) => setNewTaskDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-gray-300"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddTaskModalOpen(false)}
                  className="px-4 py-2 text-gray-600 bg-gray-100 rounded-xl"
                >
                  रद्द करें
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#087A43] text-white font-bold rounded-xl"
                >
                  सुरक्षित करें
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

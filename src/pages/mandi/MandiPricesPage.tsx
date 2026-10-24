import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { INITIAL_MANDI_PRICES } from '../../data/mockData';
import { MandiRecord } from '../../types';
import { PageHeaderNav } from '../../components/common/PageHeaderNav';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid
} from 'recharts';
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Search,
  Filter,
  Star,
  Calculator,
  ArrowRight,
  MapPin,
  Bell,
  Scale,
  Truck,
  Sparkles,
  Info
} from 'lucide-react';

export const MandiPricesPage: React.FC = () => {
  const { language, showToast } = useApp();
  const isHindi = language === 'hi' || language === 'cg';

  const [mandiList, setMandiList] = useState<MandiRecord[]>(INITIAL_MANDI_PRICES);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCommodityGroup, setSelectedCommodityGroup] = useState('all');
  const [selectedMandiForChart, setSelectedMandiForChart] = useState<MandiRecord>(INITIAL_MANDI_PRICES[0]);

  // Comparison State (up to 3 mandis)
  const [comparedMandiIds, setComparedMandiIds] = useState<string[]>([INITIAL_MANDI_PRICES[0].id, INITIAL_MANDI_PRICES[1].id]);

  // Calculator State
  const [calcYieldQuintals, setCalcYieldQuintals] = useState<number>(45);
  const [calcTransportRatePerKm, setCalcTransportRatePerKm] = useState<number>(25);
  const [calcDistanceKm, setCalcDistanceKm] = useState<number>(18);
  const [calcSelectedMandiPrice, setCalcSelectedMandiPrice] = useState<number>(INITIAL_MANDI_PRICES[0].modalPrice);

  // Price Alert Threshold
  const [alertThreshold, setAlertThreshold] = useState<number>(2350);
  const [isAlertSet, setIsAlertSet] = useState(false);

  const toggleFavorite = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setMandiList(prev => prev.map(m => {
      if (m.id === id) {
        const nextFav = !m.isFavorite;
        showToast(
          nextFav 
            ? (isHindi ? 'मंडी पसंदीदा में जोड़ी गई' : 'Mandi added to favorites')
            : (isHindi ? 'मंडी पसंदीदा से हटाई गई' : 'Removed from favorites'),
          'info'
        );
        return { ...m, isFavorite: nextFav };
      }
      return m;
    }));
  };

  const toggleCompare = (id: string) => {
    if (comparedMandiIds.includes(id)) {
      setComparedMandiIds(comparedMandiIds.filter(i => i !== id));
    } else {
      if (comparedMandiIds.length >= 3) {
        showToast(isHindi ? 'आप अधिकतम 3 मंडियों की तुलना कर सकते हैं' : 'Max 3 markets can be compared', 'info');
        return;
      }
      setComparedMandiIds([...comparedMandiIds, id]);
    }
  };

  const handleSetAlert = (e: React.FormEvent) => {
    e.preventDefault();
    setIsAlertSet(true);
    showToast(isHindi ? `भाव ₹${alertThreshold}/क्विंटल से अधिक होने पर अलर्ट मिलेगा` : 'Price threshold alert set', 'success');
  };

  // Calculations
  const totalRevenue = calcYieldQuintals * calcSelectedMandiPrice;
  const totalTransportCost = calcDistanceKm * calcTransportRatePerKm;
  const netEstimatedReturn = Math.max(0, totalRevenue - totalTransportCost);

  const filteredMandis = mandiList.filter(item => {
    const matchesSearch =
      item.cropName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.cropNameHi.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.marketName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.district.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesGroup =
      selectedCommodityGroup === 'all' || item.commodityGroup.includes(selectedCommodityGroup);

    return matchesSearch && matchesGroup;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Global Back Navigation & Dashboard Shortcut */}
      <PageHeaderNav fallbackPath="/" />

      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <div className="p-2.5 rounded-2xl bg-blue-100 text-blue-800">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2">
              <span>{isHindi ? 'मंडी भाव बुद्धिमत्ता' : 'Mandi Price Intelligence'}</span>
              <span className="text-xs font-bold bg-blue-100 text-blue-900 px-2 py-0.5 rounded-full">
                {isHindi ? 'डेमो भाव' : 'Demo Rates'}
              </span>
            </h1>
            <p className="text-xs text-gray-500">
              दैनिक न्यूनतम, अधिकतम व मॉडल भाव, ऐतिहासिक रुझान चार्ट और शुद्ध मुनाफा कैलकुलेटर
            </p>
          </div>
        </div>
      </div>

      {/* Search & Commodity Filters */}
      <div className="bg-white p-4 rounded-3xl border border-[#E5EBE1] shadow-2xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Search bar */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={isHindi ? 'फसल, मंडी या जिले का नाम खोजें...' : 'Search crop or market...'}
              className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm bg-gray-50 rounded-2xl border border-gray-200 focus:bg-white focus:outline-hidden focus:border-[#087A43]"
            />
          </div>

          {/* Group Filter */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            {[
              { id: 'all', label: isHindi ? 'सभी फसलें' : 'All Crops' },
              { id: 'अनाज', label: isHindi ? 'अनाज' : 'Cereals' },
              { id: 'तिलहन', label: isHindi ? 'तिलहन' : 'Oilseeds' },
              { id: 'सब्जियां', label: isHindi ? 'सब्जियां' : 'Vegetables' }
            ].map(group => (
              <button
                key={group.id}
                onClick={() => setSelectedCommodityGroup(group.id)}
                className={`px-3 py-1.5 text-xs font-bold rounded-xl whitespace-nowrap transition-colors cursor-pointer ${
                  selectedCommodityGroup === group.id
                    ? 'bg-[#087A43] text-white shadow-xs'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {group.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Grid: Mandi Rates Cards (Left 7 Cols) + Interactive Price Chart (Right 5 Cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Mandi Prices Cards List */}
        <div className="lg:col-span-7 space-y-3">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-bold text-gray-700">
              {filteredMandis.length} मंडियों के लाइव भाव (डेमो)
            </span>
            <span className="text-[11px] text-gray-400">
              अंतिम अपडेट: 19 अक्टूबर 2024
            </span>
          </div>

          {filteredMandis.map((mandi) => {
            const isSelectedForChart = selectedMandiForChart.id === mandi.id;
            const isCompared = comparedMandiIds.includes(mandi.id);

            return (
              <div
                key={mandi.id}
                onClick={() => {
                  setSelectedMandiForChart(mandi);
                  setCalcSelectedMandiPrice(mandi.modalPrice);
                }}
                className={`bg-white rounded-3xl p-4 sm:p-5 border transition-all cursor-pointer shadow-2xs hover:shadow-sm space-y-3 ${
                  isSelectedForChart
                    ? 'border-[#087A43] ring-2 ring-[#087A43]/20'
                    : 'border-[#E5EBE1] hover:border-emerald-300'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-bold text-gray-900">{mandi.cropNameHi}</h3>
                      <span className="text-[10px] text-gray-500 font-medium">({mandi.cropName})</span>
                    </div>
                    <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5 font-medium">
                      <MapPin className="w-3.5 h-3.5 text-gray-400" />
                      <span>{mandi.marketName}, {mandi.district} ({mandi.state})</span>
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => toggleFavorite(mandi.id, e)}
                      className="p-1.5 text-gray-400 hover:text-amber-500 transition-colors"
                      title="Favorite"
                    >
                      <Star className={`w-4 h-4 ${mandi.isFavorite ? 'fill-amber-400 text-amber-400' : ''}`} />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleCompare(mandi.id);
                      }}
                      className={`text-[10px] font-bold px-2 py-1 rounded-lg border transition-colors ${
                        isCompared
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
                      }`}
                    >
                      {isCompared ? 'तुलना में शामिल ✓' : '+ तुलना'}
                    </button>
                  </div>
                </div>

                {/* Price Matrix */}
                <div className="grid grid-cols-3 gap-2 bg-[#FAFBF7] p-3 rounded-2xl border border-gray-100 text-center">
                  <div>
                    <span className="text-[10px] text-gray-400 font-medium block">न्यूनतम भाव</span>
                    <span className="text-xs font-bold text-gray-700">₹{mandi.minPrice}</span>
                  </div>

                  <div className="border-x border-gray-200 px-2">
                    <span className="text-[10px] text-[#087A43] font-bold block uppercase tracking-wider">
                      मॉडल भाव (औसत)
                    </span>
                    <div className="flex items-center justify-center gap-1">
                      <span className="text-base sm:text-lg font-black text-[#075B35]">
                        ₹{mandi.modalPrice}
                      </span>
                      <span className="text-[10px] text-gray-500 font-medium">/क्विं</span>
                    </div>
                  </div>

                  <div>
                    <span className="text-[10px] text-gray-400 font-medium block">अधिकतम भाव</span>
                    <span className="text-xs font-bold text-gray-700">₹{mandi.maxPrice}</span>
                  </div>
                </div>

                {/* Trend indicator & Chart hint */}
                <div className="flex items-center justify-between text-xs pt-1">
                  <div className="flex items-center gap-1.5">
                    {mandi.trend === 'up' ? (
                      <span className="text-emerald-700 font-bold flex items-center text-[11px] bg-emerald-50 px-2 py-0.5 rounded-md">
                        <TrendingUp className="w-3.5 h-3.5 mr-0.5" /> +{mandi.trendPercentage}% (दैनिक बढ़त)
                      </span>
                    ) : mandi.trend === 'down' ? (
                      <span className="text-rose-700 font-bold flex items-center text-[11px] bg-rose-50 px-2 py-0.5 rounded-md">
                        <TrendingDown className="w-3.5 h-3.5 mr-0.5" /> {mandi.trendPercentage}% (गिरावट)
                      </span>
                    ) : (
                      <span className="text-gray-600 font-medium flex items-center text-[11px] bg-gray-100 px-2 py-0.5 rounded-md">
                        <Minus className="w-3.5 h-3.5 mr-0.5" /> स्थिर भाव
                      </span>
                    )}
                  </div>

                  <span className="text-[10px] text-[#087A43] font-bold group-hover:underline">
                    रुझान ग्राफ देखें →
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Column: Recharts Trend Visualization & Calculator (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Recharts Price Trend Chart Card */}
          <div className="bg-white p-5 rounded-3xl border border-[#E5EBE1] shadow-2xs space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div>
                <h3 className="text-sm font-bold text-gray-900">
                  {isHindi ? '7-दिवसीय मूल्य रुझान' : '7-Day Price Trend'}
                </h3>
                <p className="text-xs text-gray-500">
                  {selectedMandiForChart.cropNameHi} • {selectedMandiForChart.marketName}
                </p>
              </div>
              <span className="text-xs font-black text-[#087A43] bg-emerald-50 px-2.5 py-1 rounded-xl">
                ₹{selectedMandiForChart.modalPrice}/क्विंटल
              </span>
            </div>

            {/* Recharts LineChart */}
            <div className="h-48 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={selectedMandiForChart.history}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F0F4EC" />
                  <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#6B7280' }} />
                  <YAxis
                    domain={['dataMin - 50', 'dataMax + 50']}
                    tick={{ fontSize: 10, fill: '#6B7280' }}
                    tickFormatter={(v) => `₹${v}`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#FFFFFF',
                      borderRadius: '12px',
                      border: '1px solid #E5EBE1',
                      fontSize: '11px',
                      fontWeight: 600
                    }}
                    formatter={(value: any) => [`₹${value}/क्विंटल`, 'मॉडल भाव']}
                  />
                  <Line
                    type="monotone"
                    dataKey="price"
                    stroke="#087A43"
                    strokeWidth={2.5}
                    dot={{ fill: '#087A43', r: 4 }}
                    activeDot={{ r: 6, fill: '#D97706' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Price Alert Form */}
            <form onSubmit={handleSetAlert} className="bg-amber-50/70 p-3.5 rounded-2xl border border-amber-200 space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-amber-950">
                <Bell className="w-3.5 h-3.5 text-amber-700" />
                <span>{isHindi ? 'मूल्य सीमा अलर्ट' : 'Price Threshold Alert'}</span>
              </div>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={alertThreshold}
                  onChange={(e) => setAlertThreshold(parseInt(e.target.value) || 0)}
                  placeholder="₹2400"
                  className="w-full px-3 py-1.5 text-xs font-bold rounded-xl border border-amber-300 bg-white"
                />
                <button
                  type="submit"
                  className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl shrink-0 cursor-pointer"
                >
                  अलर्ट सेट करें
                </button>
              </div>
              {isAlertSet && (
                <p className="text-[10px] text-emerald-800 font-semibold">
                  ✓ अलर्ट सक्रिय: जब {selectedMandiForChart.cropNameHi} ₹{alertThreshold} पार करेगा तो सूचना मिलेगी।
                </p>
              )}
            </form>
          </div>

          {/* Side-by-Side Mandi Comparison Box (up to 3) */}
          {comparedMandiIds.length > 0 && (
            <div className="bg-white p-5 rounded-3xl border border-[#E5EBE1] shadow-2xs space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider flex items-center gap-1.5">
                  <Scale className="w-4 h-4 text-blue-600" />
                  <span>मंडियों की तुलना ({comparedMandiIds.length}/3)</span>
                </h3>
                <button
                  onClick={() => setComparedMandiIds([])}
                  className="text-[10px] text-gray-400 hover:text-gray-700"
                >
                  तुलना साफ करें
                </button>
              </div>

              <div className="space-y-2">
                {comparedMandiIds.map(id => {
                  const m = mandiList.find(x => x.id === id);
                  if (!m) return null;
                  return (
                    <div key={m.id} className="p-2.5 rounded-xl bg-gray-50 border border-gray-200 flex items-center justify-between text-xs">
                      <div>
                        <p className="font-bold text-gray-900">{m.marketName}</p>
                        <p className="text-[10px] text-gray-500">{m.cropNameHi} • {m.district}</p>
                      </div>
                      <div className="text-right">
                        <span className="font-black text-[#087A43]">₹{m.modalPrice}</span>
                        <span className="text-[9px] text-gray-400 block">/क्विंटल</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Estimated Net Return & Transport Calculator */}
          <div className="bg-white p-5 rounded-3xl border border-[#E5EBE1] shadow-2xs space-y-4">
            <div className="flex items-center gap-2 border-b border-gray-100 pb-2">
              <Calculator className="w-5 h-5 text-emerald-700" />
              <div>
                <h3 className="text-sm font-bold text-gray-900">
                  शुद्ध आय एवं परिवहन खर्च कैलकुलेटर
                </h3>
                <p className="text-[11px] text-gray-500">
                  खेत से मंडी तक की दूरी व अपेक्षित उपज का सटीक अनुमान
                </p>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-gray-600 font-semibold mb-1">
                  अनुमानित उपज (क्विंटल में)
                </label>
                <input
                  type="number"
                  value={calcYieldQuintals}
                  onChange={(e) => setCalcYieldQuintals(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-1.5 rounded-xl border border-gray-300 font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-gray-600 font-semibold mb-1">
                    दूरी (किमी)
                  </label>
                  <input
                    type="number"
                    value={calcDistanceKm}
                    onChange={(e) => setCalcDistanceKm(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-1.5 rounded-xl border border-gray-300 font-bold"
                  />
                </div>
                <div>
                  <label className="block text-gray-600 font-semibold mb-1">
                    ट्रॉली किराया (₹/किमी)
                  </label>
                  <input
                    type="number"
                    value={calcTransportRatePerKm}
                    onChange={(e) => setCalcTransportRatePerKm(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-1.5 rounded-xl border border-gray-300 font-bold"
                  />
                </div>
              </div>

              {/* Result Summary */}
              <div className="bg-[#FAFBF7] p-3 rounded-2xl border border-emerald-100 space-y-1.5">
                <div className="flex justify-between text-gray-600">
                  <span>सकल बिक्री मूल्य ({calcYieldQuintals} × ₹{calcSelectedMandiPrice}):</span>
                  <span className="font-bold">₹{totalRevenue.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-rose-700">
                  <span>अनुमानित परिवहन खर्च:</span>
                  <span className="font-bold">-₹{totalTransportCost.toLocaleString('en-IN')}</span>
                </div>
                <div className="h-px bg-gray-200 my-1" />
                <div className="flex justify-between text-sm font-black text-[#075B35]">
                  <span>अनुमानित शुद्ध आय:</span>
                  <span>₹{netEstimatedReturn.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

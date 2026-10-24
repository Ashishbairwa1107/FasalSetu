import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import {
  Factory,
  Search,
  MapPin,
  Phone,
  Star,
  Bookmark,
  Navigation,
  DollarSign,
  Info,
  ChevronRight,
  CheckCircle2,
  Clock,
  Truck,
  ArrowLeft,
  X,
  Share2
} from 'lucide-react';
import { NearbyMill } from '../../types';
import { PageHeaderNav } from '../../components/common/PageHeaderNav';

export const NearbyMillsPage: React.FC = () => {
  const navigate = useNavigate();
  const { nearbyMills, toggleMillFavorite, language, showToast } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [cropFilter, setCropFilter] = useState<'all' | 'paddy' | 'wheat' | 'pulse' | 'favorite'>('all');
  const [selectedMill, setSelectedMill] = useState<NearbyMill | null>(null);
  const [directionsModalMill, setDirectionsModalMill] = useState<NearbyMill | null>(null);
  const [sellModalMill, setSellModalMill] = useState<NearbyMill | null>(null);
  const [sellQuantity, setSellQuantity] = useState<number>(25);

  const isHindi = language === 'hi' || language === 'cg';

  const filterTabs = [
    { id: 'all', label: isHindi ? 'सभी मिल्स' : 'All Mills' },
    { id: 'paddy', label: isHindi ? 'धान / चावल' : 'Paddy / Rice' },
    { id: 'wheat', label: isHindi ? 'गेहूं' : 'Wheat' },
    { id: 'pulse', label: isHindi ? 'दलहन / तिलहन' : 'Pulses / Oilseeds' },
    { id: 'favorite', label: isHindi ? 'पसंदीदा ⭐' : 'Favorites ⭐' }
  ];

  const filteredMills = nearbyMills.filter((mill) => {
    // Search query filter
    const matchesSearch =
      mill.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      mill.village.toLowerCase().includes(searchQuery.toLowerCase()) ||
      mill.district.toLowerCase().includes(searchQuery.toLowerCase()) ||
      mill.supportedCrops.some(c => c.toLowerCase().includes(searchQuery.toLowerCase()));

    if (!matchesSearch) return false;

    // Category filter
    if (cropFilter === 'all') return true;
    if (cropFilter === 'favorite') return mill.isFavorite;
    if (cropFilter === 'paddy') {
      return mill.supportedCrops.some(c => c.includes('धान') || c.includes('चावल') || c.toLowerCase().includes('paddy') || c.toLowerCase().includes('rice'));
    }
    if (cropFilter === 'wheat') {
      return mill.supportedCrops.some(c => c.includes('गेहूं') || c.toLowerCase().includes('wheat'));
    }
    if (cropFilter === 'pulse') {
      return mill.supportedCrops.some(c => c.includes('सोयाबीन') || c.includes('दाल') || c.includes('चना') || c.includes('सरसों') || c.includes('उड़द'));
    }
    return true;
  });

  const parseRateNumber = (rateStr: string): number => {
    const match = rateStr.match(/\d+[\d,]*/);
    if (!match) return 2300;
    return parseInt(match[0].replace(/,/g, ''), 10);
  };

  const handleSellSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sellModalMill) return;
    showToast(
      isHindi
        ? `${sellModalMill.name} को ${sellQuantity} क्विंटल फसल की पूछताछ भेजी गई। वे जल्द संपर्क करेंगे।`
        : `Enquiry for ${sellQuantity} quintals sent to ${sellModalMill.name}.`,
      'success'
    );
    setSellModalMill(null);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Global Back Navigation & Dashboard Shortcut */}
      <PageHeaderNav fallbackPath="/" />

      {/* 1. Header Banner */}
      <div className="bg-gradient-to-r from-[#075B35] via-[#087A43] to-[#044326] text-white p-6 rounded-3xl shadow-sm relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-8 -translate-y-6 opacity-10 pointer-events-none">
          <Factory className="w-56 h-56 text-white" />
        </div>

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider bg-emerald-800 text-emerald-200 px-2.5 py-0.5 rounded-full">
                मंडी व प्रसंस्करण हब • Row D 12
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight">
              {isHindi ? 'नजदीकी राइस व दाल मिल्स' : 'Nearby Processing & Rice Mills'}
            </h1>
            <p className="text-xs text-emerald-100 mt-1 max-w-xl">
              {isHindi
                ? 'अपनी तैयार फसल को सीधे निकटतम मिलों में बेचें। न्यूनतम परिवहन लागत, ताजा खरीद दरें और सीधी संपर्क सुविधा।'
                : 'Sell your harvested produce directly to verified nearby processing mills at best rates with minimal transport cost.'}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="bg-white/10 backdrop-blur-xs px-4 py-3 rounded-2xl border border-white/15 text-center">
              <span className="text-2xl font-black text-amber-300">{nearbyMills.length}</span>
              <p className="text-[10px] text-emerald-100 uppercase tracking-wider font-semibold">सक्रिय मिल्स</p>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Search & Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-[#E3ECE1] shadow-2xs space-y-3">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={isHindi ? 'मिल का नाम, गांव, जिला या फसल (धान, दाल, सोयाबीन) खोजें...' : 'Search mill name, location, crop...'}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#087A43] text-xs font-medium placeholder-gray-400"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Filter Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {filterTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setCropFilter(tab.id as any)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-full whitespace-nowrap transition-all cursor-pointer ${
                cropFilter === tab.id
                  ? 'bg-[#087A43] text-white shadow-xs'
                  : 'bg-[#FAFBF7] text-gray-600 border border-gray-200 hover:bg-gray-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* 3. Demo Data Transparency Alert */}
      <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-3 flex items-start gap-2.5 text-xs text-emerald-950">
        <Info className="w-4 h-4 text-[#087A43] shrink-0 mt-0.5" />
        <div className="flex-1">
          <span className="font-bold">पारदर्शिता सूचना:</span> प्रदर्शित खरीद भाव और संपर्क विवरण स्थानीय मंडी समिति के सर्वेक्षण पर आधारित सांकेतिक (प्रोटोटाइप) हैं। अंतिम दर फसल की गुणवत्ता व नमी प्रतिशत (FAQ मानक) जांच के बाद तय होती है।
        </div>
      </div>

      {/* 4. Mill Cards Grid */}
      {filteredMills.length === 0 ? (
        <div className="bg-white rounded-3xl p-10 border border-[#E3ECE1] text-center space-y-3">
          <Factory className="w-12 h-12 text-gray-300 mx-auto" />
          <h3 className="text-sm font-bold text-gray-800">कोई मिल नहीं मिली</h3>
          <p className="text-xs text-gray-500 max-w-sm mx-auto">
            आपके चुने हुए फिल्टर या खोज शब्द से मेल खाती कोई मिल उपलब्ध नहीं है। कृपया दूसरे फिल्टर आजमाएं।
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setCropFilter('all');
            }}
            className="px-4 py-2 bg-emerald-50 text-[#087A43] font-bold text-xs rounded-xl hover:bg-emerald-100 transition-colors"
          >
            सभी मिल्स देखें
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredMills.map((mill) => (
            <div
              key={mill.id}
              className="bg-white rounded-2xl border border-[#E3ECE1] hover:border-emerald-400 p-5 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between group"
            >
              {/* Header: Name, Distance & Bookmark */}
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="w-11 h-11 rounded-2xl bg-emerald-50 border border-emerald-100 text-[#087A43] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                      <Factory className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-gray-900 group-hover:text-[#087A43] transition-colors leading-tight">
                        {mill.name}
                      </h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-[#087A43]" />
                          {mill.distanceKm} किमी दूर
                        </span>
                        <span className="text-[11px] text-gray-500">• {mill.village}, {mill.district}</span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => toggleMillFavorite(mill.id)}
                    className="p-2 rounded-xl hover:bg-gray-100 text-gray-400 hover:text-amber-500 transition-colors cursor-pointer"
                    title={mill.isFavorite ? 'पसंदीदा से हटाएं' : 'पसंदीदा में जोड़ें'}
                  >
                    <Bookmark
                      className={`w-4 h-4 ${
                        mill.isFavorite ? 'fill-amber-400 text-amber-500' : ''
                      }`}
                    />
                  </button>
                </div>

                {/* Buying Rate & Rating Strip */}
                <div className="mt-4 bg-[#FAFBF7] border border-[#E3ECE1] rounded-xl p-3 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-gray-500 font-semibold uppercase tracking-wider block">
                      वर्तमान खरीद दर (अनुमानित)
                    </span>
                    <span className="text-base font-black text-emerald-900">
                      {mill.buyingRate}
                    </span>
                  </div>

                  <div className="flex items-center gap-1 bg-amber-50 border border-amber-200 px-2 py-1 rounded-lg">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
                    <span className="text-xs font-bold text-amber-900">{mill.rating}</span>
                    <span className="text-[10px] text-amber-700">/ 5</span>
                  </div>
                </div>

                {/* Crops Handled */}
                <div className="mt-3">
                  <span className="text-[11px] text-gray-500 font-medium">स्वीकृत फसलें:</span>
                  <div className="flex items-center gap-1.5 flex-wrap mt-1">
                    {mill.supportedCrops.map((crop, idx) => (
                      <span
                        key={idx}
                        className="text-[10px] font-semibold bg-gray-100 text-gray-700 px-2 py-0.5 rounded-md"
                      >
                        {crop}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Address preview */}
                <p className="text-[11px] text-gray-500 mt-2 line-clamp-1">
                  📍 {mill.address}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="mt-4 pt-3 border-t border-gray-100 flex items-center gap-2">
                <a
                  href={`tel:${mill.contactPhone}`}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 bg-emerald-50 hover:bg-emerald-100 text-[#087A43] font-bold text-xs rounded-xl transition-colors"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>कॉल करें</span>
                </a>

                <button
                  onClick={() => setDirectionsModalMill(mill)}
                  className="flex items-center justify-center gap-1.5 py-2 px-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium text-xs rounded-xl transition-colors cursor-pointer"
                  title="दिशा-निर्देश देखें"
                >
                  <Navigation className="w-3.5 h-3.5 text-blue-600" />
                  <span>मार्ग</span>
                </button>

                <button
                  onClick={() => setSellModalMill(mill)}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 bg-[#087A43] hover:bg-[#075B35] text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  <DollarSign className="w-3.5 h-3.5" />
                  <span>फसल बेचें कोटेशन</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 5. Directions Modal */}
      {directionsModalMill && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-gray-100 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
                  <Navigation className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-gray-900">{directionsModalMill.name}</h3>
                  <p className="text-[11px] text-gray-500">दिशा-निर्देश व मार्ग विवरण</p>
                </div>
              </div>
              <button
                onClick={() => setDirectionsModalMill(null)}
                className="p-1 rounded-lg text-gray-400 hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Simulated Map Visual */}
            <div className="bg-emerald-50 rounded-2xl p-4 border border-emerald-200 space-y-3">
              <div className="flex items-center justify-between text-xs font-bold text-emerald-950">
                <span className="flex items-center gap-1.5">
                  <Truck className="w-4 h-4 text-[#087A43]" />
                  ट्रैक्टर / पिकअप द्वारा यात्रा
                </span>
                <span className="bg-emerald-200/80 text-emerald-900 px-2 py-0.5 rounded-full text-[10px]">
                  लगभग 20-25 मिनट
                </span>
              </div>

              {/* Waypoints */}
              <div className="space-y-2 text-xs text-gray-700 bg-white p-3 rounded-xl border border-emerald-100">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
                  <span className="font-semibold text-gray-900">आपका खेत (ग्राम करही, बिलासपुर)</span>
                </div>
                <div className="h-4 border-l-2 border-dashed border-gray-300 ml-1" />
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                  <span>मुख्य मंडी बाइपास रोड (दूरी: {directionsModalMill.distanceKm} किमी)</span>
                </div>
                <div className="h-4 border-l-2 border-dashed border-gray-300 ml-1" />
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                  <span className="font-bold text-gray-900">{directionsModalMill.address}</span>
                </div>
              </div>
            </div>

            <div className="text-xs text-gray-600 bg-gray-50 p-3 rounded-xl space-y-1">
              <p>📞 <strong>मिल संपर्क नंबर:</strong> {directionsModalMill.contactPhone}</p>
              <p>⏰ <strong>तौल कांटा समय:</strong> प्रातः 08:00 AM से सायं 07:00 PM तक</p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  window.open(`https://maps.google.com/?q=${encodeURIComponent(directionsModalMill.address)}`, '_blank');
                  setDirectionsModalMill(null);
                }}
                className="flex-1 py-2.5 bg-[#087A43] hover:bg-[#075B35] text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Navigation className="w-4 h-4" />
                <span>गूगल मैप्स में खोलें</span>
              </button>
              <button
                onClick={() => setDirectionsModalMill(null)}
                className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold rounded-xl"
              >
                बंद करें
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 6. Crop Quotation / Enquiry Modal */}
      {sellModalMill && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-gray-100 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-emerald-50 text-[#087A43]">
                  <DollarSign className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-gray-900">फसल विक्रय कोटेशन</h3>
                  <p className="text-[11px] text-gray-500">{sellModalMill.name}</p>
                </div>
              </div>
              <button
                onClick={() => setSellModalMill(null)}
                className="p-1 rounded-lg text-gray-400 hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSellSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">
                  उपलब्ध फसल का प्रकार
                </label>
                <select className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs font-medium focus:ring-2 focus:ring-[#087A43]">
                  {sellModalMill.supportedCrops.map((c, i) => (
                    <option key={i} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-gray-700">
                    अनुमानित मात्रा (क्विंटल)
                  </label>
                  <span className="text-xs font-bold text-[#087A43]">{sellQuantity} क्विंटल</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="200"
                  step="5"
                  value={sellQuantity}
                  onChange={(e) => setSellQuantity(parseInt(e.target.value, 10))}
                  className="w-full accent-[#087A43]"
                />
              </div>

              {/* Payout calculation card */}
              <div className="bg-[#FAFBF7] border border-emerald-200 rounded-2xl p-4 space-y-2">
                <div className="flex items-center justify-between text-xs text-gray-600">
                  <span>वर्तमान सांकेतिक दर:</span>
                  <span className="font-bold text-gray-900">{sellModalMill.buyingRate}</span>
                </div>
                <div className="flex items-center justify-between text-xs text-gray-600">
                  <span>कुल अनुमानित भुगतान:</span>
                  <span className="text-lg font-black text-[#087A43]">
                    ₹ {(sellQuantity * parseRateNumber(sellModalMill.buyingRate)).toLocaleString('en-IN')}
                  </span>
                </div>
                <p className="text-[10px] text-gray-400 pt-1 border-t border-gray-200">
                  * तौल और कटाई के बाद मिल द्वारा तुरंत आरटीजीएस/खाता भुगतान किया जाता है।
                </p>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-[#087A43] hover:bg-[#075B35] text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  पूछताछ व बुकिंग भेजें
                </button>
                <button
                  type="button"
                  onClick={() => setSellModalMill(null)}
                  className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold rounded-xl"
                >
                  रद्द करें
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
export default NearbyMillsPage;

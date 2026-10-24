import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { FarmField, SoilType, IrrigationType, GrowthStage } from '../../types';
import { ConfirmationDialog } from '../../components/common/ConfirmationDialog';
import { PageHeaderNav } from '../../components/common/PageHeaderNav';
import {
  Tractor,
  Plus,
  Edit2,
  Trash2,
  MapPin,
  Calendar,
  Layers,
  Droplets,
  Sprout,
  Activity,
  CheckCircle,
  X,
  FileText,
  AlertCircle
} from 'lucide-react';

export const FarmWorkspacePage: React.FC = () => {
  const { farms, addFarm, updateFarm, deleteFarm, language, expenses, tasks } = useApp();
  const isHindi = language === 'hi' || language === 'cg';

  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingFarm, setEditingFarm] = useState<FarmField | null>(null);
  const [farmToDelete, setFarmToDelete] = useState<string | null>(null);

  // Form states
  const [formData, setFormData] = useState<Omit<FarmField, 'id'>>({
    name: '',
    area: 2.0,
    areaUnit: 'Acres',
    location: '',
    soilType: 'Black / काली मिट्टी',
    irrigationType: 'Tube well / नलकूप',
    currentCrop: 'धान',
    cropVariety: '',
    sowingDate: new Date().toISOString().split('T')[0],
    expectedHarvestDate: new Date(Date.now() + 90 * 86400000).toISOString().split('T')[0],
    growthStage: 'vegetative',
    healthScore: 88,
    lastInspected: new Date().toISOString().split('T')[0],
    notes: ''
  });

  // Aggregates
  const totalArea = farms.reduce((sum, f) => sum + f.area, 0);
  const totalActiveCrops = new Set(farms.map(f => f.currentCrop)).size;
  const totalFarmExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);

  const handleOpenAdd = () => {
    setFormData({
      name: '',
      area: 2.5,
      areaUnit: 'Acres',
      location: '',
      soilType: 'Black / काली मिट्टी',
      irrigationType: 'Tube well / नलकूप',
      currentCrop: 'गेहूं',
      cropVariety: 'HD-3086',
      sowingDate: new Date().toISOString().split('T')[0],
      expectedHarvestDate: new Date(Date.now() + 110 * 86400000).toISOString().split('T')[0],
      growthStage: 'sowing',
      healthScore: 90,
      lastInspected: new Date().toISOString().split('T')[0],
      notes: ''
    });
    setEditingFarm(null);
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (farm: FarmField) => {
    setEditingFarm(farm);
    setFormData({
      name: farm.name,
      area: farm.area,
      areaUnit: farm.areaUnit,
      location: farm.location,
      soilType: farm.soilType,
      irrigationType: farm.irrigationType,
      currentCrop: farm.currentCrop,
      cropVariety: farm.cropVariety,
      sowingDate: farm.sowingDate,
      expectedHarvestDate: farm.expectedHarvestDate,
      growthStage: farm.growthStage,
      healthScore: farm.healthScore,
      lastInspected: farm.lastInspected,
      notes: farm.notes || ''
    });
    setIsAddModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      alert(isHindi ? 'कृपया खेत का नाम दर्ज करें' : 'Please enter farm name');
      return;
    }

    if (editingFarm) {
      updateFarm(editingFarm.id, formData);
    } else {
      addFarm(formData);
    }
    setIsAddModalOpen(false);
  };

  const stageProgressMap: Record<GrowthStage, { percent: number; labelHi: string; labelEn: string }> = {
    sowing: { percent: 15, labelHi: 'बुवाई / रोपाई', labelEn: 'Sowing / Seedling' },
    vegetative: { percent: 40, labelHi: 'कंसुआ / वृद्धि अवस्था', labelEn: 'Vegetative Growth' },
    flowering: { percent: 70, labelHi: 'फूल व बालियां निकलना', labelEn: 'Flowering Stage' },
    grain_filling: { percent: 90, labelHi: 'दाना भराव / पकना', labelEn: 'Grain Filling' },
    harvest_ready: { percent: 100, labelHi: 'कटाई हेतु तैयार', labelEn: 'Harvest Ready' }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Global Back Navigation & Dashboard Shortcut */}
      <PageHeaderNav fallbackPath="/" />

      {/* Top Banner & Add Farm Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2">
            <Tractor className="w-7 h-7 text-[#087A43]" />
            <span>{isHindi ? 'मेरा खेत कार्यक्षेत्र' : 'My Farm Workspace'}</span>
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            {isHindi
              ? 'अपनी कृषि भूमि, फसल चक्र, मिट्टी व सिंचाई संसाधनों का संपूर्ण प्रबंधन'
              : 'Manage field parcels, crop stages, irrigation and agronomic logs'}
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-4 py-2.5 bg-[#087A43] hover:bg-[#075B35] text-white rounded-2xl text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>{isHindi ? 'नया खेत जोड़ें' : 'Add New Farm'}</span>
        </button>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-white p-4 rounded-2xl border border-[#E5EBE1] shadow-2xs">
          <p className="text-xs text-gray-500 font-medium">कुल कृषि रकबा</p>
          <p className="text-2xl font-black text-gray-900 mt-1">
            {totalArea} <span className="text-xs font-bold text-gray-500">एकड़</span>
          </p>
          <span className="text-[10px] text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded font-semibold mt-2 inline-block">
            {farms.length} अलग-अलग भूखंड
          </span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-[#E5EBE1] shadow-2xs">
          <p className="text-xs text-gray-500 font-medium">सक्रिय फसलें</p>
          <p className="text-2xl font-black text-emerald-700 mt-1">
            {totalActiveCrops} <span className="text-xs font-bold text-gray-500">प्रकार</span>
          </p>
          <span className="text-[10px] text-amber-800 bg-amber-50 px-2 py-0.5 rounded font-semibold mt-2 inline-block">
            खरीफ मौसम 2024
          </span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-[#E5EBE1] shadow-2xs">
          <p className="text-xs text-gray-500 font-medium">लंबित कृषि कार्य</p>
          <p className="text-2xl font-black text-amber-600 mt-1">
            {tasks.filter(t => t.status === 'pending').length}
          </p>
          <span className="text-[10px] text-blue-800 bg-blue-50 px-2 py-0.5 rounded font-semibold mt-2 inline-block">
            अगले 7 दिनों में
          </span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-[#E5EBE1] shadow-2xs">
          <p className="text-xs text-gray-500 font-medium">कुल मौसमी खर्च</p>
          <p className="text-2xl font-black text-gray-900 mt-1">
            ₹{totalFarmExpenses.toLocaleString('en-IN')}
          </p>
          <span className="text-[10px] text-purple-800 bg-purple-50 px-2 py-0.5 rounded font-semibold mt-2 inline-block">
            खाद, बीज व मजदूरी
          </span>
        </div>
      </div>

      {/* Farms List */}
      <div className="space-y-4">
        <h2 className="text-base font-bold text-gray-900 px-1">
          {isHindi ? 'पंजीकृत खेत एवं फसल स्थिति' : 'Registered Fields & Crop Status'}
        </h2>

        {farms.length === 0 ? (
          <div className="bg-white rounded-3xl p-10 text-center border border-dashed border-gray-300">
            <Tractor className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-gray-700">अभी कोई खेत पंजीकृत नहीं है</h3>
            <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
              अपनी जमीन का नाम, रकबा, मिट्टी व वर्तमान फसल जोड़कर स्मार्ट खेती शुरू करें।
            </p>
            <button
              onClick={handleOpenAdd}
              className="mt-4 px-4 py-2 bg-[#087A43] text-white text-xs font-bold rounded-xl"
            >
              पहला खेत जोड़ें
            </button>
          </div>
        ) : (
          farms.map((farm) => {
            const stageInfo = stageProgressMap[farm.growthStage] || stageProgressMap.vegetative;

            return (
              <div
                key={farm.id}
                className="bg-white rounded-3xl p-5 border border-[#E5EBE1] shadow-2xs hover:shadow-sm transition-all space-y-4"
              >
                {/* Header: Name, Crop & Actions */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-bold text-gray-900">{farm.name}</h3>
                      <span className="text-xs bg-emerald-100 text-[#075B35] font-bold px-2.5 py-0.5 rounded-full">
                        {farm.area} {farm.areaUnit}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3.5 h-3.5 text-gray-400" />
                      <span>{farm.location}</span>
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleOpenEdit(farm)}
                      className="px-3 py-1.5 rounded-xl border border-gray-200 text-xs font-semibold text-gray-700 hover:bg-gray-50 flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Edit2 className="w-3.5 h-3.5 text-gray-500" />
                      <span>संपादित करें</span>
                    </button>
                    <button
                      onClick={() => setFarmToDelete(farm.id)}
                      className="p-2 rounded-xl text-gray-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                      title="Delete field"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Crop & Agronomic details */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div className="bg-[#FAFBF7] p-3 rounded-2xl border border-gray-100">
                    <span className="text-[10px] text-gray-400 font-medium">वर्तमान फसल</span>
                    <p className="font-bold text-gray-900 mt-0.5">{farm.currentCrop}</p>
                    <p className="text-[10px] text-gray-500">{farm.cropVariety || 'देशी किस्म'}</p>
                  </div>

                  <div className="bg-[#FAFBF7] p-3 rounded-2xl border border-gray-100">
                    <span className="text-[10px] text-gray-400 font-medium">मिट्टी का प्रकार</span>
                    <p className="font-bold text-gray-900 mt-0.5">{farm.soilType}</p>
                    <p className="text-[10px] text-emerald-800">उर्वरक अवशोषण: उत्तम</p>
                  </div>

                  <div className="bg-[#FAFBF7] p-3 rounded-2xl border border-gray-100">
                    <span className="text-[10px] text-gray-400 font-medium">सिंचाई स्रोत</span>
                    <p className="font-bold text-gray-900 mt-0.5">{farm.irrigationType}</p>
                    <p className="text-[10px] text-blue-800">नियमित आपूर्ति</p>
                  </div>

                  <div className="bg-[#FAFBF7] p-3 rounded-2xl border border-gray-100">
                    <span className="text-[10px] text-gray-400 font-medium">बुवाई / कटाई तिथि</span>
                    <p className="font-bold text-gray-900 mt-0.5">{farm.sowingDate}</p>
                    <p className="text-[10px] text-amber-700">कटाई: {farm.expectedHarvestDate}</p>
                  </div>
                </div>

                {/* Growth Stage Progress Bar */}
                <div className="bg-emerald-50/60 p-4 rounded-2xl border border-emerald-100 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5 font-bold text-emerald-950">
                      <Sprout className="w-4 h-4 text-[#087A43]" />
                      <span>फसल विकास अवस्था: {stageInfo.labelHi}</span>
                    </div>
                    <span className="text-xs font-bold text-[#087A43]">
                      {stageInfo.percent}% पूर्ण
                    </span>
                  </div>

                  {/* Progress bar line */}
                  <div className="w-full bg-emerald-200/60 h-2.5 rounded-full overflow-hidden">
                    <div
                      className="bg-[#087A43] h-full rounded-full transition-all duration-500"
                      style={{ width: `${stageInfo.percent}%` }}
                    />
                  </div>

                  {farm.notes && (
                    <p className="text-[11px] text-emerald-900/80 pt-1 font-medium italic">
                      नोट: {farm.notes}
                    </p>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add / Edit Farm Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-gray-100 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3 mb-4">
              <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <Tractor className="w-5 h-5 text-[#087A43]" />
                <span>{editingFarm ? 'खेत का विवरण बदलें' : 'नया खेत जोड़ें'}</span>
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">खेत का नाम *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="उदा. बड़ा खेत / बोरवेल वाला प्लाट"
                  className="w-full px-3 py-2 text-sm rounded-xl border border-gray-300 focus:outline-hidden focus:border-[#087A43] focus:ring-1 focus:ring-[#087A43]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">रकबा (क्षेत्रफल) *</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0.1"
                    required
                    value={formData.area}
                    onChange={(e) => setFormData({ ...formData, area: parseFloat(e.target.value) || 1 })}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-gray-300 focus:outline-hidden focus:border-[#087A43]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">इकाई</label>
                  <select
                    value={formData.areaUnit}
                    onChange={(e) => setFormData({ ...formData, areaUnit: e.target.value as any })}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-gray-300 focus:outline-hidden focus:border-[#087A43]"
                  >
                    <option value="Acres">{isHindi ? 'एकड़' : 'Acres'}</option>
                    <option value="Bigha">{isHindi ? 'बीघा' : 'Bigha'}</option>
                    <option value="Hectare">{isHindi ? 'हेक्टेयर' : 'Hectare'}</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  {isHindi ? 'स्थान / खसरा विवरण' : 'Location / Khasra Details'}
                </label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder={isHindi ? 'उदा. आरंग रोड, खसरा नं. 142' : 'e.g. Arang Road, Khasra 142'}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-gray-300 focus:outline-hidden focus:border-[#087A43]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    {isHindi ? 'मिट्टी का प्रकार' : 'Soil Type'}
                  </label>
                  <select
                    value={formData.soilType}
                    onChange={(e) => setFormData({ ...formData, soilType: e.target.value as SoilType })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-gray-300 focus:outline-hidden focus:border-[#087A43]"
                  >
                    <option value="Black / काली मिट्टी">{isHindi ? 'काली मिट्टी' : 'Black Soil'}</option>
                    <option value="Alluvial / जलोढ़">{isHindi ? 'जलोढ़ दोमट' : 'Alluvial Soil'}</option>
                    <option value="Red / लाल मिट्टी">{isHindi ? 'लाल पीली मिट्टी' : 'Red Soil'}</option>
                    <option value="Sandy Loam / दोमट">{isHindi ? 'बलुई दोमट' : 'Sandy Loam'}</option>
                    <option value="Clay / चिकनी">{isHindi ? 'चिकनी मटासी' : 'Clay Soil'}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    {isHindi ? 'सिंचाई का साधन' : 'Irrigation Source'}
                  </label>
                  <select
                    value={formData.irrigationType}
                    onChange={(e) => setFormData({ ...formData, irrigationType: e.target.value as IrrigationType })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-gray-300 focus:outline-hidden focus:border-[#087A43]"
                  >
                    <option value="Tube well / नलकूप">{isHindi ? 'नलकूप / बोरवेल' : 'Tube Well / Borewell'}</option>
                    <option value="Canal / नहर">{isHindi ? 'नहर' : 'Canal'}</option>
                    <option value="Drip / ड्रिप">{isHindi ? 'ड्रिप सिंचाई' : 'Drip Irrigation'}</option>
                    <option value="Sprinkler / फव्वारा">{isHindi ? 'स्प्रिंकलर फव्वारा' : 'Sprinkler'}</option>
                    <option value="Rainfed / वर्षा आधारित">{isHindi ? 'वर्षा आधारित' : 'Rainfed'}</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    {isHindi ? 'वर्तमान फसल *' : 'Current Crop *'}
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.currentCrop}
                    onChange={(e) => setFormData({ ...formData, currentCrop: e.target.value })}
                    placeholder={isHindi ? 'उदा. धान, गेहूं' : 'e.g. Paddy, Wheat'}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-gray-300 focus:outline-hidden focus:border-[#087A43]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    {isHindi ? 'किस्म' : 'Variety'}
                  </label>
                  <input
                    type="text"
                    value={formData.cropVariety}
                    onChange={(e) => setFormData({ ...formData, cropVariety: e.target.value })}
                    placeholder={isHindi ? 'उदा. IR-64, GW-322' : 'e.g. IR-64, GW-322'}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-gray-300 focus:outline-hidden focus:border-[#087A43]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    {isHindi ? 'बुवाई तिथि' : 'Sowing Date'}
                  </label>
                  <input
                    type="date"
                    value={formData.sowingDate}
                    onChange={(e) => setFormData({ ...formData, sowingDate: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-gray-300 focus:outline-hidden focus:border-[#087A43]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    {isHindi ? 'अपेक्षित कटाई तिथि' : 'Harvest Date'}
                  </label>
                  <input
                    type="date"
                    value={formData.expectedHarvestDate}
                    onChange={(e) => setFormData({ ...formData, expectedHarvestDate: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-gray-300 focus:outline-hidden focus:border-[#087A43]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  {isHindi ? 'फसल विकास अवस्था' : 'Growth Stage'}
                </label>
                <select
                  value={formData.growthStage}
                  onChange={(e) => setFormData({ ...formData, growthStage: e.target.value as GrowthStage })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-gray-300 focus:outline-hidden focus:border-[#087A43]"
                >
                  <option value="sowing">{isHindi ? 'बुवाई / अंकुरण अवस्था' : 'Sowing / Germination'}</option>
                  <option value="vegetative">{isHindi ? 'कंसुआ / वृद्धि अवस्था' : 'Vegetative Stage'}</option>
                  <option value="flowering">{isHindi ? 'फूल / बालियां निकलना' : 'Flowering Stage'}</option>
                  <option value="grain_filling">{isHindi ? 'दाना भराव / दुग्धावस्था' : 'Grain Filling Stage'}</option>
                  <option value="harvest_ready">{isHindi ? 'कटाई हेतु तैयार' : 'Ready for Harvest'}</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">अतिरिक्त विवरण / टिप्पणी</label>
                <textarea
                  rows={2}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="उदा. खाद का छिड़काव कब किया, मिट्टी की नमी कैसी है..."
                  className="w-full px-3 py-2 text-xs rounded-xl border border-gray-300 focus:outline-hidden focus:border-[#087A43]"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200"
                >
                  रद्द करें
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-[#087A43] hover:bg-[#075B35] rounded-xl shadow-xs"
                >
                  {editingFarm ? 'अपडेट सुरक्षित करें' : 'खेत सुरक्षित करें'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={!!farmToDelete}
        title="खेत हटाएं?"
        message="क्या आप वाकई इस खेत को अपनी सूची से हटाना चाहते हैं? इससे संबंधित फसल डेटा हट जाएगा।"
        confirmLabel="हां, हटाएं"
        cancelLabel="रद्द करें"
        isDestructive
        onConfirm={() => {
          if (farmToDelete) {
            deleteFarm(farmToDelete);
            setFarmToDelete(null);
          }
        }}
        onCancel={() => setFarmToDelete(null)}
      />
    </div>
  );
};

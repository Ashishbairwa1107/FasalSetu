import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { LandRecord } from '../../types';
import { ConfirmationDialog } from '../../components/common/ConfirmationDialog';
import { PageHeaderNav } from '../../components/common/PageHeaderNav';
import {
  Tractor,
  Plus,
  MapPin,
  Calendar,
  Layers,
  ChevronRight,
  MoreVertical,
  CheckCircle2,
  AlertCircle,
  Clock,
  Eye,
  Edit2,
  Trash2,
  Play,
  RotateCcw,
  Sparkles,
  X
} from 'lucide-react';

export const MyLandListPage: React.FC = () => {
  const navigate = useNavigate();
  const { lands, deleteLand, language, showToast } = useApp();
  const isHindi = language === 'hi' || language === 'cg';

  const [selectedLandForStatus, setSelectedLandForStatus] = useState<LandRecord | null>(null);
  const [landToDelete, setLandToDelete] = useState<string | null>(null);
  const [activeMenuLandId, setActiveMenuLandId] = useState<string | null>(null);

  const handleOpenStatusModal = (land: LandRecord) => {
    setSelectedLandForStatus(land);
    setActiveMenuLandId(null);
  };

  const handleResumeSetup = (land: LandRecord) => {
    // Resume at the exact step saved in the land record
    navigate(`/add-land?resume=${land.id}&step=${land.setupStep || 4}`);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Global Back Navigation & Dashboard Shortcut */}
      <PageHeaderNav fallbackPath="/" />

      {/* Top Header matching Reference 9.1 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2">
            <Tractor className="w-7 h-7 text-[#087A43]" />
            <span>{isHindi ? 'मेरी भूमि' : 'My Land Parcels'}</span>
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            {isHindi
              ? 'अपनी सभी पंजीकृत भूमियों का प्रबंधन, फसल स्थिति और मौसमी कार्य योजना देखें'
              : 'Manage all your registered land parcels, crop progress and seasonal work plans'}
          </p>
        </div>

        <button
          onClick={() => navigate('/add-land')}
          className="px-4 py-2.5 bg-[#087A43] hover:bg-[#075B35] text-white rounded-2xl text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>{isHindi ? '+ नई भूमि जोड़ें' : '+ Add New Land'}</span>
        </button>
      </div>

      {/* Lands List Cards matching Reference 9.1 */}
      <div className="space-y-3">
        {lands.map((land) => {
          const isComplete = land.isComplete;
          const isIncomplete = land.status.includes('अधूरी') || !land.isComplete;

          return (
            <div
              key={land.id}
              onClick={() => {
                if (isIncomplete) {
                  handleOpenStatusModal(land);
                } else {
                  navigate(`/land/${land.id}`);
                }
              }}
              className="bg-white rounded-3xl p-5 border border-[#E5EBE1] hover:border-emerald-300 shadow-2xs hover:shadow-xs transition-all cursor-pointer space-y-3 relative group"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-[#087A43] flex items-center justify-center font-bold text-lg shrink-0 border border-emerald-100">
                    <Tractor className="w-6 h-6" />
                  </div>

                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-base font-black text-gray-900">{land.name}</h3>
                      <span className="text-xs font-bold text-[#075B35] bg-emerald-100 px-2.5 py-0.5 rounded-full">
                        {land.area} {land.areaUnit}
                      </span>

                      {/* Status Badge */}
                      {isIncomplete ? (
                        <span className="text-[10px] font-bold bg-amber-100 text-amber-900 px-2 py-0.5 rounded-md flex items-center gap-1">
                          <AlertCircle className="w-3 h-3 text-amber-600" />
                          <span>अधूरी जानकारी</span>
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded-md flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          <span>{land.status}</span>
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-gray-500 flex items-center gap-1.5 mt-1 font-medium">
                      <MapPin className="w-3.5 h-3.5 text-gray-400" />
                      <span>{land.village}, {land.district} ({land.state})</span>
                    </p>
                  </div>
                </div>

                {/* Right Context Menu Trigger */}
                <div className="relative">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveMenuLandId(activeMenuLandId === land.id ? null : land.id);
                    }}
                    className="p-1.5 rounded-xl text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
                  >
                    <MoreVertical className="w-4 h-4" />
                  </button>

                  {/* Dropdown Menu */}
                  {activeMenuLandId === land.id && (
                    <div
                      onClick={(e) => e.stopPropagation()}
                      className="absolute right-0 top-full mt-1 w-44 bg-white rounded-2xl shadow-xl border border-gray-100 py-1.5 z-30 animate-in fade-in zoom-in-95"
                    >
                      <button
                        onClick={() => {
                          setActiveMenuLandId(null);
                          navigate(`/land/${land.id}`);
                        }}
                        className="w-full text-left px-3.5 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                      >
                        <Eye className="w-3.5 h-3.5 text-gray-400" />
                        <span>डैशबोर्ड देखें</span>
                      </button>

                      {isIncomplete && (
                        <button
                          onClick={() => {
                            setActiveMenuLandId(null);
                            handleResumeSetup(land);
                          }}
                          className="w-full text-left px-3.5 py-2 text-xs font-bold text-[#087A43] hover:bg-emerald-50 flex items-center gap-2"
                        >
                          <Play className="w-3.5 h-3.5" />
                          <span>प्रक्रिया पूरी करें</span>
                        </button>
                      )}

                      <button
                        onClick={() => {
                          setActiveMenuLandId(null);
                          navigate(`/add-land?resume=${land.id}&step=1`);
                        }}
                        className="w-full text-left px-3.5 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                      >
                        <Edit2 className="w-3.5 h-3.5 text-gray-400" />
                        <span>संपादित करें</span>
                      </button>

                      <div className="h-px bg-gray-100 my-1" />

                      <button
                        onClick={() => {
                          setActiveMenuLandId(null);
                          setLandToDelete(land.id);
                        }}
                        className="w-full text-left px-3.5 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 flex items-center gap-2"
                      >
                        <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                        <span>भूमि हटाएं</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Crop & Progress Strip */}
              <div className="bg-[#FAFBF7] p-3 rounded-2xl border border-gray-100 flex items-center justify-between text-xs">
                <div>
                  <span className="text-[10px] text-gray-400 block font-medium">वर्तमान फसल व सीजन</span>
                  <span className="font-bold text-gray-800">
                    {land.selectedCrop ? land.selectedCrop.nameHi : land.previousCrop} ({land.season === 'kharif' ? 'खरीफ 2024' : 'रबी 2024'})
                  </span>
                </div>

                {isIncomplete ? (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleResumeSetup(land);
                    }}
                    className="px-3.5 py-1.5 bg-[#087A43] hover:bg-[#075B35] text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
                  >
                    <span>पूरा करें</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <div className="text-right">
                    <span className="text-[10px] text-emerald-800 font-bold block">{land.cropProgress}% प्रगति</span>
                    <div className="w-24 bg-gray-200 h-1.5 rounded-full overflow-hidden mt-1">
                      <div className="bg-[#087A43] h-full rounded-full" style={{ width: `${land.cropProgress}%` }} />
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* ================= 9.2 LAND STATUS OPTIONS MODAL ================= */}
      {selectedLandForStatus && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-gray-100 space-y-5">
            <div className="flex items-start justify-between border-b border-gray-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-gray-900">
                  {selectedLandForStatus.name} ({selectedLandForStatus.area} {selectedLandForStatus.areaUnit} | {selectedLandForStatus.village})
                </h3>
                <p className="text-xs text-amber-800 bg-amber-50 px-2 py-0.5 rounded-md inline-block font-semibold mt-1">
                  स्थिति: {selectedLandForStatus.currentStage || 'केवल मूल जानकारी जोड़ी गई है'}
                </p>
              </div>
              <button
                onClick={() => setSelectedLandForStatus(null)}
                className="text-gray-400 hover:text-gray-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Visual Step Progress Tree matching Reference 9.3 */}
            <div className="space-y-2.5 bg-gray-50 p-4 rounded-2xl border border-gray-200 text-xs">
              <p className="font-bold text-gray-700 text-xs uppercase tracking-wider mb-2">
                प्रक्रिया प्रगति (Workflow Progress):
              </p>
              {[
                { title: 'भूमि एवं स्थान विवरण', step: 1, done: true },
                { title: 'मिट्टी रिपोर्ट अपलोड', step: 4, done: selectedLandForStatus.setupStep > 4 },
                { title: 'AI विश्लेषण', step: 5, done: selectedLandForStatus.setupStep > 5 },
                { title: 'सीजन और बजट', step: 6, done: selectedLandForStatus.setupStep > 6 },
                { title: 'फसल सुझाव व चयन', step: 7, done: selectedLandForStatus.setupStep > 7 },
                { title: 'योजना और कार्य कैलेंडर', step: 10, done: selectedLandForStatus.isComplete }
              ].map((s, idx) => {
                const isCurrent = (selectedLandForStatus.setupStep || 1) === s.step;

                return (
                  <div key={idx} className="flex items-center gap-2.5">
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-xs ${
                      s.done
                        ? 'bg-[#087A43] text-white'
                        : isCurrent
                        ? 'bg-amber-400 text-amber-950 ring-2 ring-amber-300'
                        : 'bg-gray-200 text-gray-400'
                    }`}>
                      {s.done ? '✓' : isCurrent ? '⭕' : '•'}
                    </div>
                    <span className={`${s.done ? 'font-semibold text-gray-800' : isCurrent ? 'font-black text-amber-900' : 'text-gray-400'}`}>
                      {s.title}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Big Green Action Button matching Reference 9.2 */}
            <button
              type="button"
              onClick={() => {
                const land = selectedLandForStatus;
                setSelectedLandForStatus(null);
                handleResumeSetup(land);
              }}
              className="w-full py-3.5 px-6 rounded-2xl bg-[#087A43] hover:bg-[#075B35] text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-900/20 cursor-pointer"
            >
              <Play className="w-4 h-4" />
              <span>पूरी प्रक्रिया शुरू करें (Continue Setup)</span>
            </button>

            {/* Secondary actions matching Reference 9.2 */}
            <div className="flex gap-2 pt-1 border-t border-gray-100">
              <button
                type="button"
                onClick={() => {
                  const land = selectedLandForStatus;
                  setSelectedLandForStatus(null);
                  navigate(`/land/${land.id}`);
                }}
                className="flex-1 py-2 rounded-xl border border-gray-200 text-xs font-semibold text-gray-700 hover:bg-gray-50 flex items-center justify-center gap-1.5"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>विवरण देखें</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  const land = selectedLandForStatus;
                  setSelectedLandForStatus(null);
                  navigate(`/add-land?resume=${land.id}&step=1`);
                }}
                className="flex-1 py-2 rounded-xl border border-gray-200 text-xs font-semibold text-gray-700 hover:bg-gray-50 flex items-center justify-center gap-1.5"
              >
                <Edit2 className="w-3.5 h-3.5" />
                <span>संपादित करें</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      <ConfirmationDialog
        isOpen={!!landToDelete}
        title="भूमि हटाएं?"
        message="क्या आप वाकई इस भूमि रिकॉर्ड को हटाना चाहते हैं? इसके स्वतंत्र कार्य और खर्च भी समाप्त हो जाएंगे।"
        confirmLabel="हां, हटाएं"
        cancelLabel="रद्द करें"
        isDestructive
        onConfirm={() => {
          if (landToDelete) {
            deleteLand(landToDelete);
            setLandToDelete(null);
          }
        }}
        onCancel={() => setLandToDelete(null)}
      />
    </div>
  );
};

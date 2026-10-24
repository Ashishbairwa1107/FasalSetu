import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { FileSpreadsheet, Download, CheckCircle2, AlertCircle, ChevronUp, ChevronDown, RefreshCw, X, Shield } from 'lucide-react';

export const ExcelDataStatusBadge: React.FC = () => {
  const { apiConnected, lastExcelSavedAt, downloadExcel, profile, lands } = useApp();
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <>
      {/* Floating Status Pill (bottom-left, unobtrusive) */}
      <div className="fixed bottom-3 left-3 z-30 hidden sm:flex items-center gap-2 bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-full border border-gray-200 shadow-md text-xs">
        <div className="flex items-center gap-1.5 cursor-pointer" onClick={() => setModalOpen(true)}>
          <span className={`w-2.5 h-2.5 rounded-full ${apiConnected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-400'}`} />
          <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-800" />
          <span className="font-semibold text-gray-800">Excel Persistence</span>
          {lastExcelSavedAt && (
            <span className="text-[10px] text-gray-500 border-l border-gray-200 pl-1.5">
              {lastExcelSavedAt}
            </span>
          )}
        </div>

        <button
          onClick={downloadExcel}
          className="ml-1 p-1 rounded-md text-emerald-800 hover:bg-emerald-50 active:scale-95 transition-all cursor-pointer"
          title="Download FasalSetu_Data.xlsx"
        >
          <Download className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Persistence Inspector Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-gray-100 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 rounded-2xl bg-emerald-100 text-[#087A43]">
                  <FileSpreadsheet className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-black text-gray-900">
                    FasalSetu Excel Data Storage
                  </h3>
                  <p className="text-[11px] text-gray-500">
                    Local Structured Workbook Persistence
                  </p>
                </div>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1.5 text-gray-400 hover:text-gray-700 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Status overview */}
            <div className="space-y-3 text-xs">
              <div className={`p-3 rounded-2xl flex items-center justify-between border ${
                apiConnected ? 'bg-emerald-50 border-emerald-200 text-emerald-950' : 'bg-amber-50 border-amber-200 text-amber-950'
              }`}>
                <div className="flex items-center gap-2">
                  {apiConnected ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
                  )}
                  <div>
                    <p className="font-bold">
                      {apiConnected ? 'Local Express API Connected' : 'Connecting to Local Express API'}
                    </p>
                    <p className="text-[10px] opacity-80 font-mono">
                      Target: data/FasalSetu_Data.xlsx
                    </p>
                  </div>
                </div>
                <button
                  onClick={downloadExcel}
                  className="px-3 py-1.5 rounded-xl bg-[#087A43] text-white font-bold text-xs hover:bg-[#075B35] flex items-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download .xlsx</span>
                </button>
              </div>

              {/* 10 Worksheets Overview */}
              <div>
                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                  Active Worksheets (10 Sheets)
                </p>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div className="p-2 bg-gray-50 rounded-xl border border-gray-100 flex items-center justify-between">
                    <span className="font-semibold text-gray-700">1. Farmers</span>
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.2 rounded">1 row</span>
                  </div>
                  <div className="p-2 bg-gray-50 rounded-xl border border-gray-100 flex items-center justify-between">
                    <span className="font-semibold text-gray-700">2. Lands</span>
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.2 rounded">{lands.length} rows</span>
                  </div>
                  <div className="p-2 bg-gray-50 rounded-xl border border-gray-100 flex items-center justify-between">
                    <span className="font-semibold text-gray-700">3. Soil_Reports</span>
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.2 rounded">Active</span>
                  </div>
                  <div className="p-2 bg-gray-50 rounded-xl border border-gray-100 flex items-center justify-between">
                    <span className="font-semibold text-gray-700">4. Crop_Planning</span>
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.2 rounded">Active</span>
                  </div>
                  <div className="p-2 bg-gray-50 rounded-xl border border-gray-100 flex items-center justify-between">
                    <span className="font-semibold text-gray-700">5. Tasks_Calendar</span>
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.2 rounded">Synced</span>
                  </div>
                  <div className="p-2 bg-gray-50 rounded-xl border border-gray-100 flex items-center justify-between">
                    <span className="font-semibold text-gray-700">6. Expenses</span>
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.2 rounded">Synced</span>
                  </div>
                  <div className="p-2 bg-gray-50 rounded-xl border border-gray-100 flex items-center justify-between">
                    <span className="font-semibold text-gray-700">7. Harvest_Profit</span>
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.2 rounded">Synced</span>
                  </div>
                  <div className="p-2 bg-gray-50 rounded-xl border border-gray-100 flex items-center justify-between">
                    <span className="font-semibold text-gray-700">8. Schemes_Mills</span>
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.2 rounded">Active</span>
                  </div>
                  <div className="p-2 bg-gray-50 rounded-xl border border-gray-100 flex items-center justify-between">
                    <span className="font-semibold text-gray-700">9. App_Settings</span>
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.2 rounded">Active</span>
                  </div>
                  <div className="p-2 bg-gray-50 rounded-xl border border-gray-100 flex items-center justify-between">
                    <span className="font-semibold text-gray-700">10. Activity_Log</span>
                    <span className="text-[10px] bg-purple-100 text-purple-800 font-bold px-1.5 py-0.2 rounded">Audited</span>
                  </div>
                </div>
              </div>

              {/* Notice */}
              <div className="p-3 bg-gray-50 rounded-2xl border border-gray-200 text-gray-600 text-[11px] leading-relaxed flex items-start gap-2">
                <Shield className="w-4 h-4 text-gray-500 shrink-0 mt-0.5" />
                <span>
                  <strong>Prototype Storage Notice:</strong> This Excel-based backend is designed for local single-user prototyping. All create, update, and delete actions are serialized and logged with timestamps in <code>Activity_Log</code>.
                </span>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setModalOpen(false)}
                className="px-5 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs rounded-xl transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

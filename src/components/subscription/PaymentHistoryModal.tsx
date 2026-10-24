import React, { useEffect, useState } from 'react';
import { X, Receipt, CheckCircle2, Clock, AlertTriangle, ArrowDownToLine, RefreshCw, Shield } from 'lucide-react';
import { PaymentTransaction } from '../../types';
import { useApp } from '../../context/AppContext';
import { fetchPaymentTransactions } from '../../services/apiService';

interface PaymentHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PaymentHistoryModal: React.FC<PaymentHistoryModalProps> = ({ isOpen, onClose }) => {
  const { profile, language } = useApp();
  const isHindi = language === 'hi' || language === 'cg';

  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState<PaymentTransaction[]>([]);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await fetchPaymentTransactions(profile.id || 'farmer-001');
      if (res.success) {
        setTransactions(res.transactions);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen, profile.id]);

  if (!isOpen) return null;

  const formatDate = (iso?: string) => {
    if (!iso) return '—';
    try {
      const d = new Date(iso);
      return d.toLocaleDateString(isHindi ? 'hi-IN' : 'en-IN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return iso;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-gray-100 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-[#087A43] via-[#075B35] to-[#044326] text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center backdrop-blur-xs">
              <Receipt className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h2 className="text-lg font-bold">
                {isHindi ? 'सदस्यता भुगतान इतिहास' : 'Subscription Payment History'}
              </h2>
              <p className="text-xs text-emerald-100">
                {isHindi ? 'सत्यापित लेन-देन और रसीद विवरण' : 'Verified transactions and receipt records'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={loadData}
              title={isHindi ? 'रिफ्रेश करें' : 'Refresh'}
              className="p-2 hover:bg-white/10 rounded-full text-white/80 hover:text-white transition-colors cursor-pointer"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-full text-white/80 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* List of transactions */}
        <div className="p-6 overflow-y-auto space-y-3 flex-1">
          {loading ? (
            <div className="py-12 text-center text-gray-500 space-y-2">
              <RefreshCw className="w-6 h-6 animate-spin mx-auto text-[#087A43]" />
              <p className="text-xs">{isHindi ? 'लेन-देन लोड हो रहे हैं...' : 'Loading transactions...'}</p>
            </div>
          ) : transactions.length === 0 ? (
            <div className="py-12 text-center text-gray-500 space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto text-gray-400">
                <Receipt className="w-6 h-6" />
              </div>
              <p className="text-sm font-semibold text-gray-700">
                {isHindi ? 'कोई भुगतान रिकॉर्ड नहीं मिला' : 'No payment records found'}
              </p>
              <p className="text-xs text-gray-500 max-w-sm mx-auto">
                {isHindi
                  ? 'जब आप सदस्यता योजना खरीदेंगे, आपके सभी सत्यापित लेन-देन और रसीदें यहाँ दिखाई देंगी।'
                  : 'When you purchase a subscription plan, all verified payment transactions and receipts will appear here.'}
              </p>
            </div>
          ) : (
            transactions.map((txn) => {
              const isSuccess = txn.paymentStatus === 'captured';
              const isPending = txn.paymentStatus === 'created' || txn.paymentStatus === 'authorized';

              return (
                <div
                  key={txn.id}
                  className="bg-[#FAFBF7] border border-[#E5EBE1] hover:border-emerald-300 rounded-2xl p-4 transition-all space-y-2.5"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span
                        className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 ${
                          isSuccess
                            ? 'bg-emerald-100 text-[#087A43]'
                            : isPending
                            ? 'bg-amber-100 text-amber-700'
                            : 'bg-red-100 text-red-700'
                        }`}
                      >
                        {isSuccess ? (
                          <CheckCircle2 className="w-4 h-4" />
                        ) : isPending ? (
                          <Clock className="w-4 h-4" />
                        ) : (
                          <AlertTriangle className="w-4 h-4" />
                        )}
                      </span>
                      <div>
                        <p className="text-xs font-bold text-gray-900">
                          {isSuccess
                            ? (isHindi ? 'भुगतान सफल एवं सत्यापित' : 'Payment Verified & Captured')
                            : isPending
                            ? (isHindi ? 'भुगतान लंबित / प्रक्रियाधीन' : 'Payment Created / Pending')
                            : (isHindi ? 'भुगतान विफल' : 'Payment Failed')}
                        </p>
                        <p className="text-[11px] text-gray-500">{formatDate(txn.createdAt)}</p>
                      </div>
                    </div>

                    <div className="text-right">
                      <p className="text-sm font-black text-gray-900">₹{txn.amount}</p>
                      <span className="text-[10px] uppercase font-bold text-gray-400">
                        {txn.currency || 'INR'}
                      </span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-gray-200/60 grid grid-cols-1 sm:grid-cols-2 gap-1 text-[11px] text-gray-600">
                    <div>
                      <span className="text-gray-400">{isHindi ? 'ऑर्डर आईडी:' : 'Order ID:'} </span>
                      <span className="font-mono text-gray-800 font-medium select-all">{txn.orderId}</span>
                    </div>
                    {txn.paymentId && (
                      <div>
                        <span className="text-gray-400">{isHindi ? 'पेमेंट आईडी:' : 'Payment ID:'} </span>
                        <span className="font-mono text-gray-800 font-medium select-all">{txn.paymentId}</span>
                      </div>
                    )}
                  </div>

                  {txn.errorReason && (
                    <div className="text-[11px] text-red-700 bg-red-50 p-2 rounded-lg">
                      {txn.errorReason}
                    </div>
                  )}
                </div>
              );
            })
          )}

          {/* Security Note */}
          <div className="p-3 bg-gray-50 rounded-2xl border border-gray-100 flex items-center gap-2.5 text-[11px] text-gray-500">
            <Shield className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              {isHindi
                ? 'सुरक्षा गारंटी: फसलसेतु कभी भी आपके कार्ड नंबर, सीवीवी या यूपीआई पिन को स्टोर नहीं करता।'
                : 'Security Guarantee: FasalSetu never stores card numbers, CVVs, or UPI PINs.'}
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 bg-[#087A43] hover:bg-[#075B35] text-white text-xs font-bold rounded-xl transition-all cursor-pointer shadow-xs"
          >
            {isHindi ? 'बंद करें' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
};

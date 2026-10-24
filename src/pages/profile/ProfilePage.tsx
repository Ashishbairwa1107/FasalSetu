import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { StateDistrictDropdowns } from '../../components/common/StateDistrictDropdowns';
import { PageHeaderNav } from '../../components/common/PageHeaderNav';
import { t } from '../../utils/translations';
import {
  User,
  Phone,
  Mail,
  MapPin,
  Tractor,
  Calendar,
  Save,
  CheckCircle2,
  Camera,
  Globe
} from 'lucide-react';

export const ProfilePage: React.FC = () => {
  const { profile, updateProfile, language } = useApp();
  const isHindi = language === 'hi' || language === 'cg';

  const [name, setName] = useState(profile.name);
  const [mobile, setMobile] = useState(profile.mobile);
  const [email, setEmail] = useState(profile.email);
  const [village, setVillage] = useState(profile.village);
  const [district, setDistrict] = useState(profile.district);
  const [state, setState] = useState(profile.state);
  const [totalAcres, setTotalAcres] = useState(profile.totalAcres);
  const [avatarUrl, setAvatarUrl] = useState(profile.avatarUrl);

  const avatarOptions = [
    'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&q=80&w=256',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=256',
    'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=256',
    'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=256'
  ];

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({
      name,
      mobile,
      email,
      village,
      district,
      state,
      totalAcres,
      avatarUrl
    });
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in duration-200">
      {/* Global Back Navigation & Dashboard Shortcut */}
      <PageHeaderNav fallbackPath="/" />

      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2">
          <User className="w-7 h-7 text-[#087A43]" />
          <span>{isHindi ? 'मेरी किसान प्रोफ़ाइल' : 'Farmer Profile'}</span>
        </h1>
        <p className="text-xs text-gray-500 mt-1">
          अपना व्यक्तिगत एवं कृषि विवरण देखें और अपडेट करें
        </p>
      </div>

      <form onSubmit={handleSave} className="bg-white p-6 rounded-3xl border border-[#E5EBE1] shadow-2xs space-y-6">
        {/* Avatar Section */}
        <div className="flex flex-col sm:flex-row items-center gap-4 border-b border-gray-100 pb-5">
          <img
            src={avatarUrl}
            alt={name}
            className="w-20 h-20 rounded-full object-cover ring-4 ring-emerald-500/30 shadow-md"
          />
          <div className="text-center sm:text-left space-y-2">
            <h3 className="text-sm font-bold text-gray-800">प्रोफाइल फोटो बदलें</h3>
            <div className="flex items-center gap-2 justify-center sm:justify-start">
              {avatarOptions.map((url, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setAvatarUrl(url)}
                  className={`w-9 h-9 rounded-full overflow-hidden border-2 transition-transform ${
                    avatarUrl === url ? 'border-[#087A43] scale-110 shadow' : 'border-gray-200 opacity-60'
                  }`}
                >
                  <img src={url} alt="Option" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Input Fields */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">पूरा नाम *</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-gray-300 focus:outline-hidden focus:border-[#087A43]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">मोबाइल नंबर *</label>
            <input
              type="text"
              required
              value={mobile}
              onChange={(e) => setMobile(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-gray-300 focus:outline-hidden focus:border-[#087A43]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">ईमेल पता</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-gray-300 focus:outline-hidden focus:border-[#087A43]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">कुल कृषि रकबा (एकड़)</label>
            <input
              type="number"
              step="0.1"
              value={totalAcres}
              onChange={(e) => setTotalAcres(parseFloat(e.target.value) || 0)}
              className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-gray-300 focus:outline-hidden focus:border-[#087A43]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">गाँव / कस्बा</label>
            <input
              type="text"
              value={village}
              onChange={(e) => setVillage(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-gray-300 focus:outline-hidden focus:border-[#087A43]"
            />
          </div>

          <div className="sm:col-span-2">
            <StateDistrictDropdowns
              selectedState={state}
              selectedDistrict={district}
              onStateChange={setState}
              onDistrictChange={setDistrict}
              stateLabel={t('state', language)}
              districtLabel={t('district', language)}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">पंजीकरण तिथि</label>
            <input
              type="text"
              disabled
              value={profile.joinedDate}
              className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-gray-200 bg-gray-50 text-gray-500 cursor-not-allowed"
            />
          </div>
        </div>

        {/* Submit */}
        <div className="pt-3 border-t border-gray-100 flex justify-end">
          <button
            type="submit"
            className="px-6 py-2.5 bg-[#087A43] hover:bg-[#075B35] text-white text-xs font-bold rounded-2xl flex items-center gap-2 shadow-sm transition-all cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>प्रोफ़ाइल सुरक्षित करें</span>
          </button>
        </div>
      </form>
    </div>
  );
};

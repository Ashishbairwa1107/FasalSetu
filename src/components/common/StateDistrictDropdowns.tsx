import React, { useMemo } from 'react';
import { ChevronDown, MapPin } from 'lucide-react';
import { INDIAN_STATES, findStateByName, formatStateLabel, formatDistrictLabel, cleanLocationLabel } from '../../data/indianLocations';
import { useApp } from '../../context/AppContext';
import { Language } from '../../types';

interface StateDistrictDropdownsProps {
  selectedState: string;
  selectedDistrict: string;
  onStateChange: (state: string) => void;
  onDistrictChange: (district: string) => void;
  className?: string;
  stateLabel?: string;
  districtLabel?: string;
  disabled?: boolean;
  language?: Language;
}

export const StateDistrictDropdowns: React.FC<StateDistrictDropdownsProps> = ({
  selectedState,
  selectedDistrict,
  onStateChange,
  onDistrictChange,
  className = '',
  stateLabel = 'राज्य',
  districtLabel = 'जिला',
  disabled = false,
  language: propLanguage
}) => {
  const { language: contextLanguage } = useApp();
  const activeLanguage = propLanguage || contextLanguage || 'hi';

  // Find current active state object
  const currentStateObj = useMemo(() => {
    return findStateByName(selectedState) || INDIAN_STATES[0];
  }, [selectedState]);

  // Clean values for comparison
  const cleanSelectedDistrict = useMemo(() => {
    return cleanLocationLabel(selectedDistrict, activeLanguage);
  }, [selectedDistrict, activeLanguage]);

  // Handle state change with auto-reset or adaptation of district
  const handleStateSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStateId = e.target.value;
    const foundState = INDIAN_STATES.find(s => s.id === newStateId);
    if (!foundState) return;

    const formattedState = formatStateLabel(foundState, activeLanguage);
    onStateChange(formattedState);

    // Check if current district is part of the new state
    const districtExistsInNewState = foundState.districts.some(d => {
      const dLabel = formatDistrictLabel(d, activeLanguage);
      return (
        cleanSelectedDistrict.toLowerCase() === d.nameHi.toLowerCase() ||
        cleanSelectedDistrict.toLowerCase() === d.nameEn.toLowerCase() ||
        dLabel.toLowerCase() === cleanSelectedDistrict.toLowerCase()
      );
    });

    if (!districtExistsInNewState) {
      if (foundState.districts.length > 0) {
        onDistrictChange(formatDistrictLabel(foundState.districts[0], activeLanguage));
      } else {
        onDistrictChange('');
      }
    }
  };

  const handleDistrictSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onDistrictChange(e.target.value);
  };

  return (
    <div className={`grid grid-cols-2 gap-3 ${className}`}>
      {/* 1. District Dropdown (Left side as in reference screenshot) */}
      <div>
        <label className="block text-xs font-semibold text-gray-700 mb-1">
          {districtLabel}
        </label>
        <div className="relative">
          <select
            disabled={disabled}
            value={cleanSelectedDistrict}
            onChange={handleDistrictSelect}
            className="w-full appearance-none px-3.5 py-2.5 text-xs sm:text-sm font-medium text-gray-900 bg-white rounded-xl border border-gray-300 hover:border-gray-400 focus:outline-hidden focus:border-[#087A43] focus:ring-2 focus:ring-[#087A43]/20 transition-all cursor-pointer pr-9 truncate disabled:opacity-50 disabled:cursor-not-allowed shadow-2xs"
          >
            {currentStateObj.districts.map(d => {
              const label = formatDistrictLabel(d, activeLanguage);
              return (
                <option key={d.id} value={label}>
                  {label}
                </option>
              );
            })}
          </select>
          <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
            <ChevronDown className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* 2. State Dropdown (Right side as in reference screenshot) */}
      <div>
        <label className="block text-xs font-semibold text-gray-700 mb-1">
          {stateLabel}
        </label>
        <div className="relative">
          <select
            disabled={disabled}
            value={currentStateObj.id}
            onChange={handleStateSelect}
            className="w-full appearance-none px-3.5 py-2.5 text-xs sm:text-sm font-medium text-gray-900 bg-white rounded-xl border border-gray-300 hover:border-gray-400 focus:outline-hidden focus:border-[#087A43] focus:ring-2 focus:ring-[#087A43]/20 transition-all cursor-pointer pr-9 truncate disabled:opacity-50 disabled:cursor-not-allowed shadow-2xs"
          >
            {INDIAN_STATES.map(s => {
              const label = formatStateLabel(s, activeLanguage);
              return (
                <option key={s.id} value={s.id}>
                  {label}
                </option>
              );
            })}
          </select>
          <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
            <ChevronDown className="w-4 h-4" />
          </div>
        </div>
      </div>
    </div>
  );
};

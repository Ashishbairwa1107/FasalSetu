/**
 * FasalSetu Regional Agricultural Season Calendar Engine
 * Configures farming season dates according to Indian state / regional agro-climatic zones.
 */

export type SeasonId = 'kharif' | 'rabi' | 'zaid';

export interface SeasonInfo {
  id: SeasonId;
  nameEn: string;
  nameHi: string;
  icon: string;
  descriptionEn: string;
  descriptionHi: string;
  typicalCropsEn: string[];
  typicalCropsHi: string[];
}

export const SEASONS_CATALOG: Record<SeasonId, SeasonInfo> = {
  kharif: {
    id: 'kharif',
    nameEn: 'Kharif Season',
    nameHi: 'खरीफ मौसम (मानसून फसल)',
    icon: '🌾',
    descriptionEn: 'Monsoon sowing to autumn harvest (Paddy, Soybean, Maize, Cotton)',
    descriptionHi: 'मानसून बुवाई से शरद कटाई (धान, सोयाबीन, मक्का, कपास)',
    typicalCropsEn: ['Paddy', 'Soybean', 'Maize', 'Cotton', 'Arhar / Tur', 'Groundnut'],
    typicalCropsHi: ['धान', 'सोयाबीन', 'मक्का', 'कपास', 'अरहर (तूर)', 'मूंगफली']
  },
  rabi: {
    id: 'rabi',
    nameEn: 'Rabi Season',
    nameHi: 'रबी मौसम (शीतकालीन फसल)',
    icon: '☀️',
    descriptionEn: 'Winter sowing to spring harvest (Wheat, Mustard, Gram, Potato)',
    descriptionHi: 'सर्दियों की बुवाई से वसंत कटाई (गेहूं, सरसों, चना, आलू)',
    typicalCropsEn: ['Wheat', 'Mustard', 'Gram / Chana', 'Barley', 'Potato', 'Peas'],
    typicalCropsHi: ['गेहूं', 'सरसों', 'चना', 'जौ', 'आलू', 'मटर']
  },
  zaid: {
    id: 'zaid',
    nameEn: 'Zaid Season',
    nameHi: 'जायद मौसम (ग्रीष्मकालीन फसल)',
    icon: '💧',
    descriptionEn: 'Spring sowing to pre-monsoon summer harvest (Moong, Urad, Vegetables)',
    descriptionHi: 'गर्मी की बुवाई से मानसून-पूर्व कटाई (मूंग, उड़द, सब्जियां, तरबूज)',
    typicalCropsEn: ['Summer Moong', 'Urad', 'Watermelon', 'Cucumber', 'Fodder', 'Vegetables'],
    typicalCropsHi: ['गर्मी की मूंग', 'उड़द', 'तरबूज', 'खीरा / ककड़ी', 'चारा फसलें', 'सब्जियां']
  }
};

/**
 * Regional season timing configurations across Indian agro-climatic zones.
 * Dates are represented as [startMonth (1-12), startDay, endMonth (1-12), endDay, endsNextYear (boolean)].
 */
interface RegionalSchedule {
  kharif: { startMonth: number; startDay: number; endMonth: number; endDay: number; endsNextYear: boolean };
  rabi: { startMonth: number; startDay: number; endMonth: number; endDay: number; endsNextYear: boolean };
  zaid: { startMonth: number; startDay: number; endMonth: number; endDay: number; endsNextYear: boolean };
}

const REGIONAL_SCHEDULES: Record<string, RegionalSchedule> = {
  // Central & Northern (Chhattisgarh, MP, UP, Bihar, Punjab, Haryana, Rajasthan)
  central_north: {
    kharif: { startMonth: 6, startDay: 15, endMonth: 11, endDay: 15, endsNextYear: false }, // 15 Jun - 15 Nov
    rabi: { startMonth: 10, startDay: 15, endMonth: 4, endDay: 15, endsNextYear: true },    // 15 Oct - 15 Apr (next yr)
    zaid: { startMonth: 3, startDay: 1, endMonth: 6, endDay: 30, endsNextYear: false }      // 01 Mar - 30 Jun
  },
  // Southern (Tamil Nadu, Andhra Pradesh, Telangana, Karnataka, Kerala)
  south: {
    kharif: { startMonth: 6, startDay: 1, endMonth: 12, endDay: 31, endsNextYear: false },  // 01 Jun - 31 Dec (Samba/Kuruvai)
    rabi: { startMonth: 10, startDay: 1, endMonth: 3, endDay: 31, endsNextYear: true },     // 01 Oct - 31 Mar (Navarai)
    zaid: { startMonth: 2, startDay: 15, endMonth: 5, endDay: 31, endsNextYear: false }     // 15 Feb - 31 May
  },
  // Western (Maharashtra, Gujarat)
  west: {
    kharif: { startMonth: 6, startDay: 15, endMonth: 11, endDay: 30, endsNextYear: false }, // 15 Jun - 30 Nov
    rabi: { startMonth: 10, startDay: 15, endMonth: 3, endDay: 31, endsNextYear: true },    // 15 Oct - 31 Mar
    zaid: { startMonth: 2, startDay: 15, endMonth: 6, endDay: 15, endsNextYear: false }     // 15 Feb - 15 Jun
  },
  // Eastern & NE (West Bengal, Odisha, Assam, Jharkhand)
  east: {
    kharif: { startMonth: 6, startDay: 1, endMonth: 12, endDay: 15, endsNextYear: false },  // 01 Jun - 15 Dec (Aman)
    rabi: { startMonth: 11, startDay: 1, endMonth: 4, endDay: 30, endsNextYear: true },     // 01 Nov - 30 Apr (Boro)
    zaid: { startMonth: 3, startDay: 15, endMonth: 6, endDay: 30, endsNextYear: false }     // 15 Mar - 30 Jun (Aus)
  }
};

/**
 * Identify the agro-climatic region key for a given state name
 */
export function getRegionKeyForState(stateName?: string): string {
  if (!stateName) return 'central_north';
  const s = stateName.toLowerCase();

  if (s.includes('tamil') || s.includes('andhra') || s.includes('telangana') || s.includes('karnataka') || s.includes('kerala')) {
    return 'south';
  }
  if (s.includes('maharashtra') || s.includes('gujarat') || s.includes('goa')) {
    return 'west';
  }
  if (s.includes('bengal') || s.includes('odisha') || s.includes('orissa') || s.includes('assam') || s.includes('tripura') || s.includes('jharkhand')) {
    return 'east';
  }
  // Default to central & north (Chhattisgarh, MP, UP, Punjab, Haryana, Rajasthan, etc.)
  return 'central_north';
}

export interface SeasonValiditySchedule {
  seasonId: SeasonId;
  seasonNameEn: string;
  seasonNameHi: string;
  icon: string;
  agriYear: string;
  startDate: string; // ISO
  endDate: string;   // ISO
  displayRangeEn: string;
  displayRangeHi: string;
  totalDays: number;
  daysRemaining: number;
  isCurrentlyActive: boolean;
  isUpcoming: boolean;
  hasExpired: boolean;
  regionName: string;
}

/**
 * Calculates accurate start and end validity dates for a specific season, state, and agricultural year
 */
export function calculateSeasonValidity(
  seasonId: SeasonId,
  stateName: string = 'Chhattisgarh',
  agriYear: string = '2026-27',
  currentDate: Date = new Date()
): SeasonValiditySchedule {
  const regionKey = getRegionKeyForState(stateName);
  const sched = REGIONAL_SCHEDULES[regionKey] || REGIONAL_SCHEDULES.central_north;
  const timing = sched[seasonId];
  const info = SEASONS_CATALOG[seasonId];

  // Parse start year from agriYear (e.g., '2026-27' or '2026' -> 2026)
  const baseYear = parseInt(agriYear.split('-')[0], 10) || currentDate.getFullYear();

  let startYear = baseYear;
  let endYear = timing.endsNextYear ? baseYear + 1 : baseYear;

  // For Zaid in an agricultural year like 2026-27, it falls in Spring 2027
  if (seasonId === 'zaid' && agriYear.includes('-')) {
    startYear = baseYear + 1;
    endYear = baseYear + 1;
  }

  const startDateObj = new Date(Date.UTC(startYear, timing.startMonth - 1, timing.startDay, 0, 0, 0));
  const endDateObj = new Date(Date.UTC(endYear, timing.endMonth - 1, timing.endDay, 23, 59, 59));

  const totalTime = endDateObj.getTime() - startDateObj.getTime();
  const totalDays = Math.ceil(totalTime / (1000 * 60 * 60 * 24));

  const nowMs = currentDate.getTime();
  const diffTime = endDateObj.getTime() - nowMs;
  const daysRemaining = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));

  const isCurrentlyActive = nowMs >= startDateObj.getTime() && nowMs <= endDateObj.getTime();
  const isUpcoming = nowMs < startDateObj.getTime();
  const hasExpired = nowMs > endDateObj.getTime();

  const monthNamesEn = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const monthNamesHi = ['जनवरी', 'फरवरी', 'मार्च', 'अप्रैल', 'मई', 'जून', 'जुलाई', 'अगस्त', 'सितंबर', 'अक्टूबर', 'नवंबर', 'दिसंबर'];

  const startFormattedEn = `${timing.startDay} ${monthNamesEn[timing.startMonth - 1]} ${startYear}`;
  const endFormattedEn = `${timing.endDay} ${monthNamesEn[timing.endMonth - 1]} ${endYear}`;

  const startFormattedHi = `${timing.startDay} ${monthNamesHi[timing.startMonth - 1]} ${startYear}`;
  const endFormattedHi = `${timing.endDay} ${monthNamesHi[timing.endMonth - 1]} ${endYear}`;

  const regionLabels: Record<string, string> = {
    central_north: 'मध्य एवं उत्तर भारत कृषि कैलेंडर',
    south: 'दक्षिण भारत कृषि कैलेंडर',
    west: 'पश्चिम भारत कृषि कैलेंडर',
    east: 'पूर्वी भारत कृषि कैलेंडर'
  };

  return {
    seasonId,
    seasonNameEn: info.nameEn,
    seasonNameHi: info.nameHi,
    icon: info.icon,
    agriYear,
    startDate: startDateObj.toISOString(),
    endDate: endDateObj.toISOString(),
    displayRangeEn: `${startFormattedEn} – ${endFormattedEn}`,
    displayRangeHi: `${startFormattedHi} से ${endFormattedHi}`,
    totalDays,
    daysRemaining,
    isCurrentlyActive,
    isUpcoming,
    hasExpired,
    regionName: regionLabels[regionKey] || 'राज्य कृषि कैलेंडर'
  };
}

/**
 * Returns available farming season choices for the farmer's state (Active, Upcoming, and Next Season)
 */
export function getSelectableSeasonsForState(stateName: string = 'Chhattisgarh', currentDate: Date = new Date()): SeasonValiditySchedule[] {
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth() + 1; // 1-12

  // Determine current agricultural cycle (June to May)
  const currentAgriYear = currentMonth >= 6 ? `${currentYear}-${(currentYear + 1).toString().slice(-2)}` : `${currentYear - 1}-${currentYear.toString().slice(-2)}`;
  const nextAgriYear = currentMonth >= 6 ? `${currentYear + 1}-${(currentYear + 2).toString().slice(-2)}` : `${currentYear}-${(currentYear + 1).toString().slice(-2)}`;

  const candidates: { seasonId: SeasonId; agriYear: string }[] = [];

  // In October (Month 10):
  // Rabi 2026-27 is starting/active (Winter)
  // Kharif 2026 is harvest/ending
  // Zaid 2027 is upcoming summer
  candidates.push({ seasonId: 'rabi', agriYear: currentAgriYear });
  candidates.push({ seasonId: 'zaid', agriYear: currentAgriYear });
  candidates.push({ seasonId: 'kharif', agriYear: currentAgriYear });
  candidates.push({ seasonId: 'kharif', agriYear: nextAgriYear });

  const list = candidates.map(c => calculateSeasonValidity(c.seasonId, stateName, c.agriYear, currentDate));

  // Sort so currently active or upcoming seasons appear first
  return list.sort((a, b) => {
    if (a.isCurrentlyActive && !b.isCurrentlyActive) return -1;
    if (!a.isCurrentlyActive && b.isCurrentlyActive) return 1;
    return new Date(a.startDate).getTime() - new Date(b.startDate).getTime();
  });
}

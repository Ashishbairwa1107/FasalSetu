/**
 * Backend Agro-Climatic Regional Season Calendar Engine for FasalSetu
 */

export const SEASONS_CATALOG = {
  kharif: {
    id: 'kharif',
    nameEn: 'Kharif Season',
    nameHi: 'खरीफ मौसम (मानसून फसल)',
    icon: '🌾'
  },
  rabi: {
    id: 'rabi',
    nameEn: 'Rabi Season',
    nameHi: 'रबी मौसम (शीतकालीन फसल)',
    icon: '☀️'
  },
  zaid: {
    id: 'zaid',
    nameEn: 'Zaid Season',
    nameHi: 'जायद मौसम (ग्रीष्मकालीन फसल)',
    icon: '💧'
  }
};

const REGIONAL_SCHEDULES = {
  // Central & Northern (Chhattisgarh, MP, UP, Bihar, Punjab, Haryana, Rajasthan)
  central_north: {
    kharif: { startMonth: 6, startDay: 15, endMonth: 11, endDay: 15, endsNextYear: false }, // 15 Jun - 15 Nov
    rabi: { startMonth: 10, startDay: 15, endMonth: 4, endDay: 15, endsNextYear: true },    // 15 Oct - 15 Apr (next yr)
    zaid: { startMonth: 3, startDay: 1, endMonth: 6, endDay: 30, endsNextYear: false }      // 01 Mar - 30 Jun
  },
  // Southern (Tamil Nadu, Andhra Pradesh, Telangana, Karnataka, Kerala)
  south: {
    kharif: { startMonth: 6, startDay: 1, endMonth: 12, endDay: 31, endsNextYear: false },  // 01 Jun - 31 Dec
    rabi: { startMonth: 10, startDay: 1, endMonth: 3, endDay: 31, endsNextYear: true },     // 01 Oct - 31 Mar
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
    kharif: { startMonth: 6, startDay: 1, endMonth: 12, endDay: 15, endsNextYear: false },  // 01 Jun - 15 Dec
    rabi: { startMonth: 11, startDay: 1, endMonth: 4, endDay: 30, endsNextYear: true },     // 01 Nov - 30 Apr
    zaid: { startMonth: 3, startDay: 15, endMonth: 6, endDay: 30, endsNextYear: false }     // 15 Mar - 30 Jun
  }
};

export function getRegionKeyForState(stateName) {
  if (!stateName) return 'central_north';
  const s = String(stateName).toLowerCase();

  if (s.includes('tamil') || s.includes('andhra') || s.includes('telangana') || s.includes('karnataka') || s.includes('kerala')) {
    return 'south';
  }
  if (s.includes('maharashtra') || s.includes('gujarat') || s.includes('goa')) {
    return 'west';
  }
  if (s.includes('bengal') || s.includes('odisha') || s.includes('orissa') || s.includes('assam') || s.includes('tripura') || s.includes('jharkhand')) {
    return 'east';
  }
  return 'central_north';
}

export function calculateSeasonDates(seasonId = 'rabi', stateName = 'Chhattisgarh', agriYear = '2026-27', currentDate = new Date()) {
  const regionKey = getRegionKeyForState(stateName);
  const sched = REGIONAL_SCHEDULES[regionKey] || REGIONAL_SCHEDULES.central_north;
  const timing = sched[seasonId] || sched.rabi;
  const info = SEASONS_CATALOG[seasonId] || SEASONS_CATALOG.rabi;

  const baseYear = parseInt(String(agriYear).split('-')[0], 10) || currentDate.getFullYear();
  let startYear = baseYear;
  let endYear = timing.endsNextYear ? baseYear + 1 : baseYear;

  if (seasonId === 'zaid' && String(agriYear).includes('-')) {
    startYear = baseYear + 1;
    endYear = baseYear + 1;
  }

  const startDateObj = new Date(Date.UTC(startYear, timing.startMonth - 1, timing.startDay, 0, 0, 0));
  const endDateObj = new Date(Date.UTC(endYear, timing.endMonth - 1, timing.endDay, 23, 59, 59));

  const nowMs = currentDate.getTime();
  const diffTime = endDateObj.getTime() - nowMs;
  const daysRemaining = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
  const isCurrentlyActive = nowMs >= startDateObj.getTime() && nowMs <= endDateObj.getTime();
  const hasExpired = nowMs > endDateObj.getTime();

  return {
    seasonId,
    seasonNameEn: info.nameEn,
    seasonNameHi: info.nameHi,
    icon: info.icon,
    agriYear,
    startDate: startDateObj.toISOString(),
    expiryDate: endDateObj.toISOString(),
    daysRemaining,
    isCurrentlyActive,
    hasExpired
  };
}

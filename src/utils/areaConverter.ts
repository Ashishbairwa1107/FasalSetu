export type LandAreaUnit = 'acre' | 'hectare' | 'bigha' | 'sqft' | 'sqm' | 'kattha' | 'gaj';

export interface AreaUnitOption {
  id: LandAreaUnit;
  labelHi: string;
  labelEn: string;
  toSquareMeters: number; // multiplier to convert 1 unit to m²
}

export const AREA_UNITS: AreaUnitOption[] = [
  { id: 'acre', labelHi: 'एकड़', labelEn: 'Acre', toSquareMeters: 4046.86 },
  { id: 'hectare', labelHi: 'हेक्टेयर', labelEn: 'Hectare', toSquareMeters: 10000 },
  { id: 'bigha', labelHi: 'बीघा', labelEn: 'Bigha', toSquareMeters: 2529.29 }, // Standard central India bigha (~0.625 acre)
  { id: 'kattha', labelHi: 'कट्ठा', labelEn: 'Kattha', toSquareMeters: 126.46 },
  { id: 'gaj', labelHi: 'गज', labelEn: 'Gaj (Sq. Yard)', toSquareMeters: 0.836127 },
  { id: 'sqft', labelHi: 'sq.ft', labelEn: 'Sq. Feet', toSquareMeters: 0.092903 },
  { id: 'sqm', labelHi: 'm²', labelEn: 'Sq. Meter', toSquareMeters: 1 }
];

export interface ConvertedAreaSummary {
  sqm: number;
  hectare: number;
  acre: number;
  sqft: number;
  bigha: number;
}

export function convertArea(amount: number, fromUnit: LandAreaUnit): ConvertedAreaSummary {
  const unitDef = AREA_UNITS.find(u => u.id === fromUnit) || AREA_UNITS[0];
  const inSqm = amount * unitDef.toSquareMeters;

  return {
    sqm: Number(inSqm.toFixed(1)),
    hectare: Number((inSqm / 10000).toFixed(3)),
    acre: Number((inSqm / 4046.86).toFixed(2)),
    sqft: Number((inSqm / 0.092903).toFixed(1)),
    bigha: Number((inSqm / 2529.29).toFixed(2))
  };
}

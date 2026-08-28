export interface ISoilProfile {
  soilType: string;
  ph: number;
  nitrogenLevel: string;
  phosphorusLevel: string;
  potassiumLevel: string;
  organicCarbonPercent: number;
  moisturePercent: number;
  drainageRate: string;
  recommendedAmendments: string[];
}

export class SoilService {
  /**
   * Analyze soil type and return geochemical health metrics
   */
  static getSoilProfile(soilType: string, waterAvailability?: string): ISoilProfile {
    const normSoil = (soilType || 'Red Soil').toLowerCase();

    if (normSoil.includes('black') || normSoil.includes('clay')) {
      return {
        soilType: 'Black Clay Soil',
        ph: 7.6,
        nitrogenLevel: 'Medium (310 kg/ha)',
        phosphorusLevel: 'Medium (18 kg/ha)',
        potassiumLevel: 'High (420 kg/ha)',
        organicCarbonPercent: 0.68,
        moisturePercent: 38,
        drainageRate: 'Moderate to Slow',
        recommendedAmendments: ['Gypsum for aeration', 'Zinc Sulphate', 'Farmyard manure (5 t/ha)'],
      };
    }

    if (normSoil.includes('alluvial') || normSoil.includes('loam')) {
      return {
        soilType: 'Alluvial Loam',
        ph: 6.9,
        nitrogenLevel: 'High (380 kg/ha)',
        phosphorusLevel: 'High (24 kg/ha)',
        potassiumLevel: 'High (390 kg/ha)',
        organicCarbonPercent: 0.85,
        moisturePercent: 44,
        drainageRate: 'Excellent',
        recommendedAmendments: ['Azospirillum bio-fertilizer', 'Vermicompost (2 t/ha)'],
      };
    }

    // Default Red / Sandy Loam
    return {
      soilType: 'Red Loam Soil',
      ph: 6.5,
      nitrogenLevel: 'Low to Medium (240 kg/ha)',
      phosphorusLevel: 'Medium (16 kg/ha)',
      potassiumLevel: 'Medium (280 kg/ha)',
      organicCarbonPercent: 0.52,
      moisturePercent: 32,
      drainageRate: 'Good / Well Drained',
      recommendedAmendments: ['Phospho-bacteria', 'Cow dung manure (8 t/ha)', 'Dolomite for pH balance'],
    };
  }
}

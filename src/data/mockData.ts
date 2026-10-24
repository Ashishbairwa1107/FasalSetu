import {
  FarmerProfile,
  FarmField,
  CropCalendarTask,
  MandiRecord,
  ExpenseRecord,
  GovtScheme,
  CommunityPost,
  KrishiAlert,
  WeatherData,
  NewsArticle,
  CropDiagnosis
} from '../types';

export const DEFAULT_FARMER_PROFILE: FarmerProfile = {
  id: 'farmer-001',
  name: 'राम कुमार वर्मा',
  mobile: '+91 98765 43210',
  email: 'ramkumar.verma@fasalsetu.in',
  village: 'आरंग',
  district: 'रायपुर',
  state: 'छत्तीसगढ़',
  language: 'hi',
  landholdingCategory: 'small',
  totalAcres: 4.5,
  avatarUrl: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&q=80&w=256',
  joinedDate: '15 जून 2024'
};

export const INITIAL_FARMS: FarmField[] = [
  {
    id: 'farm-01',
    name: 'बड़ा खेत',
    area: 2.5,
    areaUnit: 'Acres',
    location: 'आरंग रोड, खसरा नं. 142',
    soilType: 'Black / काली मिट्टी',
    irrigationType: 'Tube well / नलकूप',
    currentCrop: 'धान - IR 64',
    cropVariety: 'IR-64 Sugandh',
    sowingDate: '2024-07-12',
    expectedHarvestDate: '2024-11-15',
    growthStage: 'flowering',
    healthScore: 92,
    lastInspected: '2024-10-18',
    notes: 'कंसुआ चरण में है। 2 दिन बाद पोटाश का छिड़काव प्रस्तावित है।'
  },
  {
    id: 'farm-02',
    name: 'नहर वाला खेत',
    area: 2.0,
    areaUnit: 'Acres',
    location: 'महानदी नहर किनारा, खसरा नं. 89',
    soilType: 'Alluvial / जलोढ़',
    irrigationType: 'Canal / नहर',
    currentCrop: 'सोयाबीन - JS 20-34',
    cropVariety: 'JS-20-34 High Yield',
    sowingDate: '2024-07-20',
    expectedHarvestDate: '2024-10-28',
    growthStage: 'grain_filling',
    healthScore: 86,
    lastInspected: '2024-10-17',
    notes: 'फलियां भर रही हैं। इल्ली की निगरानी लगातार जारी है।'
  }
];

export const INITIAL_CALENDAR_TASKS: CropCalendarTask[] = [
  {
    id: 'task-101',
    farmId: 'land-01',
    cropName: 'धान',
    title: 'पोटाश व यूरिया का दूसरा छिड़काव',
    titleHi: 'पोटाश व यूरिया का दूसरा छिड़काव',
    description: 'बालियां निकलने के समय प्रति एकड़ 15 किग्रा पोटाश और 20 किग्रा यूरिया डालें।',
    descriptionHi: 'बालियां निकलने के समय प्रति एकड़ 15 किग्रा पोटाश और 20 किग्रा यूरिया डालें।',
    category: 'fertilizer',
    weekNumber: 14,
    dueDate: '2024-10-21',
    priority: 'high',
    status: 'pending',
    weatherDependent: true,
    weatherAdvice: 'तेज हवा या बारिश की संभावना न हो तभी छिड़काव करें।',
    weatherAdviceHi: 'तेज हवा या बारिश की संभावना न हो तभी छिड़काव करें।'
  },
  {
    id: 'task-102',
    farmId: 'land-01',
    cropName: 'धान',
    title: 'तना छेदक कीट निगरानी',
    titleHi: 'तना छेदक कीट निगरानी',
    description: 'खेत में फेरोमोन ट्रैप की जांच करें और तितलियों की संख्या दर्ज करें।',
    descriptionHi: 'खेत में फेरोमोन ट्रैप की जांच करें और तितलियों की संख्या दर्ज करें।',
    category: 'pest_control',
    weekNumber: 14,
    dueDate: '2024-10-22',
    priority: 'medium',
    status: 'pending',
    weatherDependent: false
  },
  {
    id: 'task-103',
    farmId: 'land-03',
    cropName: 'सोयाबीन',
    title: 'अंतिम सिंचाई व जल निकासी जांच',
    titleHi: 'अंतिम सिंचाई व जल निकासी जांच',
    description: 'दाने भरने की इस अवस्था में खेत में हल्की नमी बनी रहनी चाहिए।',
    descriptionHi: 'दाने भरने की इस अवस्था में खेत में हल्की नमी बनी रहनी चाहिए।',
    category: 'irrigation',
    weekNumber: 13,
    dueDate: '2024-10-24',
    priority: 'high',
    status: 'pending',
    weatherDependent: true,
    weatherAdvice: 'मौसम शुष्क रहने पर ही नहर का पानी खोलें।',
    weatherAdviceHi: 'मौसम शुष्क रहने पर ही नहर का पानी खोलें।'
  },
  {
    id: 'task-104',
    farmId: 'land-01',
    cropName: 'धान',
    title: 'खेत की मेड़ों की खरपतवार सफाई',
    titleHi: 'खेत की मेड़ों की खरपतवार सफाई',
    description: 'मेड़ों पर उग रहे खरपतवार काटें ताकि चूहों और कीटों का आश्रय समाप्त हो सके।',
    descriptionHi: 'मेड़ों पर उग रहे खरपतवार काटें ताकि चूहों और कीटों का आश्रय समाप्त हो सके।',
    category: 'weeding',
    weekNumber: 13,
    dueDate: '2024-10-15',
    priority: 'low',
    status: 'completed'
  },
  {
    id: 'task-105',
    farmId: 'land-03',
    cropName: 'सोयाबीन',
    title: 'हार्वेस्टर की अग्रिम बुकिंग',
    titleHi: 'हार्वेस्टर की अग्रिम बुकिंग',
    description: 'फसल पकने की तारीख 28 अक्टूबर के लिए कंबाइन हार्वेस्टर ऑपरेटर से संपर्क करें।',
    descriptionHi: 'फसल पकने की तारीख 28 अक्टूबर के लिए कंबाइन हार्वेस्टर ऑपरेटर से संपर्क करें।',
    category: 'harvest',
    weekNumber: 15,
    dueDate: '2024-10-25',
    priority: 'medium',
    status: 'pending'
  }
];

export const MOCK_WEATHER: WeatherData = {
  location: 'रायपुर',
  state: 'छत्तीसगढ़',
  currentTemp: 29,
  feelsLike: 31,
  condition: 'Partly Cloudy',
  conditionHi: 'हल्के बादल',
  humidity: 64,
  windSpeedKmH: 11,
  rainProbability: 15,
  uvIndex: '5',
  airQuality: 'AQI 62',
  todayForecast: 'Sunny during day and mild clouds in evening, suitable for spray and irrigation.',
  todayForecastHi: 'दिन में धूप और शाम को हल्के बादल, छिड़काव व सिंचाई के लिए अनुकूल मौसम।',
  dailyForecast: [
    { day: 'Mon', dayHi: 'सोम', date: '19 Oct', tempMax: 31, tempMin: 22, condition: 'Sun & Clouds', conditionHi: 'धूप व बादल', rainProb: 15, icon: 'sun-cloud' },
    { day: 'Tue', dayHi: 'मंगल', date: '20 Oct', tempMax: 32, tempMin: 21, condition: 'Clear Sun', conditionHi: 'साफ धूप', rainProb: 10, icon: 'sun' },
    { day: 'Wed', dayHi: 'बुध', date: '21 Oct', tempMax: 30, tempMin: 21, condition: 'Light Drizzle', conditionHi: 'हल्की फुहार', rainProb: 35, icon: 'cloud-rain' },
    { day: 'Thu', dayHi: 'गुरु', date: '22 Oct', tempMax: 29, tempMin: 20, condition: 'Overcast Clouds', conditionHi: 'बादल छाए रहेंगे', rainProb: 25, icon: 'cloud' },
    { day: 'Fri', dayHi: 'शुक्र', date: '23 Oct', tempMax: 30, tempMin: 19, condition: 'Open Clear', conditionHi: 'खुला मौसम', rainProb: 5, icon: 'sun' }
  ],
  lastUpdated: '19 अक्टूबर 2024, 06:30 PM'
};

export const INITIAL_MANDI_PRICES: MandiRecord[] = [
  {
    id: 'mandi-01',
    cropName: 'Paddy (Common)',
    cropNameHi: 'धान (सामान्य)',
    commodityGroup: 'अनाज (Cereals)',
    state: 'छत्तीसगढ़',
    district: 'रायपुर',
    marketName: 'रायपुर कृषि उपज मंडी',
    minPrice: 2183,
    maxPrice: 2360,
    modalPrice: 2280,
    priceUnit: '₹/क्विंटल',
    priceDate: '19 Oct 2024',
    trend: 'up',
    trendPercentage: 2.4,
    isFavorite: true,
    history: [
      { date: '13 Oct', price: 2210 },
      { date: '14 Oct', price: 2230 },
      { date: '15 Oct', price: 2225 },
      { date: '16 Oct', price: 2250 },
      { date: '17 Oct', price: 2260 },
      { date: '18 Oct', price: 2270 },
      { date: '19 Oct', price: 2280 }
    ]
  },
  {
    id: 'mandi-02',
    cropName: 'Soybean',
    cropNameHi: 'सोयाबीन (पीला)',
    commodityGroup: 'तिलहन (Oilseeds)',
    state: 'मध्य प्रदेश',
    district: 'इंदौर',
    marketName: 'इंदौर चोइथराम मंडी',
    minPrice: 4200,
    maxPrice: 4780,
    modalPrice: 4550,
    priceUnit: '₹/क्विंटल',
    priceDate: '19 Oct 2024',
    trend: 'down',
    trendPercentage: -1.2,
    isFavorite: true,
    history: [
      { date: '13 Oct', price: 4680 },
      { date: '14 Oct', price: 4650 },
      { date: '15 Oct', price: 4620 },
      { date: '16 Oct', price: 4590 },
      { date: '17 Oct', price: 4580 },
      { date: '18 Oct', price: 4560 },
      { date: '19 Oct', price: 4550 }
    ]
  },
  {
    id: 'mandi-03',
    cropName: 'Wheat (Sharbati)',
    cropNameHi: 'गेहूं (शरबती)',
    commodityGroup: 'अनाज (Cereals)',
    state: 'मध्य प्रदेश',
    district: 'सीहोर',
    marketName: 'सीहोर कृषि मंडी',
    minPrice: 2650,
    maxPrice: 3250,
    modalPrice: 2950,
    priceUnit: '₹/क्विंटल',
    priceDate: '19 Oct 2024',
    trend: 'up',
    trendPercentage: 3.1,
    isFavorite: false,
    history: [
      { date: '13 Oct', price: 2840 },
      { date: '14 Oct', price: 2860 },
      { date: '15 Oct', price: 2880 },
      { date: '16 Oct', price: 2900 },
      { date: '17 Oct', price: 2915 },
      { date: '18 Oct', price: 2930 },
      { date: '19 Oct', price: 2950 }
    ]
  },
  {
    id: 'mandi-04',
    cropName: 'Maize (Yellow)',
    cropNameHi: 'मक्का (पीला)',
    commodityGroup: 'मोटा अनाज (Coarse Cereals)',
    state: 'छत्तीसगढ़',
    district: 'धमतरी',
    marketName: 'धमतरी मंडी यार्ड',
    minPrice: 2050,
    maxPrice: 2280,
    modalPrice: 2160,
    priceUnit: '₹/क्विंटल',
    priceDate: '19 Oct 2024',
    trend: 'stable',
    trendPercentage: 0.0,
    isFavorite: false,
    history: [
      { date: '13 Oct', price: 2150 },
      { date: '14 Oct', price: 2150 },
      { date: '15 Oct', price: 2160 },
      { date: '16 Oct', price: 2160 },
      { date: '17 Oct', price: 2155 },
      { date: '18 Oct', price: 2160 },
      { date: '19 Oct', price: 2160 }
    ]
  },
  {
    id: 'mandi-05',
    cropName: 'Tomato (Hybrid)',
    cropNameHi: 'टमाटर (देसी/हाइब्रिड)',
    commodityGroup: 'सब्जियां (Vegetables)',
    state: 'छत्तीसगढ़',
    district: 'दुर्ग',
    marketName: 'दुर्ग थोक सब्जी मंडी',
    minPrice: 1400,
    maxPrice: 2100,
    modalPrice: 1750,
    priceUnit: '₹/क्विंटल',
    priceDate: '19 Oct 2024',
    trend: 'down',
    trendPercentage: -4.5,
    isFavorite: true,
    history: [
      { date: '13 Oct', price: 2100 },
      { date: '14 Oct', price: 2000 },
      { date: '15 Oct', price: 1950 },
      { date: '16 Oct', price: 1900 },
      { date: '17 Oct', price: 1820 },
      { date: '18 Oct', price: 1800 },
      { date: '19 Oct', price: 1750 }
    ]
  },
  {
    id: 'mandi-06',
    cropName: 'Mustard (Black)',
    cropNameHi: 'सरसों (काली)',
    commodityGroup: 'तिलहन (Oilseeds)',
    state: 'राजस्थान',
    district: 'भरतपुर',
    marketName: 'भरतपुर कृषि मंडी',
    minPrice: 5350,
    maxPrice: 5850,
    modalPrice: 5620,
    priceUnit: '₹/क्विंटल',
    priceDate: '19 Oct 2024',
    trend: 'up',
    trendPercentage: 1.8,
    isFavorite: false,
    history: [
      { date: '13 Oct', price: 5490 },
      { date: '14 Oct', price: 5520 },
      { date: '15 Oct', price: 5540 },
      { date: '16 Oct', price: 5570 },
      { date: '17 Oct', price: 5590 },
      { date: '18 Oct', price: 5600 },
      { date: '19 Oct', price: 5620 }
    ]
  }
];

export const INITIAL_EXPENSES: ExpenseRecord[] = [
  {
    id: 'exp-l1-1',
    farmId: 'land-01',
    cropName: 'धान',
    category: 'seeds',
    categoryHi: 'बीज खरीद',
    amount: 3200,
    date: '2024-06-15',
    season: 'kharif',
    notes: 'प्रमाणित IR-64 बीज (60 किग्रा) समिति से क्रय किया'
  },
  {
    id: 'exp-l1-2',
    farmId: 'land-01',
    cropName: 'धान',
    category: 'machinery',
    categoryHi: 'ट्रैक्टर जुताई',
    amount: 5500,
    date: '2024-06-20',
    season: 'kharif',
    notes: '2 बार रोटावेटर और 1 बार पाटा लगाने का किराया'
  },
  {
    id: 'exp-l1-3',
    farmId: 'land-01',
    cropName: 'धान',
    category: 'labour',
    categoryHi: 'रोपाई मजदूरी',
    amount: 8600,
    date: '2024-06-28',
    season: 'kharif',
    notes: '10 मजदूरों द्वारा रोपाई कार्य'
  },
  {
    id: 'exp-l1-4',
    farmId: 'land-01',
    cropName: 'धान',
    category: 'fertilizer',
    categoryHi: 'उर्वरक (डीएपी व पोटाश)',
    amount: 6000,
    date: '2024-07-02',
    season: 'kharif',
    notes: 'डीएपी 2 बोरी और पोटाश'
  },
  {
    id: 'exp-l1-5',
    farmId: 'land-01',
    cropName: 'धान',
    category: 'fertilizer',
    categoryHi: 'खाद (यूरिया)',
    amount: 1200,
    date: '2024-07-12',
    season: 'kharif',
    notes: 'यूरिया 50 kg'
  },
  {
    id: 'exp-l1-6',
    farmId: 'land-01',
    cropName: 'धान',
    category: 'irrigation',
    categoryHi: 'सिंचाई व रख-रखाव',
    amount: 4000,
    date: '2024-07-14',
    season: 'kharif',
    notes: 'नहर व मोटर बिल'
  }
];

export const INITIAL_SCHEMES: GovtScheme[] = [
  {
    id: 'scheme-01',
    name: 'PM-KISAN Samman Nidhi',
    nameHi: 'प्रधानमंत्री किसान सम्मान निधि योजना',
    shortDescription: 'Provides ₹6,000 per year directly to eligible farmer bank accounts in three equal installments.',
    shortDescriptionHi: 'पात्र किसान परिवारों को प्रति वर्ष ₹6,000 की प्रत्यक्ष आर्थिक सहायता 3 समान किस्तों में दी जाती है।',
    category: 'financial',
    level: 'central',
    applicableState: 'सभी राज्य (All India)',
    benefits: [
      '₹2,000 every 4 months directly via DBT',
      'No middleman commission',
      'Covers small & marginal farmers'
    ],
    benefitsHi: [
      'हर 4 महीने में ₹2,000 सीधे बैंक खाते में (डीबीटी)',
      'बिचौलियों से पूरी तरह मुक्त',
      'सभी पात्र भू-धारक किसान परिवारों के लिए'
    ],
    eligibilityCriteria: [
      'Cultivable landholding in farmer’s name',
      'Active Aadhaar linked with bank account',
      'e-KYC completed on PM-KISAN portal',
      'Institutional landholders and income tax payers are not eligible'
    ],
    eligibilityCriteriaHi: [
      'आवेदक के नाम पर कृषि योग्य भूमि का रिकॉर्ड होना चाहिए',
      'बैंक खाते से आधार लिंक और डीबीटी सक्रिय होना जरूरी',
      'पीएम-किसान पोर्टल पर ई-केवाईसी पूर्ण हो',
      'संस्थागत भूमि धारक एवं आयकर दाता अपात्र हैं'
    ],
    requiredDocuments: [
      'Aadhaar Card (आधार कार्ड)',
      'Land Ownership Record (खसरा / खतौनी / बी-1)',
      'Bank Account Passbook (बैंक पासबुक)',
      'Active Mobile Number linked to Aadhaar'
    ],
    requiredDocumentsHi: [
      'आधार कार्ड',
      'जमीन का खसरा / बी-1 नकल',
      'बैंक पासबुक की प्रति',
      'आधार से लिंक सक्रिय मोबाइल नंबर'
    ],
    applicationSteps: [
      'Visit official portal pmkisan.gov.in or CSC Center',
      'Click on "New Farmer Registration"',
      'Enter Aadhaar number and captcha',
      'Fill landholding details and upload khatauni',
      'Submit and verify via OTP'
    ],
    applicationStepsHi: [
      'आधिकारिक पोर्टल pmkisan.gov.in या नजदीकी सीएससी केंद्र जाएं',
      '"New Farmer Registration" विकल्प चुनें',
      'आधार नंबर दर्ज कर ओटीपी सत्यापित करें',
      'जमीन के खसरा विवरण भरें व दस्तावेज अपलोड करें',
      'आवेदन सबमिट कर रसीद सुरक्षित रखें'
    ],
    officialUrl: 'https://pmkisan.gov.in',
    bookmarked: true,
    applicationStatus: 'approved'
  },
  {
    id: 'scheme-02',
    name: 'Pradhan Mantri Fasal Bima Yojana (PMFBY)',
    nameHi: 'प्रधानमंत्री फसल बीमा योजना (PMFBY)',
    shortDescription: 'Comprehensive crop insurance against natural calamities, pests, and unseasonal rainfall with lowest premium.',
    shortDescriptionHi: 'प्राकृतिक आपदाओं, कीट प्रकोप व बेमौसम बारिश से फसल नुकसान पर न्यूनतम प्रीमियम में व्यापक बीमा सुरक्षा।',
    category: 'insurance',
    level: 'central',
    applicableState: 'सभी राज्य (All India)',
    benefits: [
      'Only 2% premium for Kharif crops and 1.5% for Rabi crops',
      'Full claim payout based on satellite and crop-cutting yield data',
      'Covers localized calamities (hailstorm, landslide, inundation)'
    ],
    benefitsHi: [
      'खरीफ फसलों के लिए मात्र 2% और रबी के लिए केवल 1.5% प्रीमियम',
      'प्राकृतिक आपदाओं से नुकसान पर बीमा कंपनी द्वारा सीधा मुआवजा',
      'ओलावृष्टि, जलभराव और बेमौसम बारिश पर 72 घंटे में सूचना पर तुरंत सर्वे'
    ],
    eligibilityCriteria: [
      'All farmers growing notified crops in notified areas',
      'Sharecroppers and tenant farmers with valid agreement eligible'
    ],
    eligibilityCriteriaHi: [
      'अधिसूचित क्षेत्र में अधिसूचित फसल उगाने वाले सभी किसान',
      'बटाईदार एवं किराएदार किसान भी अनुबंध के साथ पात्र'
    ],
    requiredDocuments: [
      'Sowing Certificate / पटवारी पंचनामा',
      'Land Record (Khasra B-1)',
      'Aadhaar and Bank Passbook'
    ],
    requiredDocumentsHi: [
      'बुवाई प्रमाण पत्र / गिरदावरी रिपोर्ट',
      'जमीन का खसरा/खतौनी',
      'आधार कार्ड व बैंक पासबुक'
    ],
    applicationSteps: [
      'Apply through pmfby.gov.in, Bank branch or CSC',
      'Select Kharif/Rabi season and current crop',
      'Pay nominal premium online or at bank'
    ],
    applicationStepsHi: [
      'पोर्टल pmfby.gov.in, बैंक शाखा अथवा सीएससी से आवेदन करें',
      'वर्तमान मौसम (खरीफ/रबी) और फसल का चयन करें',
      'निर्धारित न्यूनतम प्रीमियम का भुगतान करें'
    ],
    officialUrl: 'https://pmfby.gov.in',
    bookmarked: true,
    applicationStatus: 'under_review'
  },
  {
    id: 'scheme-03',
    name: 'PM Krishi Sinchayee Yojana (Per Drop More Crop)',
    nameHi: 'प्रधानमंत्री कृषि सिंचाई योजना (माइक्रो इरिगेशन)',
    shortDescription: 'Provides up to 55% subsidy on Drip and Sprinkler irrigation systems for water conservation.',
    shortDescriptionHi: 'ड्रिप व स्प्रिंकलर सिंचाई सिस्टम लगाने पर छोटे व सीमांत किसानों को 55% तक का सरकारी अनुदान।',
    category: 'irrigation',
    level: 'central',
    applicableState: 'सभी राज्य',
    benefits: [
      'Up to 55% subsidy for small/marginal farmers, 45% for other farmers',
      'Saves 40-50% water and enhances crop productivity by 30-40%'
    ],
    benefitsHi: [
      'लघु व सीमांत किसानों को 55% तक एवं अन्य किसानों को 45% तक सब्सिडी',
      'पानी की 40-50% बचत और उर्वरक उपयोग दक्षता में भारी वृद्धि'
    ],
    eligibilityCriteria: [
      'Farmer must own cultivable land with reliable water source (tube well, pond, well)'
    ],
    eligibilityCriteriaHi: [
      'किसान के पास अपनी खेती योग्य भूमि और सुनिश्चित जल स्रोत होना अनिवार्य'
    ],
    requiredDocuments: [
      'Water Source proof (विद्युत बिल / नलकूप प्रमाण)',
      'Soil & Water Test report',
      'Land documents and Aadhaar'
    ],
    requiredDocumentsHi: [
      'जल स्रोत प्रमाण (बिजली कनेक्शन / ट्यूबवेल)',
      'खसरा-खतौनी एवं आधार कार्ड',
      'बैंक पासबुक'
    ],
    applicationSteps: [
      'Apply on State Horticulture / Agriculture portal',
      'Field survey by assistant agriculture officer',
      'Vendor installation and subsidy credit'
    ],
    applicationStepsHi: [
      'राज्य कृषि/उद्यानिकी विभाग के पोर्टल पर ऑनलाइन पंजीकरण करें',
      'कृषि विस्तार अधिकारी द्वारा भौतिक सत्यापन',
      'अनुमोदित कंपनी द्वारा संयंत्र स्थापना व सब्सिडी भुगतान'
    ],
    officialUrl: 'https://pmksy.gov.in',
    bookmarked: false,
    applicationStatus: 'not_applied'
  },
  {
    id: 'scheme-04',
    name: 'PM KUSUM Solar Agriculture Pump Scheme',
    nameHi: 'पीएम कुसुम सोलर पंप योजना',
    shortDescription: 'Up to 90% subsidy for installing solar-powered irrigation pumps off-grid or grid-connected.',
    shortDescriptionHi: 'खेतों में सौर ऊर्जा संचालित सिंचाई पंप लगाने पर किसानों को कुल 90% तक की भारी सब्सिडी।',
    category: 'solar',
    level: 'central',
    applicableState: 'सभी राज्य',
    benefits: [
      'Free irrigation without diesel or erratic electricity',
      'Farmer pays only 10% of total system cost',
      'Surplus solar power can be sold to power grid'
    ],
    benefitsHi: [
      'डीजल के महंगे खर्च और बिजली कटौती से पूरी मुक्ति',
      'किसान को लागत का मात्र 10% अंशदान देना होता है',
      'ग्रिड कनेक्टेड पंप से अतिरिक्त बिजली ग्रिड को बेचकर अतिरिक्त कमाई'
    ],
    eligibilityCriteria: [
      'Farmers without electric pump or relying on diesel pump get priority'
    ],
    eligibilityCriteriaHi: [
      'बिना बिजली कनेक्शन वाले या डीजल पंप पर निर्भर किसानों को प्राथमिकता'
    ],
    requiredDocuments: [
      'Land records (खसरा)',
      'Aadhaar card',
      'No objection certificate if shared well'
    ],
    requiredDocumentsHi: [
      'जमीन का खसरा व नक्शा',
      'आधार कार्ड व पैन कार्ड',
      'जल स्रोत प्रमाण पत्र'
    ],
    applicationSteps: [
      'Register on State Renewable Energy Development Agency portal (e.g. CREDA in CG, UPNEDA in UP)',
      'Submit farmer contribution via demand draft/net banking',
      'Empanelled agency installs solar panels and pump'
    ],
    applicationStepsHi: [
      'राज्य सौर ऊर्जा एजेंसी पोर्टल पर आवेदन दर्ज करें',
      'अंशदान राशि का चालान जमा करें',
      'तकनीकी टीम द्वारा साइट सत्यापन एवं पंप अधिष्ठापन'
    ],
    officialUrl: 'https://pmkusum.mnre.gov.in',
    bookmarked: true,
    applicationStatus: 'applied'
  },
  {
    id: 'scheme-05',
    name: 'Rajiv Gandhi Kisan Nyay Yojana (State Input Subsidy)',
    nameHi: 'राजीव गांधी किसान न्याय योजना (छत्तीसगढ़)',
    shortDescription: 'State agricultural input assistance of ₹9,000 per acre to paddy, maize, and pulse growers.',
    shortDescriptionHi: 'छत्तीसगढ़ सरकार द्वारा खरीफ फसलों (धान, मक्का, कोदो-कुटकी) पर ₹9,000 प्रति एकड़ की इनपुट सब्सिडी।',
    category: 'financial',
    level: 'state',
    applicableState: 'छत्तीसगढ़ (Chhattisgarh)',
    benefits: [
      'Direct cash transfer of ₹9,000 per acre in 4 quarterly installments',
      'Encourages crop diversification and organic inputs'
    ],
    benefitsHi: [
      '₹9,000 प्रति एकड़ की दर से 4 किस्तों में सीधा बैंक खाते में भुगतान',
      'फसल विविधीकरण अपनाने पर ₹10,000 प्रति एकड़ सहायता'
    ],
    eligibilityCriteria: [
      'Registered farmers selling paddy through Primary Agriculture Credit Societies (PACS) in CG'
    ],
    eligibilityCriteriaHi: [
      'छत्तीसगढ़ के प्राथमिक कृषि साख सहकारी समितियों में पंजीकृत कृषक'
    ],
    requiredDocuments: [
      'Kisan Samiti Registration Card',
      'Girdawari verification report',
      'Bank passbook linked with Aadhaar'
    ],
    requiredDocumentsHi: [
      'समिति किसान पंजीयन कोड',
      'गिरदावरी सत्यापन पर्ची',
      'बैंक पासबुक'
    ],
    applicationSteps: [
      'Automatic integration via CG Food Department portal for registered paddy sellers'
    ],
    applicationStepsHi: [
      'समिति में धान विक्रय पंजीयन के आधार पर स्वतः नवीनीकरण'
    ],
    officialUrl: 'https://kisan.cg.nic.in',
    bookmarked: false,
    applicationStatus: 'approved'
  }
];

export const INITIAL_COMMUNITY_POSTS: CommunityPost[] = [
  {
    id: 'post-01',
    authorName: 'बलदेव सिंह पटेल',
    authorDistrict: 'दुर्ग (Durg)',
    authorRole: 'प्रगतिशील किसान',
    isExpert: false,
    cropTag: 'धान (Paddy)',
    questionText: 'मेरी धान की फसल में पत्तियों के ऊपरी किनारे पीले पड़कर नीचे की तरफ सूख रहे हैं। क्या यह बैक्टीरियल लीफ ब्लाइट है या पोटाश की कमी? कृपया उपाय बताएं।',
    imageUrl: 'https://images.unsplash.com/photo-1586771107445-d3ca888129ff?auto=format&fit=crop&q=80&w=600',
    createdAt: '3 घंटे पहले',
    likes: 24,
    hasLiked: false,
    saved: true,
    comments: [
      {
        id: 'c-01',
        authorName: 'डॉ. ए. के. शर्मा (वरिष्ठ कृषि वैज्ञानिक)',
        authorRole: 'कृषि विज्ञान केंद्र (KVK) दुर्ग',
        isExpert: true,
        text: 'बलदेव जी, पत्तियों के किनारे का लहरदार सूखना बैक्टीरियल लीफ ब्लाइट (BLB) का स्पष्ट लक्षण है। तुरंत खेत से अतिरिक्त पानी निकालें, यूरिया का प्रयोग रोकें, और प्रति एकड़ 30 ग्राम स्ट्रेप्टोसाइक्लिन + 500 ग्राम कॉपर ऑक्सीक्लोराइड को 200 लीटर पानी में घोलकर तुरंत छिड़काव करें।',
        date: '2 घंटे पहले',
        likes: 18
      },
      {
        id: 'c-02',
        authorName: 'संतोष यादव',
        authorRole: 'किसान',
        isExpert: false,
        text: 'मैंने पिछले साल कॉपर ऑक्सीक्लोराइड का छिड़काव किया था, 4-5 दिनों में बीमारी रुक गई थी। डॉक्टर साहब की सलाह सटीक है।',
        date: '1 घंटा पहले',
        likes: 5
      }
    ]
  },
  {
    id: 'post-02',
    authorName: 'श्रीमती शांति बाई साहू',
    authorDistrict: 'धमतरी (Dhamtari)',
    authorRole: 'महिला किसान मित्र',
    isExpert: false,
    cropTag: 'सब्जी उत्पादन',
    questionText: 'टमाटर के पौधों में फूल तो बहुत आ रहे हैं पर फल बनने से पहले झड़ रहे हैं। तापमान सामान्य है। इसके लिए कौन सा टॉनिक या सूक्ष्म पोषक तत्व देना चाहिए?',
    imageUrl: 'https://images.unsplash.com/photo-1592841200221-a6898f307baa?auto=format&fit=crop&q=80&w=600',
    createdAt: '6 घंटे पहले',
    likes: 17,
    hasLiked: true,
    saved: false,
    comments: [
      {
        id: 'c-03',
        authorName: 'प्रो. सुनीता चंद्राकर',
        authorRole: 'उद्यानिकी विशेषज्ञ, IGKV',
        isExpert: true,
        text: 'शांति जी, टमाटर में फूल झड़ने का मुख्य कारण बोरॉन की कमी या अत्यधिक नमी हो सकती है। आप प्रति लीटर पानी में 1 ग्राम बोरॉन (20%) और 2 मिली प्लानोफिक्स (NAA) मिलाकर शाम के समय छिड़काव करें। साथ ही क्यारियों में जलभराव न होने दें।',
        date: '4 घंटे पहले',
        likes: 12
      }
    ]
  },
  {
    id: 'post-03',
    authorName: 'विशाल सिंह ठाकुर',
    authorDistrict: 'बिलासपुर (Bilaspur)',
    authorRole: 'जैविक किसान',
    isExpert: false,
    cropTag: 'जैविक खेती',
    questionText: 'जीवामृत और वेस्ट डीकंपोजर का उपयोग धान में बालियां निकलते समय क्या असर दिखाता है? क्या किसी साथी ने इस अवस्था में ड्रिप से दिया है?',
    createdAt: '1 दिन पहले',
    likes: 31,
    hasLiked: false,
    comments: [
      {
        id: 'c-04',
        authorName: 'महेश कुमार वर्मा',
        authorRole: 'जैविक कृषक',
        isExpert: false,
        text: 'मैंने 200 लीटर जीवामृत प्रति एकड़ पानी के साथ बहाया था। दानों में चमक बहुत अच्छी आई और वजन भी बढ़ा। 15 दिन के अंतराल पर 2 बार दे सकते हैं।',
        date: '18 घंटे पहले',
        likes: 9
      }
    ]
  }
];

export const INITIAL_ALERTS: KrishiAlert[] = [
  {
    id: 'alert-01',
    title: 'आगामी 48 घंटों में हल्की से मध्यम बारिश की चेतावनी',
    titleHi: 'आगामी 48 घंटों में हल्की से मध्यम बारिश की चेतावनी',
    message: 'मौसम विभाग के अनुसार बंगाल की खाड़ी में बने निम्न दबाव के कारण रायपुर व आसपास के क्षेत्रों में 21 अक्टूबर को गरज-चमक के साथ बारिश की संभावना है।',
    messageHi: 'मौसम विभाग के अनुसार बंगाल की खाड़ी में बने निम्न दबाव के कारण रायपुर व आसपास के क्षेत्रों में 21 अक्टूबर को गरज-चमक के साथ बारिश की संभावना है।',
    severity: 'warning',
    type: 'weather',
    date: '19 Oct 2024, 04:00 PM',
    read: false,
    actionRequired: 'खेतों में कीटनाशक छिड़काव 2 दिन टालें तथा तैयार सब्जियों की तुड़ाई तुरंत कर लें।',
    actionRequiredHi: 'खेतों में कीटनाशक छिड़काव 2 दिन टालें तथा तैयार सब्जियों की तुड़ाई तुरंत कर लें।'
  },
  {
    id: 'alert-02',
    title: 'धान में भूरा माहू (BPH) कीट का अलर्ट जारी',
    titleHi: 'धान में भूरा माहू (BPH) कीट का अलर्ट जारी',
    message: 'नमी और बादलों के मौसम में धान के पौधों के तने के निचले भाग में भूरा फुदका (BPH) का प्रकोप बढ़ सकता है।',
    messageHi: 'नमी और बादलों के मौसम में धान के पौधों के तने के निचले भाग में भूरा फुदका (BPH) का प्रकोप बढ़ सकता है।',
    severity: 'critical',
    type: 'pest',
    date: '18 Oct 2024, 11:30 AM',
    read: false,
    actionRequired: 'खेत के पानी को 2-3 दिन के लिए निकाल दें और यदि प्रति पौधा 5-10 कीट दिखें तो चेस (Pymetrozine) का छिड़काव करें।',
    actionRequiredHi: 'खेत के पानी को 2-3 दिन के लिए निकाल दें और यदि प्रति पौधा 5-10 कीट दिखें तो चेस (Pymetrozine) का छिड़काव करें।'
  },
  {
    id: 'alert-03',
    title: 'रबी फसलों के लिए प्रमाणित बीज वितरण प्रारंभ',
    titleHi: 'रबी फसलों के लिए प्रमाणित बीज वितरण प्रारंभ',
    message: 'सहकारी समितियों में गेहूं (GW-322), चना (JG-11) और सरसों के प्रमाणित बीजों का भंडारण उपलब्ध हो गया है।',
    messageHi: 'सहकारी समितियों में गेहूं (GW-322), चना (JG-11) और सरसों के प्रमाणित बीजों का भंडारण उपलब्ध हो गया है।',
    severity: 'info',
    type: 'market',
    date: '17 Oct 2024, 02:15 PM',
    read: true,
    actionRequired: 'किसान भाई समय पर अपनी समिति से परमिट बनवाकर अनुदानित बीज प्राप्त करें।',
    actionRequiredHi: 'किसान भाई समय पर अपनी समिति से परमिट बनवाकर अनुदानित बीज प्राप्त करें।'
  }
];

export const INITIAL_NEWS: NewsArticle[] = [
  {
    id: 'news-01',
    title: 'कैबिनेट का बड़ा फैसला: रबी फसलों के न्यूनतम समर्थन मूल्य (MSP) में ऐतिहासिक बढ़ोतरी',
    titleHi: 'कैबिनेट का बड़ा फैसला: रबी फसलों के न्यूनतम समर्थन मूल्य (MSP) में ऐतिहासिक बढ़ोतरी',
    summary: 'केंद्र सरकार ने विपणन सत्र 2025-26 के लिए गेहूं की एमएसपी ₹150 बढ़ाकर ₹2,425 प्रति क्विंटल की। सरसों और चने के दामों में भी भारी वृद्धि।',
    summaryHi: 'केंद्र सरकार ने विपणन सत्र 2025-26 के लिए गेहूं की एमएसपी ₹150 बढ़ाकर ₹2,425 प्रति क्विंटल की। सरसों और चने के दामों में भी भारी वृद्धि।',
    content: 'आर्थिक मामलों की मंत्रिमंडलीय समिति (CCEA) ने आगामी रबी फसलों के लिए न्यूनतम समर्थन मूल्य (MSP) में वृद्धि को मंजूरी दे दी है। गेहूं की एमएसपी ₹2,275 से बढ़ाकर ₹2,425 प्रति क्विंटल की गई है, जो उत्पादन लागत पर 105% का लाभ सुनिश्चित करती है। इसके अलावा सरसों के लिए ₹300 और चने के लिए ₹210 प्रति क्विंटल की बढ़ोतरी की गई है। कृषि विशेषज्ञों का मानना है कि इससे किसानों की आय में उल्लेखनीय वृद्धि होगी।',
    contentHi: 'आर्थिक मामलों की मंत्रिमंडलीय समिति (CCEA) ने आगामी रबी फसलों के लिए न्यूनतम समर्थन मूल्य (MSP) में वृद्धि को मंजूरी दे दी है। गेहूं की एमएसपी ₹2,275 से बढ़ाकर ₹2,425 प्रति क्विंटल की गई है, जो उत्पादन लागत पर 105% का लाभ सुनिश्चित करती है। इसके अलावा सरसों के लिए ₹300 और चने के लिए ₹210 प्रति क्विंटल की बढ़ोतरी की गई है। कृषि विशेषज्ञों का मानना है कि इससे किसानों की आय में उल्लेखनीय वृद्धि होगी।',
    category: 'schemes',
    author: 'प्रेस सूचना ब्यूरो (PIB) / कृषि मंत्रालय',
    publishedDate: '16 अक्टूबर 2024',
    readTime: '3 मिनट',
    imageUrl: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&q=80&w=600',
    articleUrl: 'https://www.pib.gov.in/PressReleasePage.aspx?PRID=2065369',
    bookmarked: true,
    likes: 142,
    tags: ['MSP', 'रबी फसल', 'गेहूं', 'सरकारी निर्णय']
  },
  {
    id: 'news-02',
    title: 'धान की फसल में अंतिम अवस्था में पानी प्रबंधन कैसे करें? विशेषज्ञ सलाह',
    titleHi: 'धान की फसल में अंतिम अवस्था में पानी प्रबंधन कैसे करें? विशेषज्ञ सलाह',
    summary: 'बालियां निकलने के बाद और कटाई से 15 दिन पूर्व तक सही नमी बनाए रखने से 15-20% पैदावार बढ़ती है।',
    summaryHi: 'बालियां निकलने के बाद और कटाई से 15 दिन पूर्व तक सही नमी बनाए रखने से 15-20% पैदावार बढ़ती है।',
    content: 'कृषि वैज्ञानिकों के अनुसार, धान में दाना भरते समय (Milking stage) खेत में 2-3 सेमी पानी का स्तर लगातार होना चाहिए। यदि इस समय खेत सूख जाए तो दानों में खालीपन (पचकन) की समस्या आ जाती है। ध्यान रहे कि कटाई से 10 से 15 दिन पहले खेत से सारा पानी निकाल देना चाहिए ताकि दाने अच्छी तरह पकें और कटाई मशीन आसानी से चल सके।',
    contentHi: 'कृषि वैज्ञानिकों के अनुसार, धान में दाना भरते समय (Milking stage) खेत में 2-3 सेमी पानी का स्तर लगातार होना चाहिए। यदि इस समय खेत सूख जाए तो दानों में खालीपन (पचकन) की समस्या आ जाती है। ध्यान रहे कि कटाई से 10 से 15 दिन पहले खेत से सारा पानी निकाल देना चाहिए ताकि दाने अच्छी तरह पकें और कटाई मशीन आसानी से चल सके।',
    category: 'advisory',
    author: 'डॉ. रमेश चंद्र (कृषि विशेषज्ञ / ICAR संस्तुति)',
    publishedDate: '17 अक्टूबर 2024',
    readTime: '4 मिनट',
    imageUrl: 'https://images.unsplash.com/photo-1530507629858-e4977d30e9e0?auto=format&fit=crop&q=80&w=600',
    articleUrl: 'https://hi.vikaspedia.in/agriculture/crop-production/package-of-practices/cereals/paddy-water-management',
    bookmarked: false,
    likes: 89,
    tags: ['धान', 'सिंचाई प्रबंधन', 'पैदावार वृद्धि']
  },
  {
    id: 'news-03',
    title: 'वीडियो गाइड: सोलर पंप स्थापना की पूरी प्रक्रिया और 90% सब्सिडी का लाभ कैसे लें',
    titleHi: 'वीडियो गाइड: सोलर पंप स्थापना की पूरी प्रक्रिया और 90% सब्सिडी का लाभ कैसे लें',
    summary: 'पीएम कुसुम योजना के तहत अपने बोरवेल पर सोलर पैनल कैसे लगवाएं, देखें खेत से लाइव रिपोर्ट।',
    summaryHi: 'पीएम कुसुम योजना के तहत अपने बोरवेल पर सोलर पैनल कैसे लगवाएं, देखें खेत से लाइव रिपोर्ट।',
    content: 'इस वीडियो में किसान भाई विस्तार से जान सकते हैं कि कैसे 3 एचपी और 5 एचपी के सोलर पंप के लिए ऑनलाइन आवेदन करना है, दस्तावेज कौन-कौन से चाहिए और कितने दिनों में विभाग द्वारा पंप इंस्टॉल कर दिया जाता है।',
    contentHi: 'इस वीडियो में किसान भाई विस्तार से जान सकते हैं कि कैसे 3 एचपी और 5 एचपी के सोलर पंप के लिए ऑनलाइन आवेदन करना है, दस्तावेज कौन-कौन से चाहिए और कितने दिनों में विभाग द्वारा पंप इंस्टॉल कर दिया जाता है।',
    category: 'video',
    author: 'डीडी किसान (DD Kisan) / नवीन एवं नवीकरणीय ऊर्जा मंत्रालय',
    publishedDate: '15 अक्टूबर 2024',
    readTime: '6 मिनट वीडियो',
    imageUrl: '/images/solar_irrigation_pump.jpg',
    videoUrl: 'https://www.youtube.com/watch?v=MmAhV4dAqRg',
    bookmarked: true,
    likes: 310,
    tags: ['सोलर पंप', 'कुसुम योजना', 'वीडियो गाइड']
  }
];

export const SAMPLE_CROP_DIAGNOSES: CropDiagnosis[] = [
  {
    id: 'diag-01',
    cropName: 'धान (Paddy)',
    cropNameHi: 'धान',
    imageUrl: 'https://images.unsplash.com/photo-1586771107445-d3ca888129ff?auto=format&fit=crop&q=80&w=600',
    detectedDisease: 'Bacterial Leaf Blight (जीवाणु झुलसा रोग)',
    detectedDiseaseHi: 'जीवाणु झुलसा रोग (BLB)',
    confidence: 94,
    severity: 'moderate',
    symptoms: [
      'Water-soaked lesions on leaf tips turning yellow to grayish-white',
      'Wavy margins along the leaf edges',
      'Premature leaf drying leading to partial grain development'
    ],
    symptomsHi: [
      'पत्तियों के सिरे पर पानी से भीगे हुए धब्बे जो बाद में पीले व मटमैले सफेद हो जाते हैं',
      'पत्तियों के किनारों पर लहरदार सूखने की आकृति',
      'पत्तियां समय से पहले सूखने से दानों का अधूरा भराव'
    ],
    safeRemedies: [
      'Spray Streptocycline (30g) + Copper Oxychloride (500g) in 200L water per acre',
      'Immediately drain standing field water for 2-3 days to reduce humidity',
      'Temporarily suspend nitrogenous fertilizers (Urea) until condition improves'
    ],
    safeRemediesHi: [
      'प्रति एकड़ 30 ग्राम स्ट्रेप्टोसाइक्लिन + 500 ग्राम कॉपर ऑक्सीक्लोराइड को 200 लीटर पानी में घोलकर छिड़कें',
      'खेत में भरा पानी 2-3 दिनों के लिए निकालें ताकि आर्द्रता कम हो सके',
      'रोग नियंत्रण तक यूरिया का अतिरिक्त छिड़काव पूरी तरह रोकें'
    ],
    preventiveMeasures: [
      'Use certified disease-resistant seeds (e.g. Swarna Sub-1, IR-64 Drt1)',
      'Treat seeds with Trichoderma harzianum @ 10g/kg prior to nursery sowing',
      'Maintain balanced potash and silica nutrition'
    ],
    preventiveMeasuresHi: [
      'रोग प्रतिरोधी किस्मों के प्रमाणित बीजों का ही चयन करें',
      'बुवाई से पहले ट्राइकोडर्मा (10 ग्राम प्रति किलो) से बीजोपचार अवश्य करें',
      'खेत में पोटाश और जिंक का संतुलित प्रयोग करें'
    ],
    kvkAdvisory: 'यह परिणाम फ्रंटेंड AI मॉडल द्वारा सिम्युलेटेड (डेमो) है। गंभीर प्रकोप की स्थिति में निकटतम कृषि विज्ञान केंद्र (KVK) के विशेषज्ञ अथवा किसान कॉल सेंटर (1800-180-1551) से व्यक्तिगत सलाह लें।',
    kvkAdvisoryHi: 'यह परिणाम फ्रंटेंड AI मॉडल द्वारा सिम्युलेटेड (डेमो) है। गंभीर प्रकोप की स्थिति में निकटतम कृषि विज्ञान केंद्र (KVK) के विशेषज्ञ अथवा किसान कॉल सेंटर (1800-180-1551) से व्यक्तिगत सलाह लें।',
    date: '19 Oct 2024'
  },
  {
    id: 'diag-02',
    cropName: 'गेहूं (Wheat)',
    cropNameHi: 'गेहूं',
    imageUrl: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&q=80&w=600',
    detectedDisease: 'Yellow Stripe Rust (पीला रतुआ)',
    detectedDiseaseHi: 'पीला रतुआ / हल्दी रोग',
    confidence: 91,
    severity: 'severe',
    symptoms: [
      'Bright yellow powder strips parallel to leaf veins',
      'Yellow powder stains fingers when touching infected leaves',
      'Severe chlorosis causing photosynthesis drop'
    ],
    symptomsHi: [
      'पत्तियों की नसों के समानांतर चमकीली पीली पाउडरनुमा धारियां',
      'पत्ती छूने पर उंगली पर हल्दी जैसा पीला पाउडर लगना',
      'पौधों का तेजी से पीला पड़ना व प्रकाश संश्लेषण रुकना'
    ],
    safeRemedies: [
      'Spray Propiconazole 25% EC (Tilt) @ 200 ml in 200 liters of water per acre',
      'Spray during clear morning hours with fine mist nozzle'
    ],
    safeRemediesHi: [
      'प्रोपिकोनाज़ोल 25% ईसी (टिल्ट) 200 मिली प्रति 200 लीटर पानी में मिलाकर प्रति एकड़ छिड़कें',
      'सुबह के समय तेज धूप निकलने से पहले साफ पानी में घोलकर छिड़कें'
    ],
    preventiveMeasures: [
      'Cultivate resistant varieties like HD-3086, DBW-187, DBW-303',
      'Timely sowing during first fortnight of November'
    ],
    preventiveMeasuresHi: [
      'रोग प्रतिरोधी किस्मों जैसे एचडी-3086, डीबीडब्ल्यू-187 आदि की बुवाई करें',
      'नवंबर के प्रथम पखवाड़े में समय पर बुवाई करें'
    ],
    kvkAdvisory: 'सिम्युलेटेड विश्लेषण। वास्तविक रसायन प्रयोग से पहले स्थानीय कृषि अधिकारी की संस्तुति लें।',
    kvkAdvisoryHi: 'सिम्युलेटेड विश्लेषण। वास्तविक रसायन प्रयोग से पहले स्थानीय कृषि अधिकारी की संस्तुति लें।',
    date: '18 Oct 2024'
  },
  {
    id: 'diag-03',
    cropName: 'टमाटर (Tomato)',
    cropNameHi: 'टमाटर',
    imageUrl: 'https://images.unsplash.com/photo-1592841200221-a6898f307baa?auto=format&fit=crop&q=80&w=600',
    detectedDisease: 'Early Blight (अगेती झुलसा)',
    detectedDiseaseHi: 'अगेती झुलसा',
    confidence: 88,
    severity: 'mild',
    symptoms: [
      'Concentric target-board rings on lower older leaves',
      'Leaves yellowing around dark brown circular spots'
    ],
    symptomsHi: [
      'निचली पुरानी पत्तियों पर गोल चक्राकार गहरे भूरे धब्बे',
      'धब्बों के चारों ओर पत्तियों का पीला पड़ना'
    ],
    safeRemedies: [
      'Remove lower infected leaves and dispose outside field',
      'Spray Mancozeb 75% WP @ 2.5g per liter of water',
      'Organic alternative: 5% Neem seed kernel extract (NSKE) spray'
    ],
    safeRemediesHi: [
      'संक्रमित निचली पत्तियों को तोड़कर खेत से दूर नष्ट करें',
      'मैंकोजेब 75% WP को 2.5 ग्राम प्रति लीटर पानी में मिलाकर छिड़कें',
      'जैविक विकल्प: 5% नीम तेल अथवा छाछ (खट्टी लस्सी) का छिड़काव'
    ],
    preventiveMeasures: [
      'Adopt drip irrigation to avoid leaf wetness',
      'Mulch soil using paddy straw or silver-black plastic sheet'
    ],
    preventiveMeasuresHi: [
      'पत्तियों पर पानी न गिरने दें, ड्रिप विधि से सिंचाई करें',
      'खेत में मल्चिंग करें'
    ],
    kvkAdvisory: 'सिम्युलेटेड एआई रिपोर्ट। कृपया जैविक तरीकों को प्राथमिकता दें।',
    kvkAdvisoryHi: 'सिम्युलेटेड एआई रिपोर्ट। कृपया जैविक तरीकों को प्राथमिकता दें।',
    date: '16 Oct 2024'
  }
];

export const AI_FAQ_KNOWLEDGE: { queryKeywords: string[]; responseHi: string; responseEn: string; category: string }[] = [
  {
    queryKeywords: ['पत्ते पीले', 'पीला', 'yellow leaves', 'yellowing', 'pila'],
    responseHi: 'धान या फसलों में पत्तियों का पीला पड़ना आमतौर पर 3 प्रमुख कारणों से होता है:\n1. **नाइट्रोजन की कमी**: पुरानी पत्तियां नीचे से पीली पड़ रही हों तो यूरिया का संतुलित छिड़काव करें (15-20 किग्रा/एकड़)।\n2. **जलभराव या जड़ गलन**: यदि खेत में लगातार पानी भरा है तो 2 दिन पानी निकालें ताकि जड़ों को ऑक्सीजन मिल सके।\n3. **जिंक या आयरन की कमी**: नई ऊपरी पत्तियां पीली पड़ रही हों तो 5 ग्राम जिंक सल्फेट + 2.5 ग्राम बुझा चूना प्रति लीटर पानी में मिलाकर छिड़कें।\n\n*नोट: यह एक AI सिमुलेशन है। कृपया खेत की विस्तृत जांच करवाएं।*',
    responseEn: 'Leaf yellowing in crops is generally caused by:\n1. Nitrogen Deficiency: If bottom leaves yellow first, apply balanced Urea.\n2. Waterlogging / Root Hypoxia: Drain standing water for 48 hours.\n3. Zinc/Iron Deficiency: If younger top leaves yellow, spray Zinc Sulphate 0.5% with slaked lime.',
    category: 'crop_health'
  },
  {
    queryKeywords: ['रोग', 'बीमारी', 'disease', 'keeda', 'कीट', 'attack', 'rog'],
    responseHi: 'फसल सुरक्षा के लिए एकीकृत कीट प्रबंधन (IPM) अपनाएं:\n1. **शुरुआती अवस्था**: खेत में प्रकाश प्रपंच (Light Trap) और फेरोमोन ट्रैप लगाएं (5 ट्रैप प्रति एकड़)।\n2. **जैविक नियंत्रण**: 5 मिली नीम तेल (10,000 PPM) प्रति लीटर पानी में मिलाकर हर 15 दिन में छिड़कें।\n3. **रोग पहचान**: हमारे "रोग पहचान" स्क्रीन में पौधे की तस्वीर खींचकर अपलोड करें ताकि सटीक लक्षण पहचाने जा सकें।\n\n*आपातकालीन सहायता के लिए टोल-फ्री किसान कॉल सेंटर 1800-180-1551 पर संपर्क करें।*',
    responseEn: 'For integrated pest and disease management:\n1. Install pheromone and light traps (5 traps per acre).\n2. Use botanical Neem oil spray (5ml/L) as preventive control.\n3. Upload leaf photo to our Crop Disease Detection module for simulated analysis.',
    category: 'pest_control'
  },
  {
    queryKeywords: ['अगले सप्ताह', 'काम', 'next week', 'work', 'tasks', 'schedule'],
    responseHi: 'वर्तमान मौसम और फसल चक्र के आधार पर अगले सप्ताह के मुख्य कार्य:\n1. **धान (फूल अवस्था)**: अंतिम पोटाश खुराक दें और तना छेदक तितलियों की निगरानी करें।\n2. **सोयाबीन (कटाई तैयारी)**: फलियां पीली पड़ते ही कटाई की व्यवस्था करें, ज्यादा सूखने पर दाने चटकते हैं।\n3. **रबी तैयारी**: गेहूं और चना बुवाई के लिए खेत की गहरी जुताई कर 3-4 दिन धूप लगने दें।\n4. **सिंचाई**: आगामी बारिश की संभावना को देखते हुए नहर के पानी का उपयोग सावधानी से करें।',
    responseEn: 'Priority tasks for the upcoming week based on current season:\n1. Paddy (Flowering): Apply final MOP (Potash) and check stem borer traps.\n2. Soybean: Monitor pod maturity for timely harvest before shattering.\n3. Rabi Prep: Deep plough fields for upcoming Wheat and Chickpea sowing.',
    category: 'calendar'
  },
  {
    queryKeywords: ['बारिश', 'rain', 'मौसम', 'weather', 'storm', 'mausam'],
    responseHi: 'बारिश से पहले और तुरंत बाद खेत में ये सावधानियां बरतें:\n1. **कीटनाशक छिड़काव रोकें**: बारिश से 24 घंटे पहले और तुरंत बाद छिड़काव न करें, दवा धुल जाती है।\n2. **जल निकासी**: मेड़ों के निकास रास्ते खोलें ताकि धान के अलावा अन्य फसलों (सोयाबीन, मक्का, सब्जी) में जलभराव न हो।\n3. **कटी फसल की सुरक्षा**: कटी हुई उपज को तिरपाल से ढकें या पक्के गोदाम/खलिहान में शिफ्ट करें।\n4. **उर्वरक**: तेज बारिश में यूरिया न डालें, वह बहकर नष्ट हो जाता है।',
    responseEn: 'Precautions before rain:\n1. Postpone pesticide sprays 24h before rainfall to avoid chemical wash-off.\n2. Clear drainage channels to prevent waterlogging in non-paddy crops.\n3. Cover harvested grains with waterproof tarpaulins.\n4. Do not broadcast Urea on flooded soil.',
    category: 'weather_advice'
  },
  {
    queryKeywords: ['यूरिया', 'डीएपी', 'खाद', 'fertilizer', 'urea', 'dap', 'npk'],
    responseHi: 'उर्वरकों का वैज्ञानिक व संतुलित अनुपात (धान के लिए):\n- **बुवाई/रोपाई के समय (Basal dose)**: डीएपी (50 किग्रा) + पोटाश (25 किग्रा) + जिंक सल्फेट (10 किग्रा) प्रति एकड़।\n- **रोपाई के 20-25 दिन बाद**: यूरिया (30 किग्रा) पहला टॉप-ड्रेसिंग।\n- **रोपाई के 45-50 दिन बाद (कंसुआ अवस्था)**: यूरिया (20 किग्रा) + पोटाश (15 किग्रा) दूसरा टॉप-ड्रेसिंग।\n\n*सटीक मात्रा के लिए हमेशा अपने खेत के मृदा स्वास्थ्य कार्ड (Soil Health Card) की संस्तुति का पालन करें।*',
    responseEn: 'Scientific fertilizer schedule for Paddy:\n- Basal dose at transplanting: DAP 50kg + MOP 25kg + Zinc Sulphate 10kg per acre.\n- 20-25 days: First Urea top-dressing (30kg).\n- 45-50 days (Panicle initiation): Second top-dressing of Urea (20kg) + MOP (15kg).',
    category: 'fertilizer'
  }
];

export const RECOMMENDED_CROPS: import('../types').RecommendedCrop[] = [
  {
    id: 'crop-paddy',
    name: 'Paddy (Common / Hybrid)',
    nameHi: 'धान',
    image: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&q=80&w=600',
    season: 'kharif',
    seasonHi: 'खरीफ',
    durationDays: '120 - 150 दिन',
    costPerAcre: 15000,
    revenuePerAcre: 40000,
    profitPerAcre: 25000,
    waterRequirement: 'मध्यम',
    soilSuitability: 'उच्च',
    category: 'all',
    descriptionHi: 'धान मध्य व उत्तर भारत की प्रमुख खरीफ फसल है। काली व मटासी मिट्टी इसके लिए सबसे उपयुक्त होती है। सही खाद व समय पर सिंचाई से 20-25 क्विंटल प्रति एकड़ तक पैदावार संभव है।',
    timeline: [
      { stage: 'नर्सरी व रोपाई (Transplanting)', days: '1 - 25 दिन' },
      { stage: 'कंसुआ व कल्ले फूटना (Tillering)', days: '26 - 55 दिन' },
      { stage: 'बालियां निकलना (Panicle Initiation)', days: '56 - 85 दिन' },
      { stage: 'दुग्धावस्था व दाना भराव (Milking)', days: '86 - 110 दिन' },
      { stage: 'फसल पकना व कटाई (Harvesting)', days: '111 - 135 दिन' }
    ]
  },
  {
    id: 'crop-maize',
    name: 'Maize (Hybrid)',
    nameHi: 'मक्का',
    image: 'https://images.unsplash.com/photo-1551754655-cd27e38d2076?auto=format&fit=crop&q=80&w=600',
    season: 'kharif',
    seasonHi: 'खरीफ / रबी',
    durationDays: '90 - 110 दिन',
    costPerAcre: 12000,
    revenuePerAcre: 38000,
    profitPerAcre: 26000,
    waterRequirement: 'कम',
    soilSuitability: 'उच्च',
    category: 'low_water',
    descriptionHi: 'मक्का कम पानी में अधिक उत्पादन देने वाली फसल है। जल निकासी वाली दोमट मिट्टी उत्तम रहती है। पोल्ट्री व स्टार्च उद्योगों में इसकी भारी मांग रहती है।',
    timeline: [
      { stage: 'बुवाई व अंकुरण', days: '1 - 15 दिन' },
      { stage: 'घुटने की ऊंचाई (Knee High)', days: '16 - 40 दिन' },
      { stage: 'मंजर व भुट्टे निकलना (Tasseling)', days: '41 - 65 दिन' },
      { stage: 'भुट्टा भराव व परिपक्वता', days: '66 - 95 दिन' }
    ]
  },
  {
    id: 'crop-soybean',
    name: 'Soybean (Yellow)',
    nameHi: 'सोयाबीन',
    image: 'https://images.unsplash.com/photo-1599583236253-73138b7d9039?auto=format&fit=crop&q=80&w=600',
    season: 'kharif',
    seasonHi: 'खरीफ',
    durationDays: '95 - 105 दिन',
    costPerAcre: 18000,
    revenuePerAcre: 60000,
    profitPerAcre: 42000,
    waterRequirement: 'मध्यम',
    soilSuitability: 'उच्च',
    category: 'high_value',
    descriptionHi: 'सोयाबीन तिलहन की उच्च मूल्य वाली नगदी फसल है। यह मिट्टी में प्राकृतिक नाइट्रोजन भी बढ़ाती है। जेएस-20-34 किस्म कीट प्रतिरोधी है।',
    timeline: [
      { stage: 'अंकुरण व वृद्धि', days: '1 - 25 दिन' },
      { stage: 'फूल आना (Flowering)', days: '26 - 50 दिन' },
      { stage: 'फलियां बनना (Pod Formation)', days: '51 - 80 दिन' },
      { stage: 'कटाई तैयारी', days: '81 - 100 दिन' }
    ]
  },
  {
    id: 'crop-tomato',
    name: 'Tomato (Hybrid)',
    nameHi: 'टमाटर',
    image: 'https://images.unsplash.com/photo-1592841200221-a6898f307baa?auto=format&fit=crop&q=80&w=600',
    season: 'rabi',
    seasonHi: 'रबी / जायद',
    durationDays: '75 - 90 दिन',
    costPerAcre: 24000,
    revenuePerAcre: 85000,
    profitPerAcre: 61000,
    waterRequirement: 'मध्यम',
    soilSuitability: 'मध्यम',
    category: 'high_value',
    descriptionHi: 'टमाटर व्यावसायिक सब्जी की प्रमुख फसल है। ड्रिप सिंचाई व मल्चिंग से बंपर पैदावार प्राप्त होती है।',
    timeline: [
      { stage: 'रोपाई', days: '1 - 20 दिन' },
      { stage: 'फूल व शाखाएं', days: '21 - 45 दिन' },
      { stage: 'फल विकास व तुड़ाई', days: '46 - 85 दिन' }
    ]
  },
  {
    id: 'crop-pulses',
    name: 'Moong / Urad (Green Gram)',
    nameHi: 'मूंग / उड़द',
    image: 'https://images.unsplash.com/photo-1586771107445-d3ca888129ff?auto=format&fit=crop&q=80&w=600',
    season: 'zaid',
    seasonHi: 'जायद / ग्रीष्म',
    durationDays: '65 - 75 दिन',
    costPerAcre: 9000,
    revenuePerAcre: 28000,
    profitPerAcre: 19000,
    waterRequirement: 'कम',
    soilSuitability: 'उच्च',
    category: 'easy_farming',
    descriptionHi: 'कम अवधि की दलहनी फसल जो कम पानी और न्यूनतम लागत में तैयार होती है।',
    timeline: [
      { stage: 'बुवाई व अंकुरण', days: '1 - 15 दिन' },
      { stage: 'फूल व फलियां', days: '16 - 45 दिन' },
      { stage: 'तुड़ाई', days: '46 - 70 दिन' }
    ]
  }
];

export const INITIAL_LANDS: import('../types').LandRecord[] = [
  {
    id: 'land-01',
    name: 'भूमि 1',
    area: 2,
    areaUnit: 'acre',
    irrigationSource: 'नहर',
    previousCrop: 'धान',
    village: 'बरतोरा',
    district: 'बिलासपुर',
    state: 'छत्तीसगढ़',
    season: 'kharif',
    year: '2024',
    budget: 35000,
    selectedCrop: {
      id: 'crop-paddy',
      name: 'Paddy (Common / Hybrid)',
      nameHi: 'धान',
      image: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&q=80&w=600',
      season: 'kharif',
      seasonHi: 'खरीफ',
      durationDays: '120 - 150 दिन',
      costPerAcre: 15000,
      revenuePerAcre: 40000,
      profitPerAcre: 25000,
      waterRequirement: 'मध्यम',
      soilSuitability: 'उच्च',
      category: 'all',
      descriptionHi: 'धान मध्य व उत्तर भारत की प्रमुख खरीफ फसल है। काली व मटासी मिट्टी इसके लिए सबसे उपयुक्त होती है।',
      timeline: [
        { stage: 'नर्सरी व रोपाई', days: '1 - 25 दिन' },
        { stage: 'कंसुआ फूटने की अवस्था', days: '26 - 55 दिन' },
        { stage: 'बालियां निकलना', days: '56 - 85 दिन' },
        { stage: 'कटाई तैयारी', days: '86 - 130 दिन' }
      ]
    },
    setupStep: 10,
    isComplete: true,
    status: 'पूर्ण',
    completionPercentage: 100,
    createdAt: '10 जून 2024',
    cropProgress: 60,
    currentStage: 'कंसुआ / बालियां निकलना',
    healthScore: 92,
    nextActivity: { title: 'खाद डालना (12 जुलाई 2024)', date: '12 जुलाई 2024' },
    tasks: [
      {
        id: 'task-l1-01',
        farmId: 'land-01',
        cropName: 'धान',
        title: 'खाद डालना (यूरिया)',
        titleHi: 'खाद डालना (यूरिया) - मात्रा: 50 kg/एकड़',
        description: 'खेत में पानी का स्तर 2-3 सेमी रखते हुए यूरिया की दूसरी खुराक दें।',
        descriptionHi: 'खेत में पानी का स्तर 2-3 सेमी रखते हुए यूरिया की दूसरी खुराक दें।',
        category: 'fertilizer',
        weekNumber: 6,
        dueDate: '2024-07-12',
        priority: 'high',
        status: 'pending',
        weatherDependent: true,
        weatherAdviceHi: 'बारिश थमने पर ही छिड़काव करें।'
      },
      {
        id: 'task-l1-02',
        farmId: 'land-01',
        cropName: 'धान',
        title: 'सिंचाई (अवधि: 2 घंटे)',
        titleHi: 'सिंचाई (अवधि: 2 घंटे)',
        description: 'नहर का पानी खोलें और खेत में नमी सुनिश्चित करें।',
        descriptionHi: 'नहर का पानी खोलें और खेत में नमी सुनिश्चित करें।',
        category: 'irrigation',
        weekNumber: 6,
        dueDate: '2024-07-14',
        priority: 'high',
        status: 'pending'
      },
      {
        id: 'task-l1-03',
        farmId: 'land-01',
        cropName: 'धान',
        title: 'खरपतवार जांच एवं खेत निरीक्षण',
        titleHi: 'खरपतवार जांच - खेत का निरीक्षण करें',
        description: 'मेड़ों पर उग रहे खरपतवार निकालें और तना छेदक के अंडों की जांच करें।',
        descriptionHi: 'मेड़ों पर उग रहे खरपतवार निकालें और तना छेदक के अंडों की जांच करें।',
        category: 'weeding',
        weekNumber: 6,
        dueDate: '2024-07-16',
        priority: 'medium',
        status: 'completed'
      }
    ],
    expenses: [
      { id: 'exp-l1-1', farmId: 'land-01', cropName: 'धान', category: 'seeds', categoryHi: 'बीज खरीद', amount: 3200, date: '2024-06-15', season: 'kharif', notes: 'प्रमाणित IR-64 बीज' },
      { id: 'exp-l1-2', farmId: 'land-01', cropName: 'धान', category: 'machinery', categoryHi: 'ट्रैक्टर जुताई', amount: 5500, date: '2024-06-20', season: 'kharif', notes: '2 बार रोटावेटर' },
      { id: 'exp-l1-3', farmId: 'land-01', cropName: 'धान', category: 'labour', categoryHi: 'रोपाई मजदूरी', amount: 8600, date: '2024-06-28', season: 'kharif', notes: '10 मजदूर' },
      { id: 'exp-l1-4', farmId: 'land-01', cropName: 'धान', category: 'fertilizer', categoryHi: 'उर्वरक (डीएपी व पोटाश)', amount: 6000, date: '2024-07-02', season: 'kharif', notes: '2 बोरी डीएपी' },
      { id: 'exp-l1-5', farmId: 'land-01', cropName: 'धान', category: 'fertilizer', categoryHi: 'खाद (यूरिया)', amount: 1200, date: '2024-07-12', season: 'kharif', notes: 'यूरिया 50 kg' },
      { id: 'exp-l1-6', farmId: 'land-01', cropName: 'धान', category: 'irrigation', categoryHi: 'सिंचाई व रख-रखाव', amount: 4000, date: '2024-07-14', season: 'kharif', notes: 'नहर व मोटर बिल' }
    ],
    harvestQuantityQuintals: 30,
    actualRevenue: 65000
  },
  {
    id: 'land-02',
    name: 'भूमि 2',
    area: 1.5,
    areaUnit: 'acre',
    irrigationSource: 'नलकूप / बोरवेल',
    previousCrop: 'मक्का',
    village: 'करही',
    district: 'बिलासपुर',
    state: 'छत्तीसगढ़',
    season: 'kharif',
    year: '2024',
    budget: 20000,
    setupStep: 6, // At Step 6 (Season & Budget Selection)
    isComplete: false,
    status: 'अधूरी जानकारी',
    completionPercentage: 40,
    createdAt: '15 जुलाई 2024',
    cropProgress: 20,
    currentStage: 'केवल मूल जानकारी जोड़ी गई है',
    healthScore: 78,
    nextActivity: { title: 'पूरी प्रक्रिया शुरू करें', date: 'तत्काल' },
    tasks: [],
    expenses: []
  },
  {
    id: 'land-03',
    name: 'भूमि 3',
    area: 3,
    areaUnit: 'acre',
    irrigationSource: 'ड्रिप',
    previousCrop: 'सोयाबीन',
    village: 'सेपत',
    district: 'बिलासपुर',
    state: 'छत्तीसगढ़',
    season: 'rabi',
    year: '2024',
    budget: 45000,
    selectedCrop: {
      id: 'crop-soybean',
      name: 'Soybean (Yellow)',
      nameHi: 'सोयाबीन',
      image: 'https://images.unsplash.com/photo-1599583236253-73138b7d9039?auto=format&fit=crop&q=80&w=600',
      season: 'rabi',
      seasonHi: 'रबी 2024',
      durationDays: '95 - 105 दिन',
      costPerAcre: 18000,
      revenuePerAcre: 60000,
      profitPerAcre: 42000,
      waterRequirement: 'मध्यम',
      soilSuitability: 'उच्च',
      category: 'high_value',
      descriptionHi: 'सोयाबीन उच्च मूल्य वाली नगदी फसल है।',
      timeline: []
    },
    setupStep: 10,
    isComplete: true,
    status: 'सक्रिय',
    completionPercentage: 85,
    createdAt: '20 अगस्त 2024',
    cropProgress: 85,
    currentStage: 'दाना भराव',
    healthScore: 90,
    nextActivity: { title: 'कीटनाशक छिड़काव', date: '25 अक्टूबर 2024' },
    tasks: [],
    expenses: []
  }
];

export const NEARBY_MILLS: import('../types').NearbyMill[] = [
  {
    id: 'mill-01',
    name: 'शिवम राइस मिल',
    supportedCrops: ['धान (Paddy)', 'चावल (Rice)', 'भूसी'],
    distanceKm: 8.2,
    village: 'सिरगिट्टी औद्योगिक क्षेत्र',
    district: 'बिलासपुर',
    contactPhone: '+91 98271 23456',
    buyingRate: '₹ 2,320 / क्विंटल',
    rating: 4.6,
    isFavorite: true,
    address: 'प्लॉट नं. 14, सिरगिट्टी, बिलासपुर (छ.ग.)'
  },
  {
    id: 'mill-02',
    name: 'अग्रसेन राइस मिल',
    supportedCrops: ['धान (Paddy)', 'गेहूं (Wheat)'],
    distanceKm: 12.5,
    village: 'बोदरी',
    district: 'बिलासपुर',
    contactPhone: '+91 94252 87654',
    buyingRate: '₹ 2,340 / क्विंटल',
    rating: 4.8,
    isFavorite: false,
    address: 'हाईवे रोड, बोदरी, बिलासपुर (छ.ग.)'
  },
  {
    id: 'mill-03',
    name: 'किसान सेवा मिल',
    supportedCrops: ['सोयाबीन', 'अरहर (दाल)', 'चना', 'उड़द'],
    distanceKm: 18.0,
    village: 'तखतपुर मंडी रोड',
    district: 'तखतपुर',
    contactPhone: '+91 99812 34567',
    buyingRate: '₹ 4,600 / क्विंटल (सोयाबीन)',
    rating: 4.5,
    isFavorite: true,
    address: 'कृषि उपज मंडी के सामने, तखतपुर'
  },
  {
    id: 'mill-04',
    name: 'जय मां महामाया एग्रो मिल',
    supportedCrops: ['धान', 'मक्का', 'सरसों'],
    distanceKm: 24.5,
    village: 'मस्तूरी',
    district: 'बिलासपुर',
    contactPhone: '+91 97531 98765',
    buyingRate: '₹ 2,290 / क्विंटल',
    rating: 4.3,
    isFavorite: false,
    address: 'मस्तूरी चौक, बिलासपुर'
  }
];

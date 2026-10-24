export type Language = 'hi' | 'en' | 'cg' | 'mr' | 'ta' | 'te' | 'bn' | 'or';

export interface FarmerProfile {
  id: string;
  name: string;
  mobile: string;
  email: string;
  village: string;
  district: string;
  state: string;
  language: Language;
  landholdingCategory: 'small' | 'medium' | 'large';
  totalAcres: number;
  avatarUrl: string;
  joinedDate: string;
}

export interface OnboardingState {
  completed: boolean;
  step: number;
  language: Language;
  authType: 'phone' | 'email';
  phoneOrEmail: string;
  otpVerified: boolean;
  profileCreated: boolean;
  farmingTypeSelected: boolean;
}

export type SoilType = 'Alluvial / जलोढ़' | 'Black / काली मिट्टी' | 'Red / लाल मिट्टी' | 'Sandy Loam / दोमट' | 'Clay / चिकनी';
export type IrrigationType = 'Drip / ड्रिप' | 'Sprinkler / फव्वारा' | 'Canal / नहर' | 'Tube well / नलकूप' | 'Rainfed / वर्षा आधारित';
export type GrowthStage = 'sowing' | 'vegetative' | 'flowering' | 'grain_filling' | 'harvest_ready';

export interface FarmField {
  id: string;
  name: string;
  area: number;
  areaUnit: 'Acres' | 'Bigha' | 'Hectare';
  location: string;
  soilType: SoilType;
  irrigationType: IrrigationType;
  currentCrop: string;
  cropVariety: string;
  sowingDate: string;
  expectedHarvestDate: string;
  growthStage: GrowthStage;
  healthScore: number;
  lastInspected: string;
  notes?: string;
}

export type LandAreaUnit = 'acre' | 'hectare' | 'bigha' | 'sqft' | 'sqm' | 'kattha' | 'gaj';

export interface SoilReportData {
  uploaded: boolean;
  fileUrl?: string;
  fileName?: string;
  analysisCompleted: boolean;
  nitrogen: string;
  phosphorus: string;
  potassium: string;
  ph: number;
  organicCarbon: number;
  soilTexture: string;
  findings: string[];
}

export interface RecommendedCrop {
  id: string;
  name: string;
  nameHi: string;
  image: string;
  season: 'kharif' | 'rabi' | 'zaid';
  seasonHi: string;
  durationDays: string;
  costPerAcre: number;
  revenuePerAcre: number;
  profitPerAcre: number;
  waterRequirement: 'कम' | 'मध्यम' | 'उच्च';
  soilSuitability: 'उच्च' | 'मध्यम';
  category: 'all' | 'low_water' | 'high_value' | 'easy_farming';
  descriptionHi: string;
  timeline: { stage: string; days: string }[];
}

export interface LandRecord {
  id: string;
  name: string;
  area: number;
  areaUnit: LandAreaUnit;
  irrigationSource: string;
  previousCrop: string;
  village: string;
  district: string;
  state: string;
  soilDetails?: SoilReportData;
  season: 'kharif' | 'rabi' | 'zaid';
  year: string;
  budget: number;
  selectedCrop?: RecommendedCrop;
  selectedSchemes?: string[];
  setupStep: number; // 1 to 10
  isComplete: boolean;
  status: 'पूर्ण' | 'अधूरी जानकारी' | 'सक्रिय' | 'पूर्ण (Complete)' | 'अधूरी जानकारी (Incomplete)' | 'सक्रिय (Active)' | 'Complete' | 'Incomplete' | 'Active';
  completionPercentage: number;
  createdAt: string;
  cropProgress: number; // 0-100%
  currentStage: string;
  healthScore: number;
  nextActivity: { title: string; date: string };
  tasks: CropCalendarTask[];
  expenses: ExpenseRecord[];
  harvestQuantityQuintals?: number;
  actualRevenue?: number;
}

export interface NearbyMill {
  id: string;
  name: string;
  supportedCrops: string[];
  distanceKm: number;
  village: string;
  district: string;
  contactPhone: string;
  buyingRate: string;
  rating: number;
  isFavorite: boolean;
  address: string;
}

export type TaskCategory = 'sowing' | 'irrigation' | 'fertilizer' | 'pest_control' | 'weeding' | 'harvest';
export type TaskPriority = 'high' | 'medium' | 'low';
export type TaskStatus = 'pending' | 'completed';

export interface CropCalendarTask {
  id: string;
  farmId: string;
  cropName: string;
  title: string;
  titleHi: string;
  description: string;
  descriptionHi: string;
  category: TaskCategory;
  weekNumber: number;
  dueDate: string;
  priority: TaskPriority;
  status: TaskStatus;
  weatherDependent?: boolean;
  weatherAdvice?: string;
  weatherAdviceHi?: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  textHi?: string;
  timestamp: string;
  imageUrl?: string;
  category?: string;
  suggestions?: string[];
  isDemoNotice?: boolean;
}

export interface CropDiagnosis {
  id: string;
  cropName: string;
  cropNameHi: string;
  imageUrl: string;
  detectedDisease: string;
  detectedDiseaseHi: string;
  confidence: number;
  severity: 'mild' | 'moderate' | 'severe';
  symptoms: string[];
  symptomsHi: string[];
  safeRemedies: string[];
  safeRemediesHi: string[];
  preventiveMeasures: string[];
  preventiveMeasuresHi: string[];
  kvkAdvisory: string;
  kvkAdvisoryHi: string;
  date: string;
}

export interface MandiPriceHistory {
  date: string;
  price: number;
}

export interface MandiRecord {
  id: string;
  cropName: string;
  cropNameHi: string;
  commodityGroup: string;
  state: string;
  district: string;
  marketName: string;
  minPrice: number;
  maxPrice: number;
  modalPrice: number;
  priceUnit: string;
  priceDate: string;
  trend: 'up' | 'down' | 'stable';
  trendPercentage: number;
  history: MandiPriceHistory[];
  isFavorite?: boolean;
}

export type ExpenseCategory = 'seeds' | 'fertilizer' | 'labour' | 'irrigation' | 'machinery' | 'pesticides' | 'transport' | 'other';
export type FarmingSeason = 'kharif' | 'rabi' | 'zaid';
export type SeasonId = FarmingSeason;

export interface ExpenseRecord {
  id: string;
  farmId: string;
  cropName: string;
  category: ExpenseCategory;
  categoryHi: string;
  amount: number;
  date: string;
  season: FarmingSeason;
  notes?: string;
}

export interface HarvestRevenueRecord {
  id: string;
  cropName: string;
  season: FarmingSeason;
  harvestQuantityQuintal: number;
  sellingPricePerQuintal: number;
  totalRevenue: number;
  totalExpenses: number;
  netProfit: number;
}

export type SchemeCategory = 'financial' | 'subsidy' | 'insurance' | 'irrigation' | 'solar' | 'equipment';
export type ApplicationStatus = 'not_applied' | 'applied' | 'under_review' | 'approved' | 'disbursed';

export interface GovtScheme {
  id: string;
  name: string;
  nameHi: string;
  shortDescription: string;
  shortDescriptionHi: string;
  category: SchemeCategory;
  level: 'central' | 'state';
  applicableState: string;
  benefits: string[];
  benefitsHi: string[];
  eligibilityCriteria: string[];
  eligibilityCriteriaHi: string[];
  requiredDocuments: string[];
  requiredDocumentsHi: string[];
  applicationSteps: string[];
  applicationStepsHi: string[];
  officialUrl: string;
  bookmarked: boolean;
  applicationStatus: ApplicationStatus;
}

export interface CommunityComment {
  id: string;
  authorName: string;
  authorRole: string;
  isExpert: boolean;
  text: string;
  date: string;
  likes: number;
}

export interface CommunityPost {
  id: string;
  authorName: string;
  authorDistrict: string;
  authorRole: string;
  isExpert: boolean;
  cropTag: string;
  questionText: string;
  questionTextHi?: string;
  imageUrl?: string;
  createdAt: string;
  likes: number;
  hasLiked: boolean;
  comments: CommunityComment[];
  saved?: boolean;
}

export interface KrishiAlert {
  id: string;
  title: string;
  titleHi: string;
  message: string;
  messageHi: string;
  severity: 'info' | 'warning' | 'critical';
  type: 'weather' | 'pest' | 'market' | 'irrigation';
  date: string;
  read: boolean;
  actionRequired: string;
  actionRequiredHi: string;
}

export interface DailyForecast {
  day: string;
  dayHi: string;
  date: string;
  tempMax: number;
  tempMin: number;
  condition: string;
  conditionHi: string;
  rainProb: number;
  icon: string;
}

export interface WeatherData {
  location: string;
  state: string;
  currentTemp: number;
  feelsLike: number;
  condition: string;
  conditionHi: string;
  humidity: number;
  windSpeedKmH: number;
  rainProbability: number;
  uvIndex: string;
  airQuality: string;
  todayForecast: string;
  todayForecastHi: string;
  dailyForecast: DailyForecast[];
  lastUpdated: string;
}

export interface NewsArticle {
  id: string;
  title: string;
  titleHi: string;
  summary: string;
  summaryHi: string;
  content: string;
  contentHi: string;
  category: 'weather' | 'schemes' | 'advisory' | 'market' | 'video';
  author: string;
  publishedDate: string;
  readTime: string;
  imageUrl: string;
  articleUrl?: string;
  videoUrl?: string;
  bookmarked: boolean;
  likes: number;
  tags: string[];
}

export type SubscriptionPlanId = 'basic' | 'premium';
export type SubscriptionStatus = 'active' | 'expired' | 'cancelled' | 'upgraded' | 'renewed' | 'pending';
export type PaymentStatus = 'created' | 'authorized' | 'captured' | 'failed' | 'refunded';
export type VerificationStatus = 'verified' | 'unverified' | 'failed' | 'pending';

export interface SubscriptionPlan {
  id: SubscriptionPlanId;
  name: string;
  nameHi: string;
  price: number;
  currency: string;
  billingDuration: string;
  billingDurationHi: string;
  durationLabel: string;
  durationLabelHi: string;
  description: string;
  descriptionHi: string;
  features: string[];
  featuresHi: string[];
  popular?: boolean;
  tag?: string;
  tagHi?: string;
  buttonText: string;
  buttonTextHi: string;
}

export interface SubscriptionRecord {
  id: string;
  userId: string;
  planId: SubscriptionPlanId;
  planName: string;
  planNameHi: string;
  amount: number;
  currency: string;
  season?: 'kharif' | 'rabi' | 'zaid';
  seasonName?: string;
  seasonNameHi?: string;
  agriYear?: string;
  cropCycle?: string;
  state?: string;
  startDate: string;
  expiryDate: string;
  status: SubscriptionStatus;
  orderId: string;
  paymentId: string;
  verificationStatus: VerificationStatus;
  createdAt: string;
  updatedAt: string;
  daysRemaining?: number;
}

export interface PaymentTransaction {
  id: string;
  userId: string;
  subscriptionId?: string;
  paymentGateway: string;
  orderId: string;
  paymentId?: string;
  signature?: string;
  amount: number;
  currency: string;
  season?: string;
  agriYear?: string;
  cropCycle?: string;
  paymentStatus: PaymentStatus;
  verificationStatus: VerificationStatus;
  errorReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface GatewayConfig {
  configured: boolean;
  keyId: string | null;
  currency: string;
  requiredEnv: string[];
  hasWebhookSecret?: boolean;
  mode?: 'live' | 'test';
}

export interface SubscriptionEntitlements {
  cropRecommendations: boolean;
  govtSchemes: boolean;
  weatherAlerts: boolean;
  cropCalendar: boolean;
  expenseTracking: boolean;
  expertConsultation: boolean;
  soilFarmAnalysis: boolean;
  insuranceClaimAssistance: boolean;
  personalizedRecommendations: boolean;
}

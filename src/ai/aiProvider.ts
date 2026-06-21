import { geminiProvider } from './geminiProvider';

export type AIProviderType = 'gemini' | 'openai' | 'claude';

export interface AIProvider {
  chat(messages: { role: 'user' | 'ai'; text: string }[], context?: string): Promise<string>;
  analyzeImage(base64: string, mimeType: string, prompt: string): Promise<string>;
  recommendCrops(input: CropRecommendationInput): Promise<CropRecommendation[]>;
  getIrrigationAdvice(input: IrrigationInput): Promise<IrrigationAdvice>;
  getFertilizerAdvice(input: FertilizerInput): Promise<FertilizerAdvice>;
  detectDisease(imageBase64: string, mimeType: string): Promise<DiseaseResult>;
  interpretWeather(weatherData: WeatherInterpretationInput): Promise<string>;
  getDailySummary(context: DailySummaryContext): Promise<string>;
  getGovernmentSchemeInfo(query: string): Promise<string>;
  generateSmartAlerts(farms: FarmAlertContext[], weather: WeatherInterpretationInput): Promise<SmartAlert[]>;
  getMarketAdvice(input: MarketAdviceInput): Promise<MarketAdviceResult>;
  setLanguage(lang: string): void;
}

export interface FarmAlertContext {
  name: string;
  currentCrop: string;
  soilType: string;
  waterSource: string;
  growthStage: string;
}

export interface CropRecommendationInput {
  soilType: string;
  location: string;
  waterSource: string;
  season: string;
  landArea: number;
}

export interface CropRecommendation {
  name: string;
  waterRequirement: string;
  profitPotential: string;
  difficulty: string;
  harvestDuration: string;
}

export interface IrrigationInput {
  crop: string;
  soilType: string;
  rainChance: number;
  temperature: number;
  humidity: number;
  growthStage: string;
}

export interface IrrigationAdvice {
  action: 'water_today' | 'delay_irrigation' | 'increase_irrigation';
  reason: string;
  estimatedWater: string;
}

export interface FertilizerInput {
  crop: string;
  soilType: string;
  growthStage: string;
}

export interface FertilizerAdvice {
  recommendation: string;
  timing: string;
  organicAlternatives: string;
  nutrients: string;
  disclaimer: string;
}

export interface DiseaseResult {
  disease: string;
  confidence: string;
  symptoms: string;
  action: string;
  prevention: string;
}

export interface WeatherInterpretationInput {
  temperature: number;
  humidity: number;
  rainChance: number;
  windSpeed: number;
  condition: string;
}

export interface SmartAlert {
  id: string;
  alertType: 'rain' | 'pest' | 'harvest' | 'irrigation' | 'fertilizer' | 'market_price' | 'weather';
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  actionRequired: string;
  createdAt: string;
}

export interface MarketAdviceInput {
  crop: string;
  location: string;
  currentPrice: number;
  state: string;
}

export interface MarketAdviceResult {
  bestSellingTime: string;
  demandForecast: string;
  priceForecast: string;
  nearbyMarkets: string;
  recommendation: string;
}

export interface DailySummaryContext {
  userName: string;
  farms: { name: string; currentCrop?: string }[];
  weatherData: WeatherInterpretationInput[];
  totalExpenses: number;
  upcomingHarvests: { farmName: string; crop: string; daysLeft: number }[];
  farmAlerts: string[];
}

let currentProvider: AIProvider | null = null;

export function getAIProvider(): AIProvider {
  if (!currentProvider) {
    currentProvider = geminiProvider;
  }
  return currentProvider;
}

export function setAIProvider(provider: AIProvider) {
  currentProvider = provider;
}

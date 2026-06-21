export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
  Onboarding: undefined;
  Profile: undefined;
  AIHub: undefined;
  AlertHistory: undefined;
  SmartReminder: undefined;
  MarketIntelligence: undefined;
};

export type AuthStackParamList = {
  Welcome: undefined;
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  Farms: undefined;
  Finance: undefined;
  Market: undefined;
  Ecosystem: undefined;
};

export type FarmStackParamList = {
  FarmList: undefined;
  AddEditFarm: { farmId?: string } | undefined;
  FarmDetail: { farmId: string };
  CropList: { farmId: string };
  CropForm: { farmId: string; cropId?: string } | undefined;
  CropDetail: { cropId: string };
};

export type FinanceStackParamList = {
  FinanceDashboard: undefined;
  ExpenseList: { farmId?: string } | undefined;
  ExpenseForm: { expenseId?: string; farmId?: string } | undefined;
  IncomeList: { farmId?: string } | undefined;
  IncomeForm: { incomeId?: string; farmId?: string } | undefined;
  TransactionHistory: undefined;
};

export type AIStackParamList = {
  AIHub: undefined;
  AIChat: undefined;
  DiseaseScanner: undefined;
  CropRecommendation: undefined;
  IrrigationAdvisor: undefined;
  FertilizerAdvisor: undefined;
  SchemesAssistant: undefined;
  SmartAlerts: undefined;
  MarketAdvisor: undefined;
};

export type EcosystemTabParamList = {
  SchemesTab: undefined;
  CommunityTab: undefined;
  LearnTab: undefined;
  AlertsTab: undefined;
};

export type EcosystemStackParamList = {
  EcosystemHome: undefined;
  CropPriceDetail: { cropName: string };
  SchemeDetail: { schemeId: string };
  PostDetail: { postId: string };
  CreatePost: undefined;
  ArticleDetail: { articleId: string };
  VideoDetail: { videoId: string };
  FarmerProfile: { farmerId: string };
  VideoLearningHub: undefined;
  Marketplace: undefined;
  FarmerDirectory: undefined;
};

export type ProfileStackParamList = {
  ProfileMain: undefined;
  ProfileEdit: undefined;
  Settings: undefined;
};

export interface CommunityPost {
  id: string;
  user_id: string;
  content: string;
  image_urls: string[];
  post_type: 'text' | 'image' | 'question' | 'success_story' | 'pest_alert' | 'tip';
  farmer_name: string;
  village: string;
  district: string;
  likes_count: number;
  comments_count: number;
  created_at: string;
}

export interface GovernmentScheme {
  id: string;
  category: string;
  name: string;
  description: string;
  benefits: string;
  eligibility: string;
  website_url: string;
  application_process: string;
  created_at: string;
}

export interface MarketCrop {
  id: string;
  crop_name: string;
  current_price: number;
  unit: string;
  daily_change: number;
  yesterday_price: number;
  weekly_trend: number[];
  monthly_trend: number[];
  nearby_markets: { name: string; price: number }[];
  icon: string;
}

export interface LearningArticle {
  id: string;
  category: string;
  title: string;
  summary: string;
  content: string;
  reading_time: string;
  cover_image: string;
  created_at: string;
}

export interface RegionalAlert {
  id: string;
  type: 'pest' | 'disease' | 'weather' | 'price';
  title: string;
  description: string;
  affected_area: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  recommended_action: string;
  created_at: string;
  created_by: string;
  farmer_name: string;
}

export interface FarmerProfile {
  id: string;
  user_id: string;
  full_name: string;
  village: string;
  district: string;
  state: string;
  category: 'farmer' | 'expert' | 'officer' | 'vendor';
  bio: string;
  avatar_url: string;
  crops_grown: string[];
}

export interface MarketplaceProduct {
  id: string;
  category: 'seeds' | 'fertilizers' | 'pesticides' | 'equipment' | 'irrigation';
  name: string;
  description: string;
  price: number;
  image_url: string;
  seller_name: string;
  seller_location: string;
}

export interface Farm {
  id: string;
  user_id: string;
  name: string;
  location: string;
  country: string;
  state: string;
  district: string;
  village: string;
  land_area_value: number;
  land_area_unit: string;
  soil_type: string;
  water_source: string;
  current_crop: string;
  notes: string;
  preferred_language: string;
  created_at: string;
  updated_at: string;
}

export interface Crop {
  id: string;
  user_id: string;
  farm_id: string;
  crop_name: string;
  sowing_date: string;
  expected_harvest_date: string;
  season: string;
  area_allocated: number;
  area_unit: string;
  growth_stage: string;
  notes: string;
  created_at: string;
  updated_at: string;
}

export interface Expense {
  id: string;
  user_id: string;
  farm_id: string;
  title: string;
  category: string;
  amount: number;
  expense_date: string;
  description: string;
  created_at: string;
  updated_at: string;
  farms?: { name: string };
}

export interface IncomeRecord {
  id: string;
  user_id: string;
  farm_id: string;
  crop_id: string | null;
  crop_name: string;
  amount: number;
  quantity: number;
  quantity_unit: string;
  income_date: string;
  buyer_name: string;
  notes: string;
  created_at: string;
  updated_at: string;
  farms?: { name: string };
}

export interface Profile {
  id: string;
  full_name: string;
  mobile_number: string;
  email?: string;
  preferred_language: string;
  country: string;
  state: string;
  district: string;
  village: string;
  avatar_url?: string;
  created_at: string;
}

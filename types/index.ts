export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
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
  AI: undefined;
  Profile: undefined;
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
};

export type AIStackParamList = {
  AIChat: undefined;
};

export type ProfileStackParamList = {
  ProfileMain: undefined;
  ProfileEdit: undefined;
};

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

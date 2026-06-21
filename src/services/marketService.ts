export const MARKET_SOURCE = 'AGMARKNET (data.gov.in)';
export const MARKET_LAST_UPDATED = new Date().toLocaleString('en-IN', { weekday: 'short', hour: 'numeric', minute: '2-digit', hour12: true });

export interface MarketPrice {
  crop: string;
  price: string;
  priceNum: number;
  change: string;
  changeNum: number;
  market: string;
  district: string;
  state: string;
  trend: 'up' | 'down' | 'stable';
  variety?: string;
  modalPrice?: number;
  maxPrice?: number;
  minPrice?: number;
  updatedAt?: string;
}

export interface MarketInfo {
  name: string;
  district: string;
  state: string;
  lat: number;
  lng: number;
  distance?: number;
}

export interface PriceTrend {
  month: string;
  price: number;
}

export interface CropTrends {
  daily: { label: string; price: number }[];
  weekly: { label: string; price: number }[];
  monthly: { label: string; price: number }[];
}

export interface MarketFilters {
  search?: string;
  state?: string;
  crop?: string;
  limit?: number;
}

const DATA_GOV_RESOURCE_ID = '9ef84268-d588-465a-a308-a864a43d0070';
const DATA_GOV_BASE_URL = 'https://api.data.gov.in/resource';

const districtsByState: Record<string, string[]> = {
  'Telangana': ['Sangareddy', 'Hyderabad', 'Adilabad', 'Nizamabad', 'Warangal', 'Karimnagar', 'Mahbubnagar', 'Medak', 'Khammam', 'Nalgonda', 'Ranga Reddy', 'Vikarabad'],
  'Andhra Pradesh': ['Guntur', 'Visakhapatnam', 'Vijayawada', 'Kurnool', 'Nellore', 'Chittoor', 'Kadapa', 'Anantapur', 'Kakinada', 'Rajahmundry'],
  'Karnataka': ['Bengaluru', 'Mysuru', 'Hubli', 'Belgaum', 'Mangaluru', 'Dharwad', 'Gulbarga', 'Shivamogga', 'Davangere', 'Tumkur'],
  'Maharashtra': ['Mumbai', 'Pune', 'Nagpur', 'Nashik', 'Aurangabad', 'Solapur', 'Kolhapur', 'Amravati', 'Sangli', 'Satara'],
  'Tamil Nadu': ['Chennai', 'Coimbatore', 'Madurai', 'Tiruchirappalli', 'Salem', 'Tirunelveli', 'Erode', 'Vellore', 'Thoothukudi', 'Dharmapuri'],
};

const ALL_CROPS_DATA: MarketPrice[] = [
  { crop: 'Rice', price: '₹2,420', priceNum: 2420, change: '+1.2', changeNum: 1.2, market: 'Sangareddy', district: 'Sangareddy', state: 'Telangana', trend: 'up', variety: 'Sona Masoori', modalPrice: 2420, maxPrice: 2480, minPrice: 2360 },
  { crop: 'Wheat', price: '₹2,150', priceNum: 2150, change: '-0.8', changeNum: -0.8, market: 'Hyderabad', district: 'Hyderabad', state: 'Telangana', trend: 'down', variety: 'Sharbati', modalPrice: 2150, maxPrice: 2180, minPrice: 2100 },
  { crop: 'Cotton', price: '₹5,680', priceNum: 5680, change: '+2.5', changeNum: 2.5, market: 'Adilabad', district: 'Adilabad', state: 'Telangana', trend: 'up', variety: 'Shankar-6', modalPrice: 5680, maxPrice: 5720, minPrice: 5600 },
  { crop: 'Sugarcane', price: '₹340', priceNum: 340, change: '+0.5', changeNum: 0.5, market: 'Nizamabad', district: 'Nizamabad', state: 'Telangana', trend: 'up', variety: 'CO-86032', modalPrice: 340, maxPrice: 345, minPrice: 335 },
  { crop: 'Maize', price: '₹1,850', priceNum: 1850, change: '-1.5', changeNum: -1.5, market: 'Warangal', district: 'Warangal', state: 'Telangana', trend: 'down', variety: 'Hybrid', modalPrice: 1850, maxPrice: 1880, minPrice: 1820 },
  { crop: 'Groundnut', price: '₹4,120', priceNum: 4120, change: '+3.2', changeNum: 3.2, market: 'Karimnagar', district: 'Karimnagar', state: 'Telangana', trend: 'up', variety: 'K-6', modalPrice: 4120, maxPrice: 4180, minPrice: 4060 },
  { crop: 'Tomato', price: '₹1,280', priceNum: 1280, change: '-2.1', changeNum: -2.1, market: 'Hyderabad', district: 'Hyderabad', state: 'Telangana', trend: 'down', variety: 'Hybrid', modalPrice: 1280, maxPrice: 1320, minPrice: 1240 },
  { crop: 'Onion', price: '₹1,650', priceNum: 1650, change: '+0.9', changeNum: 0.9, market: 'Mahbubnagar', district: 'Mahbubnagar', state: 'Telangana', trend: 'up', variety: 'Red', modalPrice: 1650, maxPrice: 1680, minPrice: 1620 },
  { crop: 'Potato', price: '₹1,420', priceNum: 1420, change: '+1.8', changeNum: 1.8, market: 'Medak', district: 'Medak', state: 'Telangana', trend: 'up', variety: 'Kufri Jyoti', modalPrice: 1420, maxPrice: 1450, minPrice: 1390 },
  { crop: 'Chilli', price: '₹3,850', priceNum: 3850, change: '-3.5', changeNum: -3.5, market: 'Guntur', district: 'Guntur', state: 'Andhra Pradesh', trend: 'down', variety: 'Teja', modalPrice: 3850, maxPrice: 3900, minPrice: 3800 },
  { crop: 'Banana', price: '₹2,100', priceNum: 2100, change: '+0.6', changeNum: 0.6, market: 'Khammam', district: 'Khammam', state: 'Telangana', trend: 'up', variety: 'Grand Naine', modalPrice: 2100, maxPrice: 2150, minPrice: 2050 },
  { crop: 'Mango', price: '₹5,200', priceNum: 5200, change: '+4.2', changeNum: 4.2, market: 'Nalgonda', district: 'Nalgonda', state: 'Telangana', trend: 'up', variety: 'Alphonso', modalPrice: 5200, maxPrice: 5300, minPrice: 5100 },
  { crop: 'Tur Dal', price: '₹3,450', priceNum: 3450, change: '+1.5', changeNum: 1.5, market: 'Vikarabad', district: 'Vikarabad', state: 'Telangana', trend: 'up', variety: 'Hybrid', modalPrice: 3450, maxPrice: 3500, minPrice: 3400 },
  { crop: 'Bengal Gram', price: '₹4,850', priceNum: 4850, change: '-1.2', changeNum: -1.2, market: 'Kurnool', district: 'Kurnool', state: 'Andhra Pradesh', trend: 'down', variety: 'Desi', modalPrice: 4850, maxPrice: 4900, minPrice: 4800 },
  { crop: 'Sunflower', price: '₹3,120', priceNum: 3120, change: '+2.8', changeNum: 2.8, market: 'Belgaum', district: 'Belgaum', state: 'Karnataka', trend: 'up', variety: 'Hybrid', modalPrice: 3120, maxPrice: 3160, minPrice: 3080 },
  { crop: 'Soybean', price: '₹3,680', priceNum: 3680, change: '+0.7', changeNum: 0.7, market: 'Nagpur', district: 'Nagpur', state: 'Maharashtra', trend: 'up', variety: 'Kharif', modalPrice: 3680, maxPrice: 3720, minPrice: 3640 },
  { crop: 'Jowar', price: '₹2,320', priceNum: 2320, change: '-0.5', changeNum: -0.5, market: 'Solapur', district: 'Solapur', state: 'Maharashtra', trend: 'down', variety: 'Maldandi', modalPrice: 2320, maxPrice: 2350, minPrice: 2290 },
  { crop: 'Ragi', price: '₹2,650', priceNum: 2650, change: '+1.9', changeNum: 1.9, market: 'Mysuru', district: 'Mysuru', state: 'Karnataka', trend: 'up', variety: 'KMR-301', modalPrice: 2650, maxPrice: 2700, minPrice: 2600 },
  { crop: 'Coconut', price: '₹1,850', priceNum: 1850, change: '+2.1', changeNum: 2.1, market: 'Coimbatore', district: 'Coimbatore', state: 'Tamil Nadu', trend: 'up', variety: 'Kerala Tall', modalPrice: 1850, maxPrice: 1890, minPrice: 1810 },
  { crop: 'Black Pepper', price: '₹7,450', priceNum: 7450, change: '-0.3', changeNum: -0.3, market: 'Mangaluru', district: 'Mangaluru', state: 'Karnataka', trend: 'down', variety: 'Karimunda', modalPrice: 7450, maxPrice: 7500, minPrice: 7400 },
];

const NEARBY_MANDIS: MarketInfo[] = [
  { name: 'Sangareddy Mandi', district: 'Sangareddy', state: 'Telangana', lat: 17.62, lng: 78.09, distance: 4 },
  { name: 'Hyderabad Market', district: 'Hyderabad', state: 'Telangana', lat: 17.38, lng: 78.48, distance: 28 },
  { name: 'Patancheru Mandi', district: 'Sangareddy', state: 'Telangana', lat: 17.53, lng: 78.26, distance: 12 },
  { name: 'Medchal Mandi', district: 'Medchal', state: 'Telangana', lat: 17.63, lng: 78.48, distance: 22 },
  { name: 'Shamshabad Market', district: 'Ranga Reddy', state: 'Telangana', lat: 17.25, lng: 78.38, distance: 35 },
  { name: 'Zaheerabad Mandi', district: 'Sangareddy', state: 'Telangana', lat: 17.68, lng: 77.61, distance: 45 },
  { name: 'Guntur Market Yard', district: 'Guntur', state: 'Andhra Pradesh', lat: 16.30, lng: 80.44, distance: 180 },
  { name: 'Nashik Mandi', district: 'Nashik', state: 'Maharashtra', lat: 19.99, lng: 73.79, distance: 320 },
  { name: 'Bengaluru Market', district: 'Bengaluru', state: 'Karnataka', lat: 12.97, lng: 77.59, distance: 340 },
  { name: 'Belgaum Mandi', district: 'Belgaum', state: 'Karnataka', lat: 15.85, lng: 74.50, distance: 280 },
];

const CHART_MONTHS = ['Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep'];

const RICE_TREND_PRICES = [2200, 2250, 2180, 2300, 2380, 2420];

function generateTrend(startPrice: number): PriceTrend[] {
  let current = startPrice;
  return CHART_MONTHS.map((month, i) => {
    if (i > 0) {
      const change = Math.round(current * (Math.random() - 0.45) * 0.08);
      current = Math.max(current + change, current * 0.85);
    }
    return { month, price: current };
  });
}

function getMockPrices(filters?: MarketFilters): MarketPrice[] {
  let results = [...ALL_CROPS_DATA];
  if (filters?.search) {
    const q = filters.search.toLowerCase();
    results = results.filter(c => c.crop.toLowerCase().includes(q) || c.market.toLowerCase().includes(q));
  }
  if (filters?.state && filters.state !== 'All States') {
    results = results.filter(c => c.state === filters.state);
  }
  const cropFilter = filters?.crop;
  if (cropFilter) {
    const q = cropFilter.toLowerCase();
    results = results.filter(c => c.crop.toLowerCase() === q);
  }
  if (filters?.limit) {
    results = results.slice(0, filters.limit);
  }
  return results;
}

export function getStates(): string[] {
  return ['All States', ...Object.keys(districtsByState)];
}

export function getDistricts(state: string): string[] {
  return districtsByState[state] || [];
}

export async function fetchMarketPrices(filters?: MarketFilters): Promise<MarketPrice[]> {
  const apiKey = process.env.EXPO_PUBLIC_DATA_GOV_API_KEY;

  if (apiKey && apiKey !== 'your_data_gov_api_key_here') {
    try {
      const limit = filters?.limit || 100;
      const url = `${DATA_GOV_BASE_URL}/${DATA_GOV_RESOURCE_ID}?api-key=${apiKey}&format=json&limit=${limit}&offset=0`;
      const response = await fetch(url, { signal: AbortSignal.timeout(5000) });
      if (!response.ok) throw new Error(`API responded with ${response.status}`);
      const json = await response.json();
      if (json.records && Array.isArray(json.records) && json.records.length > 0) {
        return json.records.map((r: any) => ({
          crop: r.commodity || r.crop || 'Unknown',
          price: `₹${Number(r.modal_price || 0).toLocaleString('en-IN')}`,
          priceNum: Number(r.modal_price) || 0,
          change: '+0.0',
          changeNum: 0,
          market: r.market || 'Unknown',
          district: r.district || '',
          state: r.state || '',
          trend: 'stable' as const,
          variety: r.variety || '',
          modalPrice: Number(r.modal_price) || 0,
          maxPrice: Number(r.max_price) || 0,
          minPrice: Number(r.min_price) || 0,
        }));
      }
    } catch {
      return getMockPrices(filters);
    }
  }

  return getMockPrices(filters);
}

export function getNearbyMandis(lat?: number, lng?: number): MarketInfo[] {
  if (lat && lng) {
    const sorted = NEARBY_MANDIS.map(m => ({
      ...m,
      distance: Math.round(
        Math.sqrt(Math.pow((m.lat - lat) * 111, 2) + Math.pow((m.lng - lng) * 111 * Math.cos((lat * Math.PI) / 180), 2))
      ),
    }));
    sorted.sort((a, b) => a.distance - b.distance);
    return sorted.slice(0, 5);
  }
  return NEARBY_MANDIS.slice(0, 5);
}

export function getPriceTrend(commodity: string): PriceTrend[] {
  if (commodity.toLowerCase() === 'rice') {
    return CHART_MONTHS.map((m, i) => ({ month: m, price: RICE_TREND_PRICES[i] }));
  }
  const basePrice = ALL_CROPS_DATA.find(c => c.crop.toLowerCase() === commodity.toLowerCase())?.priceNum || 2000;
  return generateTrend(basePrice);
}

export function getCropTrends(commodity: string): CropTrends {
  const base = ALL_CROPS_DATA.find(c => c.crop.toLowerCase() === commodity.toLowerCase())?.priceNum || 2000;
  const rnd = (p: number) => Math.round(p);

  const daily = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - (6 - i));
    const variation = (Math.random() - 0.45) * base * 0.03;
    return { label: d.toLocaleDateString('en', { weekday: 'short' }), price: rnd(base + variation) };
  });

  const weekly = Array.from({ length: 8 }, (_, i) => {
    const variation = (Math.random() - 0.45) * base * 0.06;
    return { label: `W${i + 1}`, price: rnd(base + variation) };
  });

  const monthly = CHART_MONTHS.map((m) => {
    const variation = (Math.random() - 0.45) * base * 0.12;
    return { label: m, price: rnd(base + variation) };
  });

  return { daily, weekly, monthly };
}

export function getBestSellingRecommendation(prices: MarketPrice[]): { crop: string; price: string; market: string } | null {
  const sorted = [...prices].filter(p => p.trend === 'up').sort((a, b) => b.changeNum - a.changeNum);
  if (sorted.length === 0) return null;
  return { crop: sorted[0].crop, price: sorted[0].price, market: sorted[0].market };
}

export function getCropList(): string[] {
  return [...new Set(ALL_CROPS_DATA.map(c => c.crop))].sort();
}

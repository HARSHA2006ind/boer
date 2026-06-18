import { MarketplaceProduct } from '../types';

const MOCK_PRODUCTS: MarketplaceProduct[] = [
  { id: '1', category: 'seeds', name: 'Hybrid Cotton Seeds', description: 'High-yield BT cotton seeds, 450g pack', price: 850, image_url: '', seller_name: 'Agro Seeds Co.', seller_location: 'Hyderabad' },
  { id: '2', category: 'seeds', name: 'Sona Masoori Paddy Seeds', description: 'Premium quality paddy seeds, 10kg bag', price: 1200, image_url: '', seller_name: 'Rice Growers Ltd.', seller_location: 'Sangareddy' },
  { id: '3', category: 'fertilizers', name: 'NPK 10-26-26', description: 'Balanced fertilizer for all crops, 50kg bag', price: 950, image_url: '', seller_name: 'Fertilizers India', seller_location: 'Hyderabad' },
  { id: '4', category: 'fertilizers', name: 'Urea (46% N)', description: 'Nitrogen fertilizer, 50kg bag', price: 550, image_url: '', seller_name: 'Fertilizers India', seller_location: 'Hyderabad' },
  { id: '5', category: 'pesticides', name: 'Neem Oil 5% Spray', description: 'Organic pesticide, 1L bottle', price: 350, image_url: '', seller_name: 'Organic Solutions', seller_location: 'Pune' },
  { id: '6', category: 'pesticides', name: 'Imidacloprid 17.8% SL', description: 'Systemic insecticide, 100ml bottle', price: 280, image_url: '', seller_name: 'Crop Care Ltd.', seller_location: 'Mumbai' },
  { id: '7', category: 'equipment', name: 'Power Tiller (8 HP)', description: 'Compact power tiller for small farms', price: 45000, image_url: '', seller_name: 'Farm Machinery Co.', seller_location: 'Rajkot' },
  { id: '8', category: 'equipment', name: 'Manual Seed Drill', description: 'Hand-operated seed drill, 5-row', price: 3200, image_url: '', seller_name: 'Agri Tools Ltd.', seller_location: 'Ludhiana' },
  { id: '9', category: 'irrigation', name: 'Drip Irrigation Kit (1 Acre)', description: 'Complete drip irrigation system for 1 acre', price: 8500, image_url: '', seller_name: 'Drip Tech India', seller_location: 'Bengaluru' },
  { id: '10', category: 'irrigation', name: 'Sprinkler Set (1/2 Acre)', description: 'Portable sprinkler irrigation system', price: 4500, image_url: '', seller_name: 'Water Solutions', seller_location: 'Chennai' },
];

export async function fetchProducts(category?: string): Promise<MarketplaceProduct[]> {
  await new Promise(r => setTimeout(r, 300));
  if (category && category !== 'all') return MOCK_PRODUCTS.filter(p => p.category === category);
  return MOCK_PRODUCTS;
}

export async function searchProducts(query: string): Promise<MarketplaceProduct[]> {
  await new Promise(r => setTimeout(r, 200));
  return MOCK_PRODUCTS.filter(p => p.name.toLowerCase().includes(query.toLowerCase()));
}

import { GovernmentScheme } from '../types';
import { supabase } from './supabase';

const MOCK_SCHEMES: GovernmentScheme[] = [
  { id: '1', category: 'subsidies', name: 'PM-KISAN Samman Nidhi', description: 'Income support of 6,000/year to all landholding farmers.', benefits: '6,000 per year in 3 installments', eligibility: 'All landholding farmers', website_url: 'https://pmkisan.gov.in', application_process: 'Apply online or through CSC centers with Aadhaar and land records.', created_at: '' },
  { id: '2', category: 'crop_insurance', name: 'PM Fasal Bima Yojana', description: 'Comprehensive crop insurance covering all stages.', benefits: 'Coverage against natural calamities, pests, diseases', eligibility: 'All farmers growing notified crops', website_url: 'https://pmfby.gov.in', application_process: 'Enroll through bank branches before cutoff date.', created_at: '' },
  { id: '3', category: 'subsidies', name: 'Nutrient Based Subsidy', description: 'Subsidy on P&K fertilizers at affordable prices.', benefits: 'Fixed subsidy per kg on nutrients', eligibility: 'All farmers', website_url: 'https://fert.nic.in', application_process: 'Subsidy reflected in MRP at point of sale.', created_at: '' },
  { id: '4', category: 'irrigation', name: 'PM Krishi Sinchayee Yojana', description: 'Efficient irrigation systems for every drop.', benefits: '50-70% subsidy on drip/sprinkler systems', eligibility: 'All farmers with cultivable land', website_url: 'https://pmksy.gov.in', application_process: 'Apply through state agriculture department.', created_at: '' },
  { id: '5', category: 'equipment', name: 'SMAM - Farm Mechanization', description: 'Subsidized farm machinery for small farmers.', benefits: 'Up to 50% subsidy on tractors, power tillers', eligibility: 'Small and marginal farmers', website_url: 'https://agriwelfare.gov.in', application_process: 'Submit application to district agriculture office.', created_at: '' },
  { id: '6', category: 'state', name: 'Rythu Bandhu (Telangana)', description: 'Investment support for farmers in Telangana.', benefits: '10,000 per acre per year', eligibility: 'All farmers in Telangana', website_url: 'https://telangana.gov.in', application_process: 'Automatic disbursement based on land records.', created_at: '' },
  { id: '7', category: 'subsidies', name: 'PKVY - Organic Farming', description: 'Promotion of organic farming through clusters.', benefits: '50,000/ha for 3 years', eligibility: 'Groups of farmers forming clusters', website_url: 'https://pgsindia-ncof.gov.in', application_process: 'Apply through state agriculture department.', created_at: '' },
];

export async function fetchSchemes(category?: string): Promise<GovernmentScheme[]> {
  try {
    let query = supabase.from('government_schemes').select('*').eq('is_active', true).order('name');
    if (category && category !== 'all') {
      query = query.eq('category', category);
    }
    const { data, error } = await query;
    if (!error && data && data.length > 0) {
      return data.map(s => ({
        id: s.id, category: s.category || '', name: s.name || '', description: s.description || '',
        benefits: s.benefits || '', eligibility: s.eligibility || '', website_url: s.website_url || '',
        application_process: s.application_process || '', created_at: s.created_at || '',
      }));
    }
  } catch {}
  await new Promise(r => setTimeout(r, 300));
  if (category && category !== 'all') return MOCK_SCHEMES.filter(s => s.category === category);
  return MOCK_SCHEMES;
}

export async function fetchSchemeById(id: string): Promise<GovernmentScheme | undefined> {
  try {
    const { data, error } = await supabase.from('government_schemes').select('*').eq('id', id).single();
    if (!error && data) {
      return { id: data.id, category: data.category || '', name: data.name || '', description: data.description || '',
        benefits: data.benefits || '', eligibility: data.eligibility || '', website_url: data.website_url || '',
        application_process: data.application_process || '', created_at: data.created_at || '' };
    }
  } catch {}
  await new Promise(r => setTimeout(r, 200));
  return MOCK_SCHEMES.find(s => s.id === id);
}

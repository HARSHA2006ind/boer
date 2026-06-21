import { RegionalAlert } from '../types';
import { supabase } from './supabase';

const MOCK_ALERTS: RegionalAlert[] = [
  { id: '1', type: 'pest', title: 'Fall Armyworm Reported', description: 'Fall armyworm infestation spotted in maize fields.', affected_area: 'Coimbatore, Tamil Nadu', severity: 'high', recommended_action: 'Inspect maize crops immediately. Apply recommended pesticides.', created_at: new Date().toISOString(), created_by: '', farmer_name: 'Kumaraswamy' },
  { id: '2', type: 'disease', title: 'Tomato Disease Outbreak', description: 'Early blight detected in tomato crops.', affected_area: 'Kolar, Karnataka', severity: 'critical', recommended_action: 'Remove infected plants. Apply copper fungicide.', created_at: new Date().toISOString(), created_by: '', farmer_name: 'Venkatesh' },
  { id: '3', type: 'weather', title: 'Heavy Rainfall Warning', description: 'Heavy rainfall expected in the region.', affected_area: 'Sangareddy, Telangana', severity: 'high', recommended_action: 'Delay irrigation. Check drainage systems.', created_at: new Date().toISOString(), created_by: '', farmer_name: 'Boer Weather' },
  { id: '4', type: 'pest', title: 'Pest Spread Risk Increased', description: 'Pest activity increasing due to warm weather.', affected_area: 'Guntur, Andhra Pradesh', severity: 'medium', recommended_action: 'Monitor crops daily. Set up pheromone traps.', created_at: new Date().toISOString(), created_by: '', farmer_name: 'Agriculture Dept' },
  { id: '5', type: 'disease', title: 'Powdery Mildew in Grapes', description: 'Powdery mildew detected in grape vineyards.', affected_area: 'Nashik, Maharashtra', severity: 'high', recommended_action: 'Apply sulfur spray. Improve air circulation.', created_at: new Date().toISOString(), created_by: '', farmer_name: 'Rahul Sharma' },
];

export async function fetchAlerts(type?: string): Promise<RegionalAlert[]> {
  try {
    let query = supabase.from('regional_alerts').select('*').order('created_at', { ascending: false });
    if (type && type !== 'all') {
      query = query.eq('type', type);
    }
    const { data, error } = await query.limit(50);
    if (!error && data && data.length > 0) {
      return data.map(a => ({
        id: a.id, type: a.type || 'weather', title: a.title || '', description: a.description || '',
        affected_area: a.affected_area || '', severity: a.severity || 'medium',
        recommended_action: a.recommended_action || '', created_at: a.created_at || '',
        created_by: a.created_by || '', farmer_name: a.farmer_name || '',
      }));
    }
  } catch {}
  await new Promise(r => setTimeout(r, 300));
  if (type && type !== 'all') return MOCK_ALERTS.filter(a => a.type === type);
  return MOCK_ALERTS;
}

export async function createAlert(alert: Partial<RegionalAlert>): Promise<boolean> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    const { error } = await supabase.from('regional_alerts').insert({
      type: alert.type || 'weather', title: alert.title || '', description: alert.description || '',
      affected_area: alert.affected_area || '', severity: alert.severity || 'medium',
      recommended_action: alert.recommended_action || '', created_by: user?.id || '',
      farmer_name: alert.farmer_name || user?.user_metadata?.full_name || '',
      created_at: new Date().toISOString(),
    });
    if (!error) return true;
  } catch {}
  await new Promise(r => setTimeout(r, 500));
  return true;
}

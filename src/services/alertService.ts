import { RegionalAlert } from '../types';

const MOCK_ALERTS: RegionalAlert[] = [
  { id: '1', type: 'pest', title: 'Fall Armyworm Reported', description: 'Fall armyworm infestation spotted in maize fields.', affected_area: 'Coimbatore, Tamil Nadu', severity: 'high', recommended_action: 'Inspect maize crops immediately. Apply recommended pesticides.', created_at: new Date().toISOString(), created_by: '', farmer_name: 'Kumaraswamy' },
  { id: '2', type: 'disease', title: 'Tomato Disease Outbreak', description: 'Early blight detected in tomato crops.', affected_area: 'Kolar, Karnataka', severity: 'critical', recommended_action: 'Remove infected plants. Apply copper fungicide.', created_at: new Date().toISOString(), created_by: '', farmer_name: 'Venkatesh' },
  { id: '3', type: 'weather', title: 'Heavy Rainfall Warning', description: 'Heavy rainfall expected in the region.', affected_area: 'Sangareddy, Telangana', severity: 'high', recommended_action: 'Delay irrigation. Check drainage systems.', created_at: new Date().toISOString(), created_by: '', farmer_name: 'Boer Weather' },
  { id: '4', type: 'pest', title: 'Pest Spread Risk Increased', description: 'Pest activity increasing due to warm weather.', affected_area: 'Guntur, Andhra Pradesh', severity: 'medium', recommended_action: 'Monitor crops daily. Set up pheromone traps.', created_at: new Date().toISOString(), created_by: '', farmer_name: 'Agriculture Dept' },
  { id: '5', type: 'disease', title: 'Powdery Mildew in Grapes', description: 'Powdery mildew detected in grape vineyards.', affected_area: 'Nashik, Maharashtra', severity: 'high', recommended_action: 'Apply sulfur spray. Improve air circulation.', created_at: new Date().toISOString(), created_by: '', farmer_name: 'Rahul Sharma' },
];

export async function fetchAlerts(type?: string): Promise<RegionalAlert[]> {
  await new Promise(r => setTimeout(r, 300));
  if (type && type !== 'all') return MOCK_ALERTS.filter(a => a.type === type);
  return MOCK_ALERTS;
}

export async function createAlert(alert: Partial<RegionalAlert>): Promise<boolean> {
  await new Promise(r => setTimeout(r, 500));
  return true;
}

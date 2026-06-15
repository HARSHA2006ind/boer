import { supabase } from './supabase';
import { Crop } from '../types';

export async function getCrops(farmId: string) {
  const { data, error } = await supabase
    .from('crops')
    .select('*')
    .eq('farm_id', farmId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data as Crop[];
}

export async function getCrop(id: string) {
  const { data, error } = await supabase
    .from('crops')
    .select('*')
    .eq('id', id)
    .single();
  if (error) throw error;
  return data as Crop;
}

export async function createCrop(crop: Omit<Crop, 'id' | 'created_at' | 'updated_at'>) {
  const { data, error } = await supabase
    .from('crops')
    .insert([crop])
    .select()
    .single();
  if (error) throw error;
  return data as Crop;
}

export async function updateCrop(id: string, crop: Partial<Omit<Crop, 'id' | 'created_at' | 'updated_at'>>) {
  const { data, error } = await supabase
    .from('crops')
    .update(crop)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data as Crop;
}

export async function deleteCrop(id: string) {
  const { error } = await supabase
    .from('crops')
    .delete()
    .eq('id', id);
  if (error) throw error;
}

export const CropService = {
  getCrops,
  getCrop,
  createCrop,
  updateCrop,
  deleteCrop,
};

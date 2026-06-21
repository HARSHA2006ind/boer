import { supabase } from './supabase';
import { Crop } from '../types';
import { cropRepository } from '../repositories/cropRepository';
import { syncQueue } from './syncQueue';

export async function getCrops(farmId: string) {
  try {
    const { data, error } = await supabase
      .from('crops')
      .select('*')
      .eq('farm_id', farmId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    const crops = data as Crop[];
    for (const c of crops) await cropRepository.upsert(c);
    return crops;
  } catch {
    return cropRepository.getAll(farmId);
  }
}

export async function getCrop(id: string) {
  try {
    const { data, error } = await supabase
      .from('crops')
      .select('*')
      .eq('id', id)
      .single();
    if (error) throw error;
    const crop = data as Crop;
    await cropRepository.upsert(crop);
    return crop;
  } catch {
    const local = await cropRepository.getById(id);
    if (!local) throw new Error('Crop not found');
    return local;
  }
}

export async function createCrop(crop: Omit<Crop, 'id' | 'created_at' | 'updated_at'>) {
  const id = crypto.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  const now = new Date().toISOString();
  const full: Crop = { ...crop, id, created_at: now, updated_at: now } as Crop;

  await cropRepository.upsert(full);
  await syncQueue.add('crop', id, 'create', full);

  try {
    const { data, error } = await supabase
      .from('crops')
      .insert([full])
      .select()
      .single();
    if (error) throw error;
    const server = data as Crop;
    await cropRepository.markSynced(id);
    return server;
  } catch {
    return full;
  }
}

export async function updateCrop(id: string, crop: Partial<Omit<Crop, 'id' | 'created_at' | 'updated_at'>>) {
  const now = new Date().toISOString();
  const updates = { ...crop, updated_at: now };

  const existing = await cropRepository.getById(id);
  if (existing) {
    const merged = { ...existing, ...updates };
    await cropRepository.upsert(merged as Crop);
  }
  await syncQueue.add('crop', id, 'update', updates);

  try {
    const { data, error } = await supabase
      .from('crops')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    const server = data as Crop;
    await cropRepository.upsert(server);
    await cropRepository.markSynced(id);
    return server;
  } catch {
    return existing ? { ...existing, ...updates } : updates;
  }
}

export async function deleteCrop(id: string) {
  await cropRepository.remove(id);
  await syncQueue.add('crop', id, 'delete', { id });

  try {
    const { error } = await supabase
      .from('crops')
      .delete()
      .eq('id', id);
    if (error) throw error;
  } catch {
    // queued for later
  }
}

export const CropService = { getCrops, getCrop, createCrop, updateCrop, deleteCrop };

import type { DriftData } from './drift-store';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || import.meta.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY;
const driftsTable = import.meta.env.VITE_SUPABASE_DRIFTS_TABLE || 'drifts';

const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

function isConfigured() {
  return Boolean(supabase);
}

export async function saveDriftToSupabase(drift: DriftData): Promise<void> {
  if (!isConfigured()) return;

  const { error } = await supabase
    ?.from(driftsTable)
    .upsert({ id: drift.id, data: drift }, { onConflict: 'id' }) ?? { error: null };

  // Table missing (PGRST205): keep app usable with local fallback.
  if (error && (error as { code?: string }).code !== 'PGRST205') {
    throw error;
  }
}

export async function getDriftFromSupabase(id: string): Promise<DriftData | null> {
  if (!isConfigured()) return null;

  const { data, error } = await supabase
    ?.from(driftsTable)
    .select('data')
    .eq('id', id)
    .maybeSingle() as { data: { data: DriftData } | null; error: unknown };

  if (error) {
    if ((error as { code?: string }).code === 'PGRST205') return null;
    throw error;
  }
  if (!data) return null;
  return data.data;
}

import { supabase } from '@/lib/supabase';

export async function getXaiApiKey() {
  try {
    const { data, error } = await supabase
      .from('settings')
      .select('value')
      .eq('key', 'xai_api_key')
      .single();

    if (error) throw error;
    return data?.value || '';
  } catch (error) {
    console.error('Error fetching XAI API key:', error);
    throw error;
  }
}

export async function saveXaiApiKey(apiKey: string) {
  try {
    const { data, error } = await supabase
      .from('settings')
      .upsert(
        { key: 'xai_api_key', value: apiKey },
        { onConflict: 'key' }
      )
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error saving XAI API key:', error);
    throw error;
  }
} 
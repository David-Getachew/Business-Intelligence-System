import { supabase } from '@/lib/supabase';

// Guard function to ensure Supabase is configured
function guardSupabase() {
  if (!supabase) {
    throw new Error('Supabase is not configured. Please check your environment variables.');
  }
}

export interface SupplierPayload {
  name: string;
  contact?: {
    phone?: string;
    email?: string;
  };
}

export async function saveSupplier(payload: SupplierPayload & { id?: number }) {
  try {
    guardSupabase();
    
    const insert = {
      name: payload.name,
      contact: payload.contact || null,
    };

    if (payload.id) {
      const { data, error } = await supabase!
        .from('suppliers')
        .update(insert)
        .eq('id', payload.id)
        .select('id')
        .single();

      if (error) throw error;
      return { success: true, supplier_id: data.id };
    } else {
      const { data, error } = await supabase!
        .from('suppliers')
        .insert([insert])
        .select('id')
        .single();

      if (error) throw error;
      return { success: true, supplier_id: data.id };
    }
  } catch (error: any) {
    console.error('[API] saveSupplier error:', error);
    throw error;
  }
}

export async function fetchSuppliers() {
  try {
    guardSupabase();
    const { data, error } = await supabase!
      .from('suppliers')
      .select('id, name, contact')
      .order('name', { ascending: true });

    if (error) throw error;

    return data || [];
  } catch (error: any) {
    console.error('[API] fetchSuppliers error:', error);
    throw error;
  }
}

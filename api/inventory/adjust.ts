import { createClient } from '@supabase/supabase-js';
import { Database } from '../../src/types/database.types';

interface RequestBody {
  ingredient_id: number;
  qty_change?: number;
  set_qty?: number;
  reason: string;
}

export default async function handler(req: Request): Promise<Response> {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const supabaseUrl = process.env.VITE_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.VITE_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error('Missing Supabase configuration');
    }

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const supabaseClient = createClient<Database>(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: {
          Authorization: authHeader,
        },
      },
    });

    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const body: RequestBody = await req.json();
    const { ingredient_id, qty_change, set_qty, reason } = body;

    if (ingredient_id == null || !reason) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: ingredient_id, reason' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }
    if (qty_change === undefined && set_qty === undefined) {
      return new Response(
        JSON.stringify({ error: 'Must provide either qty_change or set_qty' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const { data: currentInventory, error: fetchError } = await supabaseClient
      .from('inventory_on_hand')
      .select('qty_on_hand, avg_unit_cost')
      .eq('ingredient_id', ingredient_id)
      .single();

    if (fetchError) throw fetchError;

    let newQty: number;
    let qtyDelta: number;

    if (set_qty !== undefined) {
      newQty = set_qty;
      qtyDelta = set_qty - (currentInventory.qty_on_hand || 0);
    } else if (qty_change !== undefined) {
      qtyDelta = qty_change;
      newQty = (currentInventory.qty_on_hand || 0) + qty_change;
    } else {
      throw new Error('Invalid adjustment parameters');
    }

    const { error: movementError } = await supabaseClient
      .from('inventory_movements')
      .insert([{
        ingredient_id,
        qty: Math.abs(qtyDelta),
        movement_type: 'ADJUST',
        unit_cost: currentInventory.avg_unit_cost,
        ref_table: 'inventory_on_hand',
        ref_id: ingredient_id,
        notes: reason,
        created_by: user.id,
      }]);

    if (movementError) throw movementError;

    const { error: updateError } = await supabaseClient
      .from('inventory_on_hand')
      .update({ qty_on_hand: newQty })
      .eq('ingredient_id', ingredient_id);

    if (updateError) throw updateError;

    return new Response(
      JSON.stringify({
        success: true,
        new_qty: newQty,
        message: 'Inventory adjusted successfully',
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('Error adjusting inventory:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Failed to adjust inventory' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}


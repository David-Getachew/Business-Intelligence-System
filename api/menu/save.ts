import { createClient } from '@supabase/supabase-js';
import { Database } from '../../src/types/database.types';

interface RequestBody {
  id?: number;
  name: string;
  price: number;
  category: string;
  active: boolean;
  recipe?: Array<{
    ingredient_id: number;
    qty_per_item: number;
  }>;
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
    const { id, name, price, category, active, recipe } = body;

    if (!name || price === undefined || !category) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: name, price, category' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    let menuItemId: number;

    if (id) {
      const { data: updateData, error: updateError } = await supabaseClient
        .from('menu_items')
        .update({ name, price, category, active })
        .eq('id', id)
        .select('id')
        .single();

      if (updateError) throw updateError;
      menuItemId = updateData.id;

      const { error: deleteError } = await supabaseClient
        .from('recipe_ingredients')
        .delete()
        .eq('menu_item_id', menuItemId);

      if (deleteError) throw deleteError;
    } else {
      // Create new menu item - don't include id field to let database auto-generate
      const { data: insertData, error: insertError } = await supabaseClient
        .from('menu_items')
        .insert([{ name, price, category, active }])
        .select('id')
        .single();

      if (insertError) {
        console.error('Menu item insert error:', insertError);
        throw insertError;
      }
      menuItemId = insertData.id;
    }

    if (recipe && recipe.length > 0) {
      const recipeInserts = recipe.map(ing => ({
        menu_item_id: menuItemId,
        ingredient_id: ing.ingredient_id,
        qty_per_item: ing.qty_per_item,
      }));

      const { error: recipeError } = await supabaseClient
        .from('recipe_ingredients')
        .insert(recipeInserts);

      if (recipeError) throw recipeError;
    }

    return new Response(
      JSON.stringify({
        success: true,
        menu_item_id: menuItemId,
        message: 'Menu item saved successfully',
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('Error saving menu item:', error?.message || 'Unknown error');
    return new Response(
      JSON.stringify({ error: error.message || 'Failed to save menu item' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }

import { supabase } from '@/lib/supabase';
import { Database, Tables, TablesInsert } from '@/types/database.types';

// Removed guardSupabase - use supabase directly

// ============================================================================
// SALES - Exact Schema Mapping
// ============================================================================

export interface SaleLineItem {
  menu_item_id: number;  // INTEGER, not string
  qty: number;           // NOT quantity
  unit_price: number;
}

export interface SalePayload {
  sale_date: string;
  items: SaleLineItem[];
}

/**
 * Process a batch of sales transactions via submit_staff_forms RPC
 * Uses submit_staff_forms instead of process_sale for consistency
 */
export async function processSale(payload: SalePayload): Promise<{
  success: boolean;
  message: string;
  sale_id?: number;
}> {
  try {
    if (!supabase) {
      throw new Error('Supabase is not configured. Please check your environment variables.');
    }

    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) {
      throw new Error('User not authenticated');
    }

    // Build payload for process_sale_with_inventory RPC
    const calculatedTotal = payload.items.reduce((sum, item) => sum + (item.qty * item.unit_price), 0);

    const rpcPayload = {
      sale_date: payload.sale_date,
      total: calculatedTotal,
      lines: payload.items.map(item => ({
        menu_item_id: item.menu_item_id,
        qty: item.qty,
        unit_price: item.unit_price,
      })),
    };

    // Call RPC with named parameters
    const { data, error } = await supabase.rpc('process_sale_with_inventory', {
      _payload: rpcPayload,
      _allow_negative_stock: false,
    });

    if (error) {
      console.error('[API] process_sale_with_inventory RPC error:', {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint,
      });

      if (error.message?.toLowerCase().includes('insufficient stock')) {
        throw new Error('INSUFFICIENT_STOCK: ' + error.message);
      }
      throw error;
    }
    
  return {
    success: true,
    message: 'Sales batch processed successfully',
      sale_id: (data as any)?.sale_id ?? undefined,
  };
  } catch (error: any) {
    console.error('[API] processSale error:', error);
    throw error;
  }
}

// ============================================================================
// PURCHASES - Exact Schema Mapping
// ============================================================================

export interface PurchasePayload {
  ingredient_id: number;  // INTEGER, not string
  qty: number;            // NOT quantity
  unit_cost: number;
  total_cost: number;
  purchase_date: string;
}

/**
 * Insert purchase records (bulk)
 * Schema: purchases(ingredient_id:int, qty:numeric, unit_cost:numeric, total_cost:numeric, purchase_date:date, created_by:uuid)
 * Trigger handle_purchase will update inventory_on_hand automatically
 */
export async function insertPurchases(purchases: PurchasePayload[]): Promise<{
  success: boolean;
  purchase_ids: number[];
}> {
  try {
    if (!supabase) {
      throw new Error('Supabase is not configured. Please check your environment variables.');
    }
    const { data: userData } = await supabase!.auth.getUser();
    if (!userData.user) {
      throw new Error('User not authenticated');
    }

    const inserts: TablesInsert<'purchases'>[] = purchases.map(p => ({
      ingredient_id: p.ingredient_id,
      qty: p.qty,
      unit_cost: p.unit_cost,
      total_cost: p.total_cost,
      purchase_date: p.purchase_date,
      created_by: userData.user.id,
    }));

    const { data, error } = await supabase
      .from('purchases')
      .insert(inserts)
      .select('id');

    if (error) throw error;

  return {
    success: true,
      purchase_ids: data.map(p => p.id),
  };
  } catch (error: any) {
    console.error('[API] insertPurchases error:', error);
    throw error;
  }
}

// ============================================================================
// EXPENSES - Exact Schema Mapping
// ============================================================================

export interface ExpensePayload {
  expense_date: string;
  category: string;  // 'Labor', 'Rent', 'Utilities', 'Supplies', 'Other'
  amount: number;
  reference?: string | null;
  notes?: string | null;
}

/**
 * Insert expense records (bulk)
 * Schema: expenses(expense_date:date, category:text, amount:numeric, reference:text, notes:text, created_by:uuid)
 */
export async function insertExpenses(expenses: ExpensePayload[]): Promise<{
  success: boolean;
  expense_ids: number[];
}> {
  try {
    if (!supabase) {
      throw new Error('Supabase is not configured. Please check your environment variables.');
    }
    const { data: userData } = await supabase!.auth.getUser();
    if (!userData.user) {
      throw new Error('User not authenticated');
    }

    const inserts: TablesInsert<'expenses'>[] = expenses.map(e => ({
      expense_date: e.expense_date,
      category: e.category,
      amount: e.amount,
      reference: e.reference || null,
      notes: e.notes || null,
      created_by: userData.user.id,
    }));

    const { data, error } = await supabase
      .from('expenses')
      .insert(inserts)
      .select('id');

    if (error) throw error;

  return {
    success: true,
      expense_ids: data.map(e => e.id),
  };
  } catch (error: any) {
    console.error('[API] insertExpenses error:', error);
    throw error;
  }
}

// ============================================================================
// MENU ITEMS & RECIPES - Atomic Transaction via Serverless
// ============================================================================

export interface RecipeIngredient {
  ingredient_id: number;  // INTEGER
  qty_per_item: number;
}

export interface MenuItemPayload {
  id?: number;  // null for create, int for update
  name: string;
  price: number;
  category: string;
  active: boolean;
  recipe: RecipeIngredient[];
}

/**
 * Save menu item + recipe atomically
 * Direct Supabase calls (works without serverless)
 */
export async function saveMenuItem(payload: MenuItemPayload): Promise<{
  success: boolean;
  menu_item_id: number;
}> {
  try {
    if (!supabase) {
      throw new Error('Supabase is not configured. Please check your environment variables.');
    }
    const { data: userData } = await supabase!.auth.getUser();
    if (!userData.user) {
      throw new Error('User not authenticated');
    }
    // Prepare RPC arguments per required signature
    const validRecipes = (payload.recipe || [])
      .filter(ing => ing.ingredient_id && ing.ingredient_id > 0 && ing.qty_per_item > 0)
      .map(ing => ({ 
        ingredient_id: ing.ingredient_id, 
        qty_per_item: Number(ing.qty_per_item) // numeric, required, cannot be null
      }));

    // Omit p_menu_item_id for creation; include last for update
    const rpcArgs = {
      p_name: payload.name,
      p_price: payload.price,
      p_category: payload.category,
      p_active: payload.active,
      p_recipe: validRecipes as unknown as any,
      // Only include p_menu_item_id for updates, omit for creation
      ...(payload.id && { p_menu_item_id: payload.id })
    };

    const { data, error } = await supabase.rpc('save_menu_item_and_recipe', rpcArgs);
    if (error) throw error;

    const returned = (data as any) || {};
    const menuItemId: number = returned.menu_item_id ?? returned.id ?? payload.id;

  return {
    success: true,
      menu_item_id: menuItemId,
  };
  } catch (error: any) {
    console.error('[API] saveMenuItem error:', error);
    throw error;
  }
}

// ============================================================================
// INVENTORY - Fetch with Exact Schema
// ============================================================================

/**
 * Fetch inventory with correct column names
 * Schema: inventory_on_hand(ingredient_id:int, qty_on_hand:numeric, avg_unit_cost:numeric, last_updated:timestamptz)
 * Join with ingredients(id, name, base_unit, reorder_point)
 */
export async function fetchInventory() {
  try {
    if (!supabase) {
      throw new Error('Supabase is not configured. Please check your environment variables.');
    }
    
    // Fetch from inventory_on_hand directly with join to ingredients for names
    const { data, error } = await supabase
      .from('inventory_on_hand')
      .select(`
        ingredient_id,
        qty_on_hand,
        avg_unit_cost,
        last_updated,
        ingredients!inner(
          name,
          base_unit,
          reorder_point,
          active
        )
      `)
      .order('ingredient_id', { ascending: true });

    if (error) {
      console.error('[API] fetchInventory error:', error);
      throw error;
    }


    return (data || []).map(item => ({
      ingredient_id: item.ingredient_id,
      name: (item.ingredients as any)?.name || 'Unknown',
      base_unit: (item.ingredients as any)?.base_unit || '',
      qty_on_hand: item.qty_on_hand || 0,
      avg_unit_cost: item.avg_unit_cost || 0,
      reorder_point: (item.ingredients as any)?.reorder_point || 0,
      last_updated: item.last_updated,
    }));
  } catch (error: any) {
    console.error('[API] fetchInventory error:', error);
    throw error;
  }
}

export interface InventoryAdjustmentPayload {
  ingredient_id: number;  // INTEGER
  qty_change?: number;
  set_qty?: number;
  reason: string;
}

/**
 * Adjust inventory atomically
 * Direct Supabase calls (works without serverless)
 */
export async function adjustInventory(payload: InventoryAdjustmentPayload): Promise<{
  success: boolean;
}> {
  try {
    if (!supabase) {
      throw new Error('Supabase is not configured. Please check your environment variables.');
    }
    const { data: userData } = await supabase!.auth.getUser();
    if (!userData.user) {
      throw new Error('User not authenticated');
    }

    // Get current inventory
    const { data: currentInventory, error: fetchError } = await supabase
      .from('inventory_on_hand')
      .select('qty_on_hand, avg_unit_cost')
      .eq('ingredient_id', payload.ingredient_id)
      .single();

    if (fetchError) throw fetchError;

    // Calculate delta
    let newQty: number;
    let qtyDelta: number;

    if (payload.set_qty !== undefined) {
      newQty = payload.set_qty;
      qtyDelta = payload.set_qty - (currentInventory.qty_on_hand || 0);
    } else if (payload.qty_change !== undefined) {
      qtyDelta = payload.qty_change;
      newQty = (currentInventory.qty_on_hand || 0) + payload.qty_change;
    } else {
      throw new Error('Must provide either qty_change or set_qty');
    }

    // Insert movement
    const { error: movementError } = await supabase
      .from('inventory_movements')
      .insert([{
        ingredient_id: payload.ingredient_id,
        qty: Math.abs(qtyDelta),
        movement_type: 'ADJUST',
        unit_cost: currentInventory.avg_unit_cost,
        ref_table: 'inventory_on_hand',
        ref_id: payload.ingredient_id,
        notes: payload.reason,
        created_by: userData.user.id,
      }]);

    if (movementError) throw movementError;

    // Update inventory
    const { error: updateError } = await supabase
      .from('inventory_on_hand')
      .update({ qty_on_hand: newQty })
      .eq('ingredient_id', payload.ingredient_id);

    if (updateError) throw updateError;

  return { success: true };
  } catch (error: any) {
    console.error('[API] adjustInventory error:', error);
    throw error;
  }
}

export async function adjustIngredientStock(
  _adjust_qty: number,
  _ingredient_id: number,
  _notes: string,
  _unit_cost: number | null
): Promise<{ success: boolean; message: string; data?: any }> {
  try {
    if (!supabase) {
      throw new Error('Supabase is not configured. Please check your environment variables.');
    }


    const { data, error } = await supabase.rpc('adjust_ingredient_stock', {
      _ingredient_id, // integer
      _adjust_qty, // signed numeric delta (negative for decrement, positive for increment)
      _unit_cost, // numeric, nullable
      _notes, // text
    });

    if (error) {
      console.error('[API] adjustIngredientStock RPC error:', error);
      throw error;
    }


    // Verify response structure
    if (data?.status === 'ok') {
      return {
        success: true,
        message: 'Stock adjusted successfully',
        data: {
          movement_id: data.movement_id,
          new_qty_on_hand: data.new_qty_on_hand
        }
      };
    } else {
      throw new Error('RPC returned unexpected status: ' + (data?.status || 'unknown'));
    }
  } catch (error: any) {
    console.error('[API] adjustIngredientStock error:', error);
    throw error;
  }
}

// ============================================================================
// DAILY SUMMARIES - Exact Schema
// ============================================================================

export interface DateRange {
  start: string;
  end: string;
}

/**
 * Fetch daily summaries with correct column names
 * Schema: daily_summaries(day, total_revenue, total_cogs, operating_expense, gross_profit, net_profit, top_income_items, category_totals)
 */
export async function fetchDailySummaries(range: DateRange) {
  try {
    if (!supabase) {
      throw new Error('Supabase is not configured. Please check your environment variables.');
    }
    const { data, error } = await supabase
      .from('daily_summaries')
      .select('*')
      .gte('day', range.start)
      .lte('day', range.end)
      .order('day', { ascending: true });

    if (error) throw error;

    return data || [];
  } catch (error: any) {
    console.error('[API] fetchDailySummaries error:', error);
    throw error;
  }
}

/**
 * Fetch weekly summaries with correct column names
 * Schema: weekly_summaries(week_start, week_end, total_revenue, total_cogs, operating_expense, gross_profit, net_profit, analysis, pdf_url)
 */
export async function fetchWeeklySummaries() {
  try {
    if (!supabase) {
      throw new Error('Supabase is not configured. Please check your environment variables.');
    }
    const { data, error } = await supabase
      .from('weekly_summaries')
      .select('*')
      .order('week_start', { ascending: false });

    if (error) throw error;

    return data || [];
  } catch (error: any) {
    console.error('[API] fetchWeeklySummaries error:', error);
    throw error;
  }
}

// ============================================================================
// TRANSACTIONS - Fetch with Joins
// ============================================================================

// New: Flattened sales view from sale_line_items, with names and usernames
export async function fetchSales(filters?: { start_date?: string; end_date?: string }) {
  try {
    if (!supabase) {
      throw new Error('Supabase is not configured. Please check your environment variables.');
    }
    // Load line items joined to sales and menu_items
    let query = supabase!
      .from('sale_line_items')
      .select(`
        id,
        qty,
        unit_price,
        line_total,
        cogs,
        sales:sale_id (
          id,
          sale_date,
          created_at,
          created_by
        ),
        menu_items:menu_item_id (
          id,
          name
        )
      `)
      .order('id', { ascending: false });

    if (filters?.start_date) {
      query = query.gte('sales.sale_date', filters.start_date);
    }
    if (filters?.end_date) {
      query = query.lte('sales.sale_date', filters.end_date);
    }
    
    // Ensure we only get rows with valid sales data
    query = query.not('sales', 'is', null);

    const { data, error } = await query.limit(200);
    if (error) throw error;

    const rows = (data || []) as any[];
    const userIds = Array.from(new Set(rows.map(r => r.sales?.created_by).filter(Boolean)));

    let userIdToName: Record<string, string> = {};
    if (userIds.length > 0) {
      const { data: profiles, error: profErr } = await supabase!
        .from('profiles')
        .select('id, full_name')
        .in('id', userIds);
      if (!profErr && profiles) {
        userIdToName = Object.fromEntries(profiles.map(p => [p.id as string, (p.full_name as string) || '']));
      }
    }

    return rows
      .filter(r => r.sales?.sale_date) // Filter out rows with null/invalid sale_date
      .map(r => ({
        id: r.id,
        created_at: r.sales?.created_at,
        sale_date: r.sales?.sale_date,
        menu_item: r.menu_items?.name || 'Unknown',
        menu_item_id: r.menu_item_id,
        quantity: r.qty,
        unit_price: r.unit_price,
        total: r.line_total,
        user_name: r.sales?.created_by ? (userIdToName[r.sales.created_by] || r.sales.created_by) : '',
        sale_id: r.sales?.id,
      }));
  } catch (error: any) {
    console.error('[API] fetchSales error:', error);
    throw error;
  }
}

export async function fetchPurchases(filters?: { start_date?: string; end_date?: string }) {
  try {
    if (!supabase) {
      throw new Error('Supabase is not configured. Please check your environment variables.');
    }
    let query = supabase!
      .from('purchases')
      .select(`
        id,
        ingredient_id,
        qty,
        unit_cost,
        total_cost,
        purchase_date,
        created_by,
        created_at,
        ingredients (name, base_unit)
      `)
      .order('purchase_date', { ascending: false });

    if (filters?.start_date) {
      query = query.gte('purchase_date', filters.start_date);
    }
    if (filters?.end_date) {
      query = query.lte('purchase_date', filters.end_date);
    }

    const { data, error } = await query.limit(200);

    if (error) throw error;
    const rows = (data || []) as any[];
    const userIds = Array.from(new Set(rows.map(r => r.created_by).filter(Boolean)));

    let userIdToName: Record<string, string> = {};
    if (userIds.length > 0) {
      const { data: profiles, error: profErr } = await supabase!
        .from('profiles')
        .select('id, full_name')
        .in('id', userIds);
      if (!profErr && profiles) {
        userIdToName = Object.fromEntries(profiles.map(p => [p.id as string, (p.full_name as string) || '']));
      }
    }

    return rows.map(r => ({
      id: r.id,
      ingredient: r.ingredients?.name || 'Unknown Ingredient',
      quantity: r.qty,
      total_cost: r.total_cost,
      unit_cost: r.unit_cost,
      created_at: r.created_at,
      user_name: r.created_by ? (userIdToName[r.created_by] || r.created_by) : '',
    }));
  } catch (error: any) {
    console.error('[API] fetchPurchases error:', error);
    throw error;
  }
}

export async function fetchExpenses(filters?: { start_date?: string; end_date?: string }) {
  try {
    if (!supabase) {
      throw new Error('Supabase is not configured. Please check your environment variables.');
    }
    let query = supabase!
      .from('expenses')
      .select('id, expense_date, category, amount, reference, notes, created_by, created_at')
      .order('expense_date', { ascending: false});

    if (filters?.start_date) {
      query = query.gte('expense_date', filters.start_date);
    }
    if (filters?.end_date) {
      query = query.lte('expense_date', filters.end_date);
    }

    const { data, error } = await query.limit(200);

    if (error) throw error;
    const rows = (data || []) as any[];
    const userIds = Array.from(new Set(rows.map(r => r.created_by).filter(Boolean)));

    let userIdToName: Record<string, string> = {};
    if (userIds.length > 0) {
      const { data: profiles, error: profErr } = await supabase!
        .from('profiles')
        .select('id, full_name')
        .in('id', userIds);
      if (!profErr && profiles) {
        userIdToName = Object.fromEntries(profiles.map(p => [p.id as string, (p.full_name as string) || '']));
      }
    }

    return rows.map(r => ({
      ...r,
      user_name: r.created_by ? (userIdToName[r.created_by] || r.created_by) : '',
    }));
  } catch (error: any) {
    console.error('[API] fetchExpenses error:', error);
    throw error;
  }
}

// ============================================================================
// MENU ITEMS & INGREDIENTS - Exact Schema
// ============================================================================

export async function fetchMenuItems() {
  try {
    if (!supabase) {
      throw new Error('Supabase is not configured. Please check your environment variables.');
    }
    const { data, error } = await supabase
      .from('menu_items')
      .select(`
        id,
        name,
        price,
        category,
        active,
        created_at
      `)
      .order('name', { ascending: true });

    if (error) throw error;

    const transformed = (data || []).map(item => ({
      ...item,
      // recipe populated on demand via view in edit flow
      recipe_count: 0,
    }));

    return transformed;
  } catch (error: any) {
    console.error('[API] fetchMenuItems error:', error);
    throw error;
  }
}

// Lookup menu item names by IDs
export async function fetchMenuItemNamesByIds(ids: number[]): Promise<Record<number, string>> {
  try {
    if (!supabase) {
      throw new Error('Supabase is not configured. Please check your environment variables.');
    }
    if (!ids || ids.length === 0) return {};
    const unique = Array.from(new Set(ids));
    const { data, error } = await supabase
      .from('menu_items')
      .select('id, name')
      .in('id', unique);
    if (error) throw error;
    return Object.fromEntries((data || []).map((r: any) => [r.id as number, r.name as string]));
  } catch (error: any) {
    console.error('[API] fetchMenuItemNamesByIds error:', error);
    throw error;
  }
}

// Use DB view to fetch ingredient counts per menu item
export async function fetchMenuIngredientCounts(): Promise<Record<number, number>> {
  try {
    if (!supabase) {
      throw new Error('Supabase is not configured. Please check your environment variables.');
    }
    const { data, error } = await supabase
      .from('view_menu_item_ingredients')
      .select('menu_item_id, menu_item_name, ingredient_id')
      .not('ingredient_id', 'is', null); // Filter out null ingredient_id rows
    if (error) throw error;
    const counts = new Map<number, number>();
    (data || []).forEach((row: any) => {
      const id = row.menu_item_id as number;
      counts.set(id, (counts.get(id) || 0) + 1);
    });
    return Object.fromEntries(counts);
  } catch (error: any) {
    console.error('[API] fetchMenuIngredientCounts error:', error);
    throw error;
  }
}

// Use DB view to fetch recipe rows for a specific menu item
export async function fetchMenuItemRecipeFromView(menuItemId: number): Promise<Array<{ ingredient_id: number; ingredient_name: string | null; qty_per_item: number }>> {
  try {
    if (!supabase) {
      throw new Error('Supabase is not configured. Please check your environment variables.');
    }
    const { data, error } = await supabase
      .from('view_menu_item_ingredients')
      .select('ingredient_id, ingredient_name, qty_per_item')
      .eq('menu_item_id', menuItemId)
      .not('ingredient_id', 'is', null) // Filter out null ingredient_id rows
      .order('ingredient_name', { ascending: true });
    if (error) throw error;

    // Collapse duplicates by summing qty_per_item
    const collapsed = new Map<number, { ingredient_id: number; ingredient_name: string | null; qty_per_item: number }>();
    (data || []).forEach((row: any) => {
      const id = row.ingredient_id as number;
      const prev = collapsed.get(id);
      if (prev) {
        prev.qty_per_item += Number(row.qty_per_item || 0);
      } else {
        collapsed.set(id, {
          ingredient_id: id,
          ingredient_name: row.ingredient_name ?? null,
          qty_per_item: Number(row.qty_per_item || 0),
        });
      }
    });
    return Array.from(collapsed.values());
  } catch (error: any) {
    console.error('[API] fetchMenuItemRecipeFromView error:', error);
    throw error;
  }
}

export async function fetchIngredients() {
  try {
    if (!supabase) {
      throw new Error('Supabase is not configured. Please check your environment variables.');
    }
    const { data, error } = await supabase
      .from('ingredients')
      .select('id, name, base_unit, reorder_point, active')
      .order('name', { ascending: true });

    if (error) throw error;

    return data || [];
  } catch (error: any) {
    console.error('[API] fetchIngredients error:', error);
    throw error;
  }
}


// ============================================================================
// USERS
// ============================================================================

export interface UserPayload {
  email: string;
  full_name: string;
  role: 'admin' | 'staff';  // EXACT schema - admin not owner
}

export async function fetchUsers() {
  try {
    if (!supabase) {
      throw new Error('Supabase is not configured. Please check your environment variables.');
    }
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return data || [];
  } catch (error: any) {
    console.error('[API] fetchUsers error:', error);
    throw error;
  }
}

// ============================================================================
// SUPPLIERS
// ============================================================================

export interface SupplierPayload {
  name: string;
  contact?: {
    phone?: string;
    email?: string;
  };
}


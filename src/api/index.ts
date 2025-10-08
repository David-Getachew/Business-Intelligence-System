/**
 * API Placeholder Module
 * 
 * All functions return mock promises. Replace these with actual API calls
 * when integrating with Supabase, n8n, or other backends.
 * 
 * Expected payload shapes and return types are documented in comments.
 */

// ============================================================================
// SALES
// ============================================================================

export interface SaleLineItem {
  menu_item_id: string;
  menu_item_name: string;
  quantity: number;
  unit_price: number;
  line_total: number;
}

export interface SalePayload {
  sale_date: string;
  items: SaleLineItem[];
  subtotal: number;
  tax: number;
  total: number;
}

/**
 * Process a batch of sales transactions
 * @returns { success: boolean, message: string, sale_ids?: string[] }
 */
export async function processSale(payload: SalePayload): Promise<{
  success: boolean;
  message: string;
  sale_ids?: string[];
}> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 800));
  
  // Check dev mode for error simulation
  if ((window as any).__DEV_SIMULATE_INSUFFICIENT_STOCK) {
    throw new Error('INSUFFICIENT_STOCK');
  }
  
  console.log('[API] processSale called with:', payload);
  return {
    success: true,
    message: 'Sales batch processed successfully',
    sale_ids: ['SALE-' + Date.now()],
  };
}

// ============================================================================
// PURCHASES
// ============================================================================

export interface PurchasePayload {
  purchase_date: string;
  ingredient_id: string;
  ingredient_name: string;
  quantity: number;
  unit_cost: number;
  total_cost: number;
  supplier?: string;
}

/**
 * Insert a purchase record
 * @returns { success: boolean, purchase_id?: string }
 */
export async function insertPurchase(payload: PurchasePayload): Promise<{
  success: boolean;
  purchase_id?: string;
}> {
  await new Promise(resolve => setTimeout(resolve, 600));
  console.log('[API] insertPurchase called with:', payload);
  return {
    success: true,
    purchase_id: 'PUR-' + Date.now(),
  };
}

// ============================================================================
// EXPENSES
// ============================================================================

export interface ExpensePayload {
  expense_date: string;
  category: string;
  amount: number;
  reference?: string;
  notes?: string;
}

/**
 * Insert an expense record
 * @returns { success: boolean, expense_id?: string }
 */
export async function insertExpense(payload: ExpensePayload): Promise<{
  success: boolean;
  expense_id?: string;
}> {
  await new Promise(resolve => setTimeout(resolve, 500));
  console.log('[API] insertExpense called with:', payload);
  return {
    success: true,
    expense_id: 'EXP-' + Date.now(),
  };
}

// ============================================================================
// MENU ITEMS
// ============================================================================

export interface RecipeIngredient {
  ingredient_id: string;
  qty_per_item: number;
}

export interface MenuItemPayload {
  name: string;
  price: number;
  category: string;
  active: boolean;
  recipe: RecipeIngredient[];
}

/**
 * Save (create or update) a menu item with its recipe
 * @returns { success: boolean, menu_item_id?: string }
 */
export async function saveMenuItem(payload: MenuItemPayload): Promise<{
  success: boolean;
  menu_item_id?: string;
}> {
  await new Promise(resolve => setTimeout(resolve, 700));
  console.log('[API] saveMenuItem called with:', payload);
  return {
    success: true,
    menu_item_id: 'MENU-' + Date.now(),
  };
}

// ============================================================================
// INVENTORY
// ============================================================================

export interface InventoryAdjustmentPayload {
  ingredient_id: string;
  qty_change?: number; // positive or negative
  set_qty?: number; // absolute value
  reason: string;
}

/**
 * Adjust inventory stock
 * @returns { success: boolean }
 */
export async function adjustInventory(payload: InventoryAdjustmentPayload): Promise<{
  success: boolean;
}> {
  await new Promise(resolve => setTimeout(resolve, 500));
  console.log('[API] adjustInventory called with:', payload);
  return { success: true };
}

/**
 * Fetch current inventory
 * @returns Array of inventory items
 */
export async function fetchInventory(): Promise<any[]> {
  await new Promise(resolve => setTimeout(resolve, 400));
  // Returns mock data from mocks
  return [];
}

// ============================================================================
// REPORTS
// ============================================================================

export interface DateRange {
  start: string;
  end: string;
}

/**
 * Fetch daily summaries for a date range
 * @returns Array of daily summary objects
 */
export async function fetchDailySummaries(range: DateRange): Promise<any[]> {
  await new Promise(resolve => setTimeout(resolve, 600));
  console.log('[API] fetchDailySummaries called with:', range);
  return [];
}

/**
 * Fetch weekly summaries
 * @returns Array of weekly summary objects with analysis
 */
export async function fetchWeeklySummaries(): Promise<any[]> {
  await new Promise(resolve => setTimeout(resolve, 500));
  return [];
}

// ============================================================================
// USERS
// ============================================================================

export interface UserPayload {
  email: string;
  full_name: string;
  role: 'owner' | 'staff';
}

/**
 * Create a new user
 * @returns { success: boolean, user_id?: string }
 */
export async function createUser(payload: UserPayload): Promise<{
  success: boolean;
  user_id?: string;
}> {
  await new Promise(resolve => setTimeout(resolve, 600));
  console.log('[API] createUser called with:', payload);
  return {
    success: true,
    user_id: 'USER-' + Date.now(),
  };
}

/**
 * Integration Tests for Business Intelligence System
 * 
 * These tests verify end-to-end flows with Supabase backend.
 * Run with: npm test (after configuring test environment)
 * 
 * Setup:
 * 1. Create a test Supabase project or use a test database
 * 2. Set VITE_PUBLIC_SUPABASE_URL and VITE_PUBLIC_SUPABASE_ANON_KEY in .env.test
 * 3. Ensure test user credentials are available
 */

import { supabase } from '../src/lib/supabase';
import {
  processSale,
  insertPurchase,
  insertExpense,
  saveMenuItem,
  adjustInventory,
  fetchInventory,
  fetchDailySummaries,
  SalePayload,
  PurchasePayload,
  ExpensePayload,
  MenuItemPayload,
} from '../src/api/index';

describe('Authentication Flow', () => {
  it('should sign in with valid credentials', async () => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: 'test@example.com',
      password: 'testpassword123',
    });

    expect(error).toBeNull();
    expect(data.user).toBeDefined();
    expect(data.session).toBeDefined();
  });

  it('should fetch user profile after authentication', async () => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user) {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      expect(error).toBeNull();
      expect(profile).toBeDefined();
      expect(['owner', 'staff']).toContain(profile.role);
    }
  });
});

describe('Sales Processing', () => {
  it('should process a sale and update inventory', async () => {
    const { data: menuItems } = await supabase
      .from('menu_items')
      .select('id, name, price')
      .limit(1)
      .single();

    if (!menuItems) {
      console.warn('No menu items found, skipping sale test');
      return;
    }

    const salePayload: SalePayload = {
      sale_date: new Date().toISOString().split('T')[0],
      items: [
        {
          menu_item_id: menuItems.id,
          menu_item_name: menuItems.name,
          quantity: 2,
          unit_price: menuItems.price,
          line_total: menuItems.price * 2,
        },
      ],
      subtotal: menuItems.price * 2,
      tax: menuItems.price * 2 * 0.1,
      total: menuItems.price * 2 * 1.1,
    };

    const result = await processSale(salePayload);

    expect(result.success).toBe(true);
    expect(result.sale_ids).toBeDefined();
    expect(result.sale_ids!.length).toBeGreaterThan(0);
  });

  it('should throw error for insufficient stock', async () => {
    const salePayload: SalePayload = {
      sale_date: new Date().toISOString().split('T')[0],
      items: [
        {
          menu_item_id: 'test-item-id',
          menu_item_name: 'Test Item',
          quantity: 999999,
          unit_price: 10,
          line_total: 9999990,
        },
      ],
      subtotal: 9999990,
      tax: 999999,
      total: 10999989,
    };

    await expect(processSale(salePayload)).rejects.toThrow('INSUFFICIENT_STOCK');
  });
});

describe('Purchase Management', () => {
  it('should insert a purchase and update inventory', async () => {
    const { data: ingredient } = await supabase
      .from('ingredients')
      .select('id, name')
      .limit(1)
      .single();

    if (!ingredient) {
      console.warn('No ingredients found, skipping purchase test');
      return;
    }

    const purchasePayload: PurchasePayload = {
      purchase_date: new Date().toISOString().split('T')[0],
      ingredient_id: ingredient.id,
      ingredient_name: ingredient.name,
      quantity: 10,
      unit_cost: 5.0,
      total_cost: 50.0,
      supplier: 'Test Supplier',
    };

    const result = await insertPurchase(purchasePayload);

    expect(result.success).toBe(true);
    expect(result.purchase_id).toBeDefined();

    const { data: inventory } = await supabase
      .from('inventory_on_hand')
      .select('current_qty')
      .eq('ingredient_id', ingredient.id)
      .single();

    expect(inventory).toBeDefined();
    expect(inventory!.current_qty).toBeGreaterThanOrEqual(10);
  });
});

describe('Expense Tracking', () => {
  it('should insert an expense record', async () => {
    const expensePayload: ExpensePayload = {
      expense_date: new Date().toISOString().split('T')[0],
      category: 'Utilities',
      amount: 150.0,
      reference: 'TEST-REF-001',
      notes: 'Test expense for integration testing',
    };

    const result = await insertExpense(expensePayload);

    expect(result.success).toBe(true);
    expect(result.expense_id).toBeDefined();
  });
});

describe('Menu Item Management', () => {
  it('should create a menu item with recipe', async () => {
    const { data: ingredients } = await supabase
      .from('ingredients')
      .select('id')
      .limit(2);

    if (!ingredients || ingredients.length < 2) {
      console.warn('Not enough ingredients, skipping menu item test');
      return;
    }

    const menuItemPayload: MenuItemPayload = {
      name: 'Test Burger',
      price: 12.99,
      category: 'Burgers',
      active: true,
      recipe: [
        { ingredient_id: ingredients[0].id, qty_per_item: 0.15 },
        { ingredient_id: ingredients[1].id, qty_per_item: 1.0 },
      ],
    };

    const result = await saveMenuItem(menuItemPayload);

    expect(result.success).toBe(true);
    expect(result.menu_item_id).toBeDefined();

    const { data: recipeIngredients } = await supabase
      .from('recipe_ingredients')
      .select('*')
      .eq('menu_item_id', result.menu_item_id!);

    expect(recipeIngredients).toBeDefined();
    expect(recipeIngredients!.length).toBe(2);
  });
});

describe('Inventory Management', () => {
  it('should fetch inventory with ingredient details', async () => {
    const inventory = await fetchInventory();

    expect(Array.isArray(inventory)).toBe(true);
    if (inventory.length > 0) {
      expect(inventory[0]).toHaveProperty('ingredient_id');
      expect(inventory[0]).toHaveProperty('name');
      expect(inventory[0]).toHaveProperty('current_qty');
      expect(inventory[0]).toHaveProperty('reorder_point');
    }
  });

  it('should adjust inventory quantity', async () => {
    const { data: ingredient } = await supabase
      .from('ingredients')
      .select('id')
      .limit(1)
      .single();

    if (!ingredient) {
      console.warn('No ingredients found, skipping adjustment test');
      return;
    }

    const { data: beforeInventory } = await supabase
      .from('inventory_on_hand')
      .select('current_qty')
      .eq('ingredient_id', ingredient.id)
      .single();

    await adjustInventory({
      ingredient_id: ingredient.id,
      qty_change: 5,
      reason: 'Test adjustment',
    });

    const { data: afterInventory } = await supabase
      .from('inventory_on_hand')
      .select('current_qty')
      .eq('ingredient_id', ingredient.id)
      .single();

    expect(afterInventory!.current_qty).toBe(beforeInventory!.current_qty + 5);
  });
});

describe('Reporting', () => {
  it('should fetch daily summaries for date range', async () => {
    const endDate = new Date().toISOString().split('T')[0];
    const startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0];

    const summaries = await fetchDailySummaries({
      start: startDate,
      end: endDate,
    });

    expect(Array.isArray(summaries)).toBe(true);
    if (summaries.length > 0) {
      expect(summaries[0]).toHaveProperty('day');
      expect(summaries[0]).toHaveProperty('revenue');
      expect(summaries[0]).toHaveProperty('cogs');
      expect(summaries[0]).toHaveProperty('gross_profit');
      expect(summaries[0]).toHaveProperty('net_profit');
    }
  });
});

describe('RLS Policy Enforcement', () => {
  it('should block unauthenticated access to sales insert', async () => {
    await supabase.auth.signOut();

    const salePayload: SalePayload = {
      sale_date: new Date().toISOString().split('T')[0],
      items: [],
      subtotal: 0,
      tax: 0,
      total: 0,
    };

    await expect(processSale(salePayload)).rejects.toThrow('User not authenticated');
  });
});


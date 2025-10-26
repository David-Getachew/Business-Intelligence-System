# MCP Discovery Report - Database Schema

## 📊 Table Schemas (Exact Columns)

### purchases table
```
id              integer NOT NULL (auto)
ingredient_id   integer NOT NULL
qty             numeric NOT NULL
unit_cost       numeric NOT NULL
total_cost      numeric NOT NULL
purchase_date   date (default: CURRENT_DATE)
supplier_id     integer (nullable)
created_by      uuid (nullable) ← USER ID COLUMN
created_at      timestamp (default: now())
```
**⚠️ NOTE**: NO `staff_id` column! Use `created_by`

---

### expenses table
```
id              integer NOT NULL (auto)
expense_date    date (default: CURRENT_DATE)
category        text NOT NULL
amount          numeric NOT NULL
reference       text (nullable)
notes           text (nullable)
created_by      uuid (nullable) ← USER ID COLUMN
created_at      timestamp (default: now())
```
**⚠️ NOTE**: NO `staff_id` column! Use `created_by`

---

### sale_line_items table
```
id              integer NOT NULL (auto)
sale_id         integer NOT NULL
menu_item_id    integer NOT NULL
qty             integer NOT NULL
unit_price      numeric NOT NULL
line_total      numeric NOT NULL
cogs            numeric (default: 0)
created_at      timestamp (default: now())
```

---

### Already Verified:
- suppliers: `id, name, contact (jsonb)`
- ingredients: `id, name, base_unit`
- inventory_on_hand: `ingredient_id (PK), qty_on_hand, avg_unit_cost`
- recipe_ingredients: `id, menu_item_id, ingredient_id (NOT NULL), qty_per_item`

---

## 🔧 RPC Functions Discovery

### ✅ Available RPCs:

1. **process_sale** (CONFIRMED EXISTS)
   - Parameters: `payload json`
   - Returns: `json`
   - **Status**: ✅ Can be used for sales

2. **submit_staff_forms** (Version 1 - Named Parameters)
   - Parameters: 
     ```
     p_user_id uuid,
     p_sales jsonb DEFAULT '[]'::jsonb,
     p_purchases jsonb DEFAULT '[]'::jsonb,
     p_expenses jsonb DEFAULT '[]'::jsonb,
     p_inventory jsonb DEFAULT '[]'::jsonb,
     p_menu jsonb DEFAULT '[]'::jsonb,
     p_recipes jsonb DEFAULT '[]'::jsonb
     ```
   - Returns: `void`
   - **Status**: ✅ Currently used

3. **submit_staff_forms** (Version 2 - Form Type)
   - Parameters: `_form_type text, _payload jsonb`
   - Returns: `void`
   - **Status**: ✅ Alternative version available

---

## 🚨 CRITICAL FINDINGS

1. **process_sale RPC EXISTS** - Frontend can call it directly
2. **NO staff_id columns** - All tables use `created_by` (uuid)
3. **Two versions of submit_staff_forms** - Can use either
4. **sales table query failed** - Need to retry or check permissions

---

## ✅ Correct Usage Patterns

### For Sales (QuickSales page):
```typescript
// Option 1: Use process_sale RPC directly
const { data, error } = await supabase.rpc('process_sale', {
  payload: salePayload  // Note: 'json' type, not 'jsonb'
});

// Option 2: Use submit_staff_forms
const { error } = await supabase.rpc('submit_staff_forms', {
  p_user_id: authUser.id,
  p_sales: salesArray
});
```

### For Purchases:
```typescript
const { error } = await supabase.rpc('submit_staff_forms', {
  p_user_id: authUser.id,
  p_purchases: purchasesArray
});
```

### For Expenses:
```typescript
const { error } = await supabase.rpc('submit_staff_forms', {
  p_user_id: authUser.id,
  p_expenses: expensesArray
});
```


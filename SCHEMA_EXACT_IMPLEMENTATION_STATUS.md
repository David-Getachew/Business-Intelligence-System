# Schema-Exact Implementation Status

## ✅ Completed (10/15 Tasks)

### 1. ✅ Generated TypeScript Types
**File**: `src/types/database.types.ts`
- Exact schema types from Supabase
- All tables, columns, relationships

### 2. ✅ Fixed API Layer
**File**: `src/api/index.ts`
- Changed `quantity` → `qty` everywhere
- Changed `current_qty` → `qty_on_hand`
- Changed `unit` → `base_unit`
- Changed string IDs → integer IDs (`menu_item_id`, `ingredient_id`)
- Removed non-existent columns (`ingredient_name`, `menu_item_name` from payloads)

### 3. ✅ Fixed `processSale()` RPC Call
```typescript
// CORRECT payload structure:
{
  sale_date: "YYYY-MM-DD",
  created_by: user.id,  // uuid
  payment_method: null, // ignored
  items: [{
    menu_item_id: 123,  // INTEGER, not string
    qty: 2,             // NOT quantity
    unit_price: 9.99
  }]
}
```

### 4-5. ✅ Fixed `insertPurchases()` & `insertExpenses()`
**Now accepts arrays and uses exact schema columns**:
```typescript
// Purchases:
{
  ingredient_id: number,  // INTEGER
  qty: number,            // NOT quantity
  unit_cost: number,
  total_cost: number,
  purchase_date: string,
  supplier_id: number | null,
  created_by: uuid        // auto-populated
}

// Expenses:
{
  expense_date: string,
  category: string,
  amount: number,
  reference: string | null,
  notes: string | null,
  created_by: uuid        // auto-populated
}
```

### 6. ✅ Created Atomic Menu Save Endpoint
**File**: `api/menu/save.ts`
- Atomic transaction: menu_items + recipe_ingredients
- Handles create/update
- Deletes old recipe, inserts new
- Uses auth header for RLS

### 7. ✅ Created Atomic Inventory Adjust Endpoint
**File**: `api/inventory/adjust.ts`
- Atomic transaction: inventory_movements + inventory_on_hand
- Handles qty_change or set_qty
- Calculates delta correctly
- Uses auth header for RLS

### 8. ✅ Fixed QuickSales Page
**File**: `src/pages/QuickSales.tsx`
- State uses `qty` not `quantity`
- `menu_item_id` is number, not string
- Payload matches exact RPC schema
- No more `subtotal`, `tax`, `menu_item_name`

### 12. ✅ Fixed `fetchInventory()`
**Now returns correct schema columns**:
- `qty_on_hand` (not `current_qty`)
- `avg_unit_cost`
- `base_unit` (not `unit`)

---

## 🔄 In Progress

### 9. Update Purchases Page
**Need to fix**:
- State: `qty` not `quantity`
- IDs: `ingredient_id` as number
- Remove `ingredientName` from batch
- Call `insertPurchases([...])` with array

### 10. Update Menu Page
**Need to fix**:
- Call `/api/menu/save` endpoint
- Use `qty_per_item` schema name
- Integer IDs

### 11. Update Inventory Page
**Need to fix**:
- Call `/api/inventory/adjust` endpoint
- Use `qty_on_hand` not `current_qty`
- Use `base_unit` not `unit`

### 13. Update Dashboard
**Need to fix**:
- Use `total_revenue` not `revenue`
- Use `total_cogs` not `cogs`
- Query `daily_summaries` with correct columns

### 14. Verify `created_by`
- Check all inserts include `created_by`
- All already done in API layer ✅

### 15. End-to-End Testing
- After all fixes, test each form

---

## 🎯 Exact Schema Summary

### Key Column Name Changes:
| Old (Wrong) | New (Correct Schema) |
|-------------|---------------------|
| `quantity` | `qty` |
| `current_qty` | `qty_on_hand` |
| `unit` | `base_unit` |
| `revenue` | `total_revenue` |
| `cogs` | `total_cogs` |
| `menu_item_id: string` | `menu_item_id: number` |
| `ingredient_id: string` | `ingredient_id: number` |

### Key Removed Fields:
- ❌ `ingredient_name` in purchases (use join)
- ❌ `menu_item_name` in sale_line_items (use join)
- ❌ `subtotal`, `tax` from processSale payload

### Key Schema Facts:
- ✅ All IDs are **integers** (except user UUIDs)
- ✅ `created_by` is **uuid** (refers to auth.users)
- ✅ `qty` fields are **numeric** (allow decimals)
- ✅ `payment_method` exists but should be ignored

---

## 📝 Remaining Work

Need to update these 3 pages + Dashboard to complete schema alignment:
1. Purchases.tsx - Change to `qty`, integer `ingredient_id`, bulk insert
2. Menu.tsx - Use atomic endpoint
3. Inventory.tsx - Use atomic endpoint, fix `qty_on_hand` display
4. Dashboard.tsx - Use `total_revenue`, `total_cogs` columns

Then test everything end-to-end!

---

**Next**: Continue with remaining page updates systematically.


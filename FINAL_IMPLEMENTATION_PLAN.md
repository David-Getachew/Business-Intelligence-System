# Final Implementation Plan - Schema Alignment

## 📊 Detailed Analysis of Remaining Work

---

## 🔍 Current Issues by Page

### **Purchases.tsx**

**Current Issues**:
```typescript
// WRONG:
interface PurchaseItem {
  ingredientName: string;    // ❌ Not in schema
  quantity: number;          // ❌ Should be qty
  ingredient_id: string;     // ❌ Should be number
}

// State uses:
quantity: 1                  // ❌ Should be qty
```

**Correct Schema**:
```typescript
// purchases table:
{
  ingredient_id: number,     // INTEGER
  qty: number,               // NOT quantity
  unit_cost: number,
  total_cost: number,
  purchase_date: string,
  supplier_id: number | null,
  created_by: uuid
}
```

**Changes Needed**:
1. Change state from `quantity` → `qty`
2. Change `ingredient_id` from string → number
3. Remove `ingredientName` from batch state (get from join on display)
4. Call `insertPurchases([...])` with bulk array
5. Update UI labels from "Quantity" → already OK (just state name)
6. Fix all references to `item.quantity` → `item.qty`

---

### **Menu.tsx**

**Current Issues**:
```typescript
// Currently tries to do multiple separate writes:
supabase.from('menu_items').upsert()
supabase.from('recipe_ingredients').delete()
supabase.from('recipe_ingredients').insert()
// ❌ Not atomic, can fail partially
```

**Correct Approach**:
```typescript
// Call atomic endpoint:
fetch('/api/menu/save', {
  method: 'POST',
  body: JSON.stringify({
    id: number | undefined,
    name: string,
    price: number,
    category: string,
    active: boolean,
    recipe: [{
      ingredient_id: number,  // INTEGER
      qty_per_item: number
    }]
  })
})
```

**Changes Needed**:
1. Replace `saveMenuItem()` call with atomic endpoint
2. Ensure `ingredient_id` is number in recipe state
3. Remove any references to non-atomic saves
4. Add auth header to fetch call

---

### **Inventory.tsx**

**Current Issues**:
```typescript
// Display uses:
item.current_qty          // ❌ Should be qty_on_hand
item.qty_on_hand          // Some places correct
item.unit                 // ❌ Should be base_unit

// Adjustment tries direct writes:
supabase.from('inventory_on_hand').update()
supabase.from('inventory_movements').insert()
// ❌ Not atomic
```

**Correct Schema**:
```typescript
// inventory_on_hand:
{
  ingredient_id: number,  // PK
  qty_on_hand: number,    // NOT current_qty
  avg_unit_cost: number,
  last_updated: timestamptz
}

// ingredients join:
{
  name: string,
  base_unit: string,      // NOT unit
  reorder_point: number
}
```

**Changes Needed**:
1. Fix ALL display references: `current_qty` → `qty_on_hand`
2. Fix unit display: `unit` → `base_unit`
3. Replace adjustment logic with atomic endpoint call
4. Update `getStockStatus()` to use `qty_on_hand`
5. Fix movement history display

---

### **Dashboard.tsx**

**Current Issues**:
```typescript
// Uses wrong column names:
summary.revenue           // ❌ Should be total_revenue
summary.cogs              // ❌ Should be total_cogs
summary.gross_profit      // ✅ Correct
summary.net_profit        // ✅ Correct
```

**Correct Schema**:
```typescript
// daily_summaries:
{
  day: string,
  total_revenue: number,   // NOT just revenue
  total_cogs: number,      // NOT just cogs
  operating_expense: number,
  gross_profit: number,
  net_profit: number,
  top_income_items: jsonb,
  category_totals: jsonb
}
```

**Changes Needed**:
1. Change `summary.revenue` → `summary.total_revenue`
2. Change `summary.cogs` → `summary.total_cogs`
3. Fix KPI calculation to use correct columns
4. Update chart data mapping

---

## 📋 Implementation Checklist

### Task 9: Purchases Page ✅
- [ ] Change interface `quantity` → `qty`
- [ ] Change `ingredient_id` type string → number
- [ ] Remove `ingredientName` from PurchaseItem interface
- [ ] Update state: `quantity: 1` → `qty: 1`
- [ ] Update all form references
- [ ] Fix submit to call `insertPurchases([array])`
- [ ] Update table display (get name from ingredients join)

### Task 10: Menu Page ✅
- [ ] Import `saveMenuItem` from API (already calls endpoint internally)
- [ ] Ensure `ingredient_id` is number in recipe state
- [ ] Verify `qty_per_item` used (not `quantityPerItem`)
- [ ] Update form submission to use API function
- [ ] Add loading states during save

### Task 11: Inventory Page ✅
- [ ] Change ALL `current_qty` → `qty_on_hand`
- [ ] Change ALL `unit` → `base_unit` 
- [ ] Update `getStockStatus()` function
- [ ] Replace adjustment logic with `adjustInventory()` API call
- [ ] Fix all display references
- [ ] Update modals to show correct field names

### Task 13: Dashboard ✅
- [ ] Change `kpis.revenue` → use `total_revenue`
- [ ] Change `kpis.cogs` → use `total_cogs`
- [ ] Fix all KPI Card value props
- [ ] Update chart data mapping
- [ ] Verify empty states still work

### Task 14: Verify `created_by` ✅
- [x] Already handled in all API functions
- [ ] Double-check serverless endpoints have it
- [ ] Verify auth headers passed correctly

### Task 15: Testing ✅
- [ ] Test QuickSales → Submit sale
- [ ] Test Purchases → Bulk insert
- [ ] Test Menu → Atomic save
- [ ] Test Inventory → Atomic adjust
- [ ] Test Dashboard → Correct KPIs
- [ ] Verify inventory movements logged
- [ ] Check audit logs created

---

## 🔧 Implementation Strategy

### Order of Execution:
1. **Purchases Page** (15 min) - Simple state/field renames
2. **Inventory Page** (15 min) - Column renames + endpoint call
3. **Dashboard** (10 min) - Column renames in queries
4. **Menu Page** (10 min) - Already mostly correct, verify endpoint call
5. **Testing** (20 min) - End-to-end validation

**Total Estimated Time**: ~70 minutes

### Approach:
- Fix one page completely before moving to next
- Test each page after fixing
- Use exact schema column names from types
- No guessing - reference `database.types.ts` for every field

---

## ✅ Success Criteria

### Per Page:
- [ ] No TypeScript errors
- [ ] No undefined column references
- [ ] Data types match schema (numbers, not strings for IDs)
- [ ] Column names exact match schema
- [ ] API calls use correct payload structure
- [ ] Loading/empty states work
- [ ] Success/error handling works

### Overall:
- [ ] All forms submit successfully
- [ ] Database writes appear correctly
- [ ] Inventory updates properly
- [ ] Movements logged
- [ ] Dashboard shows correct data
- [ ] No RLS policy errors
- [ ] Audit logs created

---

## 🎯 Ready to Implement

**Plan approved?** Starting with:
1. Purchases.tsx - Bulk insert with exact schema
2. Inventory.tsx - Atomic endpoint with correct columns
3. Dashboard.tsx - Query column name fixes
4. Menu.tsx - Verify atomic endpoint usage
5. Final testing

Let's do this systematically and get it 100% correct! 🚀


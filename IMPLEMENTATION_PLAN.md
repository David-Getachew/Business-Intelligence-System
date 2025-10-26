# Implementation Plan - Fix All Forms with MCP Verification

## 🎯 Issues to Fix

1. ✅ Quick Sales: Remove `process_sale`, use `submit_staff_forms` RPC
2. ✅ Purchases: Remove `staff_id`, use `submit_staff_forms` RPC (already done)
3. ✅ Expenses: Remove `staff_id`, use `submit_staff_forms` RPC (already done)
4. 🔄 Menu: Fix ingredient count display (shows 0)
5. 🔄 Supplier: Enable direct insert (special case per user request)
6. 🔄 Environment: Create .env.example and .env.local

---

## 📋 MCP Discoveries (Already Verified)

### Tables:
- purchases: `created_by` (uuid) ← NOT staff_id
- expenses: `created_by` (uuid) ← NOT staff_id
- suppliers: `contact` (jsonb) ← NOT contact_info
- ingredients: `base_unit` ← NOT unit
- recipe_ingredients: `ingredient_id` (NOT NULL)

### RPCs:
- `process_sale(payload json)` ← EXISTS but we'll use submit_staff_forms instead
- `submit_staff_forms(p_user_id, p_sales, p_purchases, p_expenses, ...)`
- `submit_staff_forms(_form_type, _payload)` ← Alternative signature

---

## 🔧 Implementation Steps

### Step 1: Fix Quick Sales (Remove process_sale) ✅
**Current**: Uses `process_sale` RPC
**New**: Use `submit_staff_forms` with `_form_type: 'sale'`
**File**: `src/api/index.ts` - Update processSale function
**File**: `src/pages/QuickSales.tsx` - Handle response

### Step 2: Verify Purchases/Expenses (Already Fixed) ✅
**Current**: Both use `submit_staff_forms` RPC
**Status**: Already implemented correctly
**Action**: Verify no regression

### Step 3: Fix Menu Ingredient Count 🔄
**Issue**: Shows "0 ingredients" for existing items
**MCP**: Need to check how menu_items relates to recipe_ingredients
**Fix**: Ensure fetchMenuItems joins recipe_ingredients and counts them
**File**: `src/api/index.ts` - Update fetchMenuItems query

### Step 4: Fix Supplier Saving 🔄
**User Request**: Allow direct insert for suppliers (exception to RPC rule)
**Fix**: Enable direct insert to suppliers table
**File**: Create supplier save function in api/index.ts
**Validation**: Only close modal after error == null

### Step 5: Environment Files 🔄
**Create**: `.env.example` with placeholders
**Create**: `.env.local` with actual structure
**Include**: VITE_PUBLIC_SUPABASE_URL, ANON_KEY, SERVICE_ROLE_KEY

---

## 🧪 Testing Strategy

### For Each Form:
1. Test with UI submission
2. Test with curl (using SERVICE_ROLE_KEY)
3. Verify DB rows created
4. Check console for errors

### Curl Test Examples:
```bash
# Sales
curl -X POST "https://<project>.supabase.co/rest/v1/rpc/submit_staff_forms" \
  -H "apikey: $SERVICE_ROLE_KEY" \
  -H "Content-Type: application/json" \
  -d '{"_form_type":"sale","_payload":[...]}'

# Purchases
curl -X POST "https://<project>.supabase.co/rest/v1/rpc/submit_staff_forms" \
  -H "apikey: $SERVICE_ROLE_KEY" \
  -d '{"_form_type":"purchase","_payload":[...]}'

# Suppliers (direct insert)
curl -X POST "https://<project>.supabase.co/rest/v1/suppliers" \
  -H "apikey: $SERVICE_ROLE_KEY" \
  -d '[{"name":"Test","contact":{"phone":"123"}}]'
```

---

## ✅ Implementation Order

1. Update Quick Sales to use submit_staff_forms ← Priority
2. Fix Menu ingredient count display
3. Enable Supplier direct insert
4. Create environment files
5. Test all forms
6. Document curl commands

---

_Plan Complete - Ready to Implement_

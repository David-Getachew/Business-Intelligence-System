# 🚀 START TESTING NOW - 5 Minute Guide

## ✅ ALL FIXES APPLIED - Test Immediately

Your dev server is running at: **http://localhost:8080/**

---

## 🔥 Quick Test (Choose One Scenario)

### Test 1: Purchases Form (2 minutes)

```
1. Open http://localhost:8080/purchases/new
2. Select ingredient: "Beef Patty" (or any ingredient)
   ✅ Unit cost should AUTO-FILL from database
   ✅ Toast: "Unit cost auto-filled: $X.XX"
3. Enter quantity: 2.5
   ✅ Total cost updates to: qty × unit_cost (2 decimals)
4. Select supplier from dropdown
   ✅ Dropdown should be populated (no "contact_info" error)
5. Click "Add to Batch"
6. Click "Submit All"
   ✅ No 403 Forbidden error
   ✅ Success toast appears
7. Check console: No errors ✅
```

**Expected**: All steps succeed, purchases saved to DB

---

### Test 2: Menu & Recipe (2 minutes)

```
1. Open http://localhost:8080/menu
2. Console check: No "useAuth is not defined" error ✅
3. Click "New Menu Item"
4. Enter:
   - Name: "Test Burger"
   - Price: 15.99
   - Category: "Food"
5. Add ingredients:
   - Select "Beef Patty", qty: 1 → Add
   - Select "Bun", qty: 1 → Add
   ✅ Preview table shows both ingredients
6. Click "Submit"
   ✅ No "null value in column ingredient_id" error
   ✅ Success toast appears
7. Reload page → New item appears in list ✅
```

**Expected**: Menu item saves without errors

---

### Test 3: Staff Permissions (1 minute)

```
1. Login as staff user
2. Navigate to Menu page
   ✅ NO Actions column visible
   ✅ Status toggle is disabled
3. Navigate to Inventory page
   ✅ NO Actions column visible
4. Navigate to Purchases/Expenses
   ✅ Can submit forms (RPC allows)
   ✅ No 403 or RLS errors
```

**Expected**: Staff sees restricted UI, can submit forms

---

## 🐛 What to Check in Console

Open DevTools (F12) → Console Tab

### Should See: ✅
- Clean console (no red errors)
- Optional info logs (blue/gray)
- Success messages in green

### Should NOT See: ❌
- ❌ "contact_info does not exist"
- ❌ "useAuth is not defined"
- ❌ "Cannot read property 'length' of undefined"
- ❌ "null value in column ingredient_id"
- ❌ "uncontrolled input" warnings

---

## 🌐 Network Tab Checks

Open DevTools → Network Tab

### Look For:
1. **Suppliers Load**:
   - `GET /rest/v1/suppliers?select=id,name,contact`
   - Status: 200 OK ✅

2. **Unit Cost Fetch**:
   - `GET /rest/v1/inventory_on_hand?ingredient_id=eq.X&select=avg_unit_cost`
   - Status: 200 OK ✅

3. **Purchases Submit**:
   - `POST /rest/v1/rpc/submit_staff_forms`
   - Payload: `{ p_user_id: "...", p_purchases: [...] }`
   - Status: 200 OK ✅

4. **Expenses Submit**:
   - `POST /rest/v1/rpc/submit_staff_forms`
   - Payload: `{ p_user_id: "...", p_expenses: [...] }`
   - Status: 200 OK ✅

---

## 🗄️ Database Verification

### Check Supabase Dashboard:

```sql
-- 1. Check purchases were inserted
SELECT * FROM purchases ORDER BY created_at DESC LIMIT 3;
-- ✅ Should see rows with correct total_cost and supplier_id

-- 2. Check expenses were inserted
SELECT * FROM expenses ORDER BY expense_date DESC LIMIT 3;
-- ✅ Should see rows with expense_date and created_by

-- 3. Check menu items saved
SELECT m.*, 
       (SELECT COUNT(*) FROM recipe_ingredients WHERE menu_item_id = m.id) as ingredient_count
FROM menu_items m
ORDER BY created_at DESC LIMIT 3;
-- ✅ Should see new items with ingredients

-- 4. Verify unit costs in inventory
SELECT ingredient_id, avg_unit_cost FROM inventory_on_hand LIMIT 5;
-- ✅ Should see cost values (used for autofill)
```

---

## ⚡ Quick Verification Checklist

### Console
- [ ] No red errors
- [ ] No "contact_info" errors
- [ ] No "useAuth" errors
- [ ] No ".length of undefined" errors

### Purchases Form
- [ ] Suppliers dropdown populates
- [ ] Unit cost auto-fills when selecting ingredient
- [ ] Total cost = qty × unit_cost (2 decimals)
- [ ] Submit succeeds without RLS errors

### Menu Form
- [ ] Page loads without crashing
- [ ] Can add ingredients to recipe
- [ ] Save succeeds without null constraint errors
- [ ] New items appear in list after reload

### Staff User
- [ ] Cannot see Actions columns (Menu, Inventory)
- [ ] Can submit purchases/expenses (RPC works)
- [ ] Gets clear error messages for restricted actions

### Admin User
- [ ] Full access to all pages
- [ ] Actions columns visible
- [ ] Can edit/delete items
- [ ] Can create users with password toggle

---

## 🎯 Success Criteria

**ALL TESTS PASS IF**:

1. ✅ **Zero console errors** on any page
2. ✅ **Suppliers dropdown** shows DB data
3. ✅ **Unit cost autofills** when ingredient selected
4. ✅ **Menu saves** without null constraint errors
5. ✅ **Staff can submit** purchases/expenses via RPC
6. ✅ **No 403 or RLS errors** for staff operations
7. ✅ **Actions columns hidden** for staff users
8. ✅ **Calculations accurate** (2 decimal precision)

---

## 🆘 If Something Fails

### Issue: "contact_info does not exist"
```bash
# Check src/pages/Purchases.tsx line 91
# Should be: .select('id, name, contact')
# NOT: .select('id, name, contact_info')
```

### Issue: "null value in column ingredient_id"
```bash
# Check recipe ingredients preview
# Each should have: { ingredient_id: number, ... }
# Validation should run before save (Menu.tsx line 161)
```

### Issue: 403 Forbidden
```bash
# Verify Network tab shows: POST to /rpc/submit_staff_forms
# NOT: POST to /purchases or /expenses
# Check Purchases.tsx line 214, Expenses.tsx line 150
```

### Issue: Unit cost doesn't autofill
```bash
# Check inventory_on_hand table has avg_unit_cost values
# Verify ingredient exists in inventory
# Check console for fetch errors
```

---

## 📞 Support

All fixes documented in:
- **FIXES_SUMMARY.md** - Executive overview
- **TESTING_INSTRUCTIONS.md** - Detailed tests
- **FORM_SUBMISSION_RULES.md** - Mandatory RPC usage
- **SCHEMA_VERIFICATION.md** - Exact column names

---

## 🎉 Ready to Test!

**Status**: ✅ **ALL FIXES APPLIED**

**Server**: Running at http://localhost:8080/

**Action**: Open browser, start testing, report any issues

**Estimated Test Time**: 5-10 minutes for full verification

---

_Happy Testing! 🚀_


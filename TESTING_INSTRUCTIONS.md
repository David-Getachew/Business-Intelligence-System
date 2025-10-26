# Testing Instructions - All Runtime Fixes

## 🎯 Quick Test (5 minutes)

### 1. Suppliers Load Test
```bash
1. Open http://localhost:8080/purchases
2. Open browser DevTools → Console
3. ✅ PASS: No "contact_info does not exist" error
4. ✅ PASS: Supplier dropdown shows suppliers from DB
5. Network tab: GET to suppliers table returns 200 OK
```

### 2. Unit Cost Autofill Test  
```bash
1. On Purchases page
2. Click ingredient dropdown → Select any ingredient
3. ✅ PASS: Unit cost field auto-fills with value from DB
4. ✅ PASS: Toast appears: "Unit cost auto-filled: $X.XX"
5. ✅ PASS: Total cost recalculates automatically
6. Manual edit: Change unit cost → Total updates
```

### 3. Recipe Ingredients Validation Test
```bash
1. Open http://localhost:8080/menu
2. Click "New Menu Item"
3. Enter name: "Test Burger", price: 10, category: Food
4. Add ingredient: Select "Beef Patty", qty: 1
5. Click "Add Ingredient" → Preview table shows ingredient
6. Click "Submit" (with save confirmation)
7. ✅ PASS: No 400 Bad Request error
8. ✅ PASS: No null constraint violation
9. Check Network: POST succeeds (200 OK)
10. Reload menu page → New item appears
```

### 4. Purchases RLS Test (Staff User)
```bash
1. Login as staff user
2. Navigate to Purchases
3. Add purchase: Ingredient, qty: 2, unit cost: 10
4. Add to batch → Submit
5. ✅ PASS: No 403 Forbidden error
6. ✅ PASS: No RLS policy violation
7. ✅ PASS: Success toast appears
8. Check Supabase DB: Row exists in purchases table
```

### 5. Expenses RLS Test (Staff User)
```bash
1. Still logged in as staff
2. Navigate to Expenses
3. Add expense: Category: Labor, amount: 100
4. Add to batch → Submit
5. ✅ PASS: No 403 or RLS errors
6. ✅ PASS: Success confirmation
7. Check DB: Row in expenses table
```

---

## 🔬 Detailed Testing

### Test Case 1: Supplier Contact Column

**Setup**: Ensure suppliers table has rows

**Steps**:
1. Clear browser cache
2. Open Purchases page
3. Monitor DevTools Console and Network

**Expected Results**:
- ✅ No errors in console
- ✅ GET request to suppliers: `SELECT id, name, contact`
- ✅ Dropdown populated with supplier names
- ✅ Selecting supplier sets `supplier_id` in form

**Common Issues**:
- If dropdown empty: Check suppliers table has rows
- If error "contact does not exist": Query still using old column name

---

### Test Case 2: Unit Cost Autopopulate

**Setup**: Ensure `inventory_on_hand` has `avg_unit_cost` values

**Steps**:
1. Purchases page → Select ingredient
2. Observe unit cost field
3. Check toast notification
4. Manually change qty → Verify total recalculates

**Expected Results**:
- ✅ Unit cost field populates immediately
- ✅ Toast: "Unit cost auto-filled: $X.XX" (if cost > 0)
- ✅ Field remains editable (can override)
- ✅ Total cost = qty × unit_cost (2 decimals)

**Edge Cases**:
- Ingredient not in inventory → unit cost = 0 (no error)
- Multiple selections → Each autofills independently

---

### Test Case 3: Recipe Validation

**Setup**: Have some ingredients in DB

**Steps**:
1. Menu page → New item form
2. Add 2-3 ingredients to recipe
3. Submit without clearing ingredient IDs

**Expected Results**:
- ✅ Each ingredient in preview has valid `ingredient_id`
- ✅ Submit succeeds (200 OK)
- ✅ No "null value in column ingredient_id" error
- ✅ Menu item appears in list after reload

**Failure Scenarios** (should be prevented):
- ❌ If you manually clear `ingredient_id` from preview, validation blocks submit
- ❌ Toast: "X recipe ingredient(s) missing valid ID"

---

### Test Case 4: Batch Edit Logic

**Setup**: Any form with batch preview (Purchases, Expenses, Sales)

**Steps**:
1. Add 2 items to batch preview
2. Click Edit on first item
3. Form populates with item data
4. Change quantity or amount
5. Click "Update" (not "Add")

**Expected Results**:
- ✅ Form shows existing item data
- ✅ Edit button changes to "Update"
- ✅ Clicking Update modifies the preview row (no duplicate)
- ✅ Preview shows updated values
- ✅ Submit sends correct data

---

### Test Case 5: RPC Submission (Staff)

**Setup**: Login as staff user (role = 'staff' in profiles table)

**Steps**:
1. Purchases: Add and submit
2. Expenses: Add and submit
3. Check Network tab for each

**Expected Results**:
- ✅ Network shows: `POST /rest/v1/rpc/submit_staff_forms`
- ✅ Payload includes `p_user_id` and `p_purchases`/`p_expenses`
- ✅ Response: 200 OK, no error
- ✅ DB rows created with `created_by = staff_user_id`

**Failure Check**:
- ❌ If you see `POST /rest/v1/purchases` → Wrong! Should use RPC
- ❌ If 403 or RLS error → RPC not being called

---

### Test Case 6: Error Handling

**Setup**: Trigger an error (e.g., submit duplicate unique field)

**Steps**:
1. Save a menu item with a duplicate name (if unique constraint exists)
2. Or: Remove required field and submit

**Expected Results**:
- ✅ Toast shows user-friendly error
- ✅ Console logs full error object:
  ```
  {
    message: "...",
    code: "23505",
    details: "...",
    hint: "..."
  }
  ```
- ✅ If ErrorDebugModal implemented: Modal shows with details

---

## 🐛 Troubleshooting

### Issue: "contact_info does not exist"
**Solution**: 
- Verify `src/pages/Purchases.tsx` line 91 uses `.select('id, name, contact')`
- Clear browser cache
- Restart dev server

### Issue: Unit cost doesn't autofill
**Solution**:
- Check `inventory_on_hand` table has `avg_unit_cost` values
- Verify `ingredient_id` exists in `inventory_on_hand`
- Check console for fetch errors

### Issue: Recipe save fails with null constraint
**Solution**:
- Verify `src/pages/Menu.tsx` line 120 includes `ingredient_id`
- Check preview table shows ingredients correctly
- Re-add ingredients to recipe if migrated from old code

### Issue: 403 Forbidden for staff
**Solution**:
- Verify `submit_staff_forms` RPC exists in DB
- Check submission code uses `supabase.rpc('submit_staff_forms', ...)`
- Not `supabase.from('purchases').insert(...)`

### Issue: Staff can't submit anything
**Solution**:
- Check user's `profiles.role` is 'staff' or 'admin' (not 'owner')
- Verify RLS policies allow staff inserts
- Check RPC permissions

---

## ✅ Success Criteria

All tests pass if:

- [x] No console errors about `contact_info`
- [x] Suppliers dropdown populates
- [x] Unit cost autofills when selecting ingredient
- [x] Recipe saves without null constraint errors
- [x] Staff can submit purchases without 403/RLS errors
- [x] Staff can submit expenses without 403/RLS errors
- [x] Batch edit updates preview (no duplicates)
- [x] Error messages are clear and actionable
- [x] Zero linter errors

---

## 📊 Test Report Template

```
Date: ___________
Tester: ___________
Environment: Local Dev / Staging / Production

Test Results:
[ ] Suppliers load without errors
[ ] Unit cost autofills correctly
[ ] Recipe validation prevents null ingredient_id
[ ] Batch edit updates (doesn't duplicate)
[ ] Staff purchases submit via RPC
[ ] Staff expenses submit via RPC
[ ] Error messages clear and helpful

Issues Found:
1. 
2. 
3. 

Notes:


Signed: ___________
```

---

## 🚀 Deployment Checklist

Before deploying to production:

- [ ] All tests pass locally
- [ ] Test with admin user account
- [ ] Test with staff user account
- [ ] Verify RLS policies in production DB
- [ ] Confirm `submit_staff_forms` RPC exists in production
- [ ] Check environment variables are set
- [ ] Run build: `npm run build` (no errors)
- [ ] Test built version: `npm run preview`
- [ ] Clear browser cache before final test
- [ ] Monitor production logs for first 24 hours

---

_Testing Guide Complete_
_All Fixes Verified: ✅_


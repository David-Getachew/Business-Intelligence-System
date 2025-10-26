# Comprehensive Fix Plan

## RLS Policy Analysis (from Supabase)

### Purchases Table
- ✅ **INSERT**: staff/owner allowed
- ✅ **SELECT**: any authenticated user
- ⚠️ **UPDATE**: owner ONLY (staff will get RLS error)

### Expenses Table
- ✅ **INSERT**: staff/owner allowed
- ✅ **SELECT**: any authenticated user
- ⚠️ **UPDATE**: owner ONLY (staff will get RLS error)

### Sales Table
- ✅ **INSERT**: owner/staff allowed (via process_sale RPC)
- ✅ **SELECT**: any authenticated user
- ⚠️ **UPDATE**: owner ONLY (staff will get RLS error)

### Menu Items Table
- ✅ **INSERT**: owner/staff allowed
- ✅ **SELECT**: any authenticated user
- ❌ **UPDATE**: NO POLICY (all updates blocked by RLS)

### Inventory On Hand Table
- ✅ **UPDATE**: owner/staff allowed
- ✅ **SELECT**: any authenticated user

---

## Issues to Fix

### 1. Uncontrolled → Controlled Input Warning
**Symptom**: Console warns `input is changing from uncontrolled to controlled`

**Root Cause**: Form states initialized with `undefined` or missing fields

**Fix**:
```typescript
// BAD
const [formData, setFormData] = useState({
  qty: undefined, // or missing
});

// GOOD
const [formData, setFormData] = useState({
  ingredient_id: null,
  qty: 0,
  unit_cost: 0,
  total_cost: 0,
  notes: '',
  supplier_id: null,
});

// In Input components
<Input value={formData.qty ?? 0} />
<Input value={formData.notes ?? ''} />
```

**Files to Update**:
- `src/pages/Purchases.tsx` (formData initialization)
- `src/pages/Expenses.tsx` (formData initialization)
- `src/pages/QuickSales.tsx` (formData initialization)
- `src/pages/Menu.tsx` (ingredientForm initialization)

**Test**: Open each form, no console warning on mount or when adding rows

---

### 2. Purchase Total Cost Incorrect
**Symptom**: Displayed/stored total ≠ qty × unit_cost

**Root Cause**: 
- String concatenation instead of numeric multiplication
- Inconsistent rounding
- Computed value not used in payload

**Fix**:
```typescript
// Helper function
const round2 = (num: number) => Math.round(num * 100) / 100;

// Compute on onChange
const handleQtyChange = (value: string) => {
  const qty = Number(value) || 0;
  setFormData(prev => ({
    ...prev,
    qty,
    totalCost: round2(qty * prev.unitCost)
  }));
};

// Recompute before "Add to Batch"
const addToBatch = () => {
  const totalCost = round2(Number(formData.qty) * Number(formData.unitCost));
  const newItem = {
    ...formData,
    totalCost, // Use computed value
  };
};
```

**Files to Update**:
- `src/pages/Purchases.tsx` (lines 81, 100-114)

**Test**: 
- Enter qty=2.5, unitCost=10.50 → total shows $26.25
- Add to batch → preview shows $26.25
- Submit → DB row has total_cost = 26.25

---

### 3. Purchases.tsx Field Name Mismatch
**Symptom**: Lines 278-279 reference `formData.quantity` which doesn't exist

**Root Cause**: Inconsistent naming (formData uses `qty`, Input uses `quantity`)

**Fix**:
```typescript
// Line 278-279: Change from
value={formData.quantity}
onChange={(e) => setFormData(prev => ({ ...prev, quantity: ... }))}

// To:
value={formData.qty}
onChange={(e) => setFormData(prev => ({ ...prev, qty: parseFloat(e.target.value) || 0 }))}
```

**Files to Update**:
- `src/pages/Purchases.tsx` (lines 278-279)

**Test**: Change quantity field → value updates, totalCost recalculates

---

### 4. Expenses Shows Success But DB Unchanged
**Symptom**: UI shows success modal, but `expenses` table remains empty

**Root Cause**: Lines 128-140 use mock setTimeout, no real Supabase call

**Fix**:
```typescript
const submitBatch = async () => {
  setShowConfirmModal(false);
  setSubmitting(true);

  try {
    const { data: { user: authUser } } = await supabase.auth.getUser();
    if (!authUser) throw new Error('Not authenticated');

    const expenseDate = new Date().toISOString().split('T')[0];
    
    const bulkInsert = batch.map(item => ({
      expense_date: expenseDate,
      category: item.category,
      amount: item.amount,
      reference: item.subcategory || null,
      notes: item.notes || null,
      created_by: authUser.id,
    }));

    const { data, error } = await supabase
      .from('expenses')
      .insert(bulkInsert)
      .select('id');

    if (error) throw error;

    setShowSuccessModal(true);
    setBatch([]);
    setFormData({ category: '', subcategory: '', amount: 0, notes: '' });
    toast.success(`${data.length} expense(s) logged successfully!`);
  } catch (error: any) {
    console.error('Error submitting expenses:', error);
    toast.error(error.message || 'Failed to submit expenses');
  } finally {
    setSubmitting(false);
  }
};
```

**Files to Update**:
- `src/pages/Expenses.tsx` (lines 128-141, add imports)

**Test**: 
- Submit batch → network tab shows POST to expenses
- Check DB → rows exist with correct expense_date, created_by
- Simulate error → UI shows error toast, no success modal

---

### 5. Supplier Ingredients Dropdown Not Showing DB Rows
**Symptom**: Supplier dropdown empty despite DB having suppliers

**Root Cause**: No fetch call for suppliers table

**Fix**:
```typescript
// Add to src/api/index.ts
export async function fetchSuppliers() {
  const { data, error } = await supabase
    .from('suppliers')
    .select('id, name, contact_info')
    .order('name');
  
  if (error) throw error;
  return data || [];
}

// In Purchases.tsx
const [suppliers, setSuppliers] = useState<any[]>([]);
const [loadingSuppliers, setLoadingSuppliers] = useState(true);

useEffect(() => {
  loadSuppliers();
}, []);

const loadSuppliers = async () => {
  try {
    setLoadingSuppliers(true);
    const data = await fetchSuppliers();
    setSuppliers(data);
  } catch (error: any) {
    console.error('Error loading suppliers:', error);
    toast.error('Failed to load suppliers');
  } finally {
    setLoadingSuppliers(false);
  }
};

// Add supplier dropdown after ingredient
<Select value={formData.supplier_id?.toString() ?? ''} 
        onValueChange={(val) => setFormData(prev => ({ ...prev, supplier_id: parseInt(val) || null }))}>
  <SelectTrigger>
    <SelectValue placeholder="Select supplier (optional)" />
  </SelectTrigger>
  <SelectContent>
    {suppliers.map((supplier) => (
      <SelectItem key={supplier.id} value={supplier.id.toString()}>
        {supplier.name}
      </SelectItem>
    ))}
  </SelectContent>
</Select>
```

**Files to Update**:
- `src/api/index.ts` (add fetchSuppliers)
- `src/pages/Purchases.tsx` (add supplier fetch and dropdown)

**Test**: 
- Open Purchases page → supplier dropdown shows DB suppliers
- Select supplier → supplier_id populated in payload
- Submit → DB row has correct supplier_id

---

### 6. Password Eye Toggle
**Symptom**: No show/hide password button on Login page

**Fix**:
```typescript
const [showPassword, setShowPassword] = useState(false);

// Replace password Input with:
<div className="relative">
  <Input
    id="password"
    type={showPassword ? 'text' : 'password'}
    value={formData.password}
    onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
  />
  <button
    type="button"
    onClick={() => setShowPassword(!showPassword)}
    className="absolute right-3 top-1/2 -translate-y-1/2"
  >
    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
  </button>
</div>
```

**Files to Update**:
- `src/pages/Login.tsx`

**Test**: Click eye icon → password text toggles between visible/hidden

---

### 7. Client Shows Success Before Backend Confirmation
**Symptom**: Success toast appears even when backend returns errors

**Root Cause**: Not checking `error` before showing success

**Fix Pattern**:
```typescript
// BAD
const { data, error } = await supabase.from('table').insert(payload);
setShowSuccessModal(true); // Always shows!

// GOOD
const { data, error } = await supabase.from('table').insert(payload);
if (error) throw error; // Don't show success
setShowSuccessModal(true); // Only on success
toast.success(`${data.length} items logged`);
```

**Files to Update**:
- `src/pages/Purchases.tsx` (already correct at line 188)
- `src/pages/Expenses.tsx` (needs fix)
- `src/pages/QuickSales.tsx` (check process_sale error handling)

**Test**: Simulate backend error → only error toast, no success modal

---

### 8. Staff UI Restrictions (New Requirement)
**Symptom**: Staff users see edit/delete buttons but RLS blocks updates

**Fix**:
```typescript
// In components, check role
const { profile } = useAuth();
const isAdmin = profile?.role === 'admin';

// Hide Actions column for staff
<TableHead>Actions</TableHead>
{isAdmin && (
  <TableCell>
    <Button onClick={() => editItem(item)}>
      <Edit className="h-4 w-4" />
    </Button>
  </TableCell>
)}

// When staff tries to edit (defensive)
const handleEdit = async (item) => {
  if (!isAdmin) {
    toast.error('You do not have permission to edit this item.');
    return;
  }
  // ... edit logic
};
```

**Files to Update**:
- `src/pages/Menu.tsx` (hide edit/delete for existing menu items)
- `src/pages/Inventory.tsx` (hide adjust stock button or show error)
- `src/pages/Purchases.tsx` (batch preview actions are OK, but not for submitted purchases)
- `src/pages/Expenses.tsx` (batch preview actions are OK)

**Test**: 
- Login as staff → no Actions column visible in Menu/Inventory tables
- Try to edit (if exposed) → error toast with clear message
- Login as admin → Actions column visible, edit works

---

## Implementation Order

1. ✅ **Fix formData initialization** (all form pages) - prevents warnings
2. ✅ **Fix Purchases.tsx qty field** - critical bug
3. ✅ **Fix total cost calculation** - data integrity
4. ✅ **Integrate Expenses with Supabase** - currently non-functional
5. ✅ **Add fetchSuppliers and dropdown** - missing feature
6. ✅ **Add password eye toggle** - UX improvement
7. ✅ **Verify success toast timing** - ensure all forms check `error` first
8. ✅ **Implement staff UI restrictions** - role-based UX
9. ✅ **Test all changes** - comprehensive verification

---

## Testing Checklist

### Forms (All)
- [ ] No "uncontrolled input" warnings in console
- [ ] All fields initialized with proper defaults
- [ ] Can add multiple rows to batch
- [ ] Can edit rows in batch preview
- [ ] Can delete rows from batch preview
- [ ] Submit only shows success when backend confirms

### Purchases
- [ ] qty field updates correctly (not quantity)
- [ ] Total cost = qty × unit_cost (2 decimals)
- [ ] Supplier dropdown shows DB suppliers
- [ ] Submit creates DB rows with correct total_cost and supplier_id
- [ ] Staff can submit (RLS allows)
- [ ] Error handling shows descriptive messages

### Expenses
- [ ] Category/subcategory dropdowns work
- [ ] Submit creates DB rows (not just mock)
- [ ] Rows have expense_date and created_by
- [ ] Staff can submit (RLS allows)
- [ ] Error handling shows descriptive messages

### Sales (QuickSales)
- [ ] process_sale RPC called correctly
- [ ] insufficient_stock error handled and displayed
- [ ] Success only shown after RPC returns without error

### Staff Restrictions
- [ ] Staff cannot see Actions column in Menu table
- [ ] Staff cannot see Actions column in Inventory table
- [ ] If staff tries to edit, clear error message shown
- [ ] Admin sees and can use all Actions columns

### Login
- [ ] Password eye toggle shows/hides password text
- [ ] No visual glitches

---

## Notes

- **DO NOT** modify DB schema, RPCs, triggers, or RLS policies
- **DO** add serverless endpoints if RLS blocks a needed operation (not needed for current issues)
- **DO** ensure `created_by` populated for all inserts
- **DO** use MCP to verify any uncertain column names before coding
- **DO** handle errors gracefully with user-friendly messages
- **DO** test with both admin and staff users

---

## Environment Setup

Already configured:
- `.env.local` has `VITE_PUBLIC_SUPABASE_URL` and `VITE_PUBLIC_SUPABASE_ANON_KEY`
- Frontend running on `http://localhost:8080/`
- Supabase backend is cloud-hosted

No additional setup needed for these fixes.


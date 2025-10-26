# Form Submission Rules - CRITICAL

## 🚨 MANDATORY: Use `submit_staff_forms` RPC for ALL Form Submissions

### Rule 1: RPC-Only Submission
**NEVER** use direct table inserts from the client. **ALWAYS** use the `submit_staff_forms` RPC.

```typescript
// ❌ WRONG - Direct insert (FORBIDDEN)
const { error } = await supabase
  .from('purchases')
  .insert(data);

// ✅ CORRECT - Use RPC
const { error } = await supabase.rpc('submit_staff_forms', {
  p_user_id: authUser.id,
  p_purchases: purchasesArray,  // or p_sales, p_expenses
});
```

---

## 📋 Form Type Mappings

### Sales Form
**Endpoint**: `submit_staff_forms` with `p_sales`
**Payload Schema**:
```typescript
{
  sale_date: string,        // YYYY-MM-DD
  total_amount: number,     // Decimal
  payment_method: string,   // 'cash' | 'card' | 'other'
  items: Array<{
    menu_item_id: number,
    qty: number,
    unit_price: number
  }>
}
```

**Example**:
```typescript
const { error } = await supabase.rpc('submit_staff_forms', {
  p_user_id: authUser.id,
  p_sales: [{
    sale_date: '2025-01-15',
    total_amount: 25.50,
    payment_method: 'card',
    items: [
      { menu_item_id: 1, qty: 2, unit_price: 10.00 },
      { menu_item_id: 3, qty: 1, unit_price: 5.50 }
    ]
  }],
});
```

---

### Purchases Form
**Endpoint**: `submit_staff_forms` with `p_purchases`
**Payload Schema**:
```typescript
{
  ingredient_id: number,    // FK to ingredients
  qty: number,              // Decimal
  unit_cost: number,        // Decimal
  total_cost: number,       // Computed: qty * unit_cost
  purchase_date: string,    // YYYY-MM-DD
  supplier_id: number | null,
  created_by: string        // UUID
}
```

**Example**:
```typescript
const { error } = await supabase.rpc('submit_staff_forms', {
  p_user_id: authUser.id,
  p_purchases: [{
    ingredient_id: 5,
    qty: 10.5,
    unit_cost: 3.50,
    total_cost: 36.75,
    purchase_date: '2025-01-15',
    supplier_id: 2,
    created_by: authUser.id
  }],
});
```

---

### Expenses Form
**Endpoint**: `submit_staff_forms` with `p_expenses`
**Payload Schema**:
```typescript
{
  expense_date: string,     // YYYY-MM-DD
  category: string,         // 'Labor' | 'Rent' | 'Utilities' | 'Supplies' | 'Other'
  amount: number,           // Decimal
  reference: string | null, // Optional subcategory
  notes: string | null,     // Optional notes
  created_by: string        // UUID
}
```

**Example**:
```typescript
const { error } = await supabase.rpc('submit_staff_forms', {
  p_user_id: authUser.id,
  p_expenses: [{
    expense_date: '2025-01-15',
    category: 'Labor',
    amount: 1500.00,
    reference: 'Salary',
    notes: 'Monthly payroll',
    created_by: authUser.id
  }],
});
```

---

## 🔒 Staff Permissions & RLS

### What Staff CAN Do:
- ✅ **INSERT** via `submit_staff_forms` RPC:
  - Sales
  - Purchases  
  - Expenses
  - Menu items (new only)
- ✅ **SELECT** (read) from all relevant tables
- ✅ Add items to batch preview (client-side only)

### What Staff CANNOT Do:
- ❌ **UPDATE** existing records in:
  - `sales`
  - `purchases`
  - `expenses`
  - `menu_items`
  - `inventory_on_hand`
- ❌ **DELETE** any records
- ❌ Edit existing menu items
- ❌ Adjust inventory directly

### UI Enforcement:
```typescript
const { profile } = useAuth();
const isAdmin = profile?.role === 'admin';

// Hide Actions column for staff
{isAdmin && <TableHead>Actions</TableHead>}

// Disable edit/delete buttons
<Button
  disabled={!isAdmin}
  onClick={() => handleEdit(item)}
>
  Edit
</Button>

// Show error message on unauthorized action
if (!isAdmin) {
  toast.error("You don't have permission to modify menu items or inventory.");
  return;
}
```

---

## 🛡️ Error Handling

### RPC Error Handling Pattern:
```typescript
try {
  const { error } = await supabase.rpc('submit_staff_forms', {
    p_user_id: authUser.id,
    p_purchases: purchasesPayload,
  });

  if (error) {
    // Log full error details
    console.error('RPC Error:', {
      message: error.message,
      code: error.code,
      details: error.details,
      hint: error.hint,
    });

    // Show user-friendly message
    toast.error(error.message || 'Failed to submit');
    return;
  }

  // Success handling
  toast.success('Submitted successfully!');
  clearForm();
} catch (error: any) {
  console.error('Unexpected error:', error);
  toast.error('An unexpected error occurred');
}
```

### Common Error Codes:
| Code | Meaning | User Message |
|------|---------|--------------|
| `23505` | Unique constraint | "This item already exists" |
| `23503` | Foreign key violation | "Referenced item not found" |
| `23502` | Not-null constraint | "Required field missing" |
| `42501` | Permission denied | "You don't have permission for this action" |
| `P0001` | RPC custom error | Show error.message directly |

---

## 📊 Column Name Verification (MCP)

Always verify exact column names via Supabase MCP before coding:

### Verified Schemas:
```
suppliers:
  - id (integer)
  - name (text)
  - contact (jsonb) ← NOT contact_info!

ingredients:
  - id (integer)
  - name (text)
  - base_unit (text)

inventory_on_hand:
  - ingredient_id (integer, PK)
  - qty_on_hand (numeric)
  - avg_unit_cost (numeric)

recipe_ingredients:
  - id (integer)
  - menu_item_id (integer, NOT NULL)
  - ingredient_id (integer, NOT NULL)
  - qty_per_item (numeric, NOT NULL)
```

---

## 🔄 Null Safety Rules

### Always use null-safe operators:
```typescript
// ✅ CORRECT - Null-safe
{(menuItems ?? []).map(item => ...)}
{item.recipe?.length ?? 0}
{item.price?.toFixed(2) ?? '0.00'}

// ❌ WRONG - Can crash
{menuItems.map(item => ...)}
{item.recipe.length}
{item.price.toFixed(2)}
```

### Initialize arrays with empty defaults:
```typescript
// ✅ CORRECT
const [menuItems, setMenuItems] = useState<any[]>([]);
const [batch, setBatch] = useState<Item[]>([]);

// ❌ WRONG
const [menuItems, setMenuItems] = useState<any[]>();
const [batch, setBatch] = useState<Item[]>(null);
```

---

## 📝 Validation Rules

### Client-Side Validation (Before RPC):
```typescript
// Validate required fields
if (!formData.ingredientName || !formData.ingredient_id) {
  toast.error('Please fill all required fields');
  return;
}

// Validate numeric values
if (formData.qty <= 0 || formData.unitCost <= 0) {
  toast.error('Quantity and cost must be greater than 0');
  return;
}

// Validate recipe ingredients
const invalidIngredients = recipeIngredients.filter(
  ing => !ing.ingredient_id || ing.ingredient_id <= 0
);
if (invalidIngredients.length > 0) {
  toast.error('Some ingredients are missing valid IDs');
  return;
}
```

---

## 🚀 Implementation Checklist

When creating/modifying any form:

- [ ] Use `submit_staff_forms` RPC (not direct insert)
- [ ] Map exact column names from MCP verification
- [ ] Add null safety (`??` operators) for all arrays/objects
- [ ] Initialize state with empty arrays `[]`, not `undefined`
- [ ] Validate required fields client-side
- [ ] Handle RPC errors with detailed logging
- [ ] Hide/disable Actions column for staff users
- [ ] Show appropriate error messages for unauthorized actions
- [ ] Test with both admin and staff users
- [ ] Verify in DevTools: No console errors, correct RPC endpoint called

---

## 🔍 Testing Commands

```typescript
// Verify RPC is being called (check Network tab)
// Should see: POST /rest/v1/rpc/submit_staff_forms
// Should NOT see: POST /rest/v1/purchases (or sales, expenses)

// Test null safety (open console)
// Should see NO errors like:
// - "Cannot read property 'length' of undefined"
// - "Cannot read property 'map' of undefined"
// - "Cannot read property 'toFixed' of undefined"

// Test staff permissions
// Login as staff → Navigate to Menu/Inventory
// Should see: No Actions column
// Should NOT see: Edit/Delete buttons
```

---

## ⚠️ NEVER DO THIS

```typescript
// ❌ Direct table insert
await supabase.from('purchases').insert(data);
await supabase.from('expenses').insert(data);
await supabase.from('sales').insert(data);

// ❌ Direct inventory update
await supabase.from('inventory_on_hand').update(data);

// ❌ Unsafe array access
menuItems.map(item => ...)  // Can crash if undefined
item.recipe.length         // Can crash if recipe is null

// ❌ Staff editing existing records
if (role === 'staff') {
  await supabase.from('menu_items').update({ name: 'New Name' });
}

// ❌ Missing error logging
const { error } = await supabase.rpc(...);
if (error) toast.error('Error'); // Too vague!
```

---

**Last Updated**: Current Session
**Status**: MANDATORY - ALL FORMS MUST FOLLOW THESE RULES
**Violations**: Will cause RLS errors, null pointer exceptions, and broken functionality


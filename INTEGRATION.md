# Supabase Integration Guide

This document details the complete integration between the frontend and Supabase backend.

## Integration Overview

The Business Intelligence System frontend has been fully integrated with Supabase for:

- ✅ **Authentication**: Email/password sign-in with session management
- ✅ **Database Operations**: Direct Supabase client calls with RLS
- ✅ **Real-time Updates**: Auth state changes, data refreshes
- ✅ **Role-Based Access**: Owner/Staff permissions enforced

## What Was Changed

### Files Modified

| File | Changes |
|------|---------|
| `src/api/index.ts` | Replaced all mock functions with Supabase calls |
| `src/App.tsx` | Added AuthProvider and ProtectedRoute wrappers |
| `src/pages/Login.tsx` | Integrated Supabase Auth sign-in |

### Files Created

| File | Purpose |
|------|---------|
| `src/lib/supabase.ts` | Supabase client configuration and type definitions |
| `src/contexts/AuthContext.tsx` | Authentication context and session management |
| `src/components/ProtectedRoute.tsx` | Route guard with role-based access control |
| `api/users/create.ts` | Serverless function for user creation (service role) |
| `tests/integration.test.ts` | Integration tests for all API flows |
| `.env.example` | Environment variable template |

## API Mapping

### Sales Processing

**Frontend Call:**
```typescript
import { processSale } from '@/api/index';

const result = await processSale({
  sale_date: '2025-01-15',
  items: [
    {
      menu_item_id: 'item-uuid',
      menu_item_name: 'Burger',
      quantity: 2,
      unit_price: 9.99,
      line_total: 19.98,
    },
  ],
  subtotal: 19.98,
  tax: 2.00,
  total: 21.98,
});
```

**Backend Operation:**
```typescript
supabase.rpc('process_sale', { payload: JSON.stringify(salePayload) })
```

**Database Actions:**
1. Inserts into `sales` table
2. Inserts into `sale_line_items` table
3. Calculates COGS from `recipe_ingredients`
4. Updates `inventory_on_hand` (deducts ingredients)
5. Inserts into `inventory_movements`
6. Returns sale IDs or throws `INSUFFICIENT_STOCK` error

### Purchase Logging

**Frontend Call:**
```typescript
import { insertPurchase } from '@/api/index';

const result = await insertPurchase({
  purchase_date: '2025-01-15',
  ingredient_id: 'ingredient-uuid',
  ingredient_name: 'Beef Patty',
  quantity: 10,
  unit_cost: 5.50,
  total_cost: 55.00,
  supplier: 'Local Butcher',
});
```

**Backend Operation:**
```typescript
supabase.from('purchases').insert([purchaseData])
```

**Database Actions:**
1. Inserts into `purchases` table
2. **Trigger `handle_purchase`** automatically:
   - Updates `inventory_on_hand.current_qty` (adds quantity)
   - Inserts into `inventory_movements` with type 'PURCHASE'

### Expense Recording

**Frontend Call:**
```typescript
import { insertExpense } from '@/api/index';

const result = await insertExpense({
  expense_date: '2025-01-15',
  category: 'Utilities',
  amount: 150.00,
  reference: 'Invoice-001',
  notes: 'Electricity bill',
});
```

**Backend Operation:**
```typescript
supabase.from('expenses').insert([expenseData])
```

### Menu Item Management

**Frontend Call:**
```typescript
import { saveMenuItem } from '@/api/index';

const result = await saveMenuItem({
  id: 'existing-id', // Optional, omit for new item
  name: 'Classic Burger',
  price: 9.99,
  category: 'Burgers',
  active: true,
  recipe: [
    { ingredient_id: 'beef-uuid', qty_per_item: 0.15 },
    { ingredient_id: 'bun-uuid', qty_per_item: 1 },
  ],
});
```

**Backend Operations:**
1. Upsert `menu_items` table
2. If updating, delete existing `recipe_ingredients` for this menu item
3. Insert new `recipe_ingredients` records

**Note**: This is NOT transactional at the client level. For true atomicity, use the serverless function approach or deploy as a Supabase function.

### Inventory Adjustment

**Frontend Call:**
```typescript
import { adjustInventory } from '@/api/index';

// Option 1: Relative change
await adjustInventory({
  ingredient_id: 'ingredient-uuid',
  qty_change: -5, // Negative for decrease
  reason: 'Spoilage',
});

// Option 2: Set absolute value
await adjustInventory({
  ingredient_id: 'ingredient-uuid',
  set_qty: 20,
  reason: 'Physical count correction',
});
```

**Backend Operations:**
1. Fetch current `inventory_on_hand.current_qty`
2. Calculate new quantity
3. Update `inventory_on_hand`
4. Insert into `inventory_movements` with type 'ADJUST'

### Data Fetching

#### Inventory

```typescript
import { fetchInventory } from '@/api/index';

const inventory = await fetchInventory();
// Returns array with ingredient details joined
```

**Query:**
```typescript
supabase
  .from('inventory_on_hand')
  .select(`
    ingredient_id,
    current_qty,
    last_updated,
    ingredients:ingredient_id (id, name, unit, reorder_point, supplier)
  `)
```

#### Daily Summaries

```typescript
import { fetchDailySummaries } from '@/api/index';

const summaries = await fetchDailySummaries({
  start: '2025-01-01',
  end: '2025-01-31',
});
```

**Query:**
```typescript
supabase
  .from('daily_summaries')
  .select('*')
  .gte('day', range.start)
  .lte('day', range.end)
  .order('day', { ascending: true })
```

**Note**: `daily_summaries` is populated by n8n workflows (not by frontend).

#### Transactions

```typescript
import { fetchSales, fetchPurchases, fetchExpenses } from '@/api/index';

const sales = await fetchSales({ start_date: '2025-01-01', end_date: '2025-01-31' });
const purchases = await fetchPurchases();
const expenses = await fetchExpenses();
```

## Authentication Flow

### Sign In

```typescript
import { useAuth } from '@/contexts/AuthContext';

const { signIn } = useAuth();
const { error } = await signIn(email, password);
```

**Backend:**
```typescript
supabase.auth.signInWithPassword({ email, password })
```

**On Success:**
1. Supabase returns session and user
2. `AuthContext` fetches `profiles` row for role
3. `AuthContext` stores user, profile, and session in state
4. Protected routes allow navigation based on role

### Sign Out

```typescript
const { signOut } = useAuth();
await signOut();
```

**Backend:**
```typescript
supabase.auth.signOut()
```

### Session Persistence

```typescript
useEffect(() => {
  const { data: { subscription } } = supabase.auth.onAuthStateChange(
    (_event, session) => {
      // Update user, profile, session state
    }
  );
  return () => subscription.unsubscribe();
}, []);
```

Supabase automatically:
- Stores session in localStorage
- Refreshes tokens
- Triggers `onAuthStateChange` on expiry/refresh

## Role-Based Access Control

### Frontend Enforcement

```typescript
// In App.tsx
<Route 
  path="/dashboard" 
  element={
    <ProtectedRoute>
      <MainLayout><Dashboard /></MainLayout>
    </ProtectedRoute>
  } 
/>

<Route 
  path="/reports" 
  element={
    <ProtectedRoute allowedRoles={['owner']}>
      <MainLayout><Reports /></MainLayout>
    </ProtectedRoute>
  } 
/>
```

**Logic:**
- If user not authenticated → redirect to `/login`
- If user lacks required role → redirect to `/dashboard`
- Otherwise, render children

### Backend Enforcement (RLS)

Every table has RLS policies. Example:

```sql
-- sales table: authenticated users can insert if they're owner or staff
CREATE POLICY "Users can insert sales"
ON sales FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = created_by
  AND EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role IN ('owner', 'staff')
  )
);

-- daily_summaries table: only owners can view
CREATE POLICY "Owners can view summaries"
ON daily_summaries FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'owner'
  )
);
```

**Critical**: RLS is the ultimate security boundary. Frontend role checks are UX-only; RLS blocks unauthorized DB access.

## Error Handling

### Insufficient Stock

When `process_sale` RPC detects insufficient inventory:

```typescript
try {
  await processSale(payload);
} catch (error) {
  if (error.message.includes('INSUFFICIENT_STOCK')) {
    // Show modal: "Insufficient stock for X"
  } else {
    // Generic error
  }
}
```

### Authentication Errors

```typescript
const { error } = await signIn(email, password);
if (error) {
  if (error.message.includes('Invalid login credentials')) {
    // Show: "Invalid email or password"
  } else if (error.message.includes('Email not confirmed')) {
    // Show: "Please verify your email"
  } else {
    // Show: error.message
  }
}
```

### RLS Policy Violations

If a user attempts an unauthorized action:

```typescript
// Supabase returns 403 or policy violation error
supabase.from('daily_summaries').select('*')
// Staff user → RLS blocks → error: "new row violates row-level security policy"
```

Frontend should gracefully handle and show: "You don't have permission to view this data."

## Serverless Functions

### User Creation (Service Role Required)

**Why Serverless?**
- Creating users requires `SUPABASE_SERVICE_ROLE_KEY`
- Cannot expose service key in frontend
- Use serverless function with secret environment variable

**Frontend Call:**
```typescript
import { createUser } from '@/api/index';

const result = await createUser({
  email: 'newuser@example.com',
  full_name: 'New User',
  role: 'staff',
  password: 'optional',
});
// If password omitted, temp password is generated
```

**Serverless Function (`api/users/create.ts`):**
```typescript
const supabaseAdmin = createClient(url, serviceRoleKey);
const { data } = await supabaseAdmin.auth.admin.createUser({ email, password });
await supabaseAdmin.from('profiles').upsert([{ id: data.user.id, email, full_name, role }]);
```

**Deployment:**
- **Vercel**: Automatically deploys `/api` functions
- **Netlify**: Set `functions = "api"` in `netlify.toml`
- **Supabase Edge Functions**: `supabase functions deploy create-user`

Set `SUPABASE_SERVICE_ROLE_KEY` in platform environment variables (NOT in frontend `.env`).

## n8n Automation

**Separate Service** (not part of frontend):

### Daily Aggregation Workflow

**Trigger**: Scheduled (e.g., 11:59 PM daily)

**Steps:**
1. Fetch all sales, purchases, expenses for the day
2. Calculate totals: revenue, COGS, gross profit, operating expense, net profit
3. Aggregate top income items and expense breakdown
4. `INSERT` or `UPSERT` into `daily_summaries` table

**Frontend**: Reads from `daily_summaries` via `fetchDailySummaries()`.

### Weekly Report Workflow

**Trigger**: Scheduled (e.g., Sunday 11:59 PM)

**Steps:**
1. Fetch `daily_summaries` for past week
2. Calculate weekly totals
3. Call OpenAI API for AI analysis
4. Generate PDF report
5. Upload PDF to Google Drive
6. Insert into `weekly_summaries` with `pdf_url`
7. Send email notification

**Frontend**: Displays `weekly_summaries` in Reports page with download link.

## Data Flow Diagram

```
Frontend (React + Vite)
    |
    | VITE_PUBLIC_SUPABASE_ANON_KEY
    v
Supabase (PostgreSQL + Auth)
    |
    | RLS Policies enforce role checks
    |
    v
Tables: sales, purchases, expenses, etc.
    |
    | Triggers: handle_purchase, etc.
    |
    v
Inventory & Summaries Updated
    ^
    |
    | (n8n workflows write to daily_summaries)
    |
n8n Automation (Separate)
```

## Testing the Integration

### Manual Testing Checklist

1. **Authentication**
   - [ ] Sign in as owner → should access all pages
   - [ ] Sign in as staff → should only see form pages
   - [ ] Sign out → redirected to login

2. **Sales Processing**
   - [ ] Submit sale with valid menu items → success
   - [ ] Submit sale with insufficient stock → error modal
   - [ ] Check `sales`, `sale_line_items`, `inventory_on_hand` updated

3. **Purchase Logging**
   - [ ] Submit purchase → success
   - [ ] Check `purchases`, `inventory_on_hand`, `inventory_movements` updated

4. **Expense Tracking**
   - [ ] Submit expense → success
   - [ ] Check `expenses` table

5. **Menu Management**
   - [ ] Create menu item with recipe → success
   - [ ] Update menu item → recipe replaced
   - [ ] Check `menu_items`, `recipe_ingredients` tables

6. **Inventory**
   - [ ] View inventory → displays current stock with ingredient details
   - [ ] Adjust inventory → stock updated, movement logged

7. **Reporting**
   - [ ] View dashboard → KPIs displayed from `daily_summaries`
   - [ ] View reports → weekly summaries with PDF links

### Automated Testing

See `tests/integration.test.ts` and `tests/README.md`.

```bash
npm test -- tests/integration.test.ts
```

## Common Integration Issues

### Issue: "Missing Supabase environment variables"

**Solution**: Ensure `.env.local` exists with:
```env
VITE_PUBLIC_SUPABASE_URL=...
VITE_PUBLIC_SUPABASE_ANON_KEY=...
```

### Issue: "User not authenticated" on API calls

**Solution**:
1. Check user signed in via Login
2. Verify `profiles` row exists for user ID
3. Check browser console for auth errors

### Issue: RLS policy blocks insert/select

**Solution**:
1. Verify RLS policies deployed
2. Check user's `profiles.role` matches policy requirements
3. Review Supabase logs for policy violations

### Issue: process_sale throws "insufficient_stock"

**Solution**:
1. Check `inventory_on_hand.current_qty` for required ingredients
2. Verify `recipe_ingredients.qty_per_item` is correct
3. Add purchases to increase stock

### Issue: daily_summaries table is empty

**Solution**:
- `daily_summaries` is populated by n8n workflows, not frontend
- Ensure n8n workflows are deployed and scheduled
- Manually insert test data for development:

```sql
INSERT INTO daily_summaries (day, revenue, cogs, gross_profit, operating_expense, net_profit, top_income_items, expense_by_category)
VALUES ('2025-01-15', 500, 200, 300, 100, 200, '[]'::jsonb, '{}'::jsonb);
```

## Security Checklist

- [ ] `SUPABASE_SERVICE_ROLE_KEY` never in frontend code
- [ ] `.env.local` in `.gitignore`
- [ ] RLS policies enabled on all tables
- [ ] Frontend validates user inputs
- [ ] HTTPS only in production
- [ ] Rate limiting on sensitive operations
- [ ] Regular security audits

## Next Steps

1. **Deploy to Production**: See README.md deployment section
2. **Configure n8n**: Set up daily/weekly workflows
3. **Add More Tests**: Expand `tests/integration.test.ts`
4. **Monitor Logs**: Check Supabase logs and error tracking
5. **Optimize Queries**: Add indexes, use caching where appropriate

## Support

For issues or questions:
- Check Supabase dashboard logs
- Review browser console for errors
- Consult Supabase documentation: [supabase.com/docs](https://supabase.com/docs)


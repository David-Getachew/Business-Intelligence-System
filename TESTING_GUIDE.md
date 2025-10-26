# Testing Guide - Local Development

## Quick Testing (Without Service Role Key)

You can test **everything except user creation** using just the anon key!

### Step 1: Create Test User via Supabase Dashboard

Since you can't create users from the app yet, create them manually:

1. **Go to Supabase Dashboard**
   - Navigate to: **Authentication → Users**
   - Click **Add User** or **Invite User**

2. **Create an Owner Account**
   - Email: `owner@test.com`
   - Password: `test123456`
   - Click **Create User**

3. **Add Profile Row**
   
   Go to **SQL Editor** and run:
   ```sql
   -- Get the user ID first
   SELECT id, email FROM auth.users WHERE email = 'owner@test.com';
   
   -- Then insert the profile (replace USER_ID_HERE with actual ID)
   INSERT INTO profiles (id, email, full_name, role)
   VALUES ('USER_ID_HERE', 'owner@test.com', 'Test Owner', 'owner');
   ```

4. **Create a Staff Account** (optional)
   - Email: `staff@test.com`
   - Password: `test123456`
   - Add profile with role 'staff'

### Step 2: Test All Features

Now you can test everything:

#### ✅ Authentication
```bash
npm run dev
# Navigate to http://localhost:5173/login
# Sign in with: owner@test.com / test123456
```

#### ✅ Quick Sales
1. Go to **Sales → Quick Sales**
2. Select a menu item
3. Enter quantity
4. Add to batch
5. Submit
6. Check browser console for success/errors

#### ✅ Purchases
1. Go to **Purchases → New Purchase**
2. Select ingredient
3. Enter quantity and cost
4. Submit
5. Check inventory increased

#### ✅ Expenses
1. Go to **Expenses → New Expense**
2. Select category
3. Enter amount
4. Submit

#### ✅ Menu Management
1. Go to **Menu & Recipes**
2. Create a new menu item
3. Add recipe ingredients
4. Save

#### ✅ Inventory
1. Go to **Inventory**
2. View current stock
3. Adjust inventory
4. View movements

#### ✅ Dashboard
1. Go to **Dashboard**
2. View KPIs (will be empty until you have transactions)
3. Check charts

## Testing With Service Role Key (Advanced)

### When You Need It

Only if you want to test the **user creation** functionality from the app (Settings → Users → Create User).

### Where to Add It

**Option A: For Vercel Deployment**

1. Deploy to Vercel first:
   ```bash
   npm install -g vercel
   vercel
   ```

2. In Vercel Dashboard:
   - Go to your project
   - Settings → Environment Variables
   - Add: `SUPABASE_SERVICE_ROLE_KEY` = `your-service-role-key`
   - Redeploy

**Option B: For Netlify Deployment**

1. Deploy to Netlify
2. Site Settings → Environment Variables
3. Add: `SUPABASE_SERVICE_ROLE_KEY`
4. Redeploy

**Option C: Local Testing with Serverless Functions**

If you REALLY need to test locally:

1. **Create a separate environment file for API functions:**
   ```bash
   # Create api/.env (DO NOT commit this!)
   echo "SUPABASE_SERVICE_ROLE_KEY=your-service-role-key" > api/.env
   ```

2. **Update `.gitignore`:**
   ```
   api/.env
   ```

3. **Use a local serverless function runner:**
   ```bash
   # Install Vercel CLI for local testing
   npm install -g vercel
   vercel dev
   ```

This runs your serverless functions locally with environment variables.

## Testing Checklist

### Core Functionality (No Service Role Needed)

- [ ] Sign in as owner
- [ ] Sign in as staff
- [ ] Owner can access all pages
- [ ] Staff can only access form pages
- [ ] Submit a sale
  - [ ] Inventory decreases
  - [ ] COGS calculated
  - [ ] Sale appears in transactions
- [ ] Submit a purchase
  - [ ] Inventory increases
  - [ ] Purchase logged
- [ ] Submit an expense
  - [ ] Expense recorded
- [ ] Create menu item with recipe
  - [ ] Item saved
  - [ ] Recipe ingredients linked
- [ ] Adjust inventory
  - [ ] Stock updated
  - [ ] Movement logged
- [ ] Sign out
- [ ] Redirect to login when not authenticated

### Optional (Service Role Required)

- [ ] Create new user from Settings page
- [ ] User receives invite email
- [ ] New user can sign in

## Database Setup for Testing

Before testing, ensure your database has:

### 1. Tables Created

Run your schema from Technical Build Plan in Supabase SQL Editor.

### 2. RLS Policies Deployed

Verify policies exist:
```sql
-- Check policies
SELECT tablename, policyname 
FROM pg_policies 
WHERE schemaname = 'public';
```

### 3. Test Data Seeded

```sql
-- Add test ingredients
INSERT INTO ingredients (name, unit, reorder_point, supplier) VALUES
  ('Test Ingredient 1', 'kg', 5.0, 'Test Supplier'),
  ('Test Ingredient 2', 'pcs', 20, 'Test Supplier');

-- Initialize inventory
INSERT INTO inventory_on_hand (ingredient_id, current_qty)
SELECT id, 100 FROM ingredients;

-- Add test menu item
INSERT INTO menu_items (name, price, category, active) VALUES
  ('Test Burger', 9.99, 'Burgers', true);

-- Link recipe
INSERT INTO recipe_ingredients (menu_item_id, ingredient_id, qty_per_item)
SELECT 
  (SELECT id FROM menu_items WHERE name = 'Test Burger'),
  id,
  0.15
FROM ingredients
LIMIT 1;
```

## Troubleshooting

### Error: "User not authenticated"

**Solution:**
1. Check you're signed in
2. Verify `profiles` table has a row for your user
3. Check browser console for auth errors

### Error: "INSUFFICIENT_STOCK"

**Solution:**
1. This is expected behavior when stock is low
2. Add a purchase to increase inventory
3. Check `inventory_on_hand.current_qty`

### Error: "Missing Supabase environment variables"

**Solution:**
1. Verify `.env.local` exists
2. Check variable names are correct
3. Restart dev server: `Ctrl+C` then `npm run dev`

### Error: "RLS policy violation"

**Solution:**
1. Ensure user has a `profiles` row
2. Check the role matches policy requirements
3. Verify RLS policies are deployed

### Can't Create Users

**Solution:**
This is expected! Two options:
1. Create users manually via Supabase Dashboard (recommended for testing)
2. Deploy serverless functions with service role key (for production)

## Performance Testing

### Check Query Performance

```sql
-- View slow queries in Supabase Dashboard → Logs
-- Or enable pg_stat_statements

SELECT query, calls, total_time, mean_time
FROM pg_stat_statements
ORDER BY mean_time DESC
LIMIT 10;
```

### Monitor RLS Policy Impact

RLS policies add overhead. Check execution time:
```sql
EXPLAIN ANALYZE
SELECT * FROM sales WHERE created_by = auth.uid();
```

## Integration Tests

Run the automated test suite:

```bash
# Set up test environment
cp env.example .env.test

# Edit .env.test with test Supabase project
# (Use a separate Supabase project for testing!)

# Install test dependencies
npm install --save-dev @jest/globals jest ts-jest @types/jest

# Run tests
npm test -- tests/integration.test.ts
```

## What to Test Daily

Quick smoke test:

```bash
# 1. Start dev server
npm run dev

# 2. Sign in (30 seconds)
# 3. Submit one sale (1 minute)
# 4. Submit one purchase (1 minute)
# 5. View dashboard (30 seconds)
# 6. Check inventory updated (30 seconds)

# Total: ~4 minutes
```

## Production Testing Checklist

Before going live:

- [ ] All environment variables set in hosting platform
- [ ] Database schema deployed
- [ ] RLS policies active
- [ ] Initial users created
- [ ] Test data seeded
- [ ] SSL/HTTPS enabled
- [ ] Error tracking configured (Sentry, LogRocket, etc.)
- [ ] n8n workflows deployed
- [ ] Backup strategy in place

## Getting Help

**Check Logs:**
- Browser DevTools → Console
- Supabase Dashboard → Logs
- Supabase Dashboard → Database → Query Performance

**Common Issues:**
- 90% of issues are authentication or RLS related
- Check user has `profiles` row
- Verify correct role in profiles table
- Ensure RLS policies match Technical Build Plan

---

**Remember:** You can test and use 99% of the app without the service role key! Only user creation needs it, and you can create users manually via the Supabase Dashboard.


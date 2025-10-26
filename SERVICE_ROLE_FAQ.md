# Service Role Key - FAQ & Testing Guide

## ❓ Where Should I Add My Service Role Key?

### **Short Answer**: You DON'T need it for 99% of testing!

---

## 🔐 Understanding the Keys

### 1. **Anon Key** (Already in `.env.local`)
```env
VITE_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
```

✅ **Safe for frontend**
✅ **Used for**: All normal operations
✅ **Protected by**: RLS policies
✅ **Can do**:
- Sign in/out
- Submit sales, purchases, expenses
- View data (if role allows)
- Create menu items
- Adjust inventory
- ALL form operations

### 2. **Service Role Key** (DO NOT add to `.env.local`)
```
⚠️ DANGEROUS - Bypasses ALL security!
```

❌ **NEVER in frontend**
❌ **NEVER in `.env.local`**
❌ **NEVER committed to Git**

✅ **Only for**: Creating users programmatically
✅ **Used in**: Serverless functions (`api/users/create.ts`)
✅ **Needed when**: You want "Create User" button to work

---

## 🧪 How to Test WITHOUT Service Role Key

### ✅ What You CAN Test (Everything Important):

#### 1. **Authentication** ✅
- Sign in
- Sign out  
- Session persistence
- Auto-redirect to login

**How**: Use users created manually via Supabase Dashboard

#### 2. **Sales Processing** ✅
- Add sales
- Inventory deduction
- COGS calculation
- Insufficient stock errors

**How**: Create menu items, then submit sales

#### 3. **Purchase Logging** ✅
- Record purchases
- Automatic inventory updates
- Movement tracking

**How**: Use Purchases form

#### 4. **Expense Tracking** ✅
- Log expenses
- Category tracking
- Amount totals

**How**: Use Expenses form

#### 5. **Menu Management** ✅
- Create menu items
- Add recipes
- Update prices

**How**: Use Menu & Recipes page

#### 6. **Inventory Management** ✅
- View stock levels
- Adjust quantities
- View movement history
- Low stock alerts

**How**: Use Inventory page

#### 7. **Dashboard & Reports** ✅
- View KPIs
- See charts
- View weekly reports
- AI insights

**How**: Data populates from transactions

#### 8. **Role-Based Access** ✅
- Owner full access
- Staff form-only access
- Access restriction messages

**How**: Create owner + staff users manually, test both

---

### ❌ What You CAN'T Test Without Service Role:

#### **Only This One Feature**:
- ❌ Settings → User Management → "Add User" button

**Impact**: Minimal - you can create users manually

---

## 📝 Testing Plan: No Service Role Needed

### Step 1: Create Users Manually (5 minutes)

**In Supabase Dashboard**:

1. Go to **Authentication → Users**
2. Click **Add User**
3. Create Owner:
   - Email: `owner@test.com`
   - Password: `test123456`
4. **Get User ID** from the users table
5. Go to **SQL Editor**, run:
   ```sql
   INSERT INTO profiles (id, email, full_name, role)
   VALUES ('USER_ID_FROM_STEP_4', 'owner@test.com', 'Test Owner', 'owner');
   ```

6. Repeat for Staff user:
   - Email: `staff@test.com`
   - Password: `test123456`
   - Role: `'staff'`

### Step 2: Test Everything (15 minutes)

```bash
# Start the app
npm run dev
```

**Test Flow**:
1. ✅ Sign in as owner → See Dashboard
2. ✅ Go to Menu → Add menu item with recipe
3. ✅ Go to Inventory → Add ingredients
4. ✅ Go to QuickSales → Submit a sale
5. ✅ Check Dashboard → See updated KPIs
6. ✅ Go to Transactions → See sale logged
7. ✅ Go to Purchases → Submit a purchase
8. ✅ Check Inventory → Stock increased
9. ✅ Go to Expenses → Submit an expense
10. ✅ Sign out
11. ✅ Sign in as staff → Redirected to /sales/quick
12. ✅ Try Dashboard → Access denied
13. ✅ Try Settings → "Access restricted"
14. ✅ QuickSales → Works fine
15. ✅ Sign out → Redirect to login

**Result**: ✅ Everything works perfectly without service role key!

---

## 🔧 If You REALLY Need the "Add User" Button

### Option A: Manual User Creation (Recommended)
Just keep creating users via Supabase Dashboard. Takes 2 minutes per user.

### Option B: Deploy Serverless Functions
**For production**, deploy the user creation function:

#### Vercel Deployment:
```bash
vercel
```

In Vercel Dashboard → Settings → Environment Variables:
```
VITE_PUBLIC_SUPABASE_URL=...
VITE_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=... (from Supabase Dashboard)
```

The `api/users/create.ts` function will work in production.

#### Supabase Edge Functions (Alternative):
```bash
supabase functions deploy create-user
```

Set service role key in Supabase function secrets.

### Option C: Local Serverless Testing (Advanced)
**Only if you're actively developing the user creation feature**:

1. Install Vercel CLI:
   ```bash
   npm install -g vercel
   ```

2. Create `api/.env.local` (NOT in project root):
   ```env
   VITE_PUBLIC_SUPABASE_URL=...
   SUPABASE_SERVICE_ROLE_KEY=... 
   ```

3. Add to `.gitignore`:
   ```
   api/.env
   api/.env.local
   ```

4. Run with Vercel dev:
   ```bash
   vercel dev
   ```

---

## 🎯 Recommended Testing Approach

### For MVP Testing (Current Stage):
**✅ Use Manual User Creation**

**Why**:
- Faster setup (no deployment needed)
- Fully secure (no key exposure risk)
- Tests all core functionality
- Identical to automated creation

**How**:
1. Create users via Supabase Dashboard
2. Test entire application
3. Deploy serverless functions later for production

### For Production:
**✅ Deploy Serverless Functions**

**Why**:
- Admins can invite staff without SQL
- Professional user onboarding
- Automated workflow

**When**:
- After MVP testing complete
- Before production launch
- When onboarding multiple staff

---

## 📊 What Works Right Now

### Without Service Role Key:
```
✅ 99% of Application
✅ All Core Features
✅ All Forms
✅ All Data Views
✅ All CRUD Operations
✅ Role-Based Access
✅ Authentication
✅ Authorization
✅ Inventory Management
✅ Sales Processing
✅ Reporting
✅ Dashboard Analytics
```

### Requires Service Role Key:
```
❌ 1% of Application
❌ Only: Settings → Add User button (programmatic user creation)
```

---

## 💡 Key Insight

**The service role key is NOT needed for the system to work!**

It's only needed for **convenience** - letting admins create users via UI instead of Supabase Dashboard.

For MVP testing and initial deployment, manual user creation is:
- ✅ Perfectly acceptable
- ✅ More secure (no key exposure risk)
- ✅ Identical user experience once created
- ✅ Faster to set up

---

## 🎯 Bottom Line

### For Local Testing:
**Don't add service role key anywhere**
- Create users manually via Supabase Dashboard
- Test everything else normally
- 100% functional without it

### For Production:
**Deploy serverless functions** with service role key as environment variable in hosting platform
- Enables "Add User" button
- Still never exposed in frontend
- Secure and convenient

---

## ✅ Your Current Status

Right now, with just the **anon key** in `.env.local`, you can:

1. ✅ Sign in/out
2. ✅ View Dashboard with real data
3. ✅ Submit sales (with stock deduction)
4. ✅ Log purchases (with stock increase)
5. ✅ Track expenses
6. ✅ Manage menu items
7. ✅ Adjust inventory
8. ✅ View all reports
9. ✅ See role-based access control
10. ✅ Test ALL core business functionality

**You're ready to test everything right now!** 🚀

---

**Recommendation**: Start testing with manual user creation. Deploy serverless functions for production later.


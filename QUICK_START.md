# Quick Start Guide - After Data Integration

## ✅ What Changed

**All mock data removed** → System now uses real Supabase database
**Role-based access** → Owners see everything, Staff see forms only
**Empty states added** → Helpful messages when no data exists
**User management** → Admins can create users directly from Settings

---

## 🚀 First-Time Setup (5 Minutes)

### 1. Configure Environment
```bash
# Create .env.local with your Supabase credentials
VITE_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
VITE_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

### 2. Start Dev Server
```bash
npm install
npm run dev
```

### 3. Create First User (Supabase Dashboard)
1. Go to Supabase Dashboard → **Authentication** → **Users**
2. Click **Add User**
3. Email: `owner@test.com`, Password: `test123456`
4. Click **Create User**

### 4. Add Profile Row (SQL Editor)
```sql
-- Get the user ID
SELECT id, email FROM auth.users WHERE email = 'owner@test.com';

-- Insert profile (replace USER_ID with actual ID from above)
INSERT INTO profiles (id, email, full_name, role)
VALUES ('USER_ID', 'owner@test.com', 'Test Owner', 'owner');
```

### 5. Sign In
- Navigate to `http://localhost:5173/login`
- Email: `owner@test.com`
- Password: `test123456`

---

## 👥 Creating Team Members

### As Admin (Owner):

1. **Go to Settings** → User Management
2. Click **Add User**
3. Fill in:
   - Full Name: `Staff Member`
   - Email: `staff@test.com`
   - Password: `staff123456`
   - Role: `Staff`
4. Click **Add User**
5. User can now sign in!

**That's it!** No more manual SQL or Supabase Dashboard steps.

---

## 📊 Adding Data

### Add Menu Items:
1. Go to **Menu & Recipes**
2. Click **Add Menu Item**
3. Enter name, price, category
4. Add recipe ingredients
5. Save

### Add Ingredients:
1. Go to **Inventory**
2. Add ingredients with reorder points
3. Set initial stock levels

### Log First Sale:
1. Go to **Sales → Quick Sales**
2. Select menu item
3. Enter quantity
4. Add to batch
5. Submit All

### Dashboard Updates:
- After first transactions, Dashboard shows real KPIs
- Charts populate with actual data
- No more empty states!

---

## 🔑 Access Levels

### Owner (Admin) Access:
✅ Dashboard - Full KPIs and analytics
✅ Quick Sales - Submit sales
✅ Purchases - Log purchases
✅ Expenses - Log expenses
✅ Menu & Recipes - Manage menu
✅ Inventory - View and adjust stock
✅ Transactions - View all transactions
✅ Reports - Weekly summaries
✅ Settings - **User management**

### Staff Access:
✅ Quick Sales - Submit sales
✅ Purchases - Log purchases
✅ Expenses - Log expenses
✅ Menu & Recipes - Manage menu
✅ Inventory - View and adjust stock
❌ Dashboard - Access restricted
❌ Transactions - Access restricted
❌ Reports - Access restricted
❌ Settings/User Management - Access restricted

**Staff sees**: "Access restricted. Only admins can manage users. Contact your administrator for more privileges."

---

## 🎯 Key Features

### Real-Time Data:
- Dashboard fetches from `daily_summaries`
- QuickSales loads active `menu_items`
- Settings shows all users from `profiles`

### Empty States:
- **No data on Dashboard**: Shows helpful message to start adding transactions
- **No menu items**: QuickSales guides user to add menu first
- **No users**: Settings prompts to create first team member

### Error Handling:
- **Insufficient Stock**: Modal shows which items are low
- **Duplicate Email**: Warns when creating user with existing email
- **Network Errors**: Retry buttons provided

### Loading States:
- Skeleton loaders while fetching data
- Disabled buttons during submission
- Spinner indicators on buttons

---

## 🐛 Troubleshooting

### "Missing Supabase environment variables"
**Fix**: Ensure `.env.local` exists with correct variables
```bash
# Check file exists
ls -la .env.local

# Restart dev server
npm run dev
```

### "User not authenticated"
**Fix**: 
1. Sign in at `/login`
2. Verify `profiles` table has row for user
3. Check browser console for errors

### Dashboard shows empty state
**Expected behavior** when no transactions yet.
**Fix**: Add sales/purchases/expenses to populate data

### Staff can't access Dashboard
**Expected behavior** - Staff should only see forms.
**Fix**: Sign in as owner to see Dashboard

### Can't create users
**Required**: Must be signed in as owner (admin)
**Check**: Settings page shows user management section

---

## 🧪 Testing Checklist

Quick test to verify everything works:

```bash
✅ Sign in as owner
✅ Dashboard loads (empty state OK)
✅ Go to Settings → Create staff user
✅ Sign out → Sign in as staff
✅ Verify limited access (no Dashboard)
✅ Can access QuickSales form
✅ Sign out → Sign back in as owner
✅ Full access restored
```

---

## 📚 Documentation

- **Full Integration Details**: See `DATA_INTEGRATION_COMPLETE.md`
- **Changes Summary**: See `CHANGES_SUMMARY.md`
- **General Setup**: See `README.md`
- **Environment Setup**: See `ENVIRONMENT_SETUP.md`
- **Testing Guide**: See `TESTING_GUIDE.md`
- **Deployment**: See `DEPLOYMENT_SUMMARY.md`

---

## 🎉 You're Ready!

The system is now fully integrated with Supabase. All mock data is gone and everything works with real database queries.

### Next Steps:
1. ✅ Configure environment
2. ✅ Create owner user
3. ✅ Sign in and explore
4. ✅ Create staff users via Settings
5. ✅ Add menu items and ingredients
6. ✅ Start logging transactions
7. ✅ Watch Dashboard populate with real data!

**Need Help?** Check the troubleshooting section or review the comprehensive documentation files.

---

**Status**: ✅ Integration Complete
**Last Updated**: October 10, 2025
**Version**: Production-Ready


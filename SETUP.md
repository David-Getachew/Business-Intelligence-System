# Quick Setup Guide

## 1. Configure Environment Variables

Copy the example environment file:

```bash
cp env.example .env.local
```

Then edit `.env.local` with your actual Supabase credentials:

```env
VITE_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
VITE_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Where to Find Your Credentials

1. Go to [supabase.com](https://supabase.com)
2. Open your project
3. Navigate to **Settings → API**
4. Copy:
   - **Project URL** → `VITE_PUBLIC_SUPABASE_URL`
   - **anon/public key** → `VITE_PUBLIC_SUPABASE_ANON_KEY`

⚠️ **Never share or commit your `.env.local` file!**

## 2. Install Dependencies

```bash
npm install
```

## 3. Run Development Server

```bash
npm run dev
```

The app will open at `http://localhost:5173`

## 4. Deploy Database Schema

Before the app works, you need to set up your Supabase database:

### Option A: Via Supabase SQL Editor

1. Open your Supabase project
2. Go to **SQL Editor**
3. Create a new query
4. Paste your database schema from the Technical Build Plan
5. Run the query

### Option B: Via Supabase CLI

```bash
# Install Supabase CLI
npm install -g supabase

# Link to your project
supabase link --project-ref your-project-id

# Run migrations
supabase db push
```

## 5. Create Your First User

### Via Supabase Dashboard

1. Go to **Authentication → Users**
2. Click **Add User**
3. Enter email and password
4. Click **Create User**

### Add Profile Row

After creating the user in auth, add their profile:

```sql
-- Replace with actual user UUID from auth.users
INSERT INTO profiles (id, email, full_name, role)
VALUES ('user-uuid-here', 'owner@example.com', 'Your Name', 'owner');
```

## 6. Seed Test Data (Optional)

Add some test ingredients and menu items:

```sql
-- Insert ingredients
INSERT INTO ingredients (name, unit, reorder_point, supplier) VALUES
  ('Beef Patty', 'kg', 5.0, 'Local Butcher'),
  ('Burger Bun', 'pcs', 20, 'Bakery Co'),
  ('Lettuce', 'kg', 2.0, 'Fresh Farms'),
  ('Tomato', 'kg', 3.0, 'Fresh Farms'),
  ('Cheese Slice', 'pcs', 50, 'Dairy Co');

-- Initialize inventory
INSERT INTO inventory_on_hand (ingredient_id, current_qty)
SELECT id, 100 FROM ingredients;

-- Create menu items
INSERT INTO menu_items (name, price, category, active) VALUES
  ('Classic Burger', 9.99, 'Burgers', true),
  ('Cheese Burger', 11.99, 'Burgers', true),
  ('Veggie Burger', 8.99, 'Burgers', true);
```

## 7. Test the Application

1. Navigate to `http://localhost:5173/login`
2. Sign in with your user credentials
3. Explore the dashboard
4. Try creating a sale, purchase, or expense

## Troubleshooting

### "Missing Supabase environment variables"

- Ensure `.env.local` exists with valid credentials
- Restart the dev server: `Ctrl+C` then `npm run dev`

### "User not authenticated"

- Check that you created a user in Supabase Auth
- Verify the `profiles` table has a row for your user
- Check browser console for errors

### "Cannot find module '@supabase/supabase-js'"

```bash
npm install
```

### RLS Policy Errors

- Ensure RLS policies are deployed
- Check that your user's role in `profiles` matches policy requirements
- View Supabase logs in Dashboard → Logs

## Next Steps

- Read [README.md](./README.md) for full documentation
- Check [INTEGRATION.md](./INTEGRATION.md) for API details
- Review [tests/README.md](./tests/README.md) for testing guide
- See [DEPLOYMENT_SUMMARY.md](./DEPLOYMENT_SUMMARY.md) for production deployment

## Production Deployment

### Environment Variables for Production

When deploying to Vercel, Netlify, or other platforms:

1. Add the same environment variables:
   - `VITE_PUBLIC_SUPABASE_URL`
   - `VITE_PUBLIC_SUPABASE_ANON_KEY`

2. For serverless functions (user creation), also add:
   - `SUPABASE_SERVICE_ROLE_KEY` (found in Settings → API → service_role key)

3. Deploy your code

### Build for Production

```bash
npm run build
```

Output will be in `dist/` directory.

## Support

- **Documentation**: See README.md, INTEGRATION.md
- **Supabase Docs**: [supabase.com/docs](https://supabase.com/docs)
- **Issues**: Check browser console and Supabase logs

---

Built by Dawit Getachew © 2025


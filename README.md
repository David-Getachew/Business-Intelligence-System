# Business Intelligence System

## Overview

Business Intelligence System is a comprehensive full-stack application designed for small to medium-sized businesses, particularly restaurants and cafes. This system provides automated business intelligence with real-time KPIs, transaction logging, inventory management, and AI-driven insights.

**Status**: ✅ **Fully Integrated with Supabase Backend**

This repository contains the complete frontend application integrated with Supabase for authentication, database operations, and real-time updates.

## Features

### Dashboard
- KPI cards showing revenue, COGS, gross profit, operating expenses, and net profit
- Revenue vs. Expenses chart (30-day view)
- Top performing menu items visualization
- Expense breakdown by category
- Inventory alerts for low stock items
- AI insights preview
- Quick action buttons for common tasks
- Recent transactions view

### Sales Management
- Quick sales entry with batch processing
- Menu item selection with pricing
- Quantity and price adjustments
- Line total calculations
- Batch submission with confirmation

### Purchases Tracking
- Ingredient purchase recording
- Unit cost and quantity tracking
- Total cost calculations
- Batch processing for multiple purchases
- Inventory update simulation

### Expense Management
- Categorized expense tracking
- Detailed expense subcategories
- Notes and reference fields
- Batch processing for multiple expenses

### Menu & Recipes
- Menu item management (create, read, update)
- Recipe ingredient tracking
- Category organization
- Active/inactive status toggling
- Price management

### Inventory Management
- Current stock levels view
- Reorder point tracking
- Stock status indicators (In Stock, Low Stock, Out of Stock)
- Stock adjustment capabilities
- Movement history tracking
- Supplier management

### Transaction History
- Tabbed interface for Sales, Purchases, and Expenses
- Detailed transaction viewing
- Editable transaction records
- Date-based filtering

### Reporting
- Weekly performance reports
- AI-generated insights
- PDF report downloads (simulated)
- Date range filtering

### User Management
- User role management (Owner, Staff)
- Profile management
- Account creation

### System Settings
- Date format preferences
- Currency selection
- Timezone configuration

## Technology Stack

- **Frontend Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Routing**: React Router v6
- **UI Components**: shadcn/ui (built on Radix UI)
- **Styling**: Tailwind CSS with custom design system
- **State Management**: React Query for server state
- **Forms**: React Hook Form with Zod validation
- **Charts**: Recharts
- **Icons**: Lucide React
- **Notifications**: Sonner and Radix UI Toast

## Design System

- **Fonts**: Poppins (headings), Outfit (body text)
- **Theme**: Elegant purple/pink gradient theme with light and dark modes
- **Colors**: HSL-based design system with semantic tokens
- **Responsive**: Mobile-first design with bottom navigation on small screens

## Architecture

- **Frontend**: React 18 + TypeScript + Vite
- **UI Framework**: shadcn/ui + Tailwind CSS
- **Backend**: Supabase (PostgreSQL + Auth + RLS)
- **Automation**: n8n (workflows run separately)
- **State Management**: React Query + Context API
- **Deployment**: Vercel/Netlify (frontend) + Supabase (backend)

## Quick Start

### Prerequisites

- Node.js v18 or higher
- npm or pnpm
- Supabase project (see [Setup Guide](#supabase-setup))

### 1. Clone and Install

```bash
git clone <repository-url>
cd Business-Intelligence-System
npm install
```

### 2. Environment Configuration

Copy `.env.example` to `.env.local` and configure:

```env
# Public Supabase credentials (safe for frontend)
VITE_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
VITE_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

### 3. Run Development Server

```bash
npm run dev
```

Visit `http://localhost:5173` and log in with your Supabase user credentials.

## Supabase Setup

### 1. Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Note your Project URL and anon/public API key
3. Save your Service Role key securely (never expose in frontend!)

### 2. Deploy Database Schema

Execute the SQL schema from your Technical Build Plan:

1. Open Supabase SQL Editor
2. Run the schema creation scripts (tables, triggers, RLS policies, RPCs)
3. Verify all tables are created successfully

Key tables:
- `profiles` - User roles and info
- `ingredients` - Inventory items
- `inventory_on_hand` - Current stock levels
- `menu_items` & `recipe_ingredients` - Menu with recipes
- `sales`, `purchases`, `expenses` - Transactions
- `daily_summaries`, `weekly_summaries` - Aggregated reports

### 3. Configure RLS Policies

Ensure Row Level Security policies are enabled:

```sql
-- Example: Allow authenticated users to insert sales
CREATE POLICY "Users can insert sales"
ON sales FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = created_by);

-- Example: Only owners can view daily summaries
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

### 4. Deploy RPC Functions

Create the `process_sale` function from your Technical Build Plan:

```sql
CREATE OR REPLACE FUNCTION process_sale(payload jsonb)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
-- (Full function implementation from Technical Build Plan)
$$;
```

### 5. Create Initial Users

Use Supabase Dashboard → Authentication → Users:

1. Create an owner account
2. After user creation, insert profile:

```sql
INSERT INTO profiles (id, email, full_name, role)
VALUES ('user-uuid-from-auth', 'owner@example.com', 'Owner Name', 'owner');
```

### 6. Seed Initial Data

Add test ingredients, menu items, and inventory:

```sql
-- Insert ingredients
INSERT INTO ingredients (name, unit, reorder_point, supplier) VALUES
  ('Beef Patty', 'kg', 5.0, 'Local Butcher'),
  ('Burger Bun', 'pcs', 20, 'Bakery Co'),
  ('Lettuce', 'kg', 2.0, 'Fresh Farms');

-- Initialize inventory
INSERT INTO inventory_on_hand (ingredient_id, current_qty)
SELECT id, 50 FROM ingredients;

-- Create menu items
INSERT INTO menu_items (name, price, category, active) VALUES
  ('Classic Burger', 9.99, 'Burgers', true),
  ('Cheese Burger', 11.99, 'Burgers', true);
```

## API Integration

All API functions are in `src/api/index.ts`. The frontend makes direct calls to Supabase using the anon key with RLS enforcement.

### Key API Functions

| Function | Description | Supabase Operation |
|----------|-------------|-------------------|
| `processSale()` | Submit sales batch | RPC: `process_sale` |
| `insertPurchase()` | Record purchase | INSERT into `purchases` |
| `insertExpense()` | Log expense | INSERT into `expenses` |
| `saveMenuItem()` | Create/update menu item | UPSERT `menu_items` + `recipe_ingredients` |
| `adjustInventory()` | Manual stock adjustment | UPDATE `inventory_on_hand` + INSERT `inventory_movements` |
| `fetchInventory()` | Get current stock | SELECT with JOIN |
| `fetchDailySummaries()` | Get aggregated KPIs | SELECT from `daily_summaries` |
| `fetchSales/Purchases/Expenses()` | Transaction history | SELECT with filters |

### Role-Based Access Control

- **Owner**: Full access to all pages and data
- **Staff**: Access to forms (Sales, Purchases, Expenses, Menu, Inventory) only
  - Cannot view Dashboard, Reports, Transactions, or Settings

Access control is enforced at:
1. **Frontend**: `ProtectedRoute` component with role checks
2. **Backend**: Supabase RLS policies on every table

## Deployment

### Frontend Deployment (Vercel)

1. **Connect Repository**
   ```bash
   npm install -g vercel
   vercel
   ```

2. **Set Environment Variables** in Vercel Dashboard:
   - `VITE_PUBLIC_SUPABASE_URL`
   - `VITE_PUBLIC_SUPABASE_ANON_KEY`

3. **Deploy**:
   ```bash
   vercel --prod
   ```

### Frontend Deployment (Netlify)

1. **Connect Repository** via Netlify Dashboard or CLI

2. **Build Settings**:
   - Build command: `npm run build`
   - Publish directory: `dist`

3. **Environment Variables**:
   - `VITE_PUBLIC_SUPABASE_URL`
   - `VITE_PUBLIC_SUPABASE_ANON_KEY`

### Serverless Functions (for User Creation)

The `api/` directory contains serverless functions requiring service role access.

**Vercel**: Automatically deploys `/api` functions
**Netlify**: Configure `netlify.toml`:

```toml
[build]
  functions = "api"
```

Set `SUPABASE_SERVICE_ROLE_KEY` in deployment environment (NEVER in frontend code).

Alternatively, deploy to Supabase Edge Functions:

```bash
supabase functions deploy create-user
```

## Testing

### Unit Tests

```bash
npm test
```

### Integration Tests

See `tests/README.md` for setup instructions.

```bash
# Set up test environment
cp .env.example .env.test
# Configure test Supabase project

# Run integration tests
npm test -- tests/integration.test.ts
```

### End-to-End Test Flow

1. **Sign in** as owner
2. **Create menu item** with recipe
3. **Submit purchase** → verify inventory increased
4. **Submit sale** → verify inventory decreased, COGS calculated
5. **View dashboard** → verify KPIs updated
6. **Check daily summaries** → verify aggregation

## Build for Production

```bash
npm run build
```

Output in `dist/` directory.

## Project Structure

```
src/
├── api/                 # API integration layer (Supabase calls)
│   └── index.ts        # All API functions with real backend integration
├── components/          # Reusable UI components
│   ├── dashboard/       # Dashboard-specific components
│   ├── layout/          # Layout components (Header, Sidebar, etc.)
│   ├── ui/              # Base UI components (shadcn)
│   └── ProtectedRoute.tsx  # Route guard with role checking
├── contexts/            # React Context providers
│   └── AuthContext.tsx  # Authentication and session management
├── hooks/               # Custom React hooks
├── lib/                 # Core utilities
│   ├── supabase.ts     # Supabase client configuration
│   └── utils.ts        # Helper functions
├── mocks/               # Mock data (for reference/dev only)
├── pages/               # Page components
└── App.tsx              # Main application with routing

api/                     # Serverless functions (service role operations)
└── users/
    └── create.ts       # User creation with service role

tests/                   # Integration tests
└── integration.test.ts  # End-to-end test suite
```

## Security Considerations

### Frontend Security

- ✅ Never expose `SUPABASE_SERVICE_ROLE_KEY` in client code
- ✅ Use RLS policies for all data access
- ✅ Validate and sanitize user inputs
- ✅ Use HTTPS only in production
- ✅ Implement rate limiting on sensitive operations

### Supabase RLS Best Practices

```sql
-- Example: Staff can insert sales, owner can view all
CREATE POLICY "Staff can create sales"
ON sales FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role IN ('owner', 'staff')
  )
);

CREATE POLICY "Owner can view all sales"
ON sales FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'owner'
  )
);
```

### Environment Variables

- **Frontend (.env.local)**: `VITE_PUBLIC_*` variables are exposed to client
- **Serverless Functions**: Use platform secrets for `SUPABASE_SERVICE_ROLE_KEY`
- **Never commit** `.env.local` or `.env` files to version control

## n8n Automation (Separate Service)

The n8n workflows handle:
- Daily aggregation (end of day → populate `daily_summaries`)
- Weekly reports (PDF generation + AI analysis)
- Email notifications

**Setup**: Configure n8n separately with `SUPABASE_SERVICE_ROLE_KEY` and run workflows on schedule. Frontend reads from `daily_summaries` and `weekly_summaries` tables populated by n8n.

## Troubleshooting

### "Missing Supabase environment variables"

Ensure `.env.local` exists with:
```env
VITE_PUBLIC_SUPABASE_URL=https://...
VITE_PUBLIC_SUPABASE_ANON_KEY=eyJ...
```

Restart dev server after changing env vars.

### "User not authenticated" errors

- Check user is signed in via Login page
- Verify `profiles` row exists for user
- Check browser console for auth errors

### RLS Policy Errors

- Ensure RLS policies are deployed
- Verify user's `profiles.role` matches policy requirements
- Check Supabase logs for policy violations

### Insufficient Stock Error

This is expected behavior when inventory is too low. Check:
1. `inventory_on_hand.current_qty` for ingredients
2. Menu item recipes (`recipe_ingredients.qty_per_item`)
3. Add purchases to increase stock

## Migration Notes

### From Static Frontend to Integrated

- ✅ All mock data removed from production code paths
- ✅ `src/mocks/` kept for reference but not used in app
- ✅ All API functions call Supabase directly
- ✅ No changes to UI/UX behavior
- ✅ No database schema modifications needed

### Upgrading Existing Installation

```bash
git pull origin main
npm install  # Install @supabase/supabase-js
cp .env.example .env.local  # Configure environment
npm run dev
```

## Contributing

This is an MVP template designed for customization. Feel free to extend and modify it according to your specific business requirements.

## License

MIT

## Author

Dawit Getachew - [GitHub](https://github.com/David-Getachew/) | [LinkedIn](https://www.linkedin.com/in/dawit-getachew-mekonen) | [Website](https://www.davidgetachew.com)

© 2025 Automation & Business Intelligence Systems

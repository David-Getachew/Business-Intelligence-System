# BizIntel - Business Intelligence System (MVP)

A comprehensive Business Intelligence System built with React, TypeScript, and Tailwind CSS. This is a fully functional frontend MVP with mock data, designed for seamless backend integration.

## 🎨 Design System

- **Fonts**: Poppins (headings), Outfit (body text)
- **Theme**: Elegant purple/pink gradient theme with light and dark modes
- **Colors**: HSL-based design system with semantic tokens
- **Components**: Customized shadcn/ui components

## 🚀 Tech Stack

- **Framework**: React 18 with Vite
- **Language**: TypeScript
- **Styling**: Tailwind CSS with custom design system
- **UI Components**: shadcn/ui (customized)
- **Charts**: Recharts
- **Routing**: React Router v6
- **State**: React Query

## 📁 Project Structure

```
src/
├── api/
│   └── index.ts                 # API placeholder functions
├── components/
│   ├── dashboard/               # Dashboard-specific components
│   │   ├── DateRangePicker.tsx
│   │   ├── KPICard.tsx
│   │   ├── RevenueChart.tsx
│   │   ├── TopItemsChart.tsx
│   │   ├── ExpensesPieChart.tsx
│   │   ├── InventoryAlerts.tsx
│   │   ├── AIInsightCard.tsx
│   │   └── RecentTransactions.tsx
│   ├── layout/                  # Layout components
│   │   ├── Header.tsx
│   │   ├── Sidebar.tsx
│   │   ├── MobileNav.tsx
│   │   └── MainLayout.tsx
│   └── ui/                      # Base UI components (shadcn)
├── hooks/
│   └── use-theme.tsx            # Theme management hook
├── mocks/                       # Mock data files
│   ├── ingredients.ts
│   ├── inventory.ts
│   ├── menuItems.ts
│   ├── summaries.ts
│   ├── transactions.ts
│   └── users.ts
├── pages/                       # Page components
│   ├── Dashboard.tsx
│   ├── QuickSales.tsx
│   ├── Purchases.tsx
│   ├── Expenses.tsx
│   ├── Menu.tsx
│   ├── Inventory.tsx
│   ├── Transactions.tsx
│   ├── Reports.tsx
│   ├── Settings.tsx
│   └── NotFound.tsx
└── App.tsx                      # Main app with routing
```

## 📊 Features Implemented

### ✅ Dashboard Page (`/dashboard`)
- **Date Range Controls**: Today, This Week, This Month, Custom
- **KPI Cards**: Revenue, COGS, Gross Profit, Operating Expense, Net Profit
- **Revenue vs Expense Chart**: 30-day line chart
- **Top Items Bar Chart**: Top 5 performing menu items
- **Expenses Pie Chart**: Category distribution
- **Inventory Alerts**: Low stock warnings
- **AI Insights**: Weekly analysis preview
- **Quick Actions**: Navigate to Quick Sale, New Purchase, New Expense
- **Recent Transactions**: Last 5 sales

### 🎯 Navigation Structure
- **/dashboard** - Main analytics dashboard
- **/sales/quick** - Quick sales entry (placeholder)
- **/purchases/new** - Purchase logging (placeholder)
- **/expenses/new** - Expense entry (placeholder)
- **/menu** - Menu & recipe management (placeholder)
- **/inventory** - Inventory tracking (placeholder)
- **/transactions** - Transaction history (placeholder)
- **/reports** - Weekly reports with AI insights (placeholder)
- **/settings** - User and system settings (placeholder)

### 🎨 UI Features
- **Responsive Design**: Mobile-first with bottom navigation
- **Dark/Light Mode**: Toggle in header with persistent preference
- **Glassmorphism Effects**: Modern glass cards with backdrop blur
- **Gradient Accents**: Purple to pink gradients throughout
- **Interactive Charts**: Recharts with custom styling
- **Accessibility**: Keyboard navigation, ARIA labels

## 🔌 API Integration Points

All API functions are defined in `src/api/index.ts` as placeholder functions that return mock promises. Replace these with actual backend calls:

### Sales
```typescript
processSale(payload: SalePayload): Promise<{success, message, sale_ids}>
```
**Payload Shape:**
```typescript
{
  sale_date: string,
  items: Array<{
    menu_item_id: string,
    menu_item_name: string,
    quantity: number,
    unit_price: number,
    line_total: number
  }>,
  subtotal: number,
  tax: number,
  total: number
}
```

### Purchases
```typescript
insertPurchase(payload: PurchasePayload): Promise<{success, purchase_id}>
```
**Payload Shape:**
```typescript
{
  purchase_date: string,
  ingredient_id: string,
  ingredient_name: string,
  quantity: number,
  unit_cost: number,
  total_cost: number,
  supplier?: string
}
```

### Expenses
```typescript
insertExpense(payload: ExpensePayload): Promise<{success, expense_id}>
```
**Payload Shape:**
```typescript
{
  expense_date: string,
  category: string,
  amount: number,
  reference?: string,
  notes?: string
}
```

### Menu Items
```typescript
saveMenuItem(payload: MenuItemPayload): Promise<{success, menu_item_id}>
```
**Payload Shape:**
```typescript
{
  name: string,
  price: number,
  category: string,
  active: boolean,
  recipe: Array<{
    ingredient_id: string,
    qty_per_item: number
  }>
}
```

### Inventory
```typescript
adjustInventory(payload: InventoryAdjustmentPayload): Promise<{success}>
fetchInventory(): Promise<InventoryItem[]>
```
**Adjustment Payload:**
```typescript
{
  ingredient_id: string,
  qty_change?: number,  // relative change
  set_qty?: number,     // absolute value
  reason: string
}
```

### Reports
```typescript
fetchDailySummaries(range: DateRange): Promise<DailySummary[]>
fetchWeeklySummaries(): Promise<WeeklySummary[]>
```

### Users
```typescript
createUser(payload: UserPayload): Promise<{success, user_id}>
```

## 🧪 Mock Data

Mock data is organized in the `src/mocks/` directory:

- **ingredients.ts** - List of ingredients with reorder points
- **inventory.ts** - Current inventory levels and movements
- **menuItems.ts** - Menu items with recipes
- **summaries.ts** - Daily/weekly summaries with AI analysis
- **transactions.ts** - Sales, purchases, and expenses
- **users.ts** - User accounts (owner/staff)

## 🛠️ Development

### Install Dependencies
```bash
npm install
```

### Run Development Server
```bash
npm run dev
```

### Build for Production
```bash
npm run build
```

### Preview Production Build
```bash
npm run preview
```

## 🔧 Backend Integration Guide

### Step 1: Replace API Placeholders
Navigate to `src/api/index.ts` and replace each function with actual API calls to your backend (Supabase, n8n, custom API, etc.).

### Step 2: Error Handling
Implement proper error handling for each API call. The current placeholders throw errors that can be caught in UI components.

### Step 3: Authentication
Integrate authentication in the Header component's user dropdown. Update the user context based on actual auth state.

### Step 4: Real-time Updates
Consider implementing real-time subscriptions for inventory and sales data using Supabase subscriptions or WebSockets.

### Step 5: File Uploads
For features like PDF report generation, integrate with your file storage solution.

## 🎯 Next Steps for Development

1. **Quick Sales Page**: Implement searchable menu item selector with cart functionality
2. **Purchases Page**: Add batch purchase entry form
3. **Expenses Page**: Create expense form with category management
4. **Menu Editor**: Build menu item CRUD with recipe ingredient management
5. **Inventory Page**: Full inventory table with stock adjustment modals
6. **Transactions Page**: Tabbed view with editable transaction rows
7. **Reports Page**: Weekly summaries list with PDF download
8. **Settings Page**: User management and system configuration
9. **Onboarding**: Initial setup wizard for ingredients, menu, and inventory

## 📱 Responsive Breakpoints

- **Mobile**: < 768px (bottom navigation)
- **Tablet**: 768px - 1024px
- **Desktop**: > 1024px

## 🎨 Design Tokens

All design tokens are defined in `src/index.css`:

- **Colors**: HSL-based semantic colors (primary, accent, success, warning, etc.)
- **Gradients**: `gradient-primary`, `gradient-secondary`
- **Shadows**: `shadow-sm`, `shadow-md`, `shadow-lg`, `shadow-glow`
- **Effects**: `glass` utility class for glassmorphism

## 🐛 Dev Utilities

Set global dev flags in browser console:

```javascript
// Simulate insufficient stock error
window.__DEV_SIMULATE_INSUFFICIENT_STOCK = true;

// Simulate user role (affects which controls are enabled)
window.__DEV_USER_ROLE = 'staff'; // or 'owner'
```

## 📄 License

MIT

## 👥 Contributing

This is an MVP template. Customize and extend as needed for your specific business requirements.

---

Built with ❤️ using React, TypeScript, and Tailwind CSS

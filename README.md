# Business Intelligence System - Frontend Only

## Overview

Business Intelligence System is a comprehensive frontend-only template designed by me for small to medium-sized businesses, particularly restaurants and cafes. This repository contains the **frontend only** - a fully functional React application with mock data that demonstrates the complete user interface and experience.

**Important Note**: This is a frontend template only. No backend integrations have been implemented yet. All data is mocked for demonstration purposes.

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

## Current Status

This is a **frontend template only**. The following integrations have NOT been implemented:

- Database connections
- Authentication system
- Real API endpoints
- File storage (for PDF reports)
- Payment processing
- Real-time updates

All data is currently mocked in the `src/mocks/` directory.

## Next Steps for Full Implementation

1. **Backend Development**: Implement a backend API (Node.js, Supabase, etc.)
2. **Database Setup**: Create database schema and connect to frontend
3. **Authentication**: Implement user authentication and authorization
4. **Real API Integration**: Replace mock API functions with real endpoints
5. **File Storage**: Set up file storage for reports and images
6. **Payment Integration**: Add payment processing capabilities
7. **Deployment**: Deploy frontend and backend to production environments

## Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Installation
```bash
npm install
```

### Development
```bash
npm run dev
```

### Build for Production
```bash
npm run build
```

## Project Structure

```
src/
├── api/                 # API placeholder functions (mocked)
├── components/          # Reusable UI components
│   ├── dashboard/       # Dashboard-specific components
│   ├── layout/          # Layout components (Header, Sidebar, etc.)
│   └── ui/              # Base UI components (shadcn)
├── hooks/               # Custom React hooks
├── mocks/               # Mock data for demonstration
├── pages/               # Page components
├── lib/                 # Utility functions
└── App.tsx              # Main application component
```

## Contributing

This is an MVP template designed for customization. Feel free to extend and modify it according to your specific business requirements.

## License

MIT

## Author

Dawit Getachew - [GitHub](https://github.com/David-Getachew/) | [LinkedIn](https://www.linkedin.com/in/dawit-getachew-mekonen) | [Website](https://www.davidgetachew.com)

© 2025 Automation & Business Intelligence Systems

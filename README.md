Business Intelligence System (MVP)

Overview

This project is a mobile-first Business Intelligence MVP for single-location food businesses. It provides:

- Transaction logging (POS sales, purchases, expenses)
- Menu, recipe, and inventory management with stock tracking
- Automated KPIs and weekly reports
- Secure RBAC (admin, staff) with Supabase Auth
- Supabase as the unified backend (Postgres, Auth, Storage, Edge Functions)

Architecture

- Frontend: React + TypeScript, TanStack Query, Tailwind UI components
- Backend: Supabase (Postgres, RLS, RPCs, Storage, Edge Functions)
- Auth: Supabase Auth with profiles table for roles

Key Features

- POS Sales screen with category filtering and buffer checkout
- Menu and recipe editor with atomic save RPC
- Inventory tracking and movement logs
- Reports page for weekly summaries and AI analysis text
- Image management for menu items (Storage with overwrite and cache-busting)

Security

- RBAC enforced client-side and via RLS (admin-only pages: dashboard, reports, transactions, settings)
- Sensitive operations implemented as SECURITY DEFINER RPCs where RLS would block app logic
- File uploads validated for type and size; fixed storage paths with overwrite
- No hard-coded secrets in repository; environment variables required

Getting Started

Prerequisites

- Node.js 18+
- Supabase project (URL and anon keys)

Environment Variables

Create a local .env file (not committed). Required variables:

- VITE_PUBLIC_SUPABASE_URL=
- VITE_PUBLIC_SUPABASE_ANON_KEY=

Install and Run

1) Install dependencies

   npm install

2) Start development server

   npm run dev

3) Build for production

   npm run build

Supabase Setup

- Enable Auth and create a profiles table mapping auth.users.id to role (admin, staff)
- Apply migrations for tables: menu_items, ingredients, recipe_ingredients, purchases, sales, expenses, inventory tables, summaries
- Ensure RPCs exist: save_menu_item_and_recipe (SECURITY DEFINER), log_menu_item_image, update_sale_line_item, log_buffer_sales
- Configure Storage bucket: menu-item-images (public)

Image Handling

- Images are uploaded via an Edge Function (upload-menu-item-image)
- Overwrites same path (menu_items/{id}.{ext}) with cache-control headers
- Client adds cache-busting query param and re-renders using a version key

RBAC & Routing

- Staff are restricted to POS, purchases, expenses, menu, and inventory
- Admins can access dashboard, transactions, reports, and settings
- Unauthorized staff redirection goes to /sales/pos

Contributing

- Use TypeScript strictness and keep components small and typed
- Avoid console logs in production; use toasts for user-facing messages
- Follow mobile-first design and Tailwind for styling

License

This project is provided as-is for demonstration and MVP purposes.

# Business Intelligence System

## Overview

Business Intelligence System is a full-stack application for managing inventory, sales, purchases, and dashboards using Supabase backend and React frontend, providing real-time tracking and reporting for businesses.

## Key Functionalities

- **Inventory Management**: Track current stock levels, reorder points, and stock status indicators
- **Sales Management**: Process sales with stock checks and batch processing
- **Purchases Tracking**: Record ingredient purchases with automatic inventory updates
- **Dashboard KPIs/Graphs**: Visualize revenue, COGS, gross profit, operating expenses, and net profit
- **User Roles**: Role-based access control (Owner, Staff) with appropriate permissions

## Architecture

- **Backend**: Supabase PostgreSQL database with Row Level Security (RLS) policies and Remote Procedure Calls (RPCs)
- **Frontend**: React with TypeScript, Tailwind CSS, and Supabase JavaScript client
- **State Management**: React Query for server state and Context API for global state

## Setup

1. Clone the repository
2. Install dependencies with `npm install`
3. Configure environment variables:
   - Create `.env.local` from `.env.example`
   - Set `VITE_PUBLIC_SUPABASE_URL` and `VITE_PUBLIC_SUPABASE_ANON_KEY`
4. Run database migrations (if applicable)
5. Start the development server with `npm run dev`

## Usage

The application provides a comprehensive interface for business operations:
- Dashboard for key performance indicators
- Forms for sales, purchases, and expense tracking
- Menu management with recipe ingredients
- Inventory tracking with alerts
- Transaction history with filtering
- Reporting capabilities

## Contributing

Contributions are welcome. Please fork the repository and submit pull requests with your improvements.

## License

MIT License

Copyright (c) 2025 Business Intelligence Systems

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

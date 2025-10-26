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

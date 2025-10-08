import { useState } from 'react';
import { ArrowUpRight, ArrowDownRight, ShoppingCart, Package, Receipt, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DateRangePicker } from '@/components/dashboard/DateRangePicker';
import { KPICard } from '@/components/dashboard/KPICard';
import { RevenueChart } from '@/components/dashboard/RevenueChart';
import { TopItemsChart } from '@/components/dashboard/TopItemsChart';
import { ExpensesPieChart } from '@/components/dashboard/ExpensesPieChart';
import { InventoryAlerts } from '@/components/dashboard/InventoryAlerts';
import { AIInsightCard } from '@/components/dashboard/AIInsightCard';
import { RecentTransactions } from '@/components/dashboard/RecentTransactions';
import { useNavigate } from 'react-router-dom';
import { mockChartData, mockDailySummaries } from '@/mocks/summaries';

export default function Dashboard() {
  const navigate = useNavigate();
  const [dateRange, setDateRange] = useState({ start: '', end: '' });

  // Calculate KPIs from mock data
  const todayData = mockDailySummaries[0];
  const kpis = {
    revenue: todayData.revenue,
    cogs: todayData.cogs,
    grossProfit: todayData.gross_profit,
    opex: todayData.operating_expense,
    netProfit: todayData.net_profit,
  };

  return (
    <div className="space-y-6">
      {/* Header with Date Range */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-heading font-bold">Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Overview of your business performance
          </p>
        </div>
        <DateRangePicker value={dateRange} onChange={setDateRange} />
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <KPICard
          title="Revenue"
          value={kpis.revenue}
          change={8.2}
          icon={TrendingUp}
          trend="up"
        />
        <KPICard
          title="COGS"
          value={kpis.cogs}
          change={3.1}
          icon={Package}
          trend="down"
        />
        <KPICard
          title="Gross Profit"
          value={kpis.grossProfit}
          change={12.5}
          icon={ArrowUpRight}
          trend="up"
        />
        <KPICard
          title="Operating Expense"
          value={kpis.opex}
          change={2.3}
          icon={Receipt}
          trend="up"
        />
        <KPICard
          title="Net Profit"
          value={kpis.netProfit}
          change={15.8}
          icon={ArrowUpRight}
          trend="up"
        />
      </div>

      {/* Charts Row */}
      <div className="grid gap-4 lg:grid-cols-7">
        <Card className="lg:col-span-4 shadow-card">
          <CardHeader>
            <CardTitle>Revenue vs Expenses</CardTitle>
            <CardDescription>Last 30 days performance</CardDescription>
          </CardHeader>
          <CardContent>
            <RevenueChart data={mockChartData} />
          </CardContent>
        </Card>

        <Card className="lg:col-span-3 shadow-card">
          <CardHeader>
            <CardTitle>Top Items</CardTitle>
            <CardDescription>Best performing menu items</CardDescription>
          </CardHeader>
          <CardContent>
            <TopItemsChart data={todayData.top_income_items} />
          </CardContent>
        </Card>
      </div>

      {/* Second Row */}
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle>Expense Breakdown</CardTitle>
            <CardDescription>Category distribution</CardDescription>
          </CardHeader>
          <CardContent>
            <ExpensesPieChart />
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader>
            <CardTitle>Inventory Alerts</CardTitle>
            <CardDescription>Low stock items</CardDescription>
          </CardHeader>
          <CardContent>
            <InventoryAlerts />
          </CardContent>
        </Card>

        <AIInsightCard />
      </div>

      {/* Quick Actions */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <Button 
              className="gradient-primary shadow-glow"
              onClick={() => navigate('/sales/quick')}
            >
              <ShoppingCart className="mr-2 h-4 w-4" />
              Quick Sale
            </Button>
            <Button 
              variant="secondary"
              onClick={() => navigate('/purchases/new')}
            >
              <Package className="mr-2 h-4 w-4" />
              New Purchase
            </Button>
            <Button 
              variant="secondary"
              onClick={() => navigate('/expenses/new')}
            >
              <Receipt className="mr-2 h-4 w-4" />
              New Expense
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Recent Transactions */}
      <RecentTransactions />
    </div>
  );
}

import { useState, useEffect } from 'react';
import { ArrowUpRight, ShoppingCart, Package, Receipt, TrendingUp, Sparkles, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { DateRangePicker } from '@/components/dashboard/DateRangePicker';
import { KPICard } from '@/components/dashboard/KPICard';
import { RevenueChart } from '@/components/dashboard/RevenueChart';
import { TopItemsChart } from '@/components/dashboard/TopItemsChart';
import { ExpensesPieChart } from '@/components/dashboard/ExpensesPieChart';
import { InventoryAlerts } from '@/components/dashboard/InventoryAlerts';
import { AIInsightCard } from '@/components/dashboard/AIInsightCard';
import { RecentTransactions } from '@/components/dashboard/RecentTransactions';
import { useNavigate } from 'react-router-dom';
import { fetchDailySummaries, fetchMenuItemNamesByIds } from '@/api/index';
import { calculatePreviousPeriod, calculatePercentageChange, isGoodChange } from '@/utils/dateCalculations';
import { toast } from 'sonner';

export default function Dashboard() {
  const navigate = useNavigate();
  const [dateRange, setDateRange] = useState({ start: '', end: '' }); // All time default
  const [loading, setLoading] = useState(true);
  const [dailySummaries, setDailySummaries] = useState<any[]>([]);
  const [previousSummaries, setPreviousSummaries] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDashboardData();
  }, [dateRange]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // All time default - fetch all data if no date range specified
      const endDate = dateRange.end || new Date().toISOString().split('T')[0];
      const startDate = dateRange.start || '2020-01-01'; // Far back date for all time

      const currentRange = { start: startDate, end: endDate };
      const { current, previous } = calculatePreviousPeriod(currentRange);

      // Fetch current period data
      const summaries = await fetchDailySummaries(current);
      setDailySummaries(summaries);

      // Fetch previous period data for comparison (only if not all time)
      if (previous.start && previous.end) {
        const prevSummaries = await fetchDailySummaries(previous);
        setPreviousSummaries(prevSummaries);
      } else {
        setPreviousSummaries([]);
      }
    } catch (err: any) {
      console.error('Error loading dashboard data:', err);
      setError(err.message || 'Failed to load dashboard data');
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  // Aggregate current period KPIs
  const currentKPIs = {
    revenue: dailySummaries.reduce((sum, summary) => sum + (summary.total_revenue || 0), 0),
    cogs: dailySummaries.reduce((sum, summary) => sum + (summary.total_cogs || 0), 0),
    grossProfit: dailySummaries.reduce((sum, summary) => sum + (summary.gross_profit || 0), 0),
    opex: dailySummaries.reduce((sum, summary) => sum + (summary.operating_expense || 0), 0),
    netProfit: dailySummaries.reduce((sum, summary) => sum + (summary.net_profit || 0), 0),
  };

  // Aggregate previous period KPIs
  const previousKPIs = {
    revenue: previousSummaries.reduce((sum, summary) => sum + (summary.total_revenue || 0), 0),
    cogs: previousSummaries.reduce((sum, summary) => sum + (summary.total_cogs || 0), 0),
    grossProfit: previousSummaries.reduce((sum, summary) => sum + (summary.gross_profit || 0), 0),
    opex: previousSummaries.reduce((sum, summary) => sum + (summary.operating_expense || 0), 0),
    netProfit: previousSummaries.reduce((sum, summary) => sum + (summary.net_profit || 0), 0),
  };

  // Calculate percentage changes
  const kpiChanges = {
    revenue: calculatePercentageChange(currentKPIs.revenue, previousKPIs.revenue),
    cogs: calculatePercentageChange(currentKPIs.cogs, previousKPIs.cogs),
    grossProfit: calculatePercentageChange(currentKPIs.grossProfit, previousKPIs.grossProfit),
    opex: calculatePercentageChange(currentKPIs.opex, previousKPIs.opex),
    netProfit: calculatePercentageChange(currentKPIs.netProfit, previousKPIs.netProfit),
  };

  // Determine trend direction for each KPI
  const kpiTrends = {
    revenue: kpiChanges.revenue > 0 ? 'up' : 'down',
    cogs: kpiChanges.cogs > 0 ? 'up' : 'down',
    grossProfit: kpiChanges.grossProfit > 0 ? 'up' : 'down',
    opex: kpiChanges.opex > 0 ? 'up' : 'down',
    netProfit: kpiChanges.netProfit > 0 ? 'up' : 'down',
  };

  const chartData = dailySummaries.map(summary => ({
    date: summary.day,
    revenue: summary.total_revenue || 0,          // EXACT schema column
    expenses: (summary.operating_expense || 0) + (summary.total_cogs || 0),  // EXACT schema columns
  }));

  const formatDateRange = () => {
    if (!dateRange.start || !dateRange.end) return '';
    const startDate = new Date(dateRange.start);
    const endDate = new Date(dateRange.end);
    
    if (startDate.toDateString() === endDate.toDateString()) {
      return `Period: ${startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
    }
    return `Period: ${startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} – ${endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-4 w-96 mt-2" />
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          {[1, 2, 3, 4, 5].map(i => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-heading font-bold">Dashboard</h1>
          <p className="text-muted-foreground mt-1">Overview of your business performance</p>
        </div>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <Button onClick={loadDashboardData}>Retry</Button>
      </div>
    );
  }

  const hasData = dailySummaries.length > 0;

  return (
    <div className="space-y-6">
      {/* Header with Date Range */}
      <div>
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-heading font-bold">Dashboard</h1>
            <p className="text-muted-foreground mt-1">
              Overview of your business performance
            </p>
          </div>
          <DateRangePicker value={dateRange} onChange={setDateRange} />
        </div>
        {dateRange.start && dateRange.end && (
          <p className="text-sm text-muted-foreground mt-2">
            {formatDateRange()}
          </p>
        )}
      </div>

      {!hasData && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            No data available yet. Start by adding transactions via the forms (Sales, Purchases, Expenses) to see your business metrics here.
          </AlertDescription>
        </Alert>
      )}

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <KPICard
          title="Revenue"
          value={currentKPIs.revenue}
          change={Math.round(kpiChanges.revenue * 10) / 10}
          icon={TrendingUp}
          trend={kpiTrends.revenue}
        />
        <KPICard
          title="COGS"
          value={currentKPIs.cogs}
          change={Math.round(kpiChanges.cogs * 10) / 10}
          icon={Package}
          trend={kpiTrends.cogs}
        />
        <KPICard
          title="Gross Profit"
          value={currentKPIs.grossProfit}
          change={Math.round(kpiChanges.grossProfit * 10) / 10}
          icon={ArrowUpRight}
          trend={kpiTrends.grossProfit}
        />
        <KPICard
          title="Operating Expense"
          value={currentKPIs.opex}
          change={Math.round(kpiChanges.opex * 10) / 10}
          icon={Receipt}
          trend={kpiTrends.opex}
        />
        <KPICard
          title="Net Profit"
          value={currentKPIs.netProfit}
          change={Math.round(kpiChanges.netProfit * 10) / 10}
          icon={ArrowUpRight}
          trend={kpiTrends.netProfit}
        />
      </div>

      {/* Revenue Chart - Full Width */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle>Revenue vs Expenses</CardTitle>
          <CardDescription>Last 30 days performance</CardDescription>
        </CardHeader>
        <CardContent>
          {hasData ? (
            <RevenueChart data={chartData} />
          ) : (
            <div className="h-64 flex items-center justify-center text-muted-foreground">
              No chart data available
            </div>
          )}
        </CardContent>
      </Card>

      {/* Top Items Chart - Full Width */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle>Top Items</CardTitle>
          <CardDescription>Best performing menu items</CardDescription>
        </CardHeader>
        <CardContent>
          {hasData && dailySummaries.length > 0 ? (
            <TopItems chartSource={dailySummaries} />
          ) : (
            <div className="h-64 flex items-center justify-center text-muted-foreground">
              No top items data available
            </div>
          )}
        </CardContent>
      </Card>

      {/* Middle Section - Two Columns */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Expense Breakdown */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle>Expense Breakdown</CardTitle>
            <CardDescription>Category distribution</CardDescription>
          </CardHeader>
          <CardContent>
            <ExpensesPieChart dailySummaries={dailySummaries} />
          </CardContent>
        </Card>

        {/* Inventory Alerts */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle>Inventory Alerts</CardTitle>
            <CardDescription>Low stock items</CardDescription>
          </CardHeader>
          <CardContent>
            <InventoryAlerts />
          </CardContent>
        </Card>
      </div>

      {/* Bottom Section - Two Columns */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* AI Insights */}
        <Card className="shadow-card border-primary/20 bg-gradient-to-br from-primary/5 to-accent/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              <span className="text-primary">AI Insights</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <AIInsightCard />
          </CardContent>
        </Card>
        
        {/* Quick Actions */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-3">
              <Button 
                className="gradient-primary shadow-glow justify-start"
                onClick={() => navigate('/sales/quick')}
              >
                <ShoppingCart className="mr-2 h-4 w-4" />
                Quick Sale
              </Button>
              <Button 
                variant="secondary"
                className="justify-start"
                onClick={() => navigate('/purchases/new')}
              >
                <Package className="mr-2 h-4 w-4" />
                New Purchase
              </Button>
              <Button 
                variant="secondary"
                className="justify-start"
                onClick={() => navigate('/expenses/new')}
              >
                <Receipt className="mr-2 h-4 w-4" />
                New Expense
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Transactions */}
      <RecentTransactions />
    </div>
  );
}

function TopItems({ chartSource }: { chartSource: any[] }) {
  const [mapped, setMapped] = useState<Array<{ name: string; revenue: number }>>([]);

  useEffect(() => {
    const run = async () => {
      try {
        // Aggregate top_income_items JSON across all daily summaries
        const aggregatedItems: { [key: string]: number } = {};
        
        chartSource.forEach((summary: any) => {
          if (summary.top_income_items && typeof summary.top_income_items === 'object') {
            Object.entries(summary.top_income_items).forEach(([itemName, revenue]) => {
              const revenueNum = Number(revenue) || 0;
              aggregatedItems[itemName] = (aggregatedItems[itemName] || 0) + revenueNum;
            });
          }
        });

        // Convert to array and sort by revenue (descending)
        const sortedItems = Object.entries(aggregatedItems)
          .map(([name, revenue]) => ({ name, revenue }))
          .sort((a, b) => b.revenue - a.revenue)
          .slice(0, 5); // Top 5 items

        setMapped(sortedItems);
      } catch (e) {
        console.error('Error processing top items:', e);
        setMapped([]);
      }
    };
    run();
  }, [chartSource]);

  return <TopItemsChart data={mapped} />;
}
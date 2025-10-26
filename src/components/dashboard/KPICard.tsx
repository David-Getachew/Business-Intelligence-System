import { LucideIcon, TrendingUp, TrendingDown, ArrowUp, ArrowDown, Minus } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface KPICardProps {
  title: string;
  value: number;
  change: number;
  icon: LucideIcon;
  trend: 'up' | 'down';
}

export function KPICard({ title, value, change, icon: Icon, trend }: KPICardProps) {
  const isNetProfit = title === 'Net Profit';
  const isProfit = value >= 0;
  
  // Determine if this is a cost metric (COGS, Operating Expenses)
  const isCostMetric = title === 'COGS' || title === 'Operating Expense';
  
  // Calculate display values
  const absoluteChange = Math.abs(change);
  const isPositiveChange = change > 0;
  const isZeroChange = change === 0;
  
  // Determine color and arrow logic
  let colorClass = '';
  let ArrowIcon = Minus;
  
  if (isZeroChange) {
    colorClass = 'text-muted-foreground';
    ArrowIcon = Minus;
  } else if (isCostMetric) {
    // For costs: decrease is good (green), increase is bad (red)
    if (isPositiveChange) {
      colorClass = 'text-destructive'; // Cost increased = bad
      ArrowIcon = ArrowUp;
    } else {
      colorClass = 'text-success'; // Cost decreased = good
      ArrowIcon = ArrowDown;
    }
  } else {
    // For revenue/profit: increase is good (green), decrease is bad (red)
    if (isPositiveChange) {
      colorClass = 'text-success'; // Revenue/profit increased = good
      ArrowIcon = ArrowUp;
    } else {
      colorClass = 'text-destructive'; // Revenue/profit decreased = bad
      ArrowIcon = ArrowDown;
    }
  }

  return (
    <Card className="shadow-card hover:shadow-glow transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <Icon className="h-4 w-4 text-muted-foreground" />
        </div>
        <div className="space-y-1">
          <p className={cn(
            "text-2xl font-heading font-bold",
            isNetProfit && isProfit ? "text-success" : isNetProfit && !isProfit ? "text-destructive" : ""
          )}>
            {Math.abs(value).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} Birr
            {isNetProfit && !isProfit && " (Loss)"}
          </p>
          <div className="flex items-center gap-1 text-xs">
            <ArrowIcon className={cn('h-3 w-3', colorClass)} />
            <span className={cn('font-medium', colorClass)}>
              {absoluteChange.toFixed(1)}%
            </span>
            <span className="text-muted-foreground">vs last period</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
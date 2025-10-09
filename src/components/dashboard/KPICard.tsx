import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';
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
  const TrendIcon = trend === 'up' ? TrendingUp : TrendingDown;
  const isPositive = trend === 'up';
  const isNetProfit = title === 'Net Profit';
  const isProfit = value >= 0;

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
            ${Math.abs(value).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            {isNetProfit && !isProfit && " (Loss)"}
          </p>
          <div className="flex items-center gap-1 text-xs">
            <TrendIcon className={cn('h-3 w-3', isPositive ? 'text-success' : 'text-destructive')} />
            <span className={cn('font-medium', isPositive ? 'text-success' : 'text-destructive')}>
              {change}%
            </span>
            <span className="text-muted-foreground">vs last period</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
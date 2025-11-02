import { useState, useEffect } from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Label } from 'recharts';
import { Skeleton } from '@/components/ui/skeleton';

const COLORS = [
  'hsl(var(--primary))',
  'hsl(var(--accent))',
  'hsl(var(--success))',
  'hsl(var(--warning))',
  'hsl(var(--muted-foreground))',
  'hsl(var(--destructive))',
  'hsl(var(--primary) / 0.8)',
  'hsl(var(--accent) / 0.8)',
  'hsl(var(--success) / 0.8)',
  'hsl(var(--warning) / 0.8)',
];

interface ExpensesPieChartProps {
  dailySummaries?: any[];
}

export function ExpensesPieChart({ dailySummaries = [] }: ExpensesPieChartProps) {
  const [expenseData, setExpenseData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadExpenseData = async () => {
    try {
      setLoading(true);
      
      const aggregatedExpenses: { [key: string]: number } = {};
      
      dailySummaries.forEach((summary: any) => {
        if (summary.top_expense_items && typeof summary.top_expense_items === 'object') {
          Object.entries(summary.top_expense_items).forEach(([expenseName, amount]) => {
            const amountNum = Number(amount) || 0;
            aggregatedExpenses[expenseName] = (aggregatedExpenses[expenseName] || 0) + amountNum;
          });
        }
      });

      const chartData = Object.entries(aggregatedExpenses).map(([name, value]) => ({
        name,
        value: value as number
      }));

      setExpenseData(chartData);
    } catch (error) {
      console.error('Error loading expense data:', error);
      setExpenseData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadExpenseData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dailySummaries]);

  if (loading) {
    return <Skeleton className="h-[300px] w-full" />;
  }

  if (expenseData.length === 0) {
    return (
      <div className="h-[300px] flex items-center justify-center text-muted-foreground text-sm">
        No expense data available yet
      </div>
    );
  }

  const totalExpenses = expenseData.reduce((sum, item) => sum + item.value, 0);
  const dataWithPercentages = expenseData.map(item => ({
    ...item,
    percentage: ((item.value / totalExpenses) * 100).toFixed(1)
  }));

  return (
    <div className="w-full">
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={dataWithPercentages}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={80}
            paddingAngle={2}
            dataKey="value"
            labelLine={true}
            label={({ name, percentage, cx, cy, midAngle, outerRadius, viewBox }) => {
              const RADIAN = Math.PI / 180;
              const radius = outerRadius + 35;
              const x = cx + radius * Math.cos(-midAngle * RADIAN);
              const y = cy + radius * Math.sin(-midAngle * RADIAN);
              
              // Ensure text fits within chart boundaries
              const adjustedX = viewBox?.width ? Math.max(20, Math.min(x, viewBox.width - 20)) : x;
              
              return (
                <text 
                  x={adjustedX} 
                  y={y} 
                  fill="hsl(var(--foreground))" 
                  textAnchor={x > cx ? 'start' : 'end'} 
                  dominantBaseline="central"
                  fontSize={12}
                  fontWeight="600"
                >
                  {`${name}: ${percentage}%`}
                </text>
              );
            }}
          >
            {dataWithPercentages.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={COLORS[index % COLORS.length]} 
                stroke="none"
              />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: 'hsl(var(--card))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '8px',
            }}
            formatter={(value: number) => [`${value.toFixed(2)} Birr`, 'Amount']}
            itemStyle={{ color: 'hsl(var(--foreground))' }}
          />
          <Label
            content={({ viewBox }) => {
              if (viewBox && 'cx' in viewBox && 'cy' in viewBox) {
                return (
                  <text x={viewBox.cx} y={viewBox.cy} textAnchor="middle" dominantBaseline="middle">
                    <tspan x={viewBox.cx} y={(viewBox.cy || 0) - 8} className="fill-foreground text-2xl font-bold">
                      {totalExpenses.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })} Birr
                    </tspan>
                    <tspan x={viewBox.cx} y={(viewBox.cy || 0) + 16} className="fill-muted-foreground text-sm">
                      Total Expenses
                    </tspan>
                  </text>
                );
              }
              return null;
            }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

interface RevenueChartProps {
  data: any[];
}

export function RevenueChart({ data }: RevenueChartProps) {
  // Format date for x-axis (e.g., "Oct 15")
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div className="w-full">
      <ResponsiveContainer width="100%" height={400}>
        <LineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 40 }}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
          <XAxis
            dataKey="date"
            tickFormatter={formatDate}
            className="text-xs"
            angle={-45}
            textAnchor="end"
            height={60}
          />
          <YAxis className="text-xs" />
          <Tooltip
            contentStyle={{
              backgroundColor: 'hsl(var(--card))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '8px',
            }}
            labelFormatter={(date) => new Date(date).toLocaleDateString()}
            formatter={(value: number) => [`$${value.toFixed(2)}`, '']}
          />
          <Legend />
          <Line
            type="monotone"
            dataKey="revenue"
            stroke="hsl(var(--primary))"
            strokeWidth={2}
            dot={false}
            name="Revenue"
          />
          <Line
            type="monotone"
            dataKey="total_expense"
            stroke="hsl(var(--destructive))"
            strokeWidth={2}
            dot={false}
            name="Total Expense"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
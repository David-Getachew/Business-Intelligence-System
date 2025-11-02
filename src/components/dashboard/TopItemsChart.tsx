import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';

interface TopItemsChartProps {
  data: Array<{ name: string; revenue: number }>;
}

export function TopItemsChart({ data }: TopItemsChartProps) {
  return (
    <div className="w-full">
      <ResponsiveContainer width="100%" height={400}>
        <BarChart data={data} layout="vertical" margin={{ top: 20, right: 30, left: 33, bottom: 5 }}>
          <XAxis type="number" className="text-xs" />
          <YAxis
            type="category"
            dataKey="name"
            className="text-xs"
            width={50}
            tick={{ fill: 'hsl(var(--foreground))' }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'hsl(var(--card))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '8px',
            }}
            formatter={(value: number) => [`${value.toFixed(2)} Birr`, 'Revenue']}
            labelFormatter={(name) => name}
          />
          <Bar
            dataKey="revenue"
            fill="url(#colorGradient)"
            radius={[0, 4, 4, 0]}
          />
          <defs>
            <linearGradient id="colorGradient" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="hsl(var(--primary))" />
              <stop offset="100%" stopColor="hsl(var(--accent))" />
            </linearGradient>
          </defs>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
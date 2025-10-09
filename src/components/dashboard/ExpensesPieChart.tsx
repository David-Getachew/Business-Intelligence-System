import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Label } from 'recharts';

const mockExpenseData = [
  { name: 'Rent', value: 2500 },
  { name: 'Utilities', value: 450 },
  { name: 'Marketing', value: 300 },
  { name: 'Maintenance', value: 175 },
  { name: 'Other', value: 225 },
];

const COLORS = [
  'hsl(var(--primary))',
  'hsl(var(--accent))',
  'hsl(var(--success))',
  'hsl(var(--warning))',
  'hsl(var(--muted-foreground))',
];

const totalExpenses = mockExpenseData.reduce((sum, item) => sum + item.value, 0);

export function ExpensesPieChart() {
  const dataWithPercentages = mockExpenseData.map(item => ({
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
            label={({ name, percentage, cx, cy, midAngle, outerRadius }) => {
              const RADIAN = Math.PI / 180;
              const radius = outerRadius + 20;
              const x = cx + radius * Math.cos(-midAngle * RADIAN);
              const y = cy + radius * Math.sin(-midAngle * RADIAN);
              
              return (
                <text 
                  x={x} 
                  y={y} 
                  fill="hsl(var(--foreground))" 
                  textAnchor={x > cx ? 'start' : 'end'} 
                  dominantBaseline="central"
                  fontSize={12}
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
                stroke="hsl(var(--border))"
                strokeWidth={0.5}
              />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: 'hsl(var(--card))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '8px',
            }}
            formatter={(value: number) => [`$${value.toFixed(2)}`, 'Amount']}
            itemStyle={{ color: 'hsl(var(--foreground))' }}
          />
          <Label
            content={({ viewBox }) => {
              if (viewBox && 'cx' in viewBox && 'cy' in viewBox) {
                return (
                  <text x={viewBox.cx} y={viewBox.cy} textAnchor="middle" dominantBaseline="middle">
                    <tspan x={viewBox.cx} y={viewBox.cy} className="fill-foreground text-2xl font-bold">
                      ${totalExpenses.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                    </tspan>
                    <tspan x={viewBox.cx} y={viewBox.cy + 20} className="fill-muted-foreground text-sm">
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
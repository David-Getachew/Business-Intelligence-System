import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';

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
            label={({ name, percentage }) => `${name}: ${percentage}%`}
          >
            {dataWithPercentages.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
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
          <Legend 
            layout="horizontal" 
            verticalAlign="bottom" 
            align="center"
            wrapperStyle={{ paddingTop: '20px' }}
            formatter={(value, entry, index) => (
              <span className="text-sm dark:text-gray-300">{value}</span>
            )}
          />
        </PieChart>
      </ResponsiveContainer>
      <div className="text-center mt-4">
        <p className="text-sm text-muted-foreground">Total Expenses</p>
        <p className="text-xl font-bold">${totalExpenses.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
      </div>
    </div>
  );
}
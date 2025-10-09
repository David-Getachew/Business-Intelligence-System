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
  'hsl(var(--muted))',
];

export function ExpensesPieChart() {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={mockExpenseData}
          cx="50%"
          cy="50%"
          labelLine={false}
          outerRadius={80}
          fill="#8884d8"
          dataKey="value"
          label={false}
        >
          {mockExpenseData.map((entry, index) => (
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
          layout="vertical" 
          verticalAlign="middle" 
          align="right"
          wrapperStyle={{ paddingLeft: '20px' }}
          formatter={(value, entry, index) => (
            <span className="text-sm dark:text-gray-300">{value}</span>
          )}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
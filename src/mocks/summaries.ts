export const mockDailySummaries = [
  {
    date: '2025-10-08',
    revenue: 1245.50,
    cogs: 498.20,
    gross_profit: 747.30,
    operating_expense: 125.00,
    net_profit: 622.30,
    top_income_items: [
      { name: 'Margherita Pizza', revenue: 389.70 },
      { name: 'Cheeseburger', revenue: 329.70 },
      { name: 'Pasta Carbonara', revenue: 224.85 },
      { name: 'Caesar Salad', revenue: 161.82 },
      { name: 'Iced Coffee', revenue: 139.72 },
    ],
  },
  {
    date: '2025-10-07',
    revenue: 1156.80,
    cogs: 462.72,
    gross_profit: 694.08,
    operating_expense: 98.50,
    net_profit: 595.58,
    top_income_items: [
      { name: 'Cheeseburger', revenue: 384.65 },
      { name: 'Margherita Pizza', revenue: 337.17 },
      { name: 'Iced Coffee', revenue: 199.60 },
      { name: 'Caesar Salad', revenue: 143.84 },
      { name: 'Tiramisu', revenue: 91.54 },
    ],
  },
  {
    date: '2025-10-06',
    revenue: 987.40,
    cogs: 394.96,
    gross_profit: 592.44,
    operating_expense: 75.00,
    net_profit: 517.44,
    top_income_items: [
      { name: 'Pasta Carbonara', revenue: 269.82 },
      { name: 'Margherita Pizza', revenue: 233.81 },
      { name: 'Cheeseburger', revenue: 197.82 },
      { name: 'Caesar Salad', revenue: 152.83 },
      { name: 'Iced Coffee', revenue: 133.12 },
    ],
  },
];

// Generate last 30 days of revenue & expense data
export const mockChartData = Array.from({ length: 30 }, (_, i) => {
  const date = new Date();
  date.setDate(date.getDate() - (29 - i));
  const baseRevenue = 900 + Math.random() * 500;
  const baseCogs = baseRevenue * (0.35 + Math.random() * 0.1);
  const baseOpex = 80 + Math.random() * 50;
  
  return {
    date: date.toISOString().split('T')[0],
    revenue: parseFloat(baseRevenue.toFixed(2)),
    cogs: parseFloat(baseCogs.toFixed(2)),
    opex: parseFloat(baseOpex.toFixed(2)),
    total_expense: parseFloat((baseCogs + baseOpex).toFixed(2)),
  };
});

export const mockWeeklySummaries = [
  {
    id: '1',
    week_start: '2025-10-01',
    week_end: '2025-10-07',
    revenue: 7892.50,
    cogs: 3157.00,
    gross_profit: 4735.50,
    operating_expense: 678.00,
    net_profit: 4057.50,
    analysis: 'Strong performance driven by weekend sales. Cheeseburger and Margherita Pizza continue to be top sellers. Consider seasonal menu updates for next month.',
    pdf_url: '/mock-reports/week-40-2025.pdf',
  },
  {
    id: '2',
    week_start: '2025-09-24',
    week_end: '2025-09-30',
    revenue: 7345.20,
    cogs: 2938.08,
    gross_profit: 4407.12,
    operating_expense: 625.00,
    net_profit: 3782.12,
    analysis: 'Consistent week with steady customer flow. Inventory turnover optimal. Minor increase in operating expenses due to equipment maintenance.',
    pdf_url: '/mock-reports/week-39-2025.pdf',
  },
  {
    id: '3',
    week_start: '2025-09-17',
    week_end: '2025-09-23',
    revenue: 8123.80,
    cogs: 3249.52,
    gross_profit: 4874.28,
    operating_expense: 710.00,
    net_profit: 4164.28,
    analysis: 'Best performing week of the month. New beverage menu items gaining traction. Marketing campaign showing positive ROI.',
    pdf_url: '/mock-reports/week-38-2025.pdf',
  },
];

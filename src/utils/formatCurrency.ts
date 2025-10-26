/**
 * Format currency values to display as "X Birr" instead of "$X"
 */
export function formatCurrency(value: number | string): string {
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(numValue)) return '0.00 Birr';
  return `${numValue.toFixed(2)} Birr`;
}

/**
 * Format currency for display in tables and forms
 */
export function formatCurrencyDisplay(value: number | string): string {
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(numValue)) return '0.00';
  return numValue.toFixed(2);
}

/**
 * Format currency for input fields (without Birr suffix)
 */
export function formatCurrencyInput(value: number | string): string {
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(numValue)) return '0.00';
  return numValue.toFixed(2);
}

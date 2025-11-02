import { format, subDays, subWeeks, subMonths, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns';

export interface DateRange {
  start: string;
  end: string;
}

export interface PreviousPeriodResult {
  current: DateRange;
  previous: DateRange;
}

/**
 * Calculate previous period dates based on current date range
 */
export function calculatePreviousPeriod(currentRange: DateRange): PreviousPeriodResult {
  const { start, end } = currentRange;
  
  // If no date range (all time), return empty ranges
  if (!start || !end) {
    return {
      current: { start: '', end: '' },
      previous: { start: '', end: '' }
    };
  }

  const startDate = new Date(start);
  const endDate = new Date(end);
  const duration = endDate.getTime() - startDate.getTime();
  
  // Calculate previous period of same duration
  const previousEndDate = new Date(startDate.getTime() - 24 * 60 * 60 * 1000); // Day before current start
  const previousStartDate = new Date(previousEndDate.getTime() - duration);  
  return {
    current: { start, end },
    previous: {
      start: format(previousStartDate, 'yyyy-MM-dd'),
      end: format(previousEndDate, 'yyyy-MM-dd')
    }
  };
}

/**
 * Calculate percentage change between two values
 */
export function calculatePercentageChange(current: number, previous: number): number {
  if (previous === 0) {
    return current > 0 ? 100 : 0; // Handle division by zero
  }
  return ((current - previous) / previous) * 100;
}

/**
 * Determine if percentage change is good or bad for a given KPI type
 */
export function isGoodChange(kpiType: string, change: number): boolean {
  const positiveChange = change > 0;
  
  switch (kpiType.toLowerCase()) {
    case 'revenue':
    case 'gross profit':
    case 'net profit':
      return positiveChange; // Higher is better
    case 'cogs':
    case 'operating expenses':
      return !positiveChange; // Lower is better
    default:
      return positiveChange;
  }
}

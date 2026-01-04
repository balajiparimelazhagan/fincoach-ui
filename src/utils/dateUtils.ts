/**
 * Date formatting utilities
 */

export const formatMonthDisplay = (date: Date): string => {
  const month = date.toLocaleDateString('en-US', { month: 'short' }).slice(0, 4);
  const year = date.getFullYear();
  return `${month} ${year}`;
};

export const formatDateDisplay = (dateString: string): string => {
  const date = new Date(dateString);
  const day = date.getDate();
  const month = date.toLocaleDateString('en-US', { month: 'short' }).slice(0, 4);
  const year = date.getFullYear();
  return `${day} ${month} ${year}`;
};

/**
 * Date range utilities
 */

export const getMonthDateRange = (date: Date): { dateFrom: string; dateTo: string } => {
  const year = date.getFullYear();
  const month = date.getMonth();
  const lastDay = new Date(year, month + 1, 0);
  const dateFrom = new Date(year, month, 1).toISOString().split('T')[0];
  const dateTo = lastDay.toISOString().split('T')[0];
  return { dateFrom, dateTo };
};

export const getNextDayBatch = (
  selectedMonth: Date,
  batchIndex: number
): { dateFrom: string; dateTo: string } => {
  const { dateTo: monthEnd } = getMonthDateRange(selectedMonth);
  const endDate = new Date(monthEnd);

  // Start from the most recent date and go backwards in 5-day chunks
  const batchEndDate = new Date(endDate);
  batchEndDate.setDate(batchEndDate.getDate() - batchIndex * 5);

  const batchStartDate = new Date(batchEndDate);
  batchStartDate.setDate(batchStartDate.getDate() - 4);

  const dateFrom = batchStartDate.toISOString().split('T')[0];
  const dateTo = batchEndDate.toISOString().split('T')[0];

  return { dateFrom, dateTo };
};

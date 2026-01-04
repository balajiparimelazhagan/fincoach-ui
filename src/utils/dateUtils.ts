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

export const getMonthEndDate = (date: Date): Date => {
  /**
   * Get the last day of the month for the given date.
   * Handles all month variations: 28/29 (Feb), 30 (Apr/Jun/Sep/Nov), 31 (others)
   */
  const year = date.getFullYear();
  const month = date.getMonth();
  // Get the first day of next month, then subtract 1 day
  return new Date(year, month + 1, 0);
};

export const getMonthDateRange = (date: Date): { dateFrom: string; dateTo: string } => {
  const year = date.getFullYear();
  const month = date.getMonth();
  
  // First day of the selected month
  const firstDay = new Date(year, month, 1);
  const firstDayYear = firstDay.getFullYear();
  const firstDayMonth = String(firstDay.getMonth() + 1).padStart(2, '0');
  const firstDayDate = String(firstDay.getDate()).padStart(2, '0');
  const dateFrom = `${firstDayYear}-${firstDayMonth}-${firstDayDate}`;
  
  // Last day of the selected month
  const lastDay = getMonthEndDate(date);
  const lastDayYear = lastDay.getFullYear();
  const lastDayMonth = String(lastDay.getMonth() + 1).padStart(2, '0');
  const lastDayDate = String(lastDay.getDate()).padStart(2, '0');
  const dateTo = `${lastDayYear}-${lastDayMonth}-${lastDayDate}`;
  
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

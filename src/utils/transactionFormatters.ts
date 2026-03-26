/**
 * Utility functions for formatting transaction data
 */

/**
 * Format currency amount in INR format
 */
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Math.abs(amount));
};

/**
 * Format currency in compact denominations: ₹1.2L, ₹25.9K, ₹850
 */
export const formatCompactCurrency = (amount: number): string => {
  if (amount >= 1_00_000) return `₹${(amount / 1_00_000).toFixed(1)}L`;
  if (amount >= 1_000) return `₹${(amount / 1_000).toFixed(1)}K`;
  return `₹${Math.round(amount)}`;
};

/**
 * Get color class based on transaction type
 */
export const getAmountColor = (type: 'income' | 'expense' | 'saving'): string => {
  if (type === 'income') return 'text-green-600';
  if (type === 'expense') return 'text-red-600';
  return 'text-primary';
};

/**
 * Get prefix for amount display
 */
export const getAmountPrefix = (type: 'income' | 'expense' | 'saving'): string => {
  if (type === 'income') return '+';
  if (type === 'expense') return '-';
  return '';
};

/**
 * Get category label from transaction
 */
export const getCategoryLabel = (category: any): string => {
  if (typeof category === 'object' && category) {
    return category.label;
  }
  return 'Uncategorized';
};

/**
 * Format account number for display
 */
export const formatAccountNumber = (lastFour?: string): string => {
  return lastFour ? `**** **** **** ${lastFour}` : 'N/A';
};

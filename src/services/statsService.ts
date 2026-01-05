import api from './api';

/**
 * Summary Statistics Response
 */
export interface SummaryStats {
  income: number;
  expense: number;
  savings: number;
  date_from: string;
  date_to: string;
}

/**
 * Category Spending Item
 */
export interface CategorySpending {
  name: string;
  amount: number;
}

/**
 * Category Spending Response
 */
export interface CategorySpendingResponse {
  categories: CategorySpending[];
}

/**
 * Comprehensive Statistics Response
 */
export interface ComprehensiveStats extends SummaryStats {
  categories: CategorySpending[];
}

/**
 * Stats Service
 */
export const statsService = {
  /**
   * Get summary statistics for a date range
   */
  async getSummaryStats(
    dateFrom?: string,
    dateTo?: string
  ): Promise<SummaryStats> {
    const params = new URLSearchParams();
    if (dateFrom) params.append('date_from', dateFrom);
    if (dateTo) params.append('date_to', dateTo);

    const queryString = params.toString();
    const url = queryString
      ? `/analytics/stats/summary?${queryString}`
      : '/analytics/stats/summary';

    const response = await api.get<SummaryStats>(url);
    return response.data;
  },

  /**
   * Get spending by category for a date range
   */
  async getSpendingByCategory(
    dateFrom?: string,
    dateTo?: string
  ): Promise<CategorySpendingResponse> {
    const params = new URLSearchParams();
    if (dateFrom) params.append('date_from', dateFrom);
    if (dateTo) params.append('date_to', dateTo);

    const queryString = params.toString();
    const url = queryString
      ? `/analytics/stats/spending-by-category?${queryString}`
      : '/analytics/stats/spending-by-category';

    const response = await api.get<CategorySpendingResponse>(url);
    return response.data;
  },

  /**
   * Get comprehensive statistics including income, expense, savings, and category breakdown
   */
  async getComprehensiveStats(
    dateFrom?: string,
    dateTo?: string
  ): Promise<ComprehensiveStats> {
    const params = new URLSearchParams();
    if (dateFrom) params.append('date_from', dateFrom);
    if (dateTo) params.append('date_to', dateTo);

    const queryString = params.toString();
    const url = queryString
      ? `/analytics/stats/comprehensive?${queryString}`
      : '/analytics/stats/comprehensive';

    const response = await api.get<ComprehensiveStats>(url);
    return response.data;
  },
};

export default statsService;

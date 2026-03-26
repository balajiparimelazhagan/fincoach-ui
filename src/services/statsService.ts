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
 * Per-day cashflow summary (from /analytics/cashflow/daily-summary)
 */
export interface DailySummary {
  day: number;
  income: number;
  expense: number;
  predicted_bills: number;
}

/**
 * Category budget item (from /analytics/cashflow/category-budgets)
 */
export interface CategoryBudget {
  category_id: string | null;
  category_name: string;
  has_pattern: boolean;
  current_actual: number;
  avg_last_3_months: number;
  over_budget: boolean;
  over_amount: number;
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
  /**
   * Get per-day cashflow summary for a specific month
   * @param year  Full year e.g. 2026
   * @param month 1-indexed month (1=January … 12=December)
   */
  async getCashflowDailySummary(year: number, month: number): Promise<DailySummary[]> {
    const response = await api.get<DailySummary[]>('/analytics/cashflow/daily-summary', {
      params: { year, month },
    });
    return response.data;
  },

  /**
   * Get category spending vs 3-month historical average for the given month
   * @param year  Full year e.g. 2026
   * @param month 1-indexed month (1=January … 12=December)
   */
  async getCategoryBudgets(year: number, month: number): Promise<CategoryBudget[]> {
    const response = await api.get<CategoryBudget[]>('/analytics/cashflow/category-budgets', {
      params: { year, month },
    });
    return response.data;
  },
};

export default statsService;

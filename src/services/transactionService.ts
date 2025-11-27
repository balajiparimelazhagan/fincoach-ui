import api from './api';

/**
 * Transaction Response from API
 */
export interface Transaction {
  id: string;
  amount: number;
  transaction_id: string | null;
  type: 'income' | 'expense';
  date: string;
  transactor_id: string;
  category_id: string;
  description: string;
  confidence: string;
  currency_id: string;
  user_id: string;
  message_id: string;
}

/**
 * Transaction List Response
 */
export interface TransactionListResponse {
  count: number;
  items: Transaction[];
}

/**
 * Transaction Query Parameters
 */
export interface TransactionQueryParams {
  date_from?: string;
  date_to?: string;
  description_contains?: string;
  amount_min?: number;
  amount_max?: number;
  type?: 'income' | 'expense';
  user_id?: string;
  transactor_id?: string;
  category_id?: string;
  limit?: number;
  offset?: number;
}

/**
 * Transaction Service
 * Handles all transaction-related API calls
 */
class TransactionService {
  /**
   * Fetches transactions with optional filters
   * @param params - Query parameters for filtering transactions
   * @returns Promise with transaction list response
   */
  async getTransactions(params?: TransactionQueryParams): Promise<TransactionListResponse> {
    const response = await api.get<TransactionListResponse>('/transactions', {
      params,
    });
    return response.data;
  }

  /**
   * Fetches a single transaction by ID
   * @param transactionId - Transaction ID
   * @returns Promise with transaction data
   */
  async getTransactionById(transactionId: string): Promise<Transaction> {
    const response = await api.get<Transaction>(`/transactions/${transactionId}`);
    return response.data;
  }

  /**
   * Gets income and expense totals for a specific date range
   * @param userId - User ID
   * @param dateFrom - Start date (ISO8601 format)
   * @param dateTo - End date (ISO8601 format)
   * @returns Promise with income and expense totals
   */
  async getIncomeExpenseTotals(
    userId: string,
    dateFrom: string,
    dateTo: string
  ): Promise<{ income: number; expense: number }> {
    // Fetch income transactions
    const incomeResponse = await this.getTransactions({
      user_id: userId,
      date_from: dateFrom,
      date_to: dateTo,
      type: 'income',
      limit: 200, // Increase limit to get all transactions
    });

    // Fetch expense transactions
    const expenseResponse = await this.getTransactions({
      user_id: userId,
      date_from: dateFrom,
      date_to: dateTo,
      type: 'expense',
      limit: 200, // Increase limit to get all transactions
    });

    // Calculate totals
    const income = incomeResponse.items.reduce((sum, t) => sum + t.amount, 0);
    const expense = expenseResponse.items.reduce((sum, t) => sum + Math.abs(t.amount), 0);

    return { income, expense };
  }

  /**
   * Gets income and expense totals for the current month
   * @param userId - User ID
   * @returns Promise with income and expense totals for current month
   */
    async getCurrentMonthTotals(userId: string): Promise<{ income: number; expense: number }> {
        // Demo: using previous month instead of current month (this is demo alone)
        const now = new Date();
        const firstDayPrevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const lastDayPrevMonth = new Date(now.getFullYear(), now.getMonth(), 0);

        const dateFrom = firstDayPrevMonth.toISOString().split('T')[0];
        const dateTo = lastDayPrevMonth.toISOString().split('T')[0];

        return this.getIncomeExpenseTotals(userId, dateFrom, dateTo);
    }

  /**
   * Gets recent transactions (past transactions up to today)
   * @param userId - User ID
   * @param limit - Maximum number of transactions to return
   * @returns Promise with recent transactions
   */
  async getRecentTransactions(userId: string, limit: number = 10): Promise<Transaction[]> {
    const now = new Date();
    const dateTo = now.toISOString().split('T')[0];
    
    const response = await this.getTransactions({
      user_id: userId,
      date_to: dateTo,
      limit,
    });

    return response.items;
  }

  /**
   * Gets upcoming transactions (future transactions from today onwards)
   * @param userId - User ID
   * @param limit - Maximum number of transactions to return
   * @returns Promise with upcoming transactions
   */
  async getUpcomingTransactions(userId: string, limit: number = 10): Promise<Transaction[]> {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dateFrom = tomorrow.toISOString().split('T')[0];
    
    const response = await this.getTransactions({
      user_id: userId,
      date_from: dateFrom,
      limit,
    });

    return response.items;
  }
}

// Export a singleton instance
export const transactionService = new TransactionService();
export default transactionService;

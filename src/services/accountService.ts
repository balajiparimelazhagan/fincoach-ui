import api from './api';

/**
 * Account Response from API
 */
export interface Account {
  id: string;
  account_last_four: string;
  bank_name: string;
  type: 'credit' | 'savings' | 'current';
  user_id: string;
  created_at: string;
  updated_at: string;
}

/**
 * Account with Statistics
 */
export interface AccountWithStats extends Account {
  income: number;
  expense: number;
  savings: number;
}

/**
 * Account List Response
 */
export interface AccountListResponse {
  count: number;
  items: Account[];
}

/**
 * Account Statistics List Response
 */
export interface AccountStatsListResponse {
  count: number;
  items: AccountWithStats[];
}

/**
 * Account Query Parameters
 */
export interface AccountQueryParams {
  account_type?: 'credit' | 'savings' | 'current';
  bank_name?: string;
  limit?: number;
  offset?: number;
}

/**
 * Account Service
 * Handles all account-related API calls
 */
class AccountService {
  /**
   * Fetches all accounts for the authenticated user with optional filters
   * 
   * The user_id is automatically extracted from the JWT token in the Authorization header.
   * 
   * @param params - Query parameters for filtering accounts
   * @returns Promise with account list response
   */
  async getAccounts(params?: AccountQueryParams): Promise<AccountListResponse> {
    const response = await api.get<AccountListResponse>('/accounts', {
      params,
    });
    return response.data;
  }

  /**
   * Fetches a single account by ID
   * @param accountId - Account ID
   * @returns Promise with account data
   */
  async getAccountById(accountId: string): Promise<Account> {
    const response = await api.get<Account>(`/accounts/${accountId}`);
    return response.data;
  }

  /**
   * Gets all accounts of a specific type (credit, savings, current)
   * @param accountType - Type of account to filter
   * @returns Promise with filtered account list
   */
  async getAccountsByType(
    accountType: 'credit' | 'savings' | 'current'
  ): Promise<Account[]> {
    const response = await this.getAccounts({
      account_type: accountType,
      limit: 200,
    });
    return response.items;
  }

  /**
   * Gets all accounts for a specific bank
   * @param bankName - Name of the bank to filter
   * @returns Promise with filtered account list
   */
  async getAccountsByBank(bankName: string): Promise<Account[]> {
    const response = await this.getAccounts({
      bank_name: bankName,
      limit: 200,
    });
    return response.items;
  }

  /**
   * Gets all accounts with income, expense, and savings statistics
   * 
   * @param dateFrom - Optional start date for statistics (ISO8601 format)
   * @param dateTo - Optional end date for statistics (ISO8601 format)
   * @returns Promise with accounts and their statistics
   */
  async getAccountsWithStats(
    dateFrom?: string,
    dateTo?: string
  ): Promise<AccountStatsListResponse> {
    const response = await api.get<AccountStatsListResponse>('/accounts/stats/summary', {
      params: {
        date_from: dateFrom,
        date_to: dateTo,
      },
    });
    return response.data;
  }
}

export const accountService = new AccountService();

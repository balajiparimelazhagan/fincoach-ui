export const queryKeys = {
  // User
  userProfile:      ()                              => ['user', 'profile'] as const,
  userPreferences:  ()                              => ['user', 'preferences'] as const,

  // Transactions
  transactions:     (filters: Record<string, unknown>) => ['transactions', filters] as const,
  transaction:      (id: string)                    => ['transactions', id] as const,
  monthTotals:      (year: number, month: number)   => ['transactions', 'totals', year, month] as const,

  // Accounts
  accounts:         (filters?: Record<string, unknown>) => ['accounts', filters ?? {}] as const,
  accountStats:     (dateFrom: string, dateTo: string)  => ['accounts', 'stats', dateFrom, dateTo] as const,

  // Categories
  categories:       ()                              => ['categories'] as const,

  // Stats / Analytics
  dailySummary:     (year: number, month: number)   => ['stats', 'daily', year, month] as const,
  categoryBudgets:  (year: number, month: number)   => ['stats', 'categoryBudgets', year, month] as const,
  projectedSummary: (year: number, month: number)   => ['stats', 'projected', year, month] as const,
  spendingByCategory: (dateFrom: string, dateTo: string) => ['stats', 'spendingByCategory', dateFrom, dateTo] as const,
  comprehensiveStats: (dateFrom: string, dateTo: string) => ['stats', 'comprehensive', dateFrom, dateTo] as const,

  // Patterns & Obligations
  patterns:         (status?: string)               => ['patterns', status ?? 'all'] as const,
  upcomingObligations: (daysAhead: number)          => ['obligations', 'upcoming', daysAhead] as const,

  // Budget
  customBudgetItems: ()                             => ['budget', 'customItems'] as const,
};

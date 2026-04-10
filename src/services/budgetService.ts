import api from './api';

export type BudgetSection = 'income' | 'bills' | 'savings' | 'flexible';

export interface CustomBudgetItem {
  id: string;
  label: string;
  amount: number;
  day_of_month: number | null;   // null = flexible
  section: BudgetSection;
  category_id: string | null;
  category_name: string | null;
  transactor_id: string | null;
  transactor_name: string | null;
  account_id: string | null;
  account_label: string | null;
  paid_months: string[];         // ["2026-04", "2026-05", ...]
  is_paid?: boolean;             // set when fetched with year+month context
}

export interface CreateCustomBudgetItemRequest {
  label: string;
  amount: number;
  day_of_month?: number | null;
  section: BudgetSection;
  category_id?: string | null;
  transactor_id?: string | null;
  account_id?: string | null;
}

class BudgetService {
  async getCustomItems(year?: number, month?: number): Promise<CustomBudgetItem[]> {
    const params = year && month ? { year, month } : undefined;
    const r = await api.get<CustomBudgetItem[]>('/budget/custom-items', { params });
    return r.data;
  }

  async createCustomItem(data: CreateCustomBudgetItemRequest): Promise<CustomBudgetItem> {
    const r = await api.post<CustomBudgetItem>('/budget/custom-items', data);
    return r.data;
  }

  async markCustomItemPaid(id: string, year: number, month: number, transactionId?: string): Promise<CustomBudgetItem> {
    const r = await api.patch<CustomBudgetItem>(`/budget/custom-items/${id}/mark-paid`, {
      year,
      month,
      transaction_id: transactionId ?? null,
    });
    return r.data;
  }

  async unmarkCustomItemPaid(id: string, year: number, month: number): Promise<CustomBudgetItem> {
    const r = await api.patch<CustomBudgetItem>(`/budget/custom-items/${id}/unmark-paid`, { year, month });
    return r.data;
  }

  async deleteCustomItem(id: string): Promise<void> {
    await api.delete(`/budget/custom-items/${id}`);
  }
}

export const budgetService = new BudgetService();
export default budgetService;

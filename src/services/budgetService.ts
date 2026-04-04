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
  async getCustomItems(): Promise<CustomBudgetItem[]> {
    const r = await api.get<CustomBudgetItem[]>('/budget/custom-items');
    return r.data;
  }

  async createCustomItem(data: CreateCustomBudgetItemRequest): Promise<CustomBudgetItem> {
    const r = await api.post<CustomBudgetItem>('/budget/custom-items', data);
    return r.data;
  }

  async deleteCustomItem(id: string): Promise<void> {
    await api.delete(`/budget/custom-items/${id}`);
  }
}

export const budgetService = new BudgetService();
export default budgetService;

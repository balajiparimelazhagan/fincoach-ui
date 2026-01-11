import api from './api';

/**
 * Category interface
 */
export interface Category {
  id: string;
  label: string;
  picture?: string;
}

/**
 * Category Service
 * Handles all category-related API calls
 */
class CategoryService {
  /**
   * Fetches all categories
   * @returns Promise with array of categories
   */
  async getCategories(): Promise<Category[]> {
    const response = await api.get<Category[]>('/categories');
    return response.data;
  }

  /**
   * Fetches a single category by ID
   * @param categoryId - Category ID
   * @returns Promise with category data
   */
  async getCategoryById(categoryId: string): Promise<Category> {
    const response = await api.get<Category>(`/categories/${categoryId}`);
    return response.data;
  }
}

// Export a singleton instance
export const categoryService = new CategoryService();
export default categoryService;

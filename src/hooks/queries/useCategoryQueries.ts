import { useQuery } from '@tanstack/react-query';
import { categoryService } from '../../services/categoryService';
import { queryKeys } from '../../lib/queryKeys';

export function useCategories() {
  return useQuery({
    queryKey: queryKeys.categories(),
    queryFn: () => categoryService.getCategories(),
    staleTime: 1000 * 60 * 30, // categories rarely change — cache 30 min
    gcTime: Infinity,           // never evict from memory
  });
}

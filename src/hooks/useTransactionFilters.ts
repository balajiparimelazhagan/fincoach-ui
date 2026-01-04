import { useState, useCallback } from 'react';
import { transactionService, Transaction } from '../services/transactionService';

interface GroupedTransactions {
  [date: string]: Transaction[];
}

export const useTransactionFilters = () => {
  const [groupedTransactions, setGroupedTransactions] = useState<GroupedTransactions>({});
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [totalCount, setTotalCount] = useState(0);

  const fetchTransactions = useCallback(
    async (dateFrom: string, dateTo: string, limit: number = 20, offset: number = 0, append: boolean = false) => {
      try {
        append ? setLoadingMore(true) : setIsLoading(true);

        const data = await transactionService.getTransactions({
          date_from: dateFrom,
          date_to: dateTo,
          limit,
          offset,
        });

        // Group transactions by date
        const grouped: GroupedTransactions = {};
        data.items.forEach((transaction) => {
          const dateKey = transaction.date.split('T')[0]; // YYYY-MM-DD format
          if (!grouped[dateKey]) {
            grouped[dateKey] = [];
          }
          grouped[dateKey].push(transaction);
        });

        // Sort dates in descending order (newer dates first)
        const sortedGrouped = Object.keys(grouped)
          .sort((a, b) => new Date(b).getTime() - new Date(a).getTime())
          .reduce((acc, key) => {
            acc[key] = grouped[key];
            return acc;
          }, {} as GroupedTransactions);

        if (append) {
          setGroupedTransactions((prev) => ({
            ...prev,
            ...sortedGrouped,
          }));
        } else {
          setGroupedTransactions(sortedGrouped);
        }

        setTotalCount(data.count);
        // Check if there are more items to load
        const loadedItemsCount = append ? Object.values(groupedTransactions).flat().length + data.items.length : data.items.length;
        setHasMore(loadedItemsCount < data.count);
      } catch (error) {
        console.error('Failed to fetch transactions:', error);
      } finally {
        setIsLoading(false);
        setLoadingMore(false);
      }
    },
    []
  );

  return {
    groupedTransactions,
    setGroupedTransactions,
    isLoading,
    loadingMore,
    hasMore,
    totalCount,
    fetchTransactions,
  };
};

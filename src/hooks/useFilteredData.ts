import { useMemo } from 'react';
import { Transaction } from '../services/transactionService';
import { Card } from '../components/CardCarousel';
import { ICategorySpend } from '../components/CategorySpend';

interface GroupedTransactions {
  [date: string]: Transaction[];
}

/**
 * Custom hook to filter transactions, calculate summary stats, and aggregate categories
 * based on enabled accounts
 */
export const useFilteredData = (
  groupedTransactions: GroupedTransactions,
  cards: Card[],
  enabledAccounts: Set<string>
) => {
  // Filter transactions by enabled accounts
  const filteredTransactions = useMemo(() => {
    const filtered: GroupedTransactions = {};
    Object.entries(groupedTransactions).forEach(([date, transactions]) => {
      const filteredForDate = transactions.filter(t => 
        t.account_id && enabledAccounts.has(t.account_id)
      );
      if (filteredForDate.length > 0) {
        filtered[date] = filteredForDate;
      }
    });
    return filtered;
  }, [groupedTransactions, enabledAccounts]);

  // Calculate summary stats from enabled accounts
  const filteredSummaryStats = useMemo(() => {
    const enabledCards = cards.filter(card => enabledAccounts.has(card.id));
    return {
      income: enabledCards.reduce((sum, card) => sum + (card.income || 0), 0),
      expense: enabledCards.reduce((sum, card) => sum + (card.expense || 0), 0),
      savings: enabledCards.reduce((sum, card) => sum + (card.savings || 0), 0),
    };
  }, [cards, enabledAccounts]);

  // Aggregate categories from transactions of enabled accounts
  const filteredCategories = useMemo(() => {
    const categoryTotals: { [key: string]: number } = {};
    
    Object.values(groupedTransactions).flat().forEach(transaction => {
      // Only count transactions from enabled accounts
      if (!transaction.account_id || !enabledAccounts.has(transaction.account_id)) {
        return;
      }
      
      // Extract category name (handle both string and object types)
      let categoryName = 'Uncategorized';
      if (transaction.category) {
        if (typeof transaction.category === 'string') {
          categoryName = transaction.category;
        } else if (typeof transaction.category === 'object' && 'label' in transaction.category) {
          categoryName = transaction.category.label;
        }
      }
      
      // Only sum expenses
      if (transaction.type === 'expense') {
        categoryTotals[categoryName] = (categoryTotals[categoryName] || 0) + Math.abs(transaction.amount);
      }
    });

    // Convert to array and sort by amount descending
    return Object.entries(categoryTotals)
      .map(([name, amount]) => ({
        id: name.toLowerCase().replace(/\s+/g, '_'),
        name,
        amount: Math.round(amount),
      }))
      .sort((a, b) => b.amount - a.amount);
  }, [groupedTransactions, enabledAccounts]);

  return {
    filteredTransactions,
    filteredSummaryStats,
    filteredCategories,
  };
};

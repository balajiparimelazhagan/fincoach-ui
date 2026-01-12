import React, { useEffect, useState, useMemo } from 'react';
import { IonPage, IonContent, IonSpinner } from '@ionic/react';
import Footer from '../components/Footer';
import SummaryStats from '../components/SummaryStats';
import MonthlyOverviewChart from '../components/MonthlyOverviewChart';
import HeaderNavItem from '../components/HeaderNavItem';
import TopTransactorsChart from '../components/TopTransactorsChart';
import CardCarousel, { Card } from '../components/CardCarousel';
import CategorySpend from '../components/CategorySpend';
import TransactionDetailModal from '../components/TransactionDetailModal';
import { accountService } from '../services/accountService';
import { Transaction } from '../services/transactionService';
import { categoryService, Category } from '../services/categoryService';
import { getMonthDateRange, formatMonthDisplay } from '../utils/dateUtils';
import { useTransactionFilters } from '../hooks/useTransactionFilters';
import { useAccountToggle } from '../hooks/useAccountToggle';
import { useFilteredData } from '../hooks/useFilteredData';
import { useTransactionUpdate } from '../hooks/useTransactionUpdate';
import { mapAccountsToCards } from '../utils/accountMapper';

interface PageState {
  cards: Card[];
  isLoading: boolean;
  error: string | null;
  categories: Category[];
}

const Insights: React.FC = () => {
  const [selectedMonth, setSelectedMonth] = useState<Date>(new Date());
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const [state, setState] = useState<PageState>({
    cards: [],
    isLoading: true,
    error: null,
    categories: [],
  });

  const { groupedTransactions, isLoading: transactionsLoading, fetchTransactions } = useTransactionFilters();
  
  // Extract account IDs for toggle management (memoized to prevent infinite loops)
  const accountIds = useMemo(() => state.cards.map(card => card.id), [state.cards]);
  const { enabledAccounts, handleToggleAccount } = useAccountToggle(accountIds);
  
  // Filter data based on enabled accounts
  const { filteredTransactions, filteredSummaryStats, filteredCategories } = useFilteredData(
    groupedTransactions,
    state.cards,
    enabledAccounts
  );

  // Transaction update hook with refetch callback
  const { handleTransactionUpdate } = useTransactionUpdate({
    onSuccess: () => {
      const { dateFrom, dateTo } = getMonthDateRange(selectedMonth);
      fetchTransactions(dateFrom, dateTo, 50, 0, false);
      handleCloseModal();
    },
  });

  const allFilteredTransactions = useMemo(() => {
    return Object.values(filteredTransactions).flat();
  }, [filteredTransactions]);

  // Load account and transaction data when month changes
  useEffect(() => {
    const loadData = async () => {
      try {
        setState(prev => ({ ...prev, isLoading: true, error: null }));

        const { dateFrom, dateTo } = getMonthDateRange(selectedMonth);

        // Fetch account stats and categories in parallel
        const [accountStatsResponse, categoriesData] = await Promise.all([
          accountService.getAccountsWithStats(dateFrom, dateTo),
          categoryService.getCategories(),
        ]);
        
        const accountCards = mapAccountsToCards(accountStatsResponse.items);

        setState(prev => ({
          ...prev,
          cards: accountCards,
          categories: categoriesData,
          isLoading: false,
        }));

        // Fetch transactions for the month
        fetchTransactions(dateFrom, dateTo, 50, 0, false);
      } catch (err) {
        console.error('Error loading insights data:', err);
        setState(prev => ({
          ...prev,
          isLoading: false,
          error: err instanceof Error ? err.message : 'Failed to load data',
        }));
      }
    };

    loadData();
  }, [selectedMonth, fetchTransactions]);

  // Month navigation handlers
  const handlePrevMonth = () => {
    setSelectedMonth(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(newDate.getMonth() - 1);
      return newDate;
    });
  };

  const handleNextMonth = () => {
    setSelectedMonth(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(newDate.getMonth() + 1);
      return newDate;
    });
  };

  // Handle closing modal
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedTransaction(null);
  };

  // Loading state
  if (state.isLoading) {
    return (
      <IonPage>
        <IonContent fullscreen>
          <div className="flex items-center justify-center h-screen">
            <IonSpinner name="crescent" />
          </div>
        </IonContent>
      </IonPage>
    );
  }

  return (
    <IonPage>
      <IonContent fullscreen>
        <div className="p-5 pb-24 space-y-4 bg-gray-100">
          {/* Month Navigation */}
          <HeaderNavItem 
            title={formatMonthDisplay(selectedMonth)}
            onPrev={handlePrevMonth}
            onNext={handleNextMonth}
          />
          
          {/* Card Carousel */}
          {state.cards.length > 0 ? (
            <CardCarousel 
              cards={state.cards} 
              onToggleChange={handleToggleAccount}
              enabledAccounts={enabledAccounts}
            />
          ) : (
            <div className="text-center text-gray-500">No accounts available</div>
          )}
          
          {/* Summary Stats */}
          <SummaryStats 
            income={filteredSummaryStats.income}
            expense={filteredSummaryStats.expense}
            savings={filteredSummaryStats.savings}
          />
          
          {/* Category Spending */}
          {filteredCategories.length > 0 && (
            <CategorySpend categories={filteredCategories} />
          )}

          {/* Monthly Overview Chart */}
          <div className="relative">
            <span className="absolute top-2 left-3 pl-1 text-primary font-semibold">This month</span>
            <MonthlyOverviewChart />
          </div>

          {/* Top Transactors Chart */}
          <div className="relative">
            <span className="text-primary font-semibold mb-2 block pl-1">Top Spenders</span>
            {transactionsLoading ? (
              <div className="flex items-center justify-center p-8 bg-white rounded-xl border border-gray-100">
                <IonSpinner name="bubbles" />
              </div>
            ) : (
              <TopTransactorsChart transactions={allFilteredTransactions} />
            )}
          </div>

          {/* Error Display */}
          {state.error && (
            <div className="text-red-500 text-center mt-4">{state.error}</div>
          )}
        </div>
      </IonContent>

      {/* Transaction Detail Modal */}
      <TransactionDetailModal
        isOpen={isModalOpen}
        transaction={selectedTransaction}
        onClose={handleCloseModal}
        onSave={handleTransactionUpdate}
        categories={state.categories}
      />

      <Footer />
    </IonPage>
  );
};

export default Insights;
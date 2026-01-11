import React, { useEffect, useState, useMemo } from 'react';
import { IonPage, IonContent, IonSpinner } from '@ionic/react';
import Footer from '../components/Footer';
import HeaderNavItem from '../components/HeaderNavItem';
import TransactionList from '../components/TransactionList';
import CardCarousel from '../components/CardCarousel';
import TransactionDetailModal from '../components/TransactionDetailModal';
import { useMonthNavigation } from '../hooks/useMonthNavigation';
import { useTransactionFilters } from '../hooks/useTransactionFilters';
import { useAccounts } from '../hooks/useAccounts';
import { useAccountToggle } from '../hooks/useAccountToggle';
import { useFilteredData } from '../hooks/useFilteredData';
import { useTransactionUpdate } from '../hooks/useTransactionUpdate';
import { formatMonthDisplay, formatDateDisplay, getMonthDateRange } from '../utils/dateUtils';
import { mapAccountsToCards } from '../utils/accountMapper';
import { Transaction } from '../services/transactionService';
import { categoryService, Category } from '../services/categoryService';

const Transactions: React.FC = () => {
  const ITEMS_PER_PAGE = 20;
  const [currentPage, setCurrentPage] = useState(0);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Hooks for month navigation and data fetching
  const { selectedMonth, handlePrevMonth, handleNextMonth } = useMonthNavigation();
  const { groupedTransactions, isLoading, loadingMore, hasMore, fetchTransactions } = useTransactionFilters();
  
  // Fetch accounts for the selected month
  const { dateFrom, dateTo } = getMonthDateRange(selectedMonth);
  const { accounts, isLoading: accountsLoading } = useAccounts(dateFrom, dateTo);
  
  // Convert accounts to card format (memoized to prevent infinite loops)
  const cards = useMemo(() => mapAccountsToCards(accounts), [accounts]);
  
  // Account toggle management (memoized to prevent infinite loops)
  const accountIds = useMemo(() => accounts.map(account => account.id), [accounts]);
  const { enabledAccounts, handleToggleAccount } = useAccountToggle(accountIds);
  
  // Filter transactions based on enabled accounts
  const { filteredTransactions } = useFilteredData(groupedTransactions, cards, enabledAccounts);

  // Transaction update hook with refetch callback
  const { handleTransactionUpdate } = useTransactionUpdate({
    onSuccess: () => {
      fetchTransactions(dateFrom, dateTo, ITEMS_PER_PAGE, 0, false);
      handleCloseModal();
    },
  });

  // Load categories on mount
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const categoriesData = await categoryService.getCategories();
        setCategories(categoriesData);
      } catch (err) {
        console.error('Error loading categories:', err);
      }
    };
    loadCategories();
  }, []);

  // Load initial transactions when month changes
  useEffect(() => {
    fetchTransactions(dateFrom, dateTo, ITEMS_PER_PAGE, 0, false);
    setCurrentPage(0);
  }, [selectedMonth, fetchTransactions, dateFrom, dateTo]);

  // Load more transactions (pagination)
  const handleLoadMore = () => {
    const nextPage = currentPage + 1;
    const offset = nextPage * ITEMS_PER_PAGE;
    fetchTransactions(dateFrom, dateTo, ITEMS_PER_PAGE, offset, true);
    setCurrentPage(nextPage);
  };

  // Handle transaction click to open modal
  const handleTransactionClick = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setIsModalOpen(true);
  };

  // Handle closing modal
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedTransaction(null);
  };

  return (
    <IonPage>
      <IonContent fullscreen>
        <div className="p-5 pb-24 space-y-4 bg-gray-100">
          {/* Month Selector using HeaderNavItem */}
          <HeaderNavItem 
            title={formatMonthDisplay(selectedMonth)}
            onPrev={handlePrevMonth}
            onNext={handleNextMonth}
          />

          {/* Card Carousel */}
          {accountsLoading ? (
            <div className="flex items-center justify-center p-8 bg-white rounded-xl border border-gray-100">
              <IonSpinner name="bubbles" />
            </div>
          ) : cards.length > 0 ? (
            <CardCarousel 
              cards={cards} 
              enabledAccounts={enabledAccounts}
              onToggleChange={handleToggleAccount}
            />
          ) : (
            <div className="flex items-center justify-center p-8 bg-white rounded-xl border border-gray-200">
              <span className="text-sm text-gray-400">No accounts found</span>
            </div>
          )}

          {/* Loading State */}
          {isLoading && (
            <div className="flex items-center justify-center p-8 bg-white rounded-xl border border-gray-100">
              <IonSpinner name="bubbles" />
            </div>
          )}

          {/* Transactions Grouped by Date */}
          {!isLoading && Object.keys(filteredTransactions).length > 0 ? (
            <div className="space-y-4">
              {Object.entries(filteredTransactions).map(([date, transactions]) => (
                <TransactionList
                  key={date}
                  title={formatDateDisplay(date)}
                  transactions={transactions}
                  isLoading={false}
                  isShowingFilter={false}
                  onTransactionClick={handleTransactionClick}
                />
              ))}
            </div>
          ) : !isLoading ? (
            <div className="flex items-center justify-center p-8 bg-white rounded-xl border border-gray-200">
              <span className="text-sm text-gray-400">
                {enabledAccounts.size === 0 
                  ? "No accounts selected" 
                  : "No transactions found for selected accounts"}
              </span>
            </div>
          ) : null}

          {/* Load More Button */}
          {!isLoading && hasMore && (
            <div className="flex justify-center py-4">
              <button
                onClick={handleLoadMore}
                disabled={loadingMore}
              >
                {loadingMore ? (
                  <div className="flex items-center gap-2 ">
                    <IonSpinner name="dots" />
                    Loading...
                  </div>
                ) : (
                  <div className="px-4 py-1 bg-primary text-xs text-white rounded-2xl hover:bg-primary disabled:bg-gray-400">
                    Load More
                  </div>
                )}
              </button>
            </div>
          )}
        </div>
      </IonContent>

      {/* Transaction Detail Modal */}
      <TransactionDetailModal
        isOpen={isModalOpen}
        transaction={selectedTransaction}
        onClose={handleCloseModal}
        onSave={handleTransactionUpdate}
        categories={categories}
      />

      <Footer />
    </IonPage>
  );
};

export default Transactions;

import React, { useEffect, useMemo, useState } from 'react';
import { IonPage, IonContent, IonSpinner } from '@ionic/react';
import Footer from '../components/Footer';
import HeaderNavItem from '../components/HeaderNavItem';
import TransactionList from '../components/TransactionList';
import CardCarousel, { Card } from '../components/CardCarousel';
import { useMonthNavigation } from '../hooks/useMonthNavigation';
import { useTransactionFilters } from '../hooks/useTransactionFilters';
import { useAccounts } from '../hooks/useAccounts';
import { formatMonthDisplay, formatDateDisplay, getMonthDateRange } from '../utils/dateUtils';

const Transactions: React.FC = () => {
  const ITEMS_PER_PAGE = 20;
  
  const {
    selectedMonth,
    handlePrevMonth,
    handleNextMonth,
  } = useMonthNavigation();

  const {
    groupedTransactions,
    isLoading,
    loadingMore,
    hasMore,
    fetchTransactions,
  } = useTransactionFilters();

  const { accounts, isLoading: accountsLoading } = useAccounts(
    getMonthDateRange(selectedMonth).dateFrom,
    getMonthDateRange(selectedMonth).dateTo
  );

  // Pagination state
  const [currentPage, setCurrentPage] = useState(0);

  // Convert accounts with stats to Card format for CardCarousel
  const cards: Card[] = useMemo(() => {
    return accounts.map((account) => ({
      id: account.id,
      type: account.type === 'credit' ? 'credit' : 'debit',
      balance: 0, // Backend doesn't provide balance, can be added later
      title: `${account.bank_name} Account`,
      bankName: account.bank_name,
      lastFourDigits: account.account_last_four,
      referenceNumber: account.id,
      cardBrand: 'visa' as const, // Default brand, can be customized
      income: account.income,
      expense: account.expense,
      savings: account.savings,
    }));
  }, [accounts]);

  // Initial load: fetch first page of transactions for the selected month
  useEffect(() => {
    const { dateFrom, dateTo } = getMonthDateRange(selectedMonth);
    fetchTransactions(dateFrom, dateTo, ITEMS_PER_PAGE, 0, false);
    setCurrentPage(0);
  }, [selectedMonth, fetchTransactions]);

  // Handle load more - fetch next page with same date range
  const handleLoadMore = () => {
    const { dateFrom, dateTo } = getMonthDateRange(selectedMonth);
    const nextPage = currentPage + 1;
    const offset = nextPage * ITEMS_PER_PAGE;
    fetchTransactions(dateFrom, dateTo, ITEMS_PER_PAGE, offset, true);
    setCurrentPage(nextPage);
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
            <CardCarousel cards={cards} />
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
          {!isLoading && Object.keys(groupedTransactions).length > 0 ? (
            <div className="space-y-4">
              {Object.entries(groupedTransactions).map(([date, transactions]) => (
                <TransactionList
                  key={date}
                  title={formatDateDisplay(date)}
                  transactions={transactions}
                  isLoading={false}
                  isShowingFilter={false}
                />
              ))}
            </div>
          ) : !isLoading ? (
            <div className="flex items-center justify-center p-8 bg-white rounded-xl border border-gray-200">
              <span className="text-sm text-gray-400">No transactions found</span>
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

      <Footer />
    </IonPage>
  );
};

export default Transactions;

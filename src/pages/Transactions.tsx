import React, { useEffect } from 'react';
import { IonPage, IonContent, IonSpinner } from '@ionic/react';
import Footer from '../components/Footer';
import HeaderNavItem from '../components/HeaderNavItem';
import TransactionList from '../components/TransactionList';
import CardCarousel from '../components/CardCarousel';
import { useMonthNavigation } from '../hooks/useMonthNavigation';
import { useTransactionFilters } from '../hooks/useTransactionFilters';
import { formatMonthDisplay, formatDateDisplay, getNextDayBatch } from '../utils/dateUtils';
import { MOCK_CARDS } from '../data/mockCards';

const Transactions: React.FC = () => {
  const {
    selectedMonth,
    currentDayIndex,
    handlePrevMonth,
    handleNextMonth,
    incrementDayIndex,
    resetDayIndex,
  } = useMonthNavigation();

  const {
    groupedTransactions,
    isLoading,
    loadingMore,
    hasMore,
    fetchTransactions,
  } = useTransactionFilters();

  // Initial load: fetch first 5 days of the selected month
  useEffect(() => {
    const { dateFrom, dateTo } = getNextDayBatch(selectedMonth, 0);
    fetchTransactions(dateFrom, dateTo, false);
    resetDayIndex();
  }, [selectedMonth]);


  // Handle load more
  const handleLoadMore = () => {
    const { dateFrom, dateTo } = getNextDayBatch(selectedMonth, currentDayIndex);
    fetchTransactions(dateFrom, dateTo, true);
    incrementDayIndex();
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
          <CardCarousel cards={MOCK_CARDS} />

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

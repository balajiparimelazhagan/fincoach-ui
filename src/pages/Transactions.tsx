import React, { useEffect, useState, useMemo } from 'react';
import {
  IonPage, IonContent, IonSpinner, IonSearchbar, IonIcon,
} from '@ionic/react';
import { addCircleOutline, addOutline } from 'ionicons/icons';
import Footer from '../components/Footer';
import HeaderNavItem from '../components/HeaderNavItem';
import TransactionList from '../components/TransactionList';
import CardCarousel from '../components/CardCarousel';
import TransactionDetailModal from '../components/TransactionDetailModal';
import AddTransactionSheet from '../components/AddTransactionSheet';
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

const ITEMS_PER_PAGE = 20;

const Transactions: React.FC = () => {
  const [currentPage, setCurrentPage] = useState(0);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Search
  const [searchQuery, setSearchQuery] = useState('');

  const [showAddSheet, setShowAddSheet] = useState(false);

  // Month + data hooks
  const { selectedMonth, handlePrevMonth, handleNextMonth } = useMonthNavigation();
  const { groupedTransactions, isLoading, loadingMore, hasMore, fetchTransactions } = useTransactionFilters();

  const { dateFrom, dateTo } = getMonthDateRange(selectedMonth);
  const { accounts, isLoading: accountsLoading } = useAccounts(dateFrom, dateTo);

  const cards        = useMemo(() => mapAccountsToCards(accounts), [accounts]);
  const accountIds   = useMemo(() => accounts.map(a => a.id), [accounts]);
  const { enabledAccounts, handleToggleAccount } = useAccountToggle(accountIds);
  const { filteredTransactions } = useFilteredData(groupedTransactions, cards, enabledAccounts);

  // Client-side search across enabled accounts
  const searchedTransactions = useMemo(() => {
    if (!searchQuery.trim()) return filteredTransactions;
    const q = searchQuery.toLowerCase();
    const result: Record<string, Transaction[]> = {};
    Object.entries(filteredTransactions).forEach(([date, txs]) => {
      const matched = txs.filter(tx =>
        tx.description?.toLowerCase().includes(q) ||
        String(Math.abs(tx.amount)).includes(q)
      );
      if (matched.length > 0) result[date] = matched;
    });
    return result;
  }, [filteredTransactions, searchQuery]);

  const { handleTransactionUpdate } = useTransactionUpdate({
    onSuccess: () => {
      fetchTransactions(dateFrom, dateTo, ITEMS_PER_PAGE, 0, false);
      handleCloseModal();
    },
  });

  useEffect(() => {
    categoryService.getCategories().then(setCategories).catch(console.error);
  }, []);

  // Fetch paginated transactions when month changes; clear search
  useEffect(() => {
    setSearchQuery('');
    fetchTransactions(dateFrom, dateTo, ITEMS_PER_PAGE, 0, false);
    setCurrentPage(0);
  }, [selectedMonth, fetchTransactions, dateFrom, dateTo]);

  // When search is active, fetch up to the API max so results aren't cut off
  useEffect(() => {
    if (!searchQuery.trim()) return;
    fetchTransactions(dateFrom, dateTo, 200, 0, false);
  }, [searchQuery, dateFrom, dateTo, fetchTransactions]);

  const handleLoadMore = () => {
    const nextPage = currentPage + 1;
    fetchTransactions(dateFrom, dateTo, ITEMS_PER_PAGE, nextPage * ITEMS_PER_PAGE, true);
    setCurrentPage(nextPage);
  };

  const handleTransactionClick = (tx: Transaction) => {
    setSelectedTransaction(tx);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedTransaction(null);
  };

  const handleSearchInput = (val: string) => {
    setSearchQuery(val);
    if (!val.trim()) {
      fetchTransactions(dateFrom, dateTo, ITEMS_PER_PAGE, 0, false);
      setCurrentPage(0);
    }
  };

  return (
    <IonPage>
      <IonContent fullscreen>
        <div className="p-5 pb-24 space-y-4 bg-gray-50">

          {/* Month Selector */}
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

          {isLoading && (
            <div className="flex items-center justify-center p-8 bg-white rounded-xl border border-gray-100">
              <IonSpinner name="bubbles" />
            </div>
          )}

          {/* Search + Add */}
          <div className="flex items-center gap-2">
            <IonSearchbar
              value={searchQuery}
              onIonInput={e => handleSearchInput(e.detail.value ?? '')}
              onIonClear={() => handleSearchInput('')}
              placeholder="Search transactions"
              debounce={300}
            />
            <button
              onClick={() => setShowAddSheet(true)}
              className="flex-shrink-0 flex items-center font-bold justify-centertext-primary active:opacity-80"
              aria-label="Add transaction"
            >
              <IonIcon icon={addCircleOutline} className="text-primary font-semibold text-xl w-9 h-9" />
            </button>
          </div>

          {/* Transactions grouped by date */}
          {!isLoading && Object.keys(searchedTransactions).length > 0 ? (
            <div className="space-y-4">
              {Object.entries(searchedTransactions).map(([date, txs]) => (
                <TransactionList
                  key={date}
                  title={formatDateDisplay(date)}
                  transactions={txs}
                  isLoading={false}
                  isShowingFilter={false}
                  onTransactionClick={handleTransactionClick}
                />
              ))}
            </div>
          ) : !isLoading ? (
            <div className="flex items-center justify-center p-8 bg-white rounded-xl border border-gray-200">
              <span className="text-sm text-gray-400">
                {searchQuery.trim()
                  ? 'No transactions match your search'
                  : enabledAccounts.size === 0
                  ? 'No accounts selected'
                  : 'No transactions found'}
              </span>
            </div>
          ) : null}

          {/* Load More — hidden while searching */}
          {!isLoading && !searchQuery.trim() && hasMore && (
            <div className="flex justify-center py-4">
              <button onClick={handleLoadMore} disabled={loadingMore}>
                {loadingMore ? (
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <IonSpinner name="dots" />
                    Loading...
                  </div>
                ) : (
                  <div className="px-4 py-1.5 bg-primary text-xs text-white rounded-2xl active:opacity-80">
                    Load More
                  </div>
                )}
              </button>
            </div>
          )}
        </div>
      </IonContent>

      <AddTransactionSheet
        isOpen={showAddSheet}
        onDismiss={() => setShowAddSheet(false)}
        onSuccess={() => fetchTransactions(dateFrom, dateTo, ITEMS_PER_PAGE, 0, false)}
        categories={categories}
        enabledAccounts={enabledAccounts}
      />

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

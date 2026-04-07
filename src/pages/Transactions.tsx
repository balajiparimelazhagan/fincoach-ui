import React, { useState, useMemo } from 'react';
import {
  IonPage, IonContent, IonSpinner, IonSearchbar, IonIcon,
} from '@ionic/react';
import { addCircleOutline } from 'ionicons/icons';
import { useIonToast } from '@ionic/react';
import Footer from '../components/Footer';
import HeaderNavItem from '../components/HeaderNavItem';
import TransactionList from '../components/TransactionList';
import CardCarousel from '../components/CardCarousel';
import TransactionDetailModal from '../components/TransactionDetailModal';
import AddTransactionSheet from '../components/AddTransactionSheet';
import { useMonthNavigation } from '../hooks/useMonthNavigation';
import { useAccountToggle } from '../hooks/useAccountToggle';
import { useFilteredData } from '../hooks/useFilteredData';
import { formatMonthDisplay, formatDateDisplay, getMonthDateRange } from '../utils/dateUtils';
import { mapAccountsToCards } from '../utils/accountMapper';
import { Transaction } from '../services/transactionService';
import { useTransactions, useUpdateTransaction, useBulkUpdateTransaction } from '../hooks/queries/useTransactionQueries';
import { useAccountStats } from '../hooks/queries/useAccountQueries';
import { useCategories } from '../hooks/queries/useCategoryQueries';

const ITEMS_PER_PAGE = 20;

const Transactions: React.FC = () => {
  const [currentPage, setCurrentPage] = useState(0);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddSheet, setShowAddSheet] = useState(false);
  const [present] = useIonToast();

  const { selectedMonth, handlePrevMonth, handleNextMonth } = useMonthNavigation();
  const { dateFrom, dateTo } = getMonthDateRange(selectedMonth);

  // ── Data queries ────────────────────────────────────────────────────────────
  const txLimit = searchQuery.trim() ? 200 : (currentPage + 1) * ITEMS_PER_PAGE;
  const { data: txData, isLoading: txLoading } = useTransactions(
    { date_from: dateFrom, date_to: dateTo, limit: txLimit },
  );

  const { data: accountStatsData, isLoading: accountsLoading } = useAccountStats(dateFrom, dateTo);
  const { data: categories = [] } = useCategories();

  const updateTransaction = useUpdateTransaction();
  const bulkUpdateTransaction = useBulkUpdateTransaction();

  // ── Derived data ─────────────────────────────────────────────────────────────
  const groupedTransactions = useMemo(() => {
    const items = txData?.items ?? [];
    const grouped: Record<string, Transaction[]> = {};
    items.forEach(tx => {
      const key = tx.date.split('T')[0];
      (grouped[key] ??= []).push(tx);
    });
    return Object.keys(grouped)
      .sort((a, b) => new Date(b).getTime() - new Date(a).getTime())
      .reduce((acc, k) => { acc[k] = grouped[k]; return acc; }, {} as Record<string, Transaction[]>);
  }, [txData]);

  const accounts = useMemo(() => accountStatsData?.items ?? [], [accountStatsData]);
  const cards = useMemo(() => mapAccountsToCards(accounts), [accounts]);
  const accountIds = useMemo(() => accounts.map(a => a.id), [accounts]);
  const { enabledAccounts, handleToggleAccount } = useAccountToggle(accountIds);
  const { filteredTransactions } = useFilteredData(groupedTransactions, cards, enabledAccounts);

  const hasMore = (txData?.count ?? 0) > (currentPage + 1) * ITEMS_PER_PAGE && !searchQuery.trim();

  // ── Client-side search ───────────────────────────────────────────────────────
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

  // ── Handlers ─────────────────────────────────────────────────────────────────
  const handleTransactionUpdate = async (
    transactionId: string,
    updates: { category_id?: string; transactor_label?: string },
    updateScope: 'single' | 'current_and_future' | 'month_only' | 'month_and_future'
  ) => {
    try {
      let updatedCount = 1;
      if (updateScope === 'single') {
        await updateTransaction.mutateAsync({ id: transactionId, updates });
      } else {
        const result = await bulkUpdateTransaction.mutateAsync({
          id: transactionId,
          updates: { ...updates, update_scope: updateScope },
        });
        updatedCount = result.updated_count;
      }
      present({
        message: updatedCount === 1
          ? 'Transaction updated successfully'
          : `${updatedCount} transaction(s) updated successfully`,
        duration: 2000,
        color: 'success',
      });
      handleCloseModal();
    } catch {
      present({ message: 'Failed to update transaction', duration: 2000, color: 'danger' });
    }
  };

  const handleLoadMore = () => {
    setCurrentPage(p => p + 1);
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
    if (!val.trim()) setCurrentPage(0);
  };

  const isLoading = txLoading;

  return (
    <IonPage>
      <IonContent fullscreen>
        <div className="p-5 pb-24 space-y-4 bg-gray-50">

          <HeaderNavItem
            title={formatMonthDisplay(selectedMonth)}
            onPrev={() => { handlePrevMonth(); setCurrentPage(0); setSearchQuery(''); }}
            onNext={() => { handleNextMonth(); setCurrentPage(0); setSearchQuery(''); }}
          />

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
              className="shrink-0 flex items-center font-bold justify-centertext-primary active:opacity-80"
              aria-label="Add transaction"
            >
              <IonIcon icon={addCircleOutline} className="text-primary font-semibold text-xl w-9 h-9" />
            </button>
          </div>

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

          {!isLoading && !searchQuery.trim() && hasMore && (
            <div className="flex justify-center py-4">
              <button onClick={handleLoadMore}>
                <div className="px-4 py-1.5 bg-primary text-xs text-white rounded-2xl active:opacity-80">
                  Load More
                </div>
              </button>
            </div>
          )}
        </div>
      </IonContent>

      <AddTransactionSheet
        isOpen={showAddSheet}
        onDismiss={() => setShowAddSheet(false)}
        onSuccess={() => {}}
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

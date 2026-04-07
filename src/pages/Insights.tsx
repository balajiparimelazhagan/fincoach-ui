import React, { useState, useMemo } from 'react';
import { IonPage, IonContent, IonSpinner } from '@ionic/react';
import { useIonToast } from '@ionic/react';
import Footer from '../components/Footer';
import SummaryStats from '../components/SummaryStats';
import MonthlyOverviewChart from '../components/MonthlyOverviewChart';
import HeaderNavItem from '../components/HeaderNavItem';
import TopTransactorsChart from '../components/TopTransactorsChart';
import CardCarousel from '../components/CardCarousel';
import CategorySpend from '../components/CategorySpend';
import TransactionDetailModal from '../components/TransactionDetailModal';
import { Transaction } from '../services/transactionService';
import { getMonthDateRange, formatMonthDisplay } from '../utils/dateUtils';
import { useAccountToggle } from '../hooks/useAccountToggle';
import { useFilteredData } from '../hooks/useFilteredData';
import { mapAccountsToCards } from '../utils/accountMapper';
import { useMonthNavigation } from '../hooks/useMonthNavigation';
import { useTransactions, useUpdateTransaction, useBulkUpdateTransaction } from '../hooks/queries/useTransactionQueries';
import { useAccountStats } from '../hooks/queries/useAccountQueries';
import { useCategories } from '../hooks/queries/useCategoryQueries';

const Insights: React.FC = () => {
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [present] = useIonToast();

  const { selectedMonth, handlePrevMonth, handleNextMonth } = useMonthNavigation();
  const { dateFrom, dateTo } = getMonthDateRange(selectedMonth);

  // ── Data queries ────────────────────────────────────────────────────────────
  const { data: txData, isLoading: transactionsLoading } = useTransactions(
    { date_from: dateFrom, date_to: dateTo, limit: 200 },
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
    return grouped;
  }, [txData]);

  const accounts = useMemo(() => accountStatsData?.items ?? [], [accountStatsData]);
  const cards = useMemo(() => mapAccountsToCards(accounts), [accounts]);
  const accountIds = useMemo(() => accounts.map(a => a.id), [accounts]);
  const { enabledAccounts, handleToggleAccount } = useAccountToggle(accountIds);

  const { filteredTransactions, filteredSummaryStats, filteredCategories } = useFilteredData(
    groupedTransactions,
    cards,
    enabledAccounts
  );

  const allFilteredTransactions = useMemo(
    () => Object.values(filteredTransactions).flat(),
    [filteredTransactions]
  );

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

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedTransaction(null);
  };

  const isLoading = accountsLoading && !accountStatsData;

  if (isLoading) {
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
          <HeaderNavItem
            title={formatMonthDisplay(selectedMonth)}
            onPrev={handlePrevMonth}
            onNext={handleNextMonth}
          />

          {cards.length > 0 ? (
            <CardCarousel
              cards={cards}
              onToggleChange={handleToggleAccount}
              enabledAccounts={enabledAccounts}
            />
          ) : (
            <div className="text-center text-gray-500">No accounts available</div>
          )}

          <SummaryStats
            income={filteredSummaryStats.income}
            expense={filteredSummaryStats.expense}
            savings={filteredSummaryStats.savings}
          />

          {filteredCategories.length > 0 && (
            <CategorySpend categories={filteredCategories} />
          )}

          <div className="relative">
            <span className="absolute top-2 left-3 pl-1 text-primary font-semibold">This month</span>
            <MonthlyOverviewChart />
          </div>

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
        </div>
      </IonContent>

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

export default Insights;

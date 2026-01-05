import React, { useEffect, useState } from 'react';
import { IonPage, IonContent, IonSpinner } from '@ionic/react';
import Footer from '../components/Footer';
import SummaryStats from '../components/SummaryStats';
import MonthlyOverviewChart from '../components/MonthlyOverviewChart';
import CalendarMonthView from '../components/CalendarMonthView';
import HeaderNavItem from '../components/HeaderNavItem';
import TransactionList from '../components/TransactionList';
import CardCarousel, { Card } from '../components/CardCarousel';
import CategorySpend, { ICategorySpend } from '../components/CategorySpend';
import { accountService, AccountWithStats } from '../services/accountService';
import { statsService, SummaryStats as StatsResponse, CategorySpending } from '../services/statsService';
import { getMonthDateRange, formatMonthDisplay } from '../utils/dateUtils';

interface PageState {
  cards: Card[];
  summaryStats: {
    income: number;
    expense: number;
    savings: number;
  };
  categories: ICategorySpend[];
  isLoading: boolean;
  error: string | null;
}

const Insights: React.FC = () => {
  const [selectedMonth, setSelectedMonth] = useState<Date>(new Date());
  const [state, setState] = useState<PageState>({
    cards: [],
    summaryStats: { income: 0, expense: 0, savings: 0 },
    categories: [],
    isLoading: true,
    error: null,
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        setState(prev => ({ ...prev, isLoading: true, error: null }));

        const { dateFrom, dateTo } = getMonthDateRange(selectedMonth);

        const accountStatsResponse = await accountService.getAccountsWithStats(dateFrom, dateTo);
        const accountCards: Card[] = accountStatsResponse.items.map((account: AccountWithStats) => ({
          id: account.id,
          type: account.type === 'credit' ? 'credit' : 'debit',
          balance: 0, // Not available from current API
          title: account.bank_name,
          bankName: account.bank_name,
          lastFourDigits: account.account_last_four,
          referenceNumber: account.id.substring(0, 12).toUpperCase(),
          cardBrand: 'visa' as const,
          income: account.income,
          expense: account.expense,
          savings: account.savings,
        }));

        const statsData = await statsService.getComprehensiveStats(dateFrom, dateTo);

        const categoryData: ICategorySpend[] = statsData.categories.map((cat: CategorySpending) => ({
          id: cat.name.toLowerCase().replace(/\s+/g, '_'),
          name: cat.name,
          amount: cat.amount,
        }));

        setState(prev => ({
          ...prev,
          cards: accountCards,
          summaryStats: {
            income: statsData.income,
            expense: statsData.expense,
            savings: statsData.savings,
          },
          categories: categoryData,
          isLoading: false,
        }));
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
  }, [selectedMonth]);

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

  const monthDisplay = formatMonthDisplay(selectedMonth);

  return (
    <IonPage>
      <IonContent fullscreen>
        <div className="p-5 pb-24 space-y-4 bg-gray-100">

          <HeaderNavItem 
            title={monthDisplay}
            onPrev={handlePrevMonth}
            onNext={handleNextMonth}
          />
          
          {/* Card Carousel */}
          {state.cards.length > 0 ? (
            <CardCarousel cards={state.cards} />
          ) : (
            <div className="text-center text-gray-500">No accounts available</div>
          )}
          
          <SummaryStats 
            income={state.summaryStats.income}
            expense={state.summaryStats.expense}
            savings={state.summaryStats.savings}
          />
          
          {/* Category Wallets */}
          {state.categories.length > 0 && (
            <CategorySpend categories={state.categories} />
          )}

          {/* Monthly overview chart */}
          <div className="relative">
            <span className="absolute top-2 left-3 pl-1 text-primary font-semibold"> This month</span>
              <MonthlyOverviewChart />

            {/* Monthly overview and calendar */}
            {/* <CalendarMonthView /> */}
            {/* Transactions content placeholder - List of transactions will go here */}
          </div>
            <div className="mb-5">
            <TransactionList
              title='25 November'
              isShowingFilter={false}
              transactions={[
              { transaction_id: '1', type: 'expense', date: '2024-11-25', description: 'Grocery Store', amount: -85.50, category: 'Grocery'},
              { transaction_id: '2', type: 'expense', date: '2024-11-25', description: 'Gas Station', amount: -45.00, category: 'Gas'},
              { transaction_id: '3', type: 'income', date: '2024-11-25', description: 'Outing', amount: 3200.00, category: 'Income'},
              ]}
              isLoading={false}
            />
            </div>
          <div className="mb-5">
            <TransactionList
              title='23 November'
              isShowingFilter={false}
              transactions={[
              { transaction_id: '4', type: 'expense', date: '2024-11-23', description: 'Netflix', amount: -640.50, category: 'Subscription'},
              { transaction_id: '5', type: 'expense', date: '2024-11-23', description: 'Rent', amount: -15000.00, category: 'Rent'},
              ]}
              isLoading={false}
            />
          </div>

          {state.error && (
            <div className="text-red-500 text-center mt-4">{state.error}</div>
          )}
        </div>
      </IonContent>

      <Footer />
    </IonPage>
  );
};

export default Insights;

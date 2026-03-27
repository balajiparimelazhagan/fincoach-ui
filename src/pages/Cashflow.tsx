import React, { useEffect, useState, useCallback } from 'react';
import {
  IonPage, IonContent, IonHeader, IonToolbar, IonSpinner, IonIcon,
} from '@ionic/react';
import { chevronBackOutline, chevronForwardOutline, calendarOutline } from 'ionicons/icons';
import Footer from '../components/Footer';
import CashflowCalendar from '../components/CashflowCalendar';
import UpcomingOwes from '../components/UpcomingOwes';
import FlexibleSpending from '../components/FlexibleSpending';
import DayTransactionModal from '../components/DayTransactionModal';
import { patternService, PatternObligation } from '../services/patternService';
import { statsService, DailySummary, CategoryBudget } from '../services/statsService';
import { transactionService, Transaction } from '../services/transactionService';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const Cashflow: React.FC = () => {
  const now = new Date();
  const [selectedYear,  setSelectedYear]  = useState(now.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth()); // 0-indexed

  const [dailySummary,    setDailySummary]    = useState<DailySummary[]>([]);
  const [dailyLoading,    setDailyLoading]    = useState(true);
  const [obligations,     setObligations]     = useState<PatternObligation[]>([]);
  const [categoryBudgets, setCategoryBudgets] = useState<CategoryBudget[]>([]);
  const [staticLoading,   setStaticLoading]   = useState(true);

  const [selectedDay,      setSelectedDay]      = useState<number | null>(null);
  const [dayTransactions,  setDayTransactions]  = useState<Transaction[]>([]);
  const [dayLoading,       setDayLoading]       = useState(false);

  const handlePrevMonth = () => {
    if (selectedMonth === 0) { setSelectedMonth(11); setSelectedYear(y => y - 1); }
    else setSelectedMonth(m => m - 1);
  };

  const handleNextMonth = () => {
    if (selectedMonth === 11) { setSelectedMonth(0); setSelectedYear(y => y + 1); }
    else setSelectedMonth(m => m + 1);
  };

  useEffect(() => {
    setDailyLoading(true);
    statsService.getCashflowDailySummary(selectedYear, selectedMonth + 1)
      .then(setDailySummary)
      .catch(err => console.error('Failed to fetch daily summary:', err))
      .finally(() => setDailyLoading(false));
  }, [selectedYear, selectedMonth]);

  useEffect(() => {
    patternService.getUpcomingObligations(60)
      .then(setObligations)
      .catch(err => console.error('Failed to fetch obligations:', err))
      .finally(() => setStaticLoading(false));
  }, []);

  useEffect(() => {
    statsService.getCategoryBudgets(selectedYear, selectedMonth + 1)
      .then(setCategoryBudgets)
      .catch(err => console.error('Failed to fetch category budgets:', err));
  }, [selectedYear, selectedMonth]);

  const handleDayTap = useCallback(async (day: number) => {
    setSelectedDay(day);
    setDayLoading(true);
    setDayTransactions([]);
    try {
      const dateFrom = new Date(selectedYear, selectedMonth, day);
      const dateTo   = new Date(selectedYear, selectedMonth, day, 23, 59, 59);
      const response = await transactionService.getTransactions({
        date_from: dateFrom.toISOString(),
        date_to:   dateTo.toISOString(),
        limit: 50,
      });
      setDayTransactions(response.items);
    } catch (err) {
      console.error('Failed to fetch day transactions:', err);
    } finally {
      setDayLoading(false);
    }
  }, [selectedYear, selectedMonth]);

  const closeModal = () => {
    setSelectedDay(null);
    setDayTransactions([]);
  };

  const dailyMap: Record<number, DailySummary> = {};
  dailySummary.forEach(d => { dailyMap[d.day] = d; });

  const monthObligations = obligations.filter(o => {
    const d = new Date(o.expected_date);
    return d.getFullYear() === selectedYear && d.getMonth() === selectedMonth;
  });

  const variableCategories = categoryBudgets.filter(c => !c.has_pattern);
  const loading = dailyLoading && staticLoading;

  return (
    <IonPage>
      <IonHeader className="ion-no-border border-b border-gray-200">
        <IonToolbar>
          <div className="flex items-center gap-2 px-4 py-3">
            <IonIcon icon={calendarOutline} className="text-primary text-xl" />
            <span className="text-lg font-bold text-gray-800">Cashflow</span>
          </div>
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen className="bg-gray-200!">
        <div className="pb-24 bg-gray-50">
          {/* Month Navigation */}
          <div className="flex items-center justify-between px-5 py-3">
            <button
              onClick={handlePrevMonth}
              aria-label="Previous month"
              className="w-10 h-10 flex items-center justify-center active:bg-gray-100 rounded-full"
            >
              <IonIcon icon={chevronBackOutline} className="text-primary" />
            </button>
            <span className="text-lg font-semibold text-primary">
              {MONTH_NAMES[selectedMonth]} {selectedYear}
            </span>
            <button
              onClick={handleNextMonth}
              aria-label="Next month"
              className="w-10 h-10 flex items-center justify-center active:bg-gray-100 rounded-full"
            >
              <IonIcon icon={chevronForwardOutline} className="text-primary" />
            </button>
          </div>

          {loading ? (
            <div className="flex items-center justify-center h-40">
              <IonSpinner name="bubbles" />
            </div>
          ) : (
            <>
              <CashflowCalendar
                year={selectedYear}
                month={selectedMonth}
                dailyMap={dailyMap}
                onDayTap={handleDayTap}
              />

              <UpcomingOwes obligations={monthObligations} />

              <FlexibleSpending categories={variableCategories} />
            </>
          )}
        </div>

        <DayTransactionModal
          isOpen={selectedDay !== null}
          day={selectedDay}
          month={selectedMonth}
          year={selectedYear}
          transactions={dayTransactions}
          isLoading={dayLoading}
          onClose={closeModal}
        />
      </IonContent>

      <Footer />
    </IonPage>
  );
};

export default Cashflow;

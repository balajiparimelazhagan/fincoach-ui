import React, { useState, useCallback } from 'react';
import {
  IonPage, IonContent, IonHeader, IonToolbar, IonSpinner, IonIcon,
} from '@ionic/react';
import {
  chevronBackOutline, chevronForwardOutline, calendarOutline,
  listOutline, calendarNumberOutline,
} from 'ionicons/icons';
import { useHistory } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import Footer from '../components/Footer';
import CashflowCalendar from '../components/CashflowCalendar';
import UpcomingOwes from '../components/UpcomingOwes';
import FlexibleSpending from '../components/FlexibleSpending';
import DayTransactionModal from '../components/DayTransactionModal';
import BudgetTable from '../components/BudgetTable';
import AddBudgetItemDrawer from '../components/AddBudgetItemDrawer';
import MarkAsPaidDrawer from '../components/MarkAsPaidDrawer';
import { PatternObligation } from '../services/patternService';
import { transactionService, Transaction } from '../services/transactionService';
import { BudgetSection } from '../services/budgetService';
import { useDailySummary, useCategoryBudgets } from '../hooks/queries/useStatsQueries';
import { useUpcomingObligations } from '../hooks/queries/usePatternQueries';
import { useCustomBudgetItems } from '../hooks/queries/useBudgetQueries';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const COVERAGE_KEY = 'budget_months_coverage';

type ViewMode = 'calendar' | 'budget';

const Cashflow: React.FC = () => {
  const history = useHistory();
  const queryClient = useQueryClient();
  const now = new Date();
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth()); // 0-indexed

  const isCurrentMonth = selectedYear === now.getFullYear() && selectedMonth === now.getMonth();
  const isFutureMonth = selectedYear > now.getFullYear() ||
    (selectedYear === now.getFullYear() && selectedMonth > now.getMonth());

  const [viewMode, setViewMode] = useState<ViewMode>('calendar');
  const effectiveView: ViewMode = isFutureMonth ? 'budget' : viewMode;

  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [dayTransactions, setDayTransactions] = useState<Transaction[]>([]);
  const [dayLoading, setDayLoading] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerSection, setDrawerSection] = useState<BudgetSection>('bills');
  const [payObligation, setPayObligation] = useState<PatternObligation | null>(null);
  const [monthsCoverage, setMonthsCoverage] = useState<number>(() => {
    const saved = localStorage.getItem(COVERAGE_KEY);
    return saved ? parseInt(saved) : 6;
  });

  // ── Data queries ─────────────────────────────────────────────────────────────
  const { data: dailySummary = [], isLoading: dailyLoading } =
    useDailySummary(selectedYear, selectedMonth + 1);

  const { data: allObligations = [], isLoading: obligationsLoading } =
    useUpcomingObligations(365);

  const { data: categoryBudgets = [], isLoading: budgetsLoading } =
    useCategoryBudgets(selectedYear, selectedMonth + 1);

  const { data: customItems = [], isLoading: customLoading } =
    useCustomBudgetItems();

  // ── Derived data ─────────────────────────────────────────────────────────────
  const dailyMap: Record<number, (typeof dailySummary)[0]> = {};
  dailySummary.forEach(d => { dailyMap[d.day] = d; });

  const monthObligations = allObligations.filter(o => {
    const d = new Date(o.expected_date);
    return d.getFullYear() === selectedYear && d.getMonth() === selectedMonth;
  });

  const variableCategories = categoryBudgets.filter(c => !c.has_pattern);
  const staticLoading = obligationsLoading || budgetsLoading || customLoading;
  const calendarLoading = dailyLoading || staticLoading;

  // ── Month navigation ──────────────────────────────────────────────────────────
  const handlePrevMonth = () => {
    if (selectedMonth === 0) { setSelectedMonth(11); setSelectedYear(y => y - 1); }
    else setSelectedMonth(m => m - 1);
  };

  const handleNextMonth = () => {
    if (selectedMonth === 11) { setSelectedMonth(0); setSelectedYear(y => y + 1); }
    else setSelectedMonth(m => m + 1);
  };

  // ── Day tap ───────────────────────────────────────────────────────────────────
  const handleDayTap = useCallback(async (day: number) => {
    setSelectedDay(day);
    setDayLoading(true);
    setDayTransactions([]);
    try {
      const dateFrom = new Date(selectedYear, selectedMonth, day);
      const dateTo = new Date(selectedYear, selectedMonth, day, 23, 59, 59);
      const response = await transactionService.getTransactions({
        date_from: dateFrom.toISOString(),
        date_to: dateTo.toISOString(),
        limit: 50,
      });
      setDayTransactions(response.items);
    } catch (err) {
      console.error('Failed to fetch day transactions:', err);
    } finally {
      setDayLoading(false);
    }
  }, [selectedYear, selectedMonth]);

  // ── Handlers ──────────────────────────────────────────────────────────────────
  const handleAddItem = (section: BudgetSection) => {
    setDrawerSection(section);
    setDrawerOpen(true);
  };

  const handleMonthsCoverageChange = (v: number) => {
    setMonthsCoverage(v);
    localStorage.setItem(COVERAGE_KEY, String(v));
  };

  const openNextMonthBudget = () => {
    const nextMonth = selectedMonth === 11 ? 0 : selectedMonth + 1;
    const nextYear = selectedMonth === 11 ? selectedYear + 1 : selectedYear;
    history.push(`/budget?year=${nextYear}&month=${nextMonth + 1}`);
  };

  const handleObligationFulfilled = (obligationId: string) => {
    queryClient.setQueriesData<PatternObligation[]>(
      { queryKey: ['obligations'] },
      (old) => old?.map(o => o.id === obligationId ? { ...o, status: 'FULFILLED' as const } : o)
    );
  };

  return (
    <IonPage>
      <IonHeader className="ion-no-border border-b border-gray-200">
        <IonToolbar>
          <div className="flex items-center gap-2 px-4! py-3!">
            <IonIcon
              icon={effectiveView === 'budget' ? listOutline : calendarOutline}
              className="text-primary text-xl"
            />
            <span className="text-lg font-bold text-gray-800">
              {effectiveView === 'budget' ? 'Budget' : 'Cashflow'}
            </span>

            {isCurrentMonth && effectiveView === 'calendar' && (
              <button
                onClick={openNextMonthBudget}
                className="ml-auto flex items-center gap-1 text-xs font-semibold text-primary border border-primary/30 rounded-lg px-2.5 py-1 active:bg-primary/10"
              >
                <IonIcon icon={calendarNumberOutline} className="text-sm" />
                Next month budget
              </button>
            )}
          </div>
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen className="bg-gray-50!">
        <div className="pb-24 bg-gray-50">

          {/* Month navigation + view toggle */}
          <div className="flex items-center justify-between px-5 py-3">
            <button
              onClick={handlePrevMonth}
              aria-label="Previous month"
              className="w-10 h-10 flex items-center justify-center active:bg-gray-100 rounded-full"
            >
              <IonIcon icon={chevronBackOutline} className="text-primary" />
            </button>

            <div className="flex flex-col items-center gap-1.5">
              <span className="text-lg font-semibold text-primary">
                {MONTH_NAMES[selectedMonth]} {selectedYear}
              </span>

              {!isFutureMonth && (
                <div className="flex bg-gray-100 rounded-full p-0.5">
                  <button
                    onClick={() => setViewMode('calendar')}
                    className={`flex items-center gap-1 px-3! py-1! rounded-full! text-xs font-semibold transition-all ${effectiveView === 'calendar'
                      ? 'bg-white text-primary shadow-sm'
                      : 'text-gray-500'
                      }`}
                  >
                    <IonIcon icon={calendarOutline} className="text-sm" />
                    Calendar
                  </button>
                  <button
                    onClick={() => setViewMode('budget')}
                    className={`flex items-center gap-1 px-3! py-1! rounded-full! text-xs font-semibold transition-all ${effectiveView === 'budget'
                      ? 'bg-white text-primary shadow-sm'
                      : 'text-gray-500'
                      }`}
                  >
                    <IonIcon icon={listOutline} className="text-sm" />
                    Budget
                  </button>
                </div>
              )}

              {isFutureMonth && (
                <span className="text-xs text-gray-400 font-medium">Budget Plan</span>
              )}
            </div>

            <button
              onClick={handleNextMonth}
              aria-label="Next month"
              className="w-10 h-10 flex items-center justify-center active:bg-gray-100 rounded-full"
            >
              <IonIcon icon={chevronForwardOutline} className="text-primary" />
            </button>
          </div>

          {/* ── Calendar view ── */}
          {effectiveView === 'calendar' && (
            calendarLoading ? (
              <div className="flex items-center justify-center h-40">
                <IonSpinner name="bubbles" />
              </div>
            ) : (
              <>
                <CashflowCalendar
                  year={selectedYear}
                  month={selectedMonth}
                  dailyMap={dailyMap}
                  obligations={monthObligations}
                  onDayTap={handleDayTap}
                />
                <UpcomingOwes
                  obligations={monthObligations}
                  onObligationFulfilled={handleObligationFulfilled}
                />
                <FlexibleSpending categories={variableCategories} />
              </>
            )
          )}

          {/* ── Budget view ── */}
          {effectiveView === 'budget' && (
            staticLoading ? (
              <div className="flex items-center justify-center h-40">
                <IonSpinner name="bubbles" />
              </div>
            ) : (
              <BudgetTable
                year={selectedYear}
                month={selectedMonth}
                obligations={monthObligations}
                categoryBudgets={categoryBudgets}
                customItems={customItems}
                monthsCoverage={monthsCoverage}
                onMonthsCoverageChange={handleMonthsCoverageChange}
                onAddItem={handleAddItem}
                onDeleteItem={(id) => queryClient.setQueryData(
                  ['budget', 'customItems'],
                  (old: typeof customItems) => old?.filter(i => i.id !== id) ?? []
                )}
                onObligationClick={isCurrentMonth ? setPayObligation : undefined}
              />
            )
          )}
        </div>

        <DayTransactionModal
          isOpen={selectedDay !== null}
          day={selectedDay}
          month={selectedMonth}
          year={selectedYear}
          transactions={dayTransactions}
          isLoading={dayLoading}
          onClose={() => { setSelectedDay(null); setDayTransactions([]); }}
        />

        <MarkAsPaidDrawer
          obligation={payObligation}
          onDismiss={() => setPayObligation(null)}
          onSuccess={(obligationId) => handleObligationFulfilled(obligationId)}
        />

        <AddBudgetItemDrawer
          isOpen={drawerOpen}
          defaultSection={drawerSection}
          onDismiss={() => setDrawerOpen(false)}
          onSuccess={() => {
            queryClient.invalidateQueries({ queryKey: ['budget', 'customItems'] });
            setDrawerOpen(false);
          }}
        />
      </IonContent>

      <Footer />
    </IonPage>
  );
};

export default Cashflow;

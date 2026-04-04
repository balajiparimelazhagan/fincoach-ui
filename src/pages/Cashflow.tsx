import React, { useEffect, useState, useCallback } from 'react';
import {
  IonPage, IonContent, IonHeader, IonToolbar, IonSpinner, IonIcon,
} from '@ionic/react';
import {
  chevronBackOutline, chevronForwardOutline, calendarOutline,
  listOutline, calendarNumberOutline,
} from 'ionicons/icons';
import { useHistory } from 'react-router-dom';
import Footer from '../components/Footer';
import CashflowCalendar from '../components/CashflowCalendar';
import UpcomingOwes from '../components/UpcomingOwes';
import FlexibleSpending from '../components/FlexibleSpending';
import DayTransactionModal from '../components/DayTransactionModal';
import BudgetTable from '../components/BudgetTable';
import AddBudgetItemDrawer from '../components/AddBudgetItemDrawer';
import MarkAsPaidDrawer from '../components/MarkAsPaidDrawer';
import { patternService, PatternObligation } from '../services/patternService';
import { statsService, DailySummary, CategoryBudget } from '../services/statsService';
import { transactionService, Transaction } from '../services/transactionService';
import { budgetService, CustomBudgetItem, BudgetSection } from '../services/budgetService';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const COVERAGE_KEY = 'budget_months_coverage';

type ViewMode = 'calendar' | 'budget';

const Cashflow: React.FC = () => {
  const history = useHistory();
  const now = new Date();
  const [selectedYear,  setSelectedYear]  = useState(now.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth()); // 0-indexed

  const isCurrentMonth = selectedYear === now.getFullYear() && selectedMonth === now.getMonth();
  const isFutureMonth  = selectedYear > now.getFullYear() ||
    (selectedYear === now.getFullYear() && selectedMonth > now.getMonth());

  // For current month: allow toggling. For future months: always budget.
  const [viewMode, setViewMode] = useState<ViewMode>('calendar');
  const effectiveView: ViewMode = isFutureMonth ? 'budget' : viewMode;

  const [dailySummary,    setDailySummary]    = useState<DailySummary[]>([]);
  const [dailyLoading,    setDailyLoading]    = useState(true);
  const [obligations,     setObligations]     = useState<PatternObligation[]>([]);
  const [categoryBudgets, setCategoryBudgets] = useState<CategoryBudget[]>([]);
  const [customItems,     setCustomItems]     = useState<CustomBudgetItem[]>([]);
  const [staticLoading,   setStaticLoading]   = useState(true);

  const [selectedDay,     setSelectedDay]     = useState<number | null>(null);
  const [dayTransactions, setDayTransactions] = useState<Transaction[]>([]);
  const [dayLoading,      setDayLoading]      = useState(false);

  const [drawerOpen,      setDrawerOpen]      = useState(false);
  const [drawerSection,   setDrawerSection]   = useState<BudgetSection>('bills');
  const [payObligation,   setPayObligation]   = useState<PatternObligation | null>(null);

  const [monthsCoverage, setMonthsCoverage] = useState<number>(() => {
    const saved = localStorage.getItem(COVERAGE_KEY);
    return saved ? parseInt(saved) : 6;
  });

  const handlePrevMonth = () => {
    if (selectedMonth === 0) { setSelectedMonth(11); setSelectedYear(y => y - 1); }
    else setSelectedMonth(m => m - 1);
  };

  const handleNextMonth = () => {
    if (selectedMonth === 11) { setSelectedMonth(0); setSelectedYear(y => y + 1); }
    else setSelectedMonth(m => m + 1);
  };

  // Daily summary — only needed for calendar view
  useEffect(() => {
    setDailyLoading(true);
    statsService.getCashflowDailySummary(selectedYear, selectedMonth + 1)
      .then(setDailySummary)
      .catch(err => console.error('Failed to fetch daily summary:', err))
      .finally(() => setDailyLoading(false));
  }, [selectedYear, selectedMonth]);

  // Static data — obligations, category budgets, custom items
  useEffect(() => {
    setStaticLoading(true);
    Promise.all([
      patternService.getUpcomingObligations(365),
      statsService.getCategoryBudgets(selectedYear, selectedMonth + 1),
      budgetService.getCustomItems(),
    ])
      .then(([obs, budgets, custom]) => {
        setObligations(obs);
        setCategoryBudgets(budgets);
        setCustomItems(custom);
      })
      .catch(err => console.error('Failed to fetch static data:', err))
      .finally(() => setStaticLoading(false));
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

  const reloadObligations = () =>
    patternService.getUpcomingObligations(365).then(setObligations).catch(console.error);

  const reloadCustomItems = () =>
    budgetService.getCustomItems().then(setCustomItems).catch(console.error);

  const dailyMap: Record<number, DailySummary> = {};
  dailySummary.forEach(d => { dailyMap[d.day] = d; });

  const monthObligations = obligations.filter(o => {
    const d = new Date(o.expected_date);
    return d.getFullYear() === selectedYear && d.getMonth() === selectedMonth;
  });

  const variableCategories = categoryBudgets.filter(c => !c.has_pattern);
  const calendarLoading = dailyLoading && staticLoading;

  const handleAddItem = (section: BudgetSection) => {
    setDrawerSection(section);
    setDrawerOpen(true);
  };

  const handleDeleteItem = async (id: string) => {
    await budgetService.deleteCustomItem(id);
    setCustomItems(prev => prev.filter(i => i.id !== id));
  };

  const handleMonthsCoverageChange = (v: number) => {
    setMonthsCoverage(v);
    localStorage.setItem(COVERAGE_KEY, String(v));
  };

  // Navigate to standalone Budget page for next month
  const openNextMonthBudget = () => {
    const nextMonth = selectedMonth === 11 ? 0 : selectedMonth + 1;
    const nextYear  = selectedMonth === 11 ? selectedYear + 1 : selectedYear;
    history.push(`/budget?year=${nextYear}&month=${nextMonth + 1}`);
  };

  return (
    <IonPage>
      <IonHeader className="ion-no-border border-b border-gray-200">
        <IonToolbar>
          <div className="flex items-center gap-2 px-4 py-3">
            <IonIcon
              icon={effectiveView === 'budget' ? listOutline : calendarOutline}
              className="text-primary text-xl"
            />
            <span className="text-lg font-bold text-gray-800">
              {effectiveView === 'budget' ? 'Budget' : 'Cashflow'}
            </span>

            {/* Next month budget button — only on current month calendar view */}
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

              {/* Toggle — only shown for current and past months */}
              {!isFutureMonth && (
                <div className="flex bg-gray-100 rounded-full p-0.5">
                  <button
                    onClick={() => setViewMode('calendar')}
                    className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                      effectiveView === 'calendar'
                        ? 'bg-white text-primary shadow-sm'
                        : 'text-gray-500'
                    }`}
                  >
                    <IonIcon icon={calendarOutline} className="text-sm" />
                    Calendar
                  </button>
                  <button
                    onClick={() => setViewMode('budget')}
                    className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                      effectiveView === 'budget'
                        ? 'bg-white text-primary shadow-sm'
                        : 'text-gray-500'
                    }`}
                  >
                    <IonIcon icon={listOutline} className="text-sm" />
                    Budget
                  </button>
                </div>
              )}

              {/* Future month label */}
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
                  onDayTap={handleDayTap}
                />
                <UpcomingOwes
                  obligations={monthObligations}
                  onRefresh={reloadObligations}
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
                onDeleteItem={handleDeleteItem}
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
          onClose={closeModal}
        />

        <MarkAsPaidDrawer
          obligation={payObligation}
          onDismiss={() => setPayObligation(null)}
          onSuccess={() => { setPayObligation(null); reloadObligations(); }}
        />

        <AddBudgetItemDrawer
          isOpen={drawerOpen}
          defaultSection={drawerSection}
          onDismiss={() => setDrawerOpen(false)}
          onSuccess={() => {
            reloadCustomItems();
            setDrawerOpen(false);
          }}
        />
      </IonContent>

      <Footer />
    </IonPage>
  );
};

export default Cashflow;

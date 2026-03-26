import React, { useEffect, useState, useCallback } from 'react';
import {
  IonPage, IonContent, IonHeader, IonToolbar, IonSpinner, IonIcon, IonModal,
} from '@ionic/react';
import {
  chevronBackOutline, chevronForwardOutline,
  checkmarkCircle, alertCircle, timeOutline, calendarOutline,
  closeOutline,
} from 'ionicons/icons';
import Footer from '../components/Footer';
import { patternService, PatternObligation } from '../services/patternService';
import { statsService, DailySummary, CategoryBudget } from '../services/statsService';
import { transactionService, Transaction } from '../services/transactionService';
import { formatCompactCurrency } from '../utils/transactionFormatters';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];
const SHORT_MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];


const formatFullCurrency = (amount: number) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);

const Cashflow: React.FC = () => {
  const now = new Date();
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth()); // 0-indexed

  // Month-level data
  const [dailySummary, setDailySummary] = useState<DailySummary[]>([]);
  const [dailyLoading, setDailyLoading] = useState(true);

  // Static data (fetched once)
  const [obligations, setObligations] = useState<PatternObligation[]>([]);
  const [categoryBudgets, setCategoryBudgets] = useState<CategoryBudget[]>([]);
  const [staticLoading, setStaticLoading] = useState(true);

  // Day modal
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [dayTransactions, setDayTransactions] = useState<Transaction[]>([]);
  const [dayLoading, setDayLoading] = useState(false);

  const handlePrevMonth = () => {
    if (selectedMonth === 0) { setSelectedMonth(11); setSelectedYear(y => y - 1); }
    else setSelectedMonth(m => m - 1);
  };

  const handleNextMonth = () => {
    if (selectedMonth === 11) { setSelectedMonth(0); setSelectedYear(y => y + 1); }
    else setSelectedMonth(m => m + 1);
  };

  // Fetch daily summary whenever displayed month changes
  useEffect(() => {
    setDailyLoading(true);
    statsService.getCashflowDailySummary(selectedYear, selectedMonth + 1)
      .then(setDailySummary)
      .catch(err => console.error('Failed to fetch daily summary:', err))
      .finally(() => setDailyLoading(false));
  }, [selectedYear, selectedMonth]);

  // Fetch obligations once on mount
  useEffect(() => {
    patternService.getUpcomingObligations(60)
      .then(setObligations)
      .catch(err => console.error('Failed to fetch obligations:', err))
      .finally(() => setStaticLoading(false));
  }, []);

  // Fetch category budgets whenever displayed month changes
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

  const closeModal = () => {
    setSelectedDay(null);
    setDayTransactions([]);
  };

  // Build day → summary lookup
  const dailyMap: Record<number, DailySummary> = {};
  dailySummary.forEach(d => { dailyMap[d.day] = d; });

  // Obligations for the displayed month
  const monthObligations = obligations.filter(o => {
    const d = new Date(o.expected_date);
    return d.getFullYear() === selectedYear && d.getMonth() === selectedMonth;
  });

  // Calendar grid
  const firstDayOfMonth = new Date(selectedYear, selectedMonth, 1).getDay();
  const daysInMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate();
  const calendarCells: (number | null)[] = [
    ...Array(firstDayOfMonth).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  while (calendarCells.length % 7 !== 0) calendarCells.push(null);

  const today = now.getDate();
  const isCurrentMonthView = selectedYear === now.getFullYear() && selectedMonth === now.getMonth();

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

      <IonContent fullscreen>
        <div className="pb-24">
          {/* Month Navigation */}
          <div className="flex items-center justify-between px-5 py-3 bg-white border-b border-gray-100">
            <button
              onClick={handlePrevMonth}
              aria-label="Previous month"
              className="w-11 h-11 flex items-center justify-center active:bg-gray-100 rounded-full"
            >
              <IonIcon icon={chevronBackOutline} className="text-gray-600" />
            </button>
            <span className="text-base font-semibold text-gray-800">
              {MONTH_NAMES[selectedMonth]} {selectedYear}
            </span>
            <button
              onClick={handleNextMonth}
              aria-label="Next month"
              className="w-11 h-11 flex items-center justify-center active:bg-gray-100 rounded-full"
            >
              <IonIcon icon={chevronForwardOutline} className="text-gray-600" />
            </button>
          </div>

          {loading ? (
            <div className="flex items-center justify-center h-40">
              <IonSpinner name="bubbles" />
            </div>
          ) : (
            <>
              {/* ── Calendar Grid ────────────────────────────────── */}
              <div className="px-3 pt-4 pb-3 bg-white">
                {/* Day headers */}
                <div className="grid grid-cols-7 mb-1">
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                    <div key={d} className="text-center text-[10px] text-gray-400 font-medium py-1">{d}</div>
                  ))}
                </div>

                {/* Day cells */}
                <div className="grid grid-cols-7">
                  {calendarCells.map((day, idx) => {
                    if (!day) return <div key={idx} />;
                    const isToday = isCurrentMonthView && day === today;
                    const s = dailyMap[day];
                    const hasIncome = s && s.income > 0;
                    const hasExpense = s && s.expense > 0;
                    const hasBills = s && s.predicted_bills > 0;

                    return (
                      <button
                        key={idx}
                        onClick={() => handleDayTap(day)}
                        className="flex flex-col items-center py-1 active:bg-gray-50 rounded-lg"
                      >
                        <div className={`w-7 h-7 flex items-center justify-center text-xs font-semibold rounded-full
                          ${isToday ? 'bg-primary text-white' : 'text-gray-700'}`}>
                          {day}
                        </div>
                        {(hasIncome || hasExpense || hasBills) && (
                          <div className="flex flex-col items-center leading-none mt-0.5">
                            {hasIncome && (
                              <span className="text-[8px] text-green-600 font-medium">{formatCompactCurrency(s!.income)}</span>
                            )}
                            {hasExpense && (
                              <span className="text-[8px] text-red-500 font-medium">{formatCompactCurrency(s!.expense)}</span>
                            )}
                            {hasBills && (
                              <span className="text-[8px] text-amber-500 font-medium">{formatCompactCurrency(s!.predicted_bills)}</span>
                            )}
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Legend */}
                <div className="flex gap-4 mt-3 pt-3 border-t border-gray-100 justify-center">
                  <div className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-green-500" />
                    <span className="text-[10px] text-gray-500">Income</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-red-400" />
                    <span className="text-[10px] text-gray-500">Expense</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-amber-400" />
                    <span className="text-[10px] text-gray-500">Predicted bills</span>
                  </div>
                </div>
              </div>

              {/* ── Category Budget Widget ────────────────────────── */}
              {variableCategories.length > 0 && (
                <div className="px-5 pt-5">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-semibold text-gray-700">Flexible Spending</span>
                    <span className="text-xs font-semibold text-gray-500">
                      {formatCompactCurrency(variableCategories.reduce((s, c) => s + c.current_actual, 0))}
                      {' / '}
                      {formatCompactCurrency(variableCategories.reduce((s, c) => s + c.avg_last_3_months, 0))}
                    </span>
                  </div>

                  {/* Variable categories — progress bars */}
                  {variableCategories.length > 0 && (
                    <div>
                      <div className="flex flex-col gap-3 border border-gray-200 rounded-xl py-3">
                        {variableCategories.map(cat => {
                          const hasHistory = cat.avg_last_3_months > 0;
                          const barPct = hasHistory
                            ? Math.min((cat.current_actual / cat.avg_last_3_months) * 100, 100)
                            : 0;
                          const isOver = cat.over_budget && cat.over_amount > 0;

                          return (
                            <div
                              key={cat.category_id ?? cat.category_name}
                              className="bg-white rounded-xl px-4 py-1"
                            >
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-medium text-gray-800">{cat.category_name}</span>
                                <span className="text-xs font-semibold text-gray-800">
                                  {formatCompactCurrency(cat.current_actual)} {hasHistory ? `/ ${formatCompactCurrency(cat.avg_last_3_months)}` : ``}
                                </span>
                              </div>

                              {hasHistory ? (
                                <>
                                  <div className="relative h-2 bg-gray-100 rounded-full overflow-hidden">
                                    <div
                                      className={`h-full rounded-full transition-all duration-500 ${isOver ? 'bg-red-400' : 'bg-emerald-400'}`}
                                      style={{ width: `${barPct}%` }}
                                    />
                                  </div>
                                </>
                              ) : (
                                <div className="text-[10px] text-gray-400">No history yet</div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* ── Bills List ───────────────────────────────────── */}
              <div className="px-5 pt-5">
                <div className="text-sm font-semibold text-gray-700 mb-3">
                  {monthObligations.length === 0
                    ? 'No bills detected for this month'
                    : `Bills — ${MONTH_NAMES[selectedMonth]}`}
                </div>

                {monthObligations.length === 0 ? (
                  <div className="bg-white rounded-xl border border-gray-200 p-6 text-center">
                    <p className="text-gray-400 text-sm">No recurring obligations detected.</p>
                    <p className="text-gray-300 text-xs mt-1">
                      Import transactions and run pattern analysis to detect your bills.
                    </p>
                  </div>
                ) : (
                  <div className="flex flex-col gap-2">
                    {[...monthObligations]
                      .sort((a, b) => new Date(a.expected_date).getTime() - new Date(b.expected_date).getTime())
                      .map(obligation => {
                        const daysUntilDue = patternService.getDaysUntilDue(obligation);
                        const dueText = patternService.getDueText(daysUntilDue, obligation.status);
                        const urgencyBg = patternService.getUrgencyBg(daysUntilDue, obligation.status);
                        const urgencyColor = patternService.getUrgencyColor(daysUntilDue, obligation.status);
                        const amount = patternService.getExpectedAmount(obligation);
                        const dueDate = new Date(obligation.expected_date);
                        const statusIcon =
                          obligation.status === 'FULFILLED' ? checkmarkCircle
                          : obligation.status === 'MISSED' || daysUntilDue < 0 ? alertCircle
                          : timeOutline;
                        const statusIconColor =
                          obligation.status === 'FULFILLED' ? 'text-green-500'
                          : daysUntilDue < 0 ? 'text-red-500'
                          : daysUntilDue <= 3 ? 'text-amber-500' : 'text-gray-400';

                        return (
                          <div
                            key={obligation.id}
                            className={`flex items-center justify-between rounded-xl border p-3 ${urgencyBg}`}
                          >
                            <div className="flex items-center gap-3">
                              <div className={`w-9 h-9 rounded-full bg-white border flex items-center justify-center ${urgencyBg}`}>
                                <IonIcon icon={statusIcon} className={`text-lg ${statusIconColor}`} />
                              </div>
                              <div>
                                <div className="text-sm font-semibold text-gray-800 truncate max-w-[160px]">
                                  {obligation.transactor?.label || obligation.transactor?.name || 'Unknown'}
                                </div>
                                <div className={`text-xs font-medium ${urgencyColor}`}>
                                  {dueDate.getDate()} {SHORT_MONTHS[dueDate.getMonth()]} · {dueText}
                                </div>
                              </div>
                            </div>
                            {amount > 0 && (
                              <div className="text-right">
                                <div className="text-sm font-bold text-gray-800">{formatFullCurrency(amount)}</div>
                                <div className="text-xs text-gray-400 capitalize">{obligation.status.toLowerCase()}</div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* ── Day Modal ─────────────────────────────────────────── */}
        <IonModal isOpen={selectedDay !== null} onDidDismiss={closeModal}>
          <IonHeader className="ion-no-border border-b border-gray-200">
            <IonToolbar>
              <div className="flex items-center justify-between px-4 py-3">
                <span className="text-base font-semibold text-gray-800">
                  {selectedDay} {SHORT_MONTHS[selectedMonth]} {selectedYear}
                </span>
                <button onClick={closeModal} className="p-2 rounded-full active:bg-gray-100">
                  <IonIcon icon={closeOutline} className="text-xl text-gray-600" />
                </button>
              </div>
            </IonToolbar>
          </IonHeader>
          <IonContent>
            <div className="p-5">
              {dayLoading ? (
                <div className="flex items-center justify-center h-32">
                  <IonSpinner name="bubbles" />
                </div>
              ) : dayTransactions.length === 0 ? (
                <div className="text-center text-gray-400 py-10 text-sm">
                  No transactions on this day
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  {dayTransactions.map(tx => {
                    const isExpense = tx.type === 'expense';
                    const isIncome = tx.type === 'income';
                    return (
                      <div
                        key={tx.id ?? tx.transaction_id}
                        className="flex items-center justify-between bg-white rounded-xl border border-gray-200 p-3"
                      >
                        <div className="flex-1 min-w-0 pr-3">
                          <div className="text-sm font-medium text-gray-800 truncate">{tx.description}</div>
                          {tx.category && typeof tx.category === 'object' && (
                            <div className="text-xs text-gray-400 mt-0.5">{tx.category.label}</div>
                          )}
                        </div>
                        <div className={`text-sm font-bold flex-shrink-0 ${isExpense ? 'text-red-500' : isIncome ? 'text-green-600' : 'text-blue-500'}`}>
                          {isExpense ? '-' : '+'}{formatFullCurrency(Math.abs(tx.amount))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </IonContent>
        </IonModal>
      </IonContent>

      <Footer />
    </IonPage>
  );
};

export default Cashflow;

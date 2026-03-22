import { IonPage, IonContent, IonHeader, IonToolbar, IonSpinner, IonIcon } from '@ionic/react';
import { chevronBackOutline, chevronForwardOutline, checkmarkCircle, alertCircle, timeOutline, calendarOutline } from 'ionicons/icons';
import React, { useEffect, useState, useCallback } from 'react';
import Footer from '../components/Footer';
import { patternService, PatternObligation } from '../services/patternService';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const SHORT_MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const BillsCalendar: React.FC = () => {
  const now = new Date();
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth());
  const [obligations, setObligations] = useState<PatternObligation[]>([]);
  const [loading, setLoading] = useState(true);

  const handlePrevMonth = () => {
    if (selectedMonth === 0) { setSelectedMonth(11); setSelectedYear(y => y - 1); }
    else setSelectedMonth(m => m - 1);
  };

  const handleNextMonth = () => {
    if (selectedMonth === 11) { setSelectedMonth(0); setSelectedYear(y => y + 1); }
    else setSelectedMonth(m => m + 1);
  };

  const fetchObligations = useCallback(async () => {
    setLoading(true);
    try {
      // Fetch 60 days ahead to catch next month bills too
      const data = await patternService.getUpcomingObligations(60);
      setObligations(data);
    } catch (err) {
      console.error('Failed to fetch obligations:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchObligations();
  }, [fetchObligations]);

  const formatCurrency = (amount: number) => {
    if (amount >= 1_000) return `₹${(amount / 1_000).toFixed(1)}K`;
    return `₹${Math.round(amount)}`;
  };

  const formatFullCurrency = (amount: number) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);

  // Filter obligations for the selected month
  const monthObligations = obligations.filter(o => {
    const d = new Date(o.expected_date);
    return d.getFullYear() === selectedYear && d.getMonth() === selectedMonth;
  });

  // Group by day
  const byDay: Record<number, PatternObligation[]> = {};
  monthObligations.forEach(o => {
    const day = new Date(o.expected_date).getDate();
    if (!byDay[day]) byDay[day] = [];
    byDay[day].push(o);
  });

  // Build calendar grid
  const firstDayOfMonth = new Date(selectedYear, selectedMonth, 1).getDay(); // 0=Sun
  const daysInMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate();
  const calendarCells: (number | null)[] = [
    ...Array(firstDayOfMonth).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  // Pad to complete last row
  while (calendarCells.length % 7 !== 0) calendarCells.push(null);

  const totalDue = monthObligations
    .filter(o => o.status !== 'FULFILLED')
    .reduce((sum, o) => sum + patternService.getExpectedAmount(o), 0);

  const totalPaid = monthObligations
    .filter(o => o.status === 'FULFILLED')
    .reduce((sum, o) => sum + patternService.getExpectedAmount(o), 0);

  const getDayBg = (day: number) => {
    const bills = byDay[day];
    if (!bills || bills.length === 0) return '';
    const today = now.getDate();
    const isToday = selectedYear === now.getFullYear() && selectedMonth === now.getMonth() && day === today;
    const hasFulfilled = bills.every(b => b.status === 'FULFILLED');
    if (hasFulfilled) return 'bg-green-100 rounded-full';
    const daysUntil = patternService.getDaysUntilDue(bills[0]);
    if (daysUntil < 0) return 'bg-red-100 rounded-full';
    if (daysUntil <= 3) return 'bg-amber-100 rounded-full';
    return 'bg-blue-50 rounded-full';
  };

  const today = now.getDate();
  const isCurrentMonthView = selectedYear === now.getFullYear() && selectedMonth === now.getMonth();

  return (
    <IonPage>
      <IonHeader className="ion-no-border border-b border-gray-200">
        <IonToolbar>
          <div className="flex items-center gap-2 px-4 py-3">
            <IonIcon icon={calendarOutline} className="text-primary text-xl" />
            <span className="text-lg font-bold text-gray-800">Bills Calendar</span>
          </div>
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen>
        <div className="pb-24">
          {/* Month Navigation */}
          <div className="flex items-center justify-between px-5 py-3 bg-white border-b border-gray-100">
            <button onClick={handlePrevMonth} className="w-8 h-8 flex items-center justify-center active:bg-gray-100 rounded-full">
              <IonIcon icon={chevronBackOutline} className="text-gray-600" />
            </button>
            <span className="text-base font-semibold text-gray-800">
              {MONTH_NAMES[selectedMonth]} {selectedYear}
            </span>
            <button onClick={handleNextMonth} className="w-8 h-8 flex items-center justify-center active:bg-gray-100 rounded-full">
              <IonIcon icon={chevronForwardOutline} className="text-gray-600" />
            </button>
          </div>

          {/* Summary Row */}
          {!loading && monthObligations.length > 0 && (
            <div className="flex gap-3 px-5 py-3 bg-white border-b border-gray-100">
              <div className="flex-1 text-center">
                <div className="text-xs text-gray-400">Due this month</div>
                <div className="text-base font-bold text-red-500">{formatFullCurrency(totalDue)}</div>
              </div>
              <div className="w-px bg-gray-200" />
              <div className="flex-1 text-center">
                <div className="text-xs text-gray-400">Paid</div>
                <div className="text-base font-bold text-green-600">{formatFullCurrency(totalPaid)}</div>
              </div>
              <div className="w-px bg-gray-200" />
              <div className="flex-1 text-center">
                <div className="text-xs text-gray-400">Bills</div>
                <div className="text-base font-bold text-gray-700">{monthObligations.length}</div>
              </div>
            </div>
          )}

          {loading ? (
            <div className="flex items-center justify-center h-40">
              <IonSpinner name="bubbles" />
            </div>
          ) : (
            <>
              {/* Calendar Grid */}
              <div className="px-4 pt-4 pb-2 bg-white">
                {/* Day headers */}
                <div className="grid grid-cols-7 mb-2">
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                    <div key={d} className="text-center text-xs text-gray-400 font-medium py-1">{d}</div>
                  ))}
                </div>
                {/* Day cells */}
                <div className="grid grid-cols-7 gap-y-2">
                  {calendarCells.map((day, idx) => {
                    if (!day) return <div key={idx} />;
                    const bills = byDay[day] || [];
                    const isToday = isCurrentMonthView && day === today;
                    return (
                      <div key={idx} className="flex flex-col items-center gap-0.5">
                        <div className={`w-8 h-8 flex items-center justify-center text-sm font-medium
                          ${isToday ? 'bg-primary text-white rounded-full' : ''}
                          ${bills.length > 0 && !isToday ? getDayBg(day) : ''}
                          ${!isToday && bills.length === 0 ? 'text-gray-700' : ''}
                          ${!isToday && bills.length > 0 ? 'text-gray-800' : ''}
                        `}>
                          {day}
                        </div>
                        {bills.length > 0 && (
                          <div className="flex flex-col items-center gap-0.5">
                            {bills.map(b => (
                              <span key={b.id} className="text-[9px] font-medium text-gray-500 leading-tight text-center max-w-[40px] truncate">
                                {formatCurrency(patternService.getExpectedAmount(b))}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Obligations List */}
              <div className="px-5 pt-4">
                <div className="text-sm font-semibold text-gray-700 mb-3">
                  {monthObligations.length === 0
                    ? 'No bills detected for this month'
                    : `All bills — ${MONTH_NAMES[selectedMonth]}`}
                </div>

                {monthObligations.length === 0 ? (
                  <div className="bg-white rounded-xl border border-gray-200 p-6 text-center">
                    <p className="text-gray-400 text-sm">No recurring obligations detected.</p>
                    <p className="text-gray-300 text-xs mt-1">Import transactions and run pattern analysis to detect your bills.</p>
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
                        const statusIcon = obligation.status === 'FULFILLED'
                          ? checkmarkCircle
                          : obligation.status === 'MISSED' || daysUntilDue < 0
                          ? alertCircle
                          : timeOutline;
                        const statusIconColor = obligation.status === 'FULFILLED'
                          ? 'text-green-500'
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
      </IonContent>

      <Footer />
    </IonPage>
  );
};

export default BillsCalendar;

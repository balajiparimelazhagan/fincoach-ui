import React, { useEffect, useState } from 'react';
import { IonIcon } from '@ionic/react';
import { calendarOutline } from 'ionicons/icons';
import { transactionService, Transaction } from '../services/transactionService';
import { PatternObligation, patternService } from '../services/patternService';

interface WeeklyPictureWidgetProps {
  obligations: PatternObligation[];
}

const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const WeeklyPictureWidget: React.FC<WeeklyPictureWidgetProps> = ({ obligations }) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  // Compute current week Mon–Sun
  const today = new Date();
  const dayOfWeek = today.getDay(); // 0 = Sun
  const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  const monday = new Date(today);
  monday.setDate(today.getDate() + mondayOffset);
  monday.setHours(0, 0, 0, 0);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  sunday.setHours(23, 59, 59, 999);

  const dateFrom = monday.toISOString().split('T')[0];
  const dateTo = sunday.toISOString().split('T')[0];

  useEffect(() => {
    transactionService
      .getTransactions({ date_from: dateFrom, date_to: dateTo, type: 'expense', limit: 200 })
      .then(r => setTransactions(r.items))
      .catch(console.error)
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dateFrom, dateTo]);

  const fmt = (n: number) => {
    if (n >= 1000) return `₹${(n / 1000).toFixed(0)}K`;
    return `₹${Math.round(n)}`;
  };

  // Spend per weekday (index 0 = Monday)
  const spendByDay: number[] = Array(7).fill(0);
  transactions.forEach(tx => {
    const d = new Date(tx.date);
    const day = d.getDay(); // 0 = Sun
    const idx = day === 0 ? 6 : day - 1; // Mon=0..Sun=6
    spendByDay[idx] += Math.abs(tx.amount);
  });

  const maxSpend = Math.max(...spendByDay, 1);
  const totalSpend = spendByDay.reduce((a, b) => a + b, 0);

  // Bills due this week
  const billsDueThisWeek = obligations.filter(o => {
    if (o.status !== 'EXPECTED') return false;
    const due = new Date(o.expected_date);
    return due >= monday && due <= sunday;
  });
  const billsDueTotal = billsDueThisWeek.reduce(
    (s, o) => s + patternService.getExpectedAmount(o),
    0
  );

  // Today's weekday index (Mon=0)
  const todayIdx = today.getDay() === 0 ? 6 : today.getDay() - 1;

  // Day of week a bill is due (first soonest one)
  const billDayIdx =
    billsDueThisWeek.length > 0
      ? (() => {
          const d = new Date(billsDueThisWeek[0].expected_date);
          return d.getDay() === 0 ? 6 : d.getDay() - 1;
        })()
      : -1;

  // Format week label
  const weekLabel = `${monday.getDate()} – ${sunday.getDate()} ${sunday.toLocaleString('en-IN', { month: 'short' })}`;

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <IonIcon icon={calendarOutline} className="text-gray-600 text-base" />
          <span className="text-sm font-semibold text-gray-800">This Week</span>
          <span className="text-xs text-gray-400">{weekLabel}</span>
        </div>
      </div>

      {/* Summary line */}
      <div className="flex items-center gap-3 mb-3 text-sm">
        <span className="text-gray-600">
          Spent: <span className="font-bold text-gray-900">{fmt(totalSpend)}</span>
        </span>
        {billsDueTotal > 0 && (
          <>
            <span className="text-gray-300">|</span>
            <span className="text-amber-600">
              Bills due: <span className="font-bold">{fmt(billsDueTotal)}</span>
              {billDayIdx >= 0 && (
                <span className="font-normal text-xs ml-1">({DAY_LABELS[billDayIdx]})</span>
              )}
            </span>
          </>
        )}
      </div>

      {/* Day bars */}
      <div className="grid grid-cols-7 gap-1">
        {DAY_LABELS.map((label, idx) => {
          const spend = spendByDay[idx];
          const barHeight = spend > 0 ? Math.max(8, Math.round((spend / maxSpend) * 48)) : 4;
          const isToday = idx === todayIdx;
          const hasBill = idx === billDayIdx;
          const isFuture = idx > todayIdx;

          return (
            <div key={label} className="flex flex-col items-center gap-1">
              {/* Bar */}
              <div className="flex items-end h-12">
                <div
                  className={`w-5 rounded-t transition-all ${
                    hasBill
                      ? 'bg-amber-400'
                      : isToday
                      ? 'bg-primary'
                      : isFuture
                      ? 'bg-gray-100'
                      : spend > 0
                      ? 'bg-blue-300'
                      : 'bg-gray-100'
                  }`}
                  style={{ height: `${barHeight}px` }}
                />
              </div>
              {/* Amount */}
              <div className="text-center" style={{ minHeight: '16px' }}>
                {spend > 0 && (
                  <span className="text-[9px] text-gray-500 leading-none">{fmt(spend)}</span>
                )}
                {hasBill && spend === 0 && (
                  <span className="text-[9px] text-amber-500 leading-none">bill</span>
                )}
              </div>
              {/* Day label */}
              <span
                className={`text-[10px] font-medium ${
                  isToday ? 'text-primary' : 'text-gray-400'
                }`}
              >
                {label}
              </span>
            </div>
          );
        })}
      </div>

      {/* Insight line */}
      {!loading && totalSpend > 0 && (
        <div className="mt-3 pt-3 border-t border-gray-100">
          {billsDueTotal > 0 ? (
            <p className="text-xs text-amber-600">
              {billsDueThisWeek[0].transactor?.label || billsDueThisWeek[0].transactor?.name || 'A bill'} of{' '}
              {fmt(patternService.getExpectedAmount(billsDueThisWeek[0]))} is due{' '}
              {billDayIdx >= 0 ? `on ${DAY_LABELS[billDayIdx]}` : 'this week'}.
            </p>
          ) : (
            <p className="text-xs text-gray-400">No bills due this week.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default WeeklyPictureWidget;

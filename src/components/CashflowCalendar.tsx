import React from 'react';
import { DailySummary } from '../services/statsService';
import { formatCompactCurrency } from '../utils/transactionFormatters';

interface CashflowCalendarProps {
  year: number;
  month: number; // 0-indexed
  dailyMap: Record<number, DailySummary>;
  onDayTap: (day: number) => void;
}

const DAY_HEADERS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const CashflowCalendar: React.FC<CashflowCalendarProps> = ({ year, month, dailyMap, onDayTap }) => {
  const now = new Date();
  const today = now.getDate();
  const isCurrentMonthView = year === now.getFullYear() && month === now.getMonth();

  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const calendarCells: (number | null)[] = [
    ...Array(firstDayOfMonth).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  while (calendarCells.length % 7 !== 0) calendarCells.push(null);

  return (
    <div className="pt-4 pb-3 bg-white rounded-xl mx-3 mt-2 border border-gray-200">
      {/* Day headers */}
      <div className="grid grid-cols-7 mb-1">
        {DAY_HEADERS.map(d => (
          <div key={d} className="text-center text-[10px] text-gray-400 font-medium py-1">{d}</div>
        ))}
      </div>

      {/* Day cells */}
      <div className="grid grid-cols-7">
        {calendarCells.map((day, idx) => {
          if (!day) return <div key={idx} />;
          const isToday = isCurrentMonthView && day === today;
          const s = dailyMap[day];
          const hasIncome  = s && s.income > 0;
          const hasExpense = s && s.expense > 0;
          const hasBills   = s && s.predicted_bills > 0;

          return (
            <button
              key={idx}
              onClick={() => onDayTap(day)}
              className="flex flex-col items-center py-1 active:bg-gray-50 rounded-lg"
            >
              <div className={`w-7 h-7 flex items-center justify-center text-xs font-semibold rounded-full
                ${isToday ? 'bg-primary text-white' : 'text-gray-700'}`}>
                {day}
              </div>
              {(hasIncome || hasExpense || hasBills) && (
                <div className="flex flex-col items-center leading-none mt-0.5">
                  {hasIncome  && <span className="text-[8px] text-green-600 font-medium">{formatCompactCurrency(s!.income)}</span>}
                  {hasExpense && <span className="text-[8px] text-red-500 font-medium">{formatCompactCurrency(s!.expense)}</span>}
                  {hasBills   && <span className="text-[8px] text-amber-500 font-medium">{formatCompactCurrency(s!.predicted_bills)}</span>}
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
  );
};

export default CashflowCalendar;

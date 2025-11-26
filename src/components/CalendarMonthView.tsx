import React from 'react';
import { IonIcon } from '@ionic/react';
import { ellipseOutline } from 'ionicons/icons';

interface DayCell {
  date: number | string; // number for day, or blank for empty cell
  income?: number;
  expense?: number;
  highlight?: boolean; // for event/selection
}

const sampleMonth: DayCell[] = [
  // First row (Mon-Sun) - this sample assumes first day of the month falls on Monday;
  // blank days would be '' if month starts later in the week.
  { date: 30, income: 2300, expense: -1200 }, { date: 31, income: 2400, expense: -2100 }, { date: 1, income: 2900, expense: -2600 }, { date: 2, income: 2000, expense: -1200 }, { date: 3, income: 2100, expense: -2200 }, { date: 4, income: 2600, expense: -1800 }, { date: 5, income: 2450, expense: -900 },
  // Row 2
  { date: 6, income: 2400, expense: -2000 }, { date: 7, income: 2000, expense: -1200 }, { date: 8, income: 2600, expense: -900 }, { date: 9, income: 1000, expense: -200 }, { date: 10, income: 2400, expense: -2500 }, { date: 11, income: 2450, expense: -900 }, { date: 12, income: 800, expense: -1200 },
  // Row 3
  { date: 13, income: 2000, expense: -1600 }, { date: 14, income: 2600, expense: -2300 }, { date: 15, income: 2900, expense: -1800 }, { date: 16, income: 2400, expense: -3000 }, { date: 17, income: 2000, expense: -2100 }, { date: 18, income: 2600, expense: -2200 }, { date: 19, income: 2450, expense: -900 },
  // Row 4
  { date: 20, income: 2400, expense: -2000 }, { date: 21, income: 2000, expense: -1200 }, { date: 22, income: 2600, expense: -900 }, { date: 23, income: 1000, expense: -200 }, { date: 24, income: 2400, expense: -2500 }, { date: 25, income: 2450, expense: -900 }, { date: 26, income: 800, expense: -1200 },
  // Row 5
  { date: 27, income: 2000, expense: -1600 }, { date: 28, income: 2600, expense: -2300 }, { date: 29, income: 2900, expense: -1800 }, { date: 30, income: 2400, expense: -3000 }, { date: 31, income: 2000, expense: -2100 }, { date: 1, income: 2600, expense: -2200 }, { date: 2, income: 2450, expense: -900 },
];

const CalendarMonthView: React.FC = () => {
  const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const columns = weekDays.length;
  const cellWidth = 72; // px - fixed column width so grid doesn't shrink
  const gapPx = 12; // spacing between cells
  const minGridWidth = columns * (cellWidth + gapPx);

  return (
    <div className="bg-white rounded-xl p-4 mt-4 shadow-sm">
      <div className="mb-3">
        <div className="flex items-center justify-between">
          <div className="text-sm font-semibold text-gray-800">Month View</div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <div style={{ minWidth: `${minGridWidth}px`, paddingBottom: 4 }}>
          <div className="grid grid-cols-7 gap-3">
        {weekDays.map((wd) => (
          <div key={wd} className="text-xs font-medium text-gray-400 text-center">{wd}</div>
        ))}

        {sampleMonth.map((d, idx) => (
          <div key={`${d.date}-${idx}`} className="p-2 bg-white rounded-lg border border-gray-100 shadow-sm relative flex flex-col gap-1 items-center text-center" style={{ minWidth: `${cellWidth}px`, width: `${cellWidth}px`, minHeight: 72 }}>
            <div className="flex flex-col items-center gap-0.5">
              <div className={`text-[11px] ${d.income && d.income > 0 ? 'text-green-400' : 'text-gray-300'}`}>{d.income ? `+${Math.round(d.income)}` : ''}</div>
              <div className={`text-[11px] ${d.expense && d.expense < 0 ? 'text-red-400' : 'text-gray-300'}`}>{d.expense ? `${d.expense}` : ''}</div>
            </div>

            <div className="mt-1 text-sm font-semibold text-gray-800">{d.date}</div>
          </div>
        ))}
          </div>
        </div>
      </div>
      </div>
  );
};

export default CalendarMonthView;

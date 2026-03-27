import React from 'react';
import { CategoryBudget } from '../services/statsService';
import { formatCompactCurrency } from '../utils/transactionFormatters';

interface FlexibleSpendingProps {
  categories: CategoryBudget[];
}

const FlexibleSpending: React.FC<FlexibleSpendingProps> = ({ categories }) => {
  if (categories.length === 0) return null;

  const totalActual  = categories.reduce((s, c) => s + c.current_actual, 0);
  const totalAvg     = categories.reduce((s, c) => s + c.avg_last_3_months, 0);

  return (
    <div className="px-5 pt-5">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-semibold text-gray-700">Flexible Spending</span>
        <span className="text-xs font-semibold text-gray-500">
          {formatCompactCurrency(totalActual)} / {formatCompactCurrency(totalAvg)}
        </span>
      </div>

      <div className="flex flex-col gap-3 bg-white border border-gray-200 rounded-xl py-3">
        {categories.map(cat => {
          const hasHistory = cat.avg_last_3_months > 0;
          const barPct     = hasHistory
            ? Math.min((cat.current_actual / cat.avg_last_3_months) * 100, 100)
            : 0;
          const isOver     = cat.over_budget && cat.over_amount > 0;

          return (
            <div
              key={cat.category_id ?? cat.category_name}
              className="bg-white rounded-xl px-4 py-1"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-800">{cat.category_name}</span>
                <span className="text-xs font-semibold text-gray-800">
                  {formatCompactCurrency(cat.current_actual)}
                  {hasHistory ? ` / ${formatCompactCurrency(cat.avg_last_3_months)}` : ''}
                </span>
              </div>

              {hasHistory ? (
                <div className="relative h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${isOver ? 'bg-red-400' : 'bg-emerald-400'}`}
                    style={{ width: `${barPct}%` }}
                  />
                </div>
              ) : (
                <div className="text-[10px] text-gray-400">No history yet</div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default FlexibleSpending;

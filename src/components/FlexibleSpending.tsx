import React, { useState } from 'react';
import { IonIcon } from '@ionic/react';
import { chevronDownOutline, chevronUpOutline } from 'ionicons/icons';
import { CategoryBudget } from '../services/statsService';
import { formatCompactCurrency } from '../utils/transactionFormatters';
import { getCategoryIcon } from '../utils/categoryIconMap';

const VISIBLE_COUNT = 5;

interface FlexibleSpendingProps {
  categories: CategoryBudget[];
}

const FlexibleSpending: React.FC<FlexibleSpendingProps> = ({ categories }) => {
  const [expanded, setExpanded] = useState(false);

  if (categories.length === 0) return null;

  const totalActual = categories.reduce((s, c) => s + c.current_actual, 0);
  const totalAvg = categories.reduce((s, c) => s + c.avg_last_3_months, 0);

  const visible = expanded ? categories : categories.slice(0, VISIBLE_COUNT);
  const hasMore = categories.length > VISIBLE_COUNT;

  return (
    <div className="px-5 pt-5">
      <div className="flex items-center justify-between mb-3">
        <span className="text font-semibold text-gray-700">Flexible Spending</span>
        <span className="text font-semibold text-gray-500">
          {formatCompactCurrency(totalActual)} / {formatCompactCurrency(totalAvg)}
        </span>
      </div>

      <div className="flex flex-col bg-white border border-gray-200 rounded-xl overflow-hidden">
        {visible.map((cat, idx) => {
          const hasHistory = cat.avg_last_3_months > 0;
          const barPct = hasHistory
            ? Math.min((cat.current_actual / cat.avg_last_3_months) * 100, 100)
            : 0;
          const isOver = cat.over_budget && cat.over_amount > 0;

          return (
            <div
              key={cat.category_id ?? cat.category_name}
              className={`px-4 py-3 ${idx < visible.length - 1 ? 'border-b border-gray-100' : ''}`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <IonIcon
                    icon={getCategoryIcon(cat.category_name)}
                    className="text-base text-gray-400 flex-shrink-0"
                  />
                  <span className="text-sm font-medium text-gray-800">{cat.category_name}</span>
                </div>
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

        {hasMore && (
          <button
            className="flex items-center justify-center gap-1.5 py-2! text-xs font-semibold text-primary border-t! border-gray-200! active:bg-gray-50"
            onClick={() => setExpanded(e => !e)}
          >
            <IonIcon icon={expanded ? chevronUpOutline : chevronDownOutline} className="text-sm" />
            {expanded ? 'Show less' : `Show all ${categories.length} categories`}
          </button>
        )}
      </div>
    </div>
  );
};

export default FlexibleSpending;

import React from 'react';
import { IonIcon } from '@ionic/react';
import { trendingUpOutline, trendingDownOutline, walletOutline } from 'ionicons/icons';

interface MonthSummaryCardProps {
  income: number;
  expense: number;
  month: string; // e.g. "March 2026"
  projectedIncome?: number;
  projectedExpense?: number;
}

const MonthSummaryCard: React.FC<MonthSummaryCardProps> = ({
  income,
  expense,
  month,
  projectedIncome = 0,
  projectedExpense = 0,
}) => {
  const balance = income - expense;
  const spentPercent = income > 0 ? Math.min(100, Math.round((expense / income) * 100)) : 0;

  // What fraction of total expected income is still to come (0–100)
  const projectedIncomePercent =
    projectedIncome > 0
      ? Math.min(100, Math.round((income / (income + projectedIncome)) * 100))
      : 0;

  // What fraction of total expected expense is still to come (0–100)
  const projectedExpensePercent =
    projectedExpense > 0
      ? Math.min(100, Math.round((expense / (expense + projectedExpense)) * 100))
      : 0;

  const fmt = (n: number) =>
    new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(n);

  const barColor = (pct: number) =>
    pct >= 90 ? 'bg-red-500' : pct >= 70 ? 'bg-amber-500' : 'bg-primary';

  const progressColor = barColor(spentPercent);

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">
        {month} — Overview
      </div>

      {/* Three figures */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-1">
            <IonIcon icon={trendingUpOutline} className="text-green-500 text-xs" />
            <span className="text-xs text-gray-500">Income</span>
          </div>
          <span className="text-base font-bold text-green-600">
            {income > 0 ? `+${fmt(income)}` : '—'}
          </span>
        </div>

        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-1">
            <IonIcon icon={trendingDownOutline} className="text-red-500 text-xs" />
            <span className="text-xs text-gray-500">Expenses</span>
          </div>
          <span className="text-base font-bold text-red-600">
            {expense > 0 ? `-${fmt(expense)}` : '—'}
          </span>
        </div>

        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-1">
            <IonIcon icon={walletOutline} className="text-blue-500 text-xs" />
            <span className="text-xs text-gray-500">Balance</span>
          </div>
          <span className={`text-base font-bold ${balance >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
            {income > 0 ? fmt(balance) : '—'}
          </span>
        </div>
      </div>

      {/* Spending progress bar */}
      {income > 0 && (
        <div>
          <div className="w-full bg-gray-100 rounded-full h-2 mb-1.5">
            <div
              className={`h-2 rounded-full transition-all ${progressColor}`}
              style={{ width: `${spentPercent}%` }}
            />
          </div>
          <div className="flex justify-between items-center">
            <span className="text-xs text-gray-400">
              {spentPercent}% of income spent so far
            </span>
            {spentPercent >= 90 && (
              <span className="text-xs font-semibold text-red-500">High</span>
            )}
            {spentPercent >= 70 && spentPercent < 90 && (
              <span className="text-xs font-semibold text-amber-500">Watch out</span>
            )}
          </div>
        </div>
      )}


      {[
        { label: 'Projected income', amount: projectedIncome, pct: projectedIncomePercent, noun: 'income' },
        { label: 'Projected expense', amount: projectedExpense, pct: projectedExpensePercent, noun: 'expense' },
      ].map(({ label, amount, pct, noun }) =>
        amount > 0 ? (
          <React.Fragment key={noun}>
            <div className='uppercase text-xs font-semibold text-gray-400 my-2'>{label}</div>
            <div>
              <div className="w-full bg-gray-100 rounded-full h-2 mb-1.5">
                <div
                  className={`h-2 rounded-full transition-all ${barColor(pct)}`}
                  style={{ width: `${pct}%` }}
                />
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-400">{fmt(amount)} of {noun} yet to come</span>
              </div>
            </div>
          </React.Fragment>
        ) : null
      )}

      {/* Empty state */}
      {income === 0 && expense === 0 && (
        <p className="text-xs text-gray-400 text-center py-2">
          No transactions yet. Import from Gmail to get started.
        </p>
      )}
    </div>
  );
};

export default MonthSummaryCard;

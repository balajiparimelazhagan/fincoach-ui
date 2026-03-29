import React from 'react';
import { useHistory } from 'react-router-dom';
import { PatternObligation, patternService } from '../services/patternService';

interface UpcomingBillsListProps {
  obligations: PatternObligation[];
}

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTH_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);

const getDateBadge = (daysUntilDue: number, expectedDate: string): { top: string; bottom?: string; color: string } => {
  if (daysUntilDue < 0) return { top: `${Math.abs(daysUntilDue)}d`, bottom: 'overdue', color: 'bg-red-100 text-red-700' };
  if (daysUntilDue === 0) return { top: 'Today', color: 'bg-amber-100 text-amber-700' };
  if (daysUntilDue === 1) return { top: 'Tmrw', color: 'bg-amber-100 text-amber-700' };
  if (daysUntilDue <= 7) {
    const d = new Date(expectedDate);
    return { top: DAY_NAMES[d.getDay()], bottom: `${d.getDate()}`, color: 'bg-blue-50 text-blue-700' };
  }
  const d = new Date(expectedDate);
  return {
    top: MONTH_SHORT[d.getMonth()],
    bottom: `${d.getDate()}`,
    color: 'bg-gray-100 text-gray-600',
  };
};

const UpcomingBillsList: React.FC<UpcomingBillsListProps> = ({ obligations }) => {
  const history = useHistory();

  // Split: near-term (≤30 days) and far-future (>30 days), both expense only, not fulfilled/cancelled
  const pending = obligations.filter(
    o => o.status !== 'FULFILLED' && o.status !== 'CANCELLED' && o.pattern?.direction === 'expense'
  );

  const nearTerm = pending
    .filter(o => patternService.getDaysUntilDue(o) <= 30)
    .slice(0, 6);

  const farFuture = pending
    .filter(o => patternService.getDaysUntilDue(o) > 30)
    .slice(0, 3);

  if (nearTerm.length === 0 && farFuture.length === 0) return null;

  return (
    <div className="bg-white rounded-2xl overflow-hidden border border-gray-200">
      <div className="px-4 pt-3 pb-2 flex items-center justify-between border-b border-gray-200">
        <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Upcoming</span>
        <button
          className="text-xs text-primary font-medium active:opacity-70"
          onClick={() => history.push('/cashflow')}
        >
          See all
        </button>
      </div>

      <div className="divide-y divide-gray-200 mx-2">
        {nearTerm.filter(o => patternService.getDaysUntilDue(o) > 0).slice(0, 3).map(o => {
          const days = patternService.getDaysUntilDue(o);
          const amount = patternService.getExpectedAmount(o);
          const badge = getDateBadge(days, o.expected_date);
          const name = o.transactor?.label || o.transactor?.name || 'Bill';

          return (
            <div key={o.id} className="px-2 py-3 flex items-center gap-3">
              {/* Date badge */}
              <div className={`w-11 rounded-lg flex flex-col items-center justify-center py-1.5 flex-shrink-0 ${badge.color}`}>
                <span className="text-[11px] font-bold leading-none">{badge.top}</span>
                {badge.bottom && (
                  <span className="text-[10px] leading-none mt-0.5">{badge.bottom}</span>
                )}
              </div>

              {/* Name */}
              <div className="flex flex-col items-start min-w-0">
                <p className="text-sm font-semibold text-gray-800 truncate">{name}</p>
                {o.account && (
                  <p className="text-xs text-gray-400">
                    {o.account.bank_name} ···· {o.account.account_last_four}
                  </p>
                )}
              </div>

              {/* Amount */}
              {amount > 0 && (
                <span className="text-sm font-semibold text-gray-700 flex-shrink-0">
                  {formatCurrency(amount)}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default UpcomingBillsList;

import React from 'react';
import { useHistory } from 'react-router-dom';
import { PatternObligation, patternService } from '../services/patternService';

interface OverdueAlertCardProps {
  obligations: PatternObligation[];
}

const OverdueAlertCard: React.FC<OverdueAlertCardProps> = ({ obligations }) => {
  const history = useHistory();

  const overdue = obligations.filter(o => {
    if (o.status === 'FULFILLED' || o.status === 'CANCELLED') return false;
    return patternService.getDaysUntilDue(o) < 0;
  });

  if (overdue.length === 0) return null;

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);

  return (
    <div className="overflow-hidden">
      {overdue.map(o => {
        const daysOverdue = Math.abs(patternService.getDaysUntilDue(o));
        const amount = patternService.getExpectedAmount(o);
        const name = o.transactor?.label || o.transactor?.name || 'Unknown';
        const isIncome = o.pattern?.direction === 'income';

        return (
          <div
            key={o.id}
            className="bg-red-50 border border-red-300 mb-2 rounded-lg px-4 py-3 flex items-center justify-between active:opacity-80"
            onClick={() => history.push('/cashflow')}
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full flex border-2 border-red-400 items-center justify-center flex-shrink-0">
                <span className="text-red-400 font-bold">!</span>
              </div>
              <div>
                <p className="text-sm font-semibold leading-tight">
                  {isIncome ? 'Not received' : 'Not paid'} · {name}
                </p>
                <p className="text-red-600 text-xs mt-0.5">
                  {daysOverdue} {daysOverdue === 1 ? 'day' : 'days'} overdue
                  {amount > 0 ? ` · ${formatCurrency(amount)}` : ''}
                </p>
              </div>
            </div>
            <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        );
      })}
    </div>
  );
};

export default OverdueAlertCard;

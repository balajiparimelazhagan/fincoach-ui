import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
import { IonIcon } from '@ionic/react';
import { ellipsisVertical } from 'ionicons/icons';
import { PatternObligation, patternService } from '../services/patternService';
import ObligationActionSheet from './ObligationActionSheet';

interface OverdueAlertCardProps {
  obligations: PatternObligation[];
  onRefresh?: () => void;
}

const OverdueAlertCard: React.FC<OverdueAlertCardProps> = ({ obligations, onRefresh }) => {
  const history = useHistory();
  const [selected, setSelected] = useState<PatternObligation | null>(null);

  const overdue = obligations.filter(o => {
    if (o.status === 'FULFILLED' || o.status === 'CANCELLED' || o.status === 'SKIPPED') return false;
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
    <>
      <div className="overflow-hidden">
        {overdue.slice(0, 3).map(o => {
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

              <button
                className="text-red-500 p-1"
                onClick={e => { e.stopPropagation(); setSelected(o); }}
              >
                <IonIcon icon={ellipsisVertical} />
              </button>
            </div>
          );
        })}
      </div>

      <ObligationActionSheet
        obligation={selected}
        onDismiss={() => setSelected(null)}
        onRefresh={onRefresh}
      />
    </>
  );
};

export default OverdueAlertCard;
import React from 'react';
import { IonIcon } from '@ionic/react';
import { receiptOutline, chevronForwardOutline } from 'ionicons/icons';
import { useHistory } from 'react-router-dom';
import { PatternObligation, patternService } from '../services/patternService';

interface FamilyBillsSummaryWidgetProps {
  obligations: PatternObligation[];
}

const FamilyBillsSummaryWidget: React.FC<FamilyBillsSummaryWidgetProps> = ({ obligations }) => {
  const history = useHistory();

  const expenseObligations = obligations.filter(o => o.pattern?.direction === 'expense');

  if (expenseObligations.length === 0) return null;

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);

  const paid = expenseObligations.filter(o => o.status === 'FULFILLED');
  const remaining = expenseObligations.filter(o => o.status === 'EXPECTED');
  const missed = expenseObligations.filter(o => o.status === 'MISSED');

  const paidTotal = paid.reduce((s, o) => s + patternService.getExpectedAmount(o), 0);
  const remainingTotal = remaining.reduce((s, o) => s + patternService.getExpectedAmount(o), 0);
  const missedTotal = missed.reduce((s, o) => s + patternService.getExpectedAmount(o), 0);
  const total = paidTotal + remainingTotal + missedTotal;
  const paidPercent = total > 0 ? Math.round((paidTotal / total) * 100) : 0;

  const soonest = remaining
    .map(o => ({ o, days: patternService.getDaysUntilDue(o) }))
    .filter(({ days }) => days >= 0)
    .sort((a, b) => a.days - b.days)[0];

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <IonIcon icon={receiptOutline} className="text-gray-600 text-base" />
          <span className="text-sm font-semibold text-gray-800">Expense This Month</span>
        </div>
        <button
          onClick={() => history.push('/bills')}
          className="flex items-center gap-0.5 text-xs text-primary font-medium active:opacity-70"
        >
          See all <IonIcon icon={chevronForwardOutline} className="text-xs" />
        </button>
      </div>

      <div className="flex items-start gap-4 mb-3">
        <div>
          <div className="text-xs text-gray-500 mb-0.5">Spent</div>
          <div className="text-base font-bold text-green-600">{formatCurrency(paidTotal)}</div>
        </div>
        <div className="text-gray-300 mt-3">|</div>
        <div>
          <div className="text-xs text-gray-500 mb-0.5">Due</div>
          <div className="text-base font-bold text-gray-800">{formatCurrency(remainingTotal)}</div>
        </div>
        {missed.length > 0 && (
          <>
            <div className="text-gray-300 mt-3">|</div>
            <div>
              <div className="text-xs text-gray-500 mb-0.5">Missed</div>
              <div className="text-base font-bold text-red-600">{formatCurrency(missedTotal)}</div>
            </div>
          </>
        )}
      </div>

      <div className="w-full bg-gray-100 rounded-full h-1.5 mb-1.5">
        <div
          className="bg-green-500 h-1.5 rounded-full"
          style={{ width: `${paidPercent}%` }}
        />
      </div>
      <div className="text-xs text-gray-400 mb-3">{paidPercent}% paid this cycle</div>

      {soonest && (
        <div className={`text-xs font-medium flex items-center gap-1 ${
          soonest.days <= 3 ? 'text-amber-600' : 'text-gray-500'
        }`}>
          <span>Soonest:</span>
          <span className="font-semibold">
            {soonest.o.transactor?.label || soonest.o.transactor?.name}
          </span>
          <span>{formatCurrency(patternService.getExpectedAmount(soonest.o))}</span>
          <span>—</span>
          <span>{patternService.getDueText(soonest.days, soonest.o.status)}</span>
        </div>
      )}
    </div>
  );
};

export default FamilyBillsSummaryWidget;

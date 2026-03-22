import React from 'react';
import { IonIcon } from '@ionic/react';
import { arrowDownCircleOutline, checkmarkCircle, alertCircleOutline, timeOutline } from 'ionicons/icons';
import { PatternObligation, patternService } from '../services/patternService';

interface RentalIncomeWidgetProps {
  obligations: PatternObligation[];
}

const RentalIncomeWidget: React.FC<RentalIncomeWidgetProps> = ({ obligations }) => {
  const incomeObligations = obligations.filter(o => o.pattern?.direction === 'income');

  if (incomeObligations.length === 0) return null;

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);

  return (
    <div className="flex flex-col gap-2">
      <span className="text-sm font-semibold text-gray-800 px-1">Expected Income</span>
      {incomeObligations.map(obligation => {
        const name = obligation.transactor?.label || obligation.transactor?.name || 'Income';
        const amount = patternService.getExpectedAmount(obligation);
        const daysUntilDue = patternService.getDaysUntilDue(obligation);
        const isFulfilled = obligation.status === 'FULFILLED';
        const isMissed = obligation.status === 'MISSED';
        const isOverdue = !isFulfilled && !isMissed && daysUntilDue < 0;

        const bgClass = isFulfilled
          ? 'bg-green-50 border-green-200'
          : isMissed || isOverdue
          ? 'bg-red-50 border-red-200'
          : daysUntilDue <= 3
          ? 'bg-amber-50 border-amber-200'
          : 'bg-white border-gray-200';

        const amountColorClass = isFulfilled ? 'text-green-600' : 'text-blue-600';

        const statusIcon = isFulfilled
          ? checkmarkCircle
          : isMissed || isOverdue
          ? alertCircleOutline
          : timeOutline;

        const statusIconColor = isFulfilled
          ? 'text-green-500'
          : isMissed || isOverdue
          ? 'text-red-500'
          : 'text-gray-400';

        const dueText = isFulfilled
          ? 'Received ✓'
          : isMissed
          ? 'Missed'
          : isOverdue
          ? `Expected ${Math.abs(daysUntilDue)} day${Math.abs(daysUntilDue) !== 1 ? 's' : ''} ago`
          : patternService.getDueText(daysUntilDue, obligation.status);

        return (
          <div
            key={obligation.id}
            className={`flex items-center justify-between rounded-xl border p-3 ${bgClass}`}
          >
            <div className="flex items-center gap-3">
              <div className={`w-9 h-9 rounded-full flex items-center justify-center ${
                isFulfilled ? 'bg-green-100' : 'bg-blue-50'
              }`}>
                <IonIcon icon={arrowDownCircleOutline} className={`text-lg ${
                  isFulfilled ? 'text-green-600' : 'text-blue-600'
                }`} />
              </div>
              <div>
                <div className="text-sm font-semibold text-gray-800">{name}</div>
                <div className={`text-xs font-medium flex items-center gap-1 ${
                  isFulfilled ? 'text-green-600' : isMissed || isOverdue ? 'text-red-600' : 'text-gray-500'
                }`}>
                  <IonIcon icon={statusIcon} className={`text-xs ${statusIconColor}`} />
                  {dueText}
                </div>
              </div>
            </div>
            {amount > 0 && (
              <div className="text-right">
                <div className={`text-sm font-bold ${amountColorClass}`}>
                  +{formatCurrency(amount)}
                </div>
                <div className="text-xs text-gray-400">Expected</div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default RentalIncomeWidget;

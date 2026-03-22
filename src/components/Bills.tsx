import React, { useEffect, useState } from 'react';
import { IonIcon, IonSpinner } from '@ionic/react';
import { receiptOutline, alertCircleOutline, checkmarkCircleOutline, timeOutline } from 'ionicons/icons';
import { patternService, PatternObligation } from '../services/patternService';

interface BillsProps {
  /** Pass obligations if already fetched by parent; otherwise component fetches its own */
  obligations?: PatternObligation[];
  isLoading?: boolean;
}

const Bills: React.FC<BillsProps> = ({ obligations: propObligations, isLoading: propLoading }) => {
  const [obligations, setObligations] = useState<PatternObligation[]>(propObligations ?? []);
  const [loading, setLoading] = useState(propLoading ?? propObligations === undefined);

  useEffect(() => {
    if (propObligations !== undefined) {
      setObligations(propObligations);
      setLoading(propLoading ?? false);
      return;
    }
    const fetch = async () => {
      try {
        const data = await patternService.getUpcomingObligations(45);
        // Only show expense obligations (bills)
        setObligations(data.filter(o => o.pattern?.direction === 'expense'));
      } catch (err) {
        console.error('Failed to fetch bills:', err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [propObligations, propLoading]);

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);

  const getStatusIcon = (daysUntilDue: number, status: string) => {
    if (status === 'FULFILLED') return checkmarkCircleOutline;
    if (status === 'MISSED' || daysUntilDue < 0) return alertCircleOutline;
    if (daysUntilDue <= 3) return alertCircleOutline;
    return timeOutline;
  };

  const getStatusIconColor = (daysUntilDue: number, status: string) => {
    if (status === 'FULFILLED') return 'text-green-500';
    if (status === 'MISSED' || daysUntilDue < 0) return 'text-red-500';
    if (daysUntilDue <= 3) return 'text-amber-500';
    return 'text-gray-400';
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-4 flex items-center justify-center h-16">
        <IonSpinner name="dots" className="text-gray-400" />
      </div>
    );
  }

  if (obligations.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
        <p className="text-sm text-gray-400">No upcoming bills detected.</p>
        <p className="text-xs text-gray-300 mt-1">Import transactions to detect recurring bills.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {obligations.map(obligation => {
        const daysUntilDue = patternService.getDaysUntilDue(obligation);
        const dueText = patternService.getDueText(daysUntilDue, obligation.status);
        const urgencyBg = patternService.getUrgencyBg(daysUntilDue, obligation.status);
        const urgencyColor = patternService.getUrgencyColor(daysUntilDue, obligation.status);
        const amount = patternService.getExpectedAmount(obligation);
        const statusIcon = getStatusIcon(daysUntilDue, obligation.status);
        const statusIconColor = getStatusIconColor(daysUntilDue, obligation.status);

        return (
          <div
            key={obligation.id}
            className={`flex items-center justify-between rounded-xl border p-3 ${urgencyBg}`}
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center">
                <IonIcon icon={receiptOutline} className="text-gray-600 text-lg" />
              </div>
              <div>
                <div className="text-sm font-semibold text-gray-800 truncate max-w-[160px]">
                  {obligation.transactor?.label || obligation.transactor?.name || 'Unknown'}
                </div>
                <div className={`text-xs font-medium flex items-center gap-1 ${urgencyColor}`}>
                  <IonIcon icon={statusIcon} className={`text-xs ${statusIconColor}`} />
                  {dueText}
                </div>
              </div>
            </div>
            {amount > 0 && (
              <div className="text-right">
                <div className="text-sm font-bold text-gray-800">
                  {formatCurrency(amount)}
                </div>
                {obligation.expected_min_amount !== obligation.expected_max_amount &&
                  obligation.expected_min_amount && obligation.expected_max_amount && (
                  <div className="text-xs text-gray-400">
                    ±{formatCurrency(Math.round((obligation.expected_max_amount - obligation.expected_min_amount) / 2))}
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default Bills;

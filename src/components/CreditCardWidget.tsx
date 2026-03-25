import React, { useEffect, useState } from 'react';
import { IonIcon, IonSpinner } from '@ionic/react';
import { cardOutline, alertCircleOutline } from 'ionicons/icons';
import { accountService } from '../services/accountService';
import { patternService, PatternObligation } from '../services/patternService';

interface CreditCardDisplayItem {
  id: string;
  title: string;
  amountDue: number;
  daysUntilDue: number | null;
  dueDateText: string;
  urgencyColor: string;
  urgencyBg: string;
}

interface CreditCardWidgetProps {
  /** Pass obligations if already fetched by parent to avoid duplicate API call */
  obligations?: PatternObligation[];
}

const CreditCardWidget: React.FC<CreditCardWidgetProps> = ({ obligations: propObligations }) => {
  const [cards, setCards] = useState<CreditCardDisplayItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCreditCards = async () => {
      try {
        const [creditAccounts, obligations] = await Promise.all([
          accountService.getAccountsByType('credit'),
          propObligations !== undefined
            ? Promise.resolve(propObligations)
            : patternService.getUpcomingObligations(60),
        ]);

        if (creditAccounts.length === 0) {
          setCards([]);
          setLoading(false);
          return;
        }

        const displayItems: CreditCardDisplayItem[] = creditAccounts.map(account => {
          // Match obligation by bank name in transactor name
          const matchingObligation = obligations.find(o =>
            o.transactor?.name?.toLowerCase().includes(account.bank_name.toLowerCase()) &&
            o.pattern?.direction === 'expense'
          );

          const amountDue = matchingObligation
            ? patternService.getExpectedAmount(matchingObligation)
            : 0;

          const daysUntilDue = matchingObligation
            ? patternService.getDaysUntilDue(matchingObligation)
            : null;

          return {
            id: account.id,
            title: `${account.bank_name} ••${account.account_last_four}`,
            amountDue,
            daysUntilDue,
            dueDateText: matchingObligation
              ? patternService.getDueText(daysUntilDue!, matchingObligation.status)
              : 'No upcoming bill',
            urgencyColor: matchingObligation
              ? patternService.getUrgencyColor(daysUntilDue!, matchingObligation.status)
              : 'text-gray-400',
            urgencyBg: matchingObligation
              ? patternService.getUrgencyBg(daysUntilDue!, matchingObligation.status)
              : 'bg-white border-gray-200',
          };
        });

        // Only show cards that have an actual obligation (upcoming, paid, or overdue)
        setCards(displayItems.filter(c => c.daysUntilDue !== null));
      } catch (err) {
        console.error('Failed to fetch credit card data:', err);
        setCards([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCreditCards();
  }, [propObligations]);

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);

  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-4 flex items-center justify-center h-20">
        <IonSpinner name="dots" className="text-gray-400" />
      </div>
    );
  }

  if (cards.length === 0) return null;

  return (
    <div className="flex flex-col gap-2">
      <span className="text-sm font-semibold text-gray-800 px-1">Credit Card Bills</span>
      {cards.map(card => (
        <div
          key={card.id}
          className={`flex items-center justify-between rounded-xl border p-3 ${card.urgencyBg}`}
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center">
              <IonIcon icon={cardOutline} className="text-gray-600 text-lg" />
            </div>
            <div>
              <div className="text-sm font-semibold text-gray-800">{card.title}</div>
              <div className={`text-xs font-medium flex items-center gap-1 ${card.urgencyColor}`}>
                {card.daysUntilDue !== null && Math.abs(card.daysUntilDue) <= 3 && (
                  <IonIcon icon={alertCircleOutline} className="text-xs" />
                )}
                {card.dueDateText}
              </div>
            </div>
          </div>
          {card.amountDue > 0 && (
            <div className="text-right">
              <div className="text-sm font-bold text-red-600">{formatCurrency(card.amountDue)}</div>
              <div className="text-xs text-gray-400">Amount due</div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default CreditCardWidget;

import React from 'react';
import { IonIcon } from '@ionic/react';
import { checkmarkCircle, alertCircle, informationCircle, trendingUpOutline } from 'ionicons/icons';
import { PatternObligation, patternService } from '../services/patternService';
import { Transaction } from '../services/transactionService';

interface CheckItem {
  type: 'ok' | 'warning' | 'info';
  text: string;
}

interface MorningCheckWidgetProps {
  obligations: PatternObligation[];
  recentTransactions: Transaction[];
  income: number;
  expense: number;
}

const MorningCheckWidget: React.FC<MorningCheckWidgetProps> = ({
  obligations,
  recentTransactions,
  income,
  expense,
}) => {
  const formatCurrency = (amount: number) => {
    if (amount >= 1_00_000) return `₹${(amount / 1_00_000).toFixed(1)}L`;
    if (amount >= 1_000) return `₹${(amount / 1_000).toFixed(0)}K`;
    return `₹${Math.round(amount)}`;
  };

  const items: CheckItem[] = [];

  // Check income received this month
  if (income > 0) {
    // Large income transactions (salary, rent)
    const largeCredits = recentTransactions.filter(t => t.type === 'income' && t.amount >= 5000);
    if (largeCredits.length > 0) {
      const topCredit = largeCredits[0];
      const name = (topCredit.transactor as any)?.label || (topCredit.transactor as any)?.name || 'Income';
      items.push({ type: 'ok', text: `${name} ${formatCurrency(topCredit.amount)} received` });
    } else {
      items.push({ type: 'ok', text: `${formatCurrency(income)} income this month` });
    }
  }

  // Check obligations due very soon (within 5 days)
  const soonObligations = obligations
    .filter(o => o.status === 'EXPECTED' && o.pattern?.direction === 'expense')
    .map(o => ({ o, days: patternService.getDaysUntilDue(o) }))
    .filter(({ days }) => days >= 0 && days <= 7)
    .sort((a, b) => a.days - b.days);

  soonObligations.forEach(({ o, days }) => {
    const name = o.transactor?.label || o.transactor?.name || 'Bill';
    const amount = patternService.getExpectedAmount(o);
    const dueText = days === 0 ? 'today' : days === 1 ? 'tomorrow' : `in ${days} days`;
    items.push({
      type: days <= 3 ? 'warning' : 'info',
      text: `${name} ${formatCurrency(amount)} due ${dueText}`,
    });
  });

  // Overdue obligations
  const overdueObligations = obligations.filter(
    o => o.status === 'EXPECTED' && patternService.getDaysUntilDue(o) < 0
  );
  overdueObligations.forEach(o => {
    const name = o.transactor?.label || o.transactor?.name || 'Bill';
    const days = Math.abs(patternService.getDaysUntilDue(o));
    items.push({ type: 'warning', text: `${name} overdue by ${days} day${days !== 1 ? 's' : ''}` });
  });

  // Net position summary
  const upcoming7Days = obligations
    .filter(o => o.status === 'EXPECTED')
    .map(o => ({ o, days: patternService.getDaysUntilDue(o) }))
    .filter(({ days }) => days >= 0 && days <= 7)
    .reduce((sum, { o }) => sum + patternService.getExpectedAmount(o), 0);

  if (upcoming7Days > 0 && income > 0) {
    const balance = income - expense;
    if (balance >= upcoming7Days) {
      items.push({
        type: 'ok',
        text: `You need ${formatCurrency(upcoming7Days)} this week — you're covered`,
      });
    } else {
      items.push({
        type: 'warning',
        text: `${formatCurrency(upcoming7Days)} due this week — check your balance`,
      });
    }
  }

  // No data state
  if (items.length === 0) {
    return null;
  }

  const iconMap = {
    ok: { icon: checkmarkCircle, color: 'text-green-500' },
    warning: { icon: alertCircle, color: 'text-amber-500' },
    info: { icon: informationCircle, color: 'text-blue-400' },
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="flex items-center gap-2 px-4 pt-3 pb-2 border-b border-gray-100">
        <IonIcon icon={trendingUpOutline} className="text-primary text-base" />
        <span className="text-sm font-semibold text-gray-800">Today's Picture</span>
      </div>
      <div className="px-4 py-3 flex flex-col gap-2">
        {items.map((item, idx) => {
          const { icon, color } = iconMap[item.type];
          return (
            <div key={idx} className="flex items-start gap-2">
              <IonIcon icon={icon} className={`text-base mt-0.5 flex-shrink-0 ${color}`} />
              <span className="text-sm text-gray-700 leading-snug">{item.text}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MorningCheckWidget;

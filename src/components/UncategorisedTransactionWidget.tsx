import React, { useState } from 'react';
import { IonIcon, IonSpinner } from '@ionic/react';
import { helpCircleOutline, checkmarkOutline, chevronDownOutline } from 'ionicons/icons';
import { Transaction, transactionService } from '../services/transactionService';
import { Category } from '../services/categoryService';

interface UncategorisedTransactionWidgetProps {
  transactions: Transaction[];
  categories: Category[];
  onCategorised: (txId: string) => void;
}

const AMOUNT_THRESHOLD = 5000;

const QUICK_LABELS = [
  'Family transfer',
  "Dad's medical",
  'Loan repayment',
  'Property expense',
  'School fees',
  'Other',
];

const UncategorisedTransactionWidget: React.FC<UncategorisedTransactionWidgetProps> = ({
  transactions,
  categories,
  onCategorised,
}) => {
  const [savingId, setSavingId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const largeTx = transactions.filter(
    t =>
      t.type === 'expense' &&
      Math.abs(t.amount) >= AMOUNT_THRESHOLD &&
      !t.category
  );

  if (largeTx.length === 0) return null;

  const fmt = (n: number) =>
    new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(Math.abs(n));

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
  };

  const handleQuickLabel = async (tx: Transaction, label: string) => {
    const txId = tx.id || tx.transaction_id;
    if (!txId) return;
    setSavingId(txId);
    try {
      await transactionService.updateTransaction(txId, { transactor_label: label });
      onCategorised(txId);
    } catch (err) {
      console.error('Failed to label transaction:', err);
    } finally {
      setSavingId(null);
      setExpandedId(null);
    }
  };

  const handleCategory = async (tx: Transaction, categoryId: string) => {
    const txId = tx.id || tx.transaction_id;
    if (!txId) return;
    setSavingId(txId);
    try {
      await transactionService.updateTransaction(txId, { category_id: categoryId });
      onCategorised(txId);
    } catch (err) {
      console.error('Failed to categorise transaction:', err);
    } finally {
      setSavingId(null);
      setExpandedId(null);
    }
  };

  return (
    <div className="flex flex-col gap-3">
      {largeTx.map(tx => {
        const txId = tx.id || tx.transaction_id || '';
        const name =
          (tx.transactor as any)?.label ||
          (tx.transactor as any)?.name ||
          tx.description ||
          'Unknown';
        const isExpanded = expandedId === txId;
        const isSaving = savingId === txId;

        return (
          <div key={txId} className="bg-amber-50 border border-amber-200 rounded-xl overflow-hidden">
            <div className="flex items-start gap-3 p-3">
              <div className="w-9 h-9 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                <IonIcon icon={helpCircleOutline} className="text-amber-600 text-lg" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-semibold text-amber-700 mb-0.5">
                  Needs your attention
                </div>
                <div className="text-sm font-semibold text-gray-800 truncate">{name}</div>
                <div className="text-xs text-gray-500">
                  {fmt(tx.amount)} · {formatDate(tx.date)}
                </div>
              </div>
              <button
                onClick={() => setExpandedId(isExpanded ? null : txId)}
                className="flex-shrink-0 p-1"
              >
                <IonIcon
                  icon={chevronDownOutline}
                  className={`text-amber-600 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                />
              </button>
            </div>

            {isExpanded && (
              <div className="px-3 pb-3 border-t border-amber-200 pt-3">
                <div className="text-xs font-semibold text-gray-600 mb-2">What was this for?</div>
                <div className="flex flex-wrap gap-1.5">
                  {QUICK_LABELS.map(label => (
                    <button
                      key={label}
                      onClick={() => handleQuickLabel(tx, label)}
                      disabled={isSaving}
                      className="px-2.5 py-1 rounded-full bg-white border border-amber-300 text-xs font-medium text-gray-700 active:bg-amber-100 disabled:opacity-50 flex items-center gap-1"
                    >
                      {isSaving ? (
                        <IonSpinner name="dots" className="w-3 h-3" />
                      ) : (
                        label
                      )}
                    </button>
                  ))}
                </div>

                {categories.length > 0 && (
                  <>
                    <div className="text-xs font-semibold text-gray-600 mt-2.5 mb-1.5">
                      Or assign a category:
                    </div>
                    <select
                      onChange={e => e.target.value && handleCategory(tx, e.target.value)}
                      disabled={isSaving}
                      className="w-full text-xs text-gray-700 bg-white border border-amber-200 rounded-lg px-2 py-1.5 outline-none"
                    >
                      <option value="">Select category…</option>
                      {categories.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.label}</option>
                      ))}
                    </select>
                  </>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default UncategorisedTransactionWidget;

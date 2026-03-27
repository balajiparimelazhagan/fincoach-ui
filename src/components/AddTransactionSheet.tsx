import React, { useState, useEffect } from 'react';
import { IonModal, IonContent, IonSpinner, IonIcon, IonToast } from '@ionic/react';
import { checkmarkOutline } from 'ionicons/icons';
import { transactionService, CreateTransactionRequest } from '../services/transactionService';
import { accountService, Account } from '../services/accountService';
import { Category } from '../services/categoryService';

interface AddTransactionSheetProps {
  isOpen: boolean;
  onDismiss: () => void;
  onSuccess: () => void;
  categories: Category[];
  enabledAccounts: Set<string>;
}

const TYPE_OPTIONS: { value: 'expense' | 'income' | 'saving'; label: string; active: string }[] = [
  { value: 'expense',  label: 'Expense',           active: 'bg-red-100 text-red-700 border-red-200' },
  { value: 'income',   label: 'Income',            active: 'bg-green-100 text-green-700 border-green-200' },
  { value: 'saving',   label: 'Transfer / Saving', active: 'bg-purple-100 text-purple-700 border-purple-200' },
];

const AMOUNT_COLOR: Record<string, string> = {
  expense: 'text-red-500',
  income:  'text-green-600',
  saving:  'text-purple-600',
};

const AddTransactionSheet: React.FC<AddTransactionSheetProps> = ({
  isOpen,
  onDismiss,
  onSuccess,
  categories,
  enabledAccounts,
}) => {
  const [addLabel, setAddLabel]         = useState('');
  const [addAmount, setAddAmount]       = useState('');
  const [addType, setAddType]           = useState<'expense' | 'income' | 'saving'>('expense');
  const [addCategoryId, setAddCategoryId] = useState('');
  const [addAccountId, setAddAccountId]   = useState('');
  const [addDate, setAddDate]           = useState(new Date().toISOString().split('T')[0]);
  const [addAccounts, setAddAccounts]   = useState<Account[]>([]);
  const [loadingAccounts, setLoadingAccounts] = useState(false);
  const [submitting, setSubmitting]     = useState(false);
  const [toastMsg, setToastMsg]         = useState('');
  const [toastColor, setToastColor]     = useState<'success' | 'danger'>('success');

  // Pre-fill form when sheet opens
  useEffect(() => {
    if (!isOpen) return;
    setAddLabel('');
    setAddAmount('');
    setAddType('expense');
    setAddCategoryId(categories[0]?.id ?? '');
    setAddDate(new Date().toISOString().split('T')[0]);

    if (addAccounts.length === 0) {
      setLoadingAccounts(true);
      accountService.getAccounts({ limit: 50 })
        .then(r => {
          setAddAccounts(r.items);
          const firstEnabled = r.items.find(a => enabledAccounts.has(a.id));
          setAddAccountId(firstEnabled?.id ?? r.items[0]?.id ?? '');
        })
        .catch(console.error)
        .finally(() => setLoadingAccounts(false));
    } else {
      const firstEnabled = addAccounts.find(a => enabledAccounts.has(a.id));
      setAddAccountId(firstEnabled?.id ?? addAccounts[0]?.id ?? '');
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const handleSubmit = async () => {
    const parsedAmount = parseFloat(addAmount.replace(/,/g, ''));
    if (!parsedAmount || parsedAmount <= 0) {
      setToastColor('danger');
      setToastMsg('Please enter a valid amount.');
      return;
    }

    const selectedCategory = categories.find(c => c.id === addCategoryId);
    const description = addLabel.trim() || selectedCategory?.label || addType;

    const payload: CreateTransactionRequest = {
      amount: parsedAmount,
      type: addType,
      description,
      date: addDate,
      category_id: addCategoryId || undefined,
      account_id:  addAccountId  || undefined,
    };

    setSubmitting(true);
    try {
      await transactionService.createTransaction(payload);
      setToastColor('success');
      setToastMsg('Transaction added!');
      onDismiss();
      setTimeout(onSuccess, 400);
    } catch (err) {
      setToastColor('danger');
      const detail = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail;
      setToastMsg(detail ?? 'Failed to add transaction. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <IonModal
        isOpen={isOpen}
        onDidDismiss={onDismiss}
        breakpoints={[0, 1]}
        initialBreakpoint={1}
        handle={true}
      >
        <IonContent className="bg-gray-50">
          <div className="p-5 flex flex-col gap-4 pb-8">

            <div className="flex justify-between items-center">
              {/* Amount — hero field */}
              <div className="p-2">
                <label className="block text-sm font-semibold text-gray-400 mb-1  tracking-wide">Amount (₹)</label>
                <input
                  type="number"
                  inputMode="decimal"
                  placeholder="0"
                  value={addAmount}
                  onChange={e => setAddAmount(e.target.value)}
                  autoFocus
                  className={`text-xs! w-full font-bold! border border-gray-300 rounded-lg py-1.5 px-2 outline-none bg-transparent placeholder-gray-200 ${AMOUNT_COLOR[addType]}`}
                />
              </div>

              {/* Account — pre-filled to current enabled account */}
              <div className="p-2">
                <label className="block text-sm font-semibold text-gray-400 mb-1  tracking-wide">Account</label>
                {loadingAccounts ? (
                  <IonSpinner name="dots" className="w-5 h-5" />
                ) : (
                  <select
                    value={addAccountId}
                    onChange={e => setAddAccountId(e.target.value)}
                    className="w-full text-xs! font-semibold! bg-transparent outline-none border border-gray-300 rounded-lg py-1.5 px-2"
                  >
                    <option value="">Cash / Not linked</option>
                    {addAccounts.map(acc => (
                      <option key={acc.id} value={acc.id}>
                        {acc.bank_name} •••• {acc.account_last_four}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            </div>

            {/* Label */}
            <div className="p-2">
              <label className="block text-sm font-semibold text-gray-400 mb-1  tracking-wide">Label</label>
              <input
                type="text"
                placeholder="e.g. Reliance Digital, Swiggy…"
                value={addLabel}
                onChange={e => setAddLabel(e.target.value)}
                className="w-full text-sm! font-semibold! border border-gray-300 rounded-lg py-1.5 px-2 outline-none bg-transparent placeholder-gray-300"
              />
            </div>

            {/* Type — pre-filled: Expense */}
            <div className="p-2">
              <label className="block text-sm font-semibold text-gray-400 mb-2 tracking-wide">Type</label>
              <div className="flex gap-2 flex-wrap">
                {TYPE_OPTIONS.map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => setAddType(opt.value)}
                    className={`px-3! py-1.5! rounded-lg! border text-xs font-semibold transition-all ${
                      addType === opt.value ? opt.active : 'bg-gray-50 text-gray-500 border-gray-200'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            
            <div className="flex justify-between items-center">
              {/* Category — pre-filled to first category */}
              <div className="p-2">
                <label className="block text-sm font-semibold text-gray-400 mb-1  tracking-wide">Category</label>
                <select
                  value={addCategoryId}
                  onChange={e => setAddCategoryId(e.target.value)}
                  className="w-full text-sm! font-semibold! bg-transparent outline-none border border-gray-300 rounded-lg py-1.5 px-2"
                >
                  <option value="">Uncategorized</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.label}</option>
                  ))}
                </select>
              </div>

              {/* Date — pre-filled to today */}
              <div className="p-2">
                <label className="block text-sm font-semibold text-gray-400 mb-1  tracking-wide">Date</label>
                <input
                  type="date"
                  value={addDate}
                  max={new Date().toISOString().split('T')[0]}
                  onChange={e => setAddDate(e.target.value)}
                  className="w-full text-sm! font-semibold! border border-gray-300 rounded-lg py-1.5 px-2 text-gray-800 bg-transparent outline-none py-1"
                />
              </div>
            </div>

            {/* Save */}
            <button
              onClick={handleSubmit}
              disabled={submitting || !addAmount}
              className="bg-primary text-white rounded-2xl! py-2.5! font-semibold text-sm flex items-center justify-center gap-2 disabled:opacity-40 active:opacity-80"
            >
              {submitting ? (
                <IonSpinner name="dots" className="text-white w-5 h-5" />
              ) : (
                <>
                  <IonIcon icon={checkmarkOutline} className="text-base" />
                  Add Transaction
                </>
              )}
            </button>
          </div>
        </IonContent>
      </IonModal>

      <IonToast
        isOpen={!!toastMsg}
        message={toastMsg}
        duration={2000}
        color={toastColor}
        onDidDismiss={() => setToastMsg('')}
        position="top"
      />
    </>
  );
};

export default AddTransactionSheet;

import React, { useEffect, useState } from 'react';
import {
  IonPage,
  IonContent,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonButton,
  IonIcon,
  IonSpinner,
  IonToast,
} from '@ionic/react';
import { closeOutline, checkmarkOutline } from 'ionicons/icons';
import { useHistory, useLocation } from 'react-router-dom';
import { transactionService, CreateTransactionRequest } from '../services/transactionService';
import { categoryService, Category } from '../services/categoryService';
import { accountService, Account } from '../services/accountService';

const FOR_WHOM_OPTIONS = ['Me', 'Wife', 'Parents', 'Kids', 'Household'];

const TYPE_OPTIONS: { value: 'expense' | 'income' | 'saving'; label: string; color: string }[] = [
  { value: 'expense', label: 'Expense', color: 'bg-red-100 text-red-700 border-red-200' },
  { value: 'income', label: 'Income', color: 'bg-green-100 text-green-700 border-green-200' },
  { value: 'saving', label: 'Transfer / Saving', color: 'bg-purple-100 text-purple-700 border-purple-200' },
];

const AddTransaction: React.FC = () => {
  const history = useHistory();
  const location = useLocation<{ type?: 'expense' | 'income' | 'saving' }>();

  const [amount, setAmount] = useState('');
  const [type, setType] = useState<'expense' | 'income' | 'saving'>(
    location.state?.type ?? 'expense'
  );
  const [categoryId, setCategoryId] = useState('');
  const [accountId, setAccountId] = useState('');
  const [forWhom, setForWhom] = useState('Me');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [note, setNote] = useState('');

  const [categories, setCategories] = useState<Category[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loadingMeta, setLoadingMeta] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [toastMsg, setToastMsg] = useState('');
  const [toastColor, setToastColor] = useState<'success' | 'danger'>('success');

  useEffect(() => {
    Promise.all([
      categoryService.getCategories(),
      accountService.getAccounts({ limit: 50 }).then(r => r.items),
    ])
      .then(([cats, accs]) => {
        setCategories(cats);
        setAccounts(accs);
      })
      .catch(console.error)
      .finally(() => setLoadingMeta(false));
  }, []);

  const handleSubmit = async () => {
    const parsedAmount = parseFloat(amount.replace(/,/g, ''));
    if (!parsedAmount || parsedAmount <= 0) {
      setToastColor('danger');
      setToastMsg('Please enter a valid amount.');
      return;
    }

    const description = note.trim() || `${forWhom !== 'Me' ? `${forWhom} — ` : ''}${
      categories.find(c => c.id === categoryId)?.label ?? type
    }`;

    const payload: CreateTransactionRequest = {
      amount: parsedAmount,
      type,
      description,
      date,
      for_whom: forWhom,
      note: note.trim() || undefined,
      category_id: categoryId || undefined,
      account_id: accountId || undefined,
    };

    setSubmitting(true);
    try {
      await transactionService.createTransaction(payload);
      setToastColor('success');
      setToastMsg('Transaction added!');
      setTimeout(() => history.goBack(), 800);
    } catch (err) {
      setToastColor('danger');
      const detail = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail;
      setToastMsg(detail ?? 'Failed to add transaction. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <IonPage>
      <IonHeader className="ion-no-border">
        <IonToolbar className="bg-white px-2">
          <IonButtons slot="start">
            <IonButton onClick={() => history.goBack()} fill="clear">
              <IonIcon icon={closeOutline} className="text-gray-600 text-2xl" />
            </IonButton>
          </IonButtons>
          <IonTitle className="text-gray-900 font-semibold text-base">Add Transaction</IonTitle>
          <IonButtons slot="end">
            <IonButton
              onClick={handleSubmit}
              disabled={submitting || !amount}
              fill="clear"
              className="font-semibold text-primary"
            >
              {submitting ? <IonSpinner name="dots" className="text-primary w-5 h-5" /> : 'Save'}
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen className="bg-gray-50">
        <div className="p-5 flex flex-col gap-5">

          {/* Amount */}
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">
              Amount (₹)
            </label>
            <input
              type="number"
              inputMode="decimal"
              placeholder="0"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              className="w-full text-3xl font-bold text-gray-900 outline-none bg-transparent placeholder-gray-300"
            />
          </div>

          {/* Transaction Type */}
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <label className="block text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">
              Type
            </label>
            <div className="flex gap-2 flex-wrap">
              {TYPE_OPTIONS.map(opt => (
                <button
                  key={opt.value}
                  onClick={() => setType(opt.value)}
                  className={`px-3 py-1.5 rounded-full border text-xs font-semibold transition-all ${
                    type === opt.value ? opt.color : 'bg-gray-50 text-gray-500 border-gray-200'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* For Whom */}
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <label className="block text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">
              For whom
            </label>
            <div className="flex gap-2 flex-wrap">
              {FOR_WHOM_OPTIONS.map(opt => (
                <button
                  key={opt}
                  onClick={() => setForWhom(opt)}
                  className={`px-3 py-1.5 rounded-full border text-xs font-semibold transition-all ${
                    forWhom === opt
                      ? 'bg-primary/10 text-primary border-primary/30'
                      : 'bg-gray-50 text-gray-500 border-gray-200'
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>

          {/* Category */}
          {!loadingMeta && categories.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">
                Category
              </label>
              <select
                value={categoryId}
                onChange={e => setCategoryId(e.target.value)}
                className="w-full text-sm text-gray-800 bg-transparent outline-none py-1"
              >
                <option value="">Select category (optional)</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.label}</option>
                ))}
              </select>
            </div>
          )}

          {/* Account */}
          {!loadingMeta && accounts.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">
                Paid from
              </label>
              <select
                value={accountId}
                onChange={e => setAccountId(e.target.value)}
                className="w-full text-sm text-gray-800 bg-transparent outline-none py-1"
              >
                <option value="">Cash / Not linked</option>
                {accounts.map(acc => (
                  <option key={acc.id} value={acc.id}>
                    {acc.bank_name} ••{acc.account_last_four} ({acc.type})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Date */}
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">
              Date
            </label>
            <input
              type="date"
              value={date}
              max={new Date().toISOString().split('T')[0]}
              onChange={e => setDate(e.target.value)}
              className="w-full text-sm text-gray-800 bg-transparent outline-none py-1"
            />
          </div>

          {/* Note */}
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">
              Note
            </label>
            <input
              type="text"
              placeholder="e.g. Dad's BP medicine — March"
              value={note}
              onChange={e => setNote(e.target.value)}
              className="w-full text-sm text-gray-800 bg-transparent outline-none py-1 placeholder-gray-300"
            />
          </div>

          {/* Submit */}
          <button
            onClick={handleSubmit}
            disabled={submitting || !amount}
            className="w-full bg-primary text-white rounded-xl py-3.5 font-semibold text-sm flex items-center justify-center gap-2 disabled:opacity-40 active:opacity-80"
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

      <IonToast
        isOpen={!!toastMsg}
        message={toastMsg}
        duration={2000}
        color={toastColor}
        onDidDismiss={() => setToastMsg('')}
        position="top"
      />
    </IonPage>
  );
};

export default AddTransaction;

import React, { useState, useEffect } from 'react';
import { IonModal, IonContent, IonSpinner, IonIcon, IonToast } from '@ionic/react';
import { addOutline } from 'ionicons/icons';
import { budgetService, BudgetSection, CreateCustomBudgetItemRequest } from '../services/budgetService';
import { categoryService, Category } from '../services/categoryService';
import { accountService, Account } from '../services/accountService';

interface AddBudgetItemDrawerProps {
  isOpen: boolean;
  defaultSection?: BudgetSection;
  onDismiss: () => void;
  onSuccess: () => void;
}

const SECTION_OPTIONS: { value: BudgetSection; label: string; color: string }[] = [
  { value: 'income',   label: 'Income',             color: 'bg-green-100 text-green-700 border-green-200' },
  { value: 'bills',    label: 'Bills',               color: 'bg-red-100 text-red-700 border-red-200' },
  { value: 'savings',  label: 'Savings / Invest.',   color: 'bg-blue-100 text-blue-700 border-blue-200' },
  { value: 'flexible', label: 'Flexible',            color: 'bg-amber-100 text-amber-700 border-amber-200' },
];

const ordinal = (n: number) => {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
};

const AddBudgetItemDrawer: React.FC<AddBudgetItemDrawerProps> = ({
  isOpen,
  defaultSection = 'bills',
  onDismiss,
  onSuccess,
}) => {
  const [label, setLabel]         = useState('');
  const [amount, setAmount]       = useState('');
  const [section, setSection]     = useState<BudgetSection>(defaultSection);
  const [dayOfMonth, setDayOfMonth] = useState('');
  const [isFlexible, setIsFlexible] = useState(false);
  const [categoryId, setCategoryId] = useState('');
  const [accountId, setAccountId]   = useState('');

  const [categories, setCategories] = useState<Category[]>([]);
  const [accounts, setAccounts]     = useState<Account[]>([]);
  const [loadingMeta, setLoadingMeta] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [toastMsg, setToastMsg]     = useState('');
  const [toastColor, setToastColor] = useState<'success' | 'danger'>('success');

  // Reset & sync defaultSection when drawer opens
  useEffect(() => {
    if (!isOpen) return;
    setLabel('');
    setAmount('');
    setSection(defaultSection);
    setDayOfMonth('');
    setIsFlexible(false);
    setCategoryId('');
    setAccountId('');

    if (categories.length === 0 || accounts.length === 0) {
      setLoadingMeta(true);
      Promise.all([
        categoryService.getCategories(),
        accountService.getAccounts({ limit: 50 }),
      ])
        .then(([cats, accs]) => {
          setCategories(cats);
          setAccounts(accs.items);
        })
        .catch(console.error)
        .finally(() => setLoadingMeta(false));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const handleSubmit = async () => {
    const parsedAmount = parseFloat(amount.replace(/,/g, ''));
    if (!label.trim()) {
      setToastColor('danger');
      setToastMsg('Please enter a name.');
      return;
    }
    if (!parsedAmount || parsedAmount <= 0) {
      setToastColor('danger');
      setToastMsg('Please enter a valid amount.');
      return;
    }

    const parsedDay = isFlexible ? null : (parseInt(dayOfMonth) || null);

    const payload: CreateCustomBudgetItemRequest = {
      label: label.trim(),
      amount: parsedAmount,
      section,
      day_of_month: parsedDay,
      category_id: categoryId || null,
      account_id:  accountId  || null,
    };

    setSubmitting(true);
    try {
      await budgetService.createCustomItem(payload);
      setToastColor('success');
      setToastMsg('Budget item added!');
      onDismiss();
      setTimeout(onSuccess, 300);
    } catch (err) {
      setToastColor('danger');
      const detail = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail;
      setToastMsg(detail ?? 'Failed to add item. Please try again.');
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
        handle
      >
        <IonContent className="bg-gray-50">
          <div className="p-5 flex flex-col gap-4 pb-10">

            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-0.5">Add Budget Item</p>
            </div>

            {/* Section picker */}
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Section</label>
              <div className="flex gap-2 flex-wrap">
                {SECTION_OPTIONS.map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => setSection(opt.value)}
                    className={`px-3! py-1.5! rounded-lg! border text-xs font-semibold transition-all ${
                      section === opt.value ? opt.color : 'bg-gray-50 text-gray-500 border-gray-200'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Name */}
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Name</label>
              <input
                type="text"
                placeholder="e.g. Mutual Fund SIP, Fuel…"
                value={label}
                onChange={e => setLabel(e.target.value)}
                autoFocus
                className="w-full text-sm font-semibold border border-gray-300 rounded-lg py-1.5 px-2 outline-none bg-white placeholder-gray-300"
              />
            </div>

            {/* Amount + Date row */}
            <div className="flex gap-2">
              <div className="flex-1">
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Amount (₹)</label>
                <input
                  type="number"
                  inputMode="decimal"
                  placeholder="0"
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                  className="w-full text-sm font-bold border border-gray-300 rounded-lg py-1.5 px-2 outline-none bg-white placeholder-gray-200 text-gray-800"
                />
              </div>

              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Date</label>
                  <label className="flex items-center gap-1 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={isFlexible}
                      onChange={e => setIsFlexible(e.target.checked)}
                      className="w-3.5 h-3.5 accent-primary"
                    />
                    <span className="text-xs text-gray-500">Flexible</span>
                  </label>
                </div>
                {isFlexible ? (
                  <div className="text-sm font-semibold text-gray-400 border border-gray-200 rounded-lg py-1.5 px-2 bg-gray-50">
                    Flexible
                  </div>
                ) : (
                  <select
                    value={dayOfMonth}
                    onChange={e => setDayOfMonth(e.target.value)}
                    className="w-full text-sm font-semibold bg-white outline-none border border-gray-300 rounded-lg py-1.5 px-2"
                  >
                    <option value="">— Select day —</option>
                    {Array.from({ length: 28 }, (_, i) => i + 1).map(d => (
                      <option key={d} value={d}>{ordinal(d)} of the month</option>
                    ))}
                  </select>
                )}
              </div>
            </div>

            {/* Category + Account row */}
            {loadingMeta ? (
              <div className="flex justify-center py-2">
                <IonSpinner name="dots" className="w-5 h-5 text-primary" />
              </div>
            ) : (
              <div className="flex gap-2">
                <div className="flex-1">
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Category</label>
                  <select
                    value={categoryId}
                    onChange={e => setCategoryId(e.target.value)}
                    className="w-full text-xs font-semibold bg-white outline-none border border-gray-300 rounded-lg py-1.5 px-2"
                  >
                    <option value="">Uncategorized</option>
                    {categories.map(c => (
                      <option key={c.id} value={c.id}>{c.label}</option>
                    ))}
                  </select>
                </div>
                <div className="flex-1">
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Account</label>
                  <select
                    value={accountId}
                    onChange={e => setAccountId(e.target.value)}
                    className="w-full text-xs font-semibold bg-white outline-none border border-gray-300 rounded-lg py-1.5 px-2"
                  >
                    <option value="">Any</option>
                    {accounts.map(a => (
                      <option key={a.id} value={a.id}>{a.bank_name} ···{a.account_last_four}</option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {/* Submit */}
            <button
              onClick={handleSubmit}
              disabled={submitting || !label || !amount}
              className="bg-primary text-white rounded-2xl! py-2.5! font-semibold text-sm flex items-center justify-center gap-2 disabled:opacity-40 active:opacity-80"
            >
              {submitting ? (
                <IonSpinner name="dots" className="text-white w-5 h-5" />
              ) : (
                <>
                  <IonIcon icon={addOutline} className="text-base" />
                  Add to Budget
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

export default AddBudgetItemDrawer;

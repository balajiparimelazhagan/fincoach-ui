import React, { useState, useEffect } from 'react';
import { IonModal, IonContent, IonSpinner, IonIcon, IonToast } from '@ionic/react';
import { checkmarkOutline, checkmarkCircle, radioButtonOffOutline } from 'ionicons/icons';
import { PatternObligation, patternService } from '../services/patternService';
import { transactionService, Transaction } from '../services/transactionService';
import { accountService, Account } from '../services/accountService';
import { useFulfillObligation } from '../hooks/queries/usePatternQueries';

interface MarkAsPaidDrawerProps {
  obligation: PatternObligation | null;
  onDismiss: () => void;
  onSuccess: (obligationId: string) => void;
}

const fmt = (n: number) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);

const MarkAsPaidDrawer: React.FC<MarkAsPaidDrawerProps> = ({ obligation, onDismiss, onSuccess }) => {
  const fulfillObligation = useFulfillObligation();
  const isOpen = !!obligation;
  const txType = obligation?.pattern?.direction === 'income' ? 'income' : 'expense';
  const transactorName = obligation?.transactor?.label ?? obligation?.transactor?.name ?? 'Payment';

  // Recent transactions for this transactor
  const [recentTxs, setRecentTxs] = useState<Transaction[]>([]);
  const [loadingRecent, setLoadingRecent] = useState(false);
  const [selectedTxId, setSelectedTxId] = useState<string | null>(null);

  // Manual form
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState('');
  const [accountId, setAccountId] = useState('');
  const [isCash, setIsCash] = useState(false);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loadingAccounts, setLoadingAccounts] = useState(false);

  // UI
  const [submitting, setSubmitting] = useState(false);
  const [toastMsg, setToastMsg] = useState('');
  const [toastColor, setToastColor] = useState<'success' | 'danger'>('success');

  // Reset + prefill when obligation changes
  useEffect(() => {
    if (!obligation) return;
    setSelectedTxId(null);
    setAmount(String(patternService.getExpectedAmount(obligation)));
    setDate(new Date().toISOString().split('T')[0]);
    setAccountId(obligation.account?.id ?? '');
    setIsCash(false);
  }, [obligation?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  // Fetch recent transactions for the transactor
  useEffect(() => {
    if (!isOpen || !obligation?.transactor?.id) return;
    setLoadingRecent(true);
    transactionService
      .getTransactions({ transactor_id: obligation.transactor.id, limit: 3 })
      .then(r => setRecentTxs(r.items))
      .catch(console.error)
      .finally(() => setLoadingRecent(false));
  }, [isOpen, obligation?.transactor?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  // Fetch accounts once
  useEffect(() => {
    if (!isOpen || accounts.length > 0) return;
    setLoadingAccounts(true);
    accountService
      .getAccounts({ limit: 50 })
      .then(r => {
        setAccounts(r.items);
        if (!obligation?.account?.id) setAccountId(r.items[0]?.id ?? '');
      })
      .catch(console.error)
      .finally(() => setLoadingAccounts(false));
  }, [isOpen]); // eslint-disable-line react-hooks/exhaustive-deps

  const selectExistingTx = (tx: Transaction) => {
    setSelectedTxId(tx.id === selectedTxId ? null : (tx.id ?? null));
  };

  const handleSubmit = async () => {
    if (!obligation) return;
    setSubmitting(true);
    try {
      let transactionId: string | undefined;

      if (selectedTxId) {
        // Link to existing transaction
        transactionId = selectedTxId;
      } else {
        // Create a new transaction from the form
        const parsed = parseFloat(amount.replace(/,/g, ''));
        if (!parsed || parsed <= 0) {
          setToastColor('danger');
          setToastMsg('Please enter a valid amount.');
          setSubmitting(false);
          return;
        }
        const tx = await transactionService.createTransaction({
          amount: parsed,
          type: txType,
          description: transactorName,
          date,
          account_id: isCash ? undefined : (accountId || undefined),
        });
        transactionId = tx.id;
      }

      await fulfillObligation.mutateAsync({ obligationId: obligation.id, transactionId });
      setToastColor('success');
      setToastMsg('Marked as paid!');
      const fulfilledId = obligation.id;
      onDismiss();
      setTimeout(() => onSuccess(fulfilledId), 400);
    } catch (err) {
      setToastColor('danger');
      const detail = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail;
      setToastMsg(detail ?? 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const canSubmit = !submitting && (!!selectedTxId || !!amount);

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
          <div className="p-5 flex flex-col gap-5 pb-8">

            {/* Header */}
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-0.5">Mark as paid</p>
              <h2 className="text-lg font-bold text-gray-800 truncate">{transactorName}</h2>
            </div>

            {/* ── Section 1: Recent transactions ── */}
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Recent transactions</p>

              {loadingRecent ? (
                <div className="flex justify-center py-3">
                  <IonSpinner name="dots" className="text-primary w-5 h-5" />
                </div>
              ) : recentTxs.length === 0 ? (
                <p className="text-xs text-gray-400 italic">No recent transactions found for {transactorName}.</p>
              ) : (
                <div className="flex flex-col gap-2">
                  {recentTxs.map(tx => {
                    const isSelected = tx.id === selectedTxId;
                    const txDate = new Date(tx.date);
                    const dateStr = `${txDate.getDate()} ${['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][txDate.getMonth()]} ${txDate.getFullYear()}`;
                    return (
                      <button
                        key={tx.id}
                        onClick={() => selectExistingTx(tx)}
                        className={`flex items-center justify-between rounded-xl border p-3 text-left transition-all ${isSelected
                            ? 'border-primary bg-primary/5'
                            : 'border-gray-200 bg-white'
                          }`}
                      >
                        <div className="flex items-center gap-3">
                          <IonIcon
                            icon={isSelected ? checkmarkCircle : radioButtonOffOutline}
                            className={`text-xl shrink-0 ${isSelected ? 'text-primary' : 'text-gray-300'}`}
                          />
                          <div>
                            <p className="text-sm font-semibold text-gray-800">{fmt(tx.amount)}</p>
                            <p className="text-xs text-gray-400">{dateStr}</p>
                          </div>
                        </div>
                        {tx.account && (
                          <p className="text-xs text-gray-400 font-medium">
                            {tx.account.bank_name} ····{tx.account.account_last_four}
                          </p>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Divider */}
            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-gray-200" />
              <span className="text-xs text-gray-400 font-medium">or record manually</span>
              <div className="flex-1 h-px bg-gray-200" />
            </div>

            {/* ── Section 2: Manual form ── */}
            <div className={`flex flex-col gap-4 transition-opacity ${selectedTxId ? 'opacity-40 pointer-events-none' : 'opacity-100'}`}>

              {/* Amount + Date */}
              <div className="flex gap-2">
                <div className="flex-1">
                  <label className="block text-xs font-semibold text-gray-400 mb-1 tracking-wide uppercase">Amount (₹)</label>
                  <input
                    type="number"
                    inputMode="decimal"
                    placeholder="0"
                    value={amount}
                    onChange={e => setAmount(e.target.value)}
                    className={`w-full text-sm font-bold border border-gray-300 rounded-lg py-1.5 px-2 outline-none bg-white placeholder-gray-200 ${txType === 'income' ? 'text-green-600' : 'text-red-500'}`}
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-xs font-semibold text-gray-400 mb-1 tracking-wide uppercase">Date</label>
                  <input
                    type="date"
                    value={date}
                    max={new Date().toISOString().split('T')[0]}
                    onChange={e => setDate(e.target.value)}
                    className="w-full text-sm font-semibold border border-gray-300 rounded-lg py-1.5 px-2 text-gray-800 bg-white outline-none"
                  />
                </div>
              </div>

              {/* Account + Cash toggle */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="text-xs font-semibold text-gray-400 tracking-wide uppercase">Account</label>
                  <label className="flex items-center gap-1.5 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={isCash}
                      onChange={e => setIsCash(e.target.checked)}
                      className="w-4 h-4 accent-primary rounded"
                    />
                    <span className="text-xs font-medium text-gray-500">Cash payment</span>
                  </label>
                </div>
                {loadingAccounts ? (
                  <IonSpinner name="dots" className="w-5 h-5" />
                ) : (
                  <select
                    value={accountId}
                    onChange={e => setAccountId(e.target.value)}
                    disabled={isCash}
                    className={`w-full text-sm font-semibold bg-white outline-none border border-gray-300 rounded-lg py-1.5 px-2 ${isCash ? 'opacity-40' : ''}`}
                  >
                    <option value="">Select account</option>
                    {accounts.map(acc => (
                      <option key={acc.id} value={acc.id}>
                        {acc.bank_name} •••• {acc.account_last_four}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            </div>

            {/* Submit */}
            <button
              onClick={handleSubmit}
              disabled={!canSubmit}
              className="bg-primary text-white rounded-2xl! py-2.5! font-semibold text-sm flex items-center justify-center gap-2 disabled:opacity-40 active:opacity-80"
            >
              {submitting ? (
                <IonSpinner name="dots" className="text-white w-5 h-5" />
              ) : (
                <>
                  <IonIcon icon={checkmarkOutline} className="text-base" />
                  {selectedTxId ? 'Link & Mark as Paid' : 'Record & Mark as Paid'}
                </>
              )}
            </button>

          </div>
        </IonContent>
      </IonModal>

      <IonToast
        isOpen={!!toastMsg}
        message={toastMsg}
        duration={2500}
        color={toastColor}
        onDidDismiss={() => setToastMsg('')}
        position="top"
      />
    </>
  );
};

export default MarkAsPaidDrawer;

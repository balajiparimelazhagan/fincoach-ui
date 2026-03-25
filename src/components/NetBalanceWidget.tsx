import React, { useEffect, useState } from 'react';
import { IonIcon, IonSpinner } from '@ionic/react';
import { walletOutline, cardOutline, saveOutline } from 'ionicons/icons';
import { accountService, AccountWithStats } from '../services/accountService';

const NetBalanceWidget: React.FC = () => {
  const [accounts, setAccounts] = useState<AccountWithStats[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    const dateFrom = firstDay.toISOString().split('T')[0];
    const dateTo = lastDay.toISOString().split('T')[0];

    accountService.getAccountsWithStats(dateFrom, dateTo)
      .then(res => setAccounts(res.items))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(Math.abs(amount));

  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-4 flex items-center justify-center h-16">
        <IonSpinner name="dots" className="text-gray-400" />
      </div>
    );
  }

  if (accounts.length === 0) return null;

  // Net = (savings account net inflow) - (credit card outflow)
  const savingsAccounts = accounts.filter(a => a.type === 'savings' || a.type === 'current');
  const creditAccounts = accounts.filter(a => a.type === 'credit');

  const totalNet =
    savingsAccounts.reduce((sum, a) => sum + (a.income - a.expense), 0) -
    creditAccounts.reduce((sum, a) => sum + a.expense, 0);

  // Only show accounts with non-zero balance
  const visibleAccounts = accounts.filter(a => {
    const balance = a.type === 'credit' ? -(a.expense) : a.income - a.expense;
    return balance !== 0;
  });

  if (visibleAccounts.length === 0) return null;

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      <div className="flex items-center gap-2 mb-3">
        <IonIcon icon={walletOutline} className="text-gray-600 text-base" />
        <span className="text-sm font-semibold text-gray-800">Family Accounts</span>
      </div>

      <div className="flex flex-col gap-2.5">
        {visibleAccounts.map(account => {
          const isCredit = account.type === 'credit';
          const balance = isCredit
            ? -(account.expense)
            : account.income - account.expense;
          const isPositive = balance >= 0;

          return (
            <div key={account.id} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <IonIcon
                  icon={isCredit ? cardOutline : saveOutline}
                  className={`text-sm ${isCredit ? 'text-red-400' : 'text-blue-400'}`}
                />
                <div>
                  <span className="text-xs font-medium text-gray-700">
                    {account.bank_name} ••{account.account_last_four}
                  </span>
                  <span className="ml-1.5 text-xs text-gray-400 capitalize">{account.type}</span>
                </div>
              </div>
              <span className={`text-sm font-semibold ${isPositive ? 'text-gray-800' : 'text-red-600'}`}>
                {isPositive ? '+' : '-'}{formatCurrency(balance)}
              </span>
            </div>
          );
        })}
      </div>

      <div className="mt-3 pt-3 border-t border-gray-100 flex justify-between items-center">
        <span className="text-xs font-semibold text-gray-600">Net Balance</span>
        <span className={`text-base font-bold ${totalNet >= 0 ? 'text-green-600' : 'text-red-600'}`}>
          {totalNet >= 0 ? '+' : '-'}{formatCurrency(totalNet)}
        </span>
      </div>
    </div>
  );
};

export default NetBalanceWidget;

import React from 'react';
import ActivityCard from './ActivityCard';
import { Transaction } from '../services/transactionService';

interface ActivityListProps {
  title: string;
  transactions?: Transaction[];
  isLoading?: boolean;
  isShowingFilter?: boolean;
}

const ActivityList: React.FC<ActivityListProps> = ({ title, transactions = [], isLoading = false, isShowingFilter = true }) => {
  const [filter, setFilter] = React.useState('transactions');

  // Filter transactions based on selected filter
  const filteredTransactions = React.useMemo(() => {
    if (filter === 'transactions') return transactions;
    
    return transactions.filter(t => {
      if (filter === 'incomes') return t.type === 'income';
      if (filter === 'expenses') return t.type === 'expense';
      if (filter === 'savings') return t.type === 'income'; // You can adjust this logic
      return true;
    });
  }, [transactions, filter]);
  // Format date to show "17 Nov" format
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const day = date.getDate();
    const month = date.toLocaleDateString('en-US', { month: 'short' });
    return `${day} ${month}`;
  };

  // Format time to show "5.43" format
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const hours = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}.${minutes}`;
  };

  // Get display amount (positive for income, negative for expense)
  const getDisplayAmount = (transaction: Transaction) => {
    return transaction.type === 'income' ? transaction.amount : -Math.abs(transaction.amount);
  };

  if (isLoading) {
    return (
      <div className="mt-5">
        <div className="mb-3 px-1">
          <span className="text font-semibold text-gray-800">{title} transactions</span>
        </div>
        <div className="flex items-center justify-center p-8 bg-white rounded-xl border border-gray-100">
          <span className="text-sm text-gray-400">Loading...</span>
        </div>
      </div>
    );
  }

  if (!filteredTransactions || filteredTransactions.length === 0) {
    return (
      <div className="mt-5">
        <div className="mb-3 px-1">
          <span className="text font-semibold text-gray-800">{title}</span>
          {isShowingFilter && (
            <select 
            value={filter} 
            onChange={(e) => setFilter(e.target.value)}
            className="text-xs text-primary! border-0 bg-transparent font-semibold! underline-offset-3 underline focus:outline-none focus:ring-0 focus:border-transparent"
          >
            <option value="transactions">transactions</option>
            <option value="savings">savings</option>
            <option value="incomes">incomes</option>
            <option value="expenses">expenses</option>
          </select>
          )}
        </div>
        <div className="flex items-center justify-center p-8 bg-white rounded-xl border border-gray-200">
          <span className="text-sm text-gray-400">No transactions found</span>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-5">
      <div className="mb-3 px-1">
        <span className="text font-semibold text-gray-800">{title}</span>
        {isShowingFilter && (
          <select 
            value={filter} 
            onChange={(e) => setFilter(e.target.value)}
            className="text-xs text-primary! border-0 bg-transparent font-semibold! underline-offset-3 underline focus:outline-none focus:ring-0 focus:border-transparent"
          >
            <option value="transactions">transactions</option>
            <option value="savings">savings</option>
            <option value="incomes">incomes</option>
            <option value="expenses">expenses</option>
          </select>
        )}
      </div>

      <div className="flex flex-col border bg-white border-gray-200 rounded-xl overflow-hidden">
        {filteredTransactions.map((transaction) => (
          <ActivityCard
            key={transaction.id}
            title={transaction.description}
            date={formatDate(transaction.date)}
            amount={getDisplayAmount(transaction)}
            fee={formatTime(transaction.date)}
            avatarUrl={undefined}
          />
        ))}
      </div>
    </div>
  );
};

export default ActivityList;

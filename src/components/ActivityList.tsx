import React from 'react';
import ActivityCard from './ActivityCard';
import { Transaction } from '../services/transactionService';

interface ActivityListProps {
  title: string;
  transactions?: Transaction[];
  isLoading?: boolean;
}

const ActivityList: React.FC<ActivityListProps> = ({ title, transactions = [], isLoading = false }) => {
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
          <span className="text-sm font-semibold text-gray-800">{title}</span>
        </div>
        <div className="flex items-center justify-center p-8 bg-white rounded-xl border border-gray-100">
          <span className="text-sm text-gray-400">Loading...</span>
        </div>
      </div>
    );
  }

  if (!transactions || transactions.length === 0) {
    return (
      <div className="mt-5">
        <div className="mb-3 px-1">
          <span className="text-sm font-semibold text-gray-800">{title}</span>
        </div>
        <div className="flex items-center justify-center p-8 bg-white rounded-xl border border-gray-100">
          <span className="text-sm text-gray-400">No transactions found</span>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-5">
      <div className="mb-3 px-1">
        <span className="text-sm font-semibold text-gray-800">{title}</span>
      </div>

      <div className="flex flex-col border border-gray-100 rounded-xl overflow-hidden">
        {transactions.map((transaction) => (
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

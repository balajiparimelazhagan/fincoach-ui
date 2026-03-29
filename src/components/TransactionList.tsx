import React from 'react';
import TransactionCard from './TransactionCard';
import { Transaction } from '../services/transactionService';

interface TransactionListProps {
  title: string;
  transactions?: Transaction[];
  isLoading?: boolean;
  isShowingFilter?: boolean;
  onTransactionClick?: (transaction: Transaction) => void;
}

const TransactionList: React.FC<TransactionListProps> = ({
  title,
  transactions = [],
  isLoading = false,
  onTransactionClick
}) => {
  const filter = 'transactions';

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

  // Get display amount (positive for income, negative for expense)
  const getDisplayAmount = (transaction: Transaction) => {
    return transaction.type === 'income' ? transaction.amount : -Math.abs(transaction.amount);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8 bg-white rounded-xl border border-gray-100">
        <span className="text-sm text-gray-400">Loading...</span>
      </div>
    );
  }

  if (!filteredTransactions || filteredTransactions.length === 0) {
    return (
      <div className="mt-5">
        <div className="flex items-center justify-center p-8 bg-white rounded-xl border border-gray-200">
          <span className="text-sm text-gray-400">No transactions found</span>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-2 mx-auto flex flex-col overflow-hidden max-w-90 bg-white border-gray-200 rounded-xl border">
      <span className="text-sm font-semibold text-gray-400 border-b border-gray-200 px-3 py-2 uppercase">{title}</span>
      <div className="mt-1 bg-white ">
        {filteredTransactions.map((transaction) => (
          <div
            key={transaction.id}
            onClick={() => onTransactionClick?.(transaction)}
            className="cursor-pointer hover:bg-gray-50 transition-colors"
          >
            <TransactionCard
              title={transaction.transactor?.label || transaction.transactor?.name || transaction.description || 'Unknown'}
              date={formatDate(transaction.date)}
              amount={getDisplayAmount(transaction)}
              avatarUrl={transaction.transactor?.picture}
              category={typeof transaction.category === 'string' ? transaction.category : transaction.category?.label}
              description={transaction.description}
              account={transaction.account ? {
                account_last_four: transaction.account.account_last_four,
                bank_name: transaction.account.bank_name,
                type: transaction.account.type,
              } : undefined}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default TransactionList;

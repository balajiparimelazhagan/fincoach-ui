import React from 'react';
import { Transaction } from '../../services/transactionService';
import { formatCurrency, getAmountColor, getAmountPrefix, formatAccountNumber } from '../../utils/transactionFormatters';

interface TransactionDetailsProps {
  transaction: Transaction;
}

/**
 * Displays transaction amount and account details
 */
export const TransactionDetails: React.FC<TransactionDetailsProps> = ({ transaction }) => {
  return (
    <div className="w-8/12 border-l pl-4 border-gray-300">
      {/* Transaction Amount */}
      <div className={`text-xl font-bold mb-2 ${getAmountColor(transaction.type)}`}>
        {getAmountPrefix(transaction.type)}{formatCurrency(transaction.amount)}
      </div>

      {/* Account Details */}
      <p className="text-xs text-gray-600 mb-1 font-medium">
        {formatAccountNumber(transaction.account?.account_last_four)}
      </p>
      <p className="text-sm text-gray-800 font-semibold">
        {transaction.account?.bank_name || ''}
      </p>
    </div>
  );
};

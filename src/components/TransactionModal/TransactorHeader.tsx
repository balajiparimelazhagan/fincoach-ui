import React from 'react';
import { Transaction } from '../../services/transactionService';

interface TransactorHeaderProps {
  transaction: Transaction;
}

/**
 * Displays transactor picture and name
 */
export const TransactorHeader: React.FC<TransactorHeaderProps> = ({ transaction }) => {
  const transactorName = transaction.transactor?.name || 'Unknown';
  const transactorPicture = transaction.transactor?.picture;
  const initial = transactorName.charAt(0);

  return (
    <>
      {/* Transactor Picture */}
      <div className="w-14 h-14 rounded-full bg-linear-to-br from-primary to-blue-600 flex items-center justify-center mb-2">
        {transactorPicture ? (
          <img
            src={transactorPicture}
            alt={transactorName}
            className="w-full h-full rounded-full object-cover"
          />
        ) : (
          <span className="text-xl font-semibold text-white">
            {initial}
          </span>
        )}
      </div>

      {/* Transactor Name */}
      <p className="text-lg font-semibold text-gray-900 text-center mb-1">
        {transactorName}
      </p>
    </>
  );
};

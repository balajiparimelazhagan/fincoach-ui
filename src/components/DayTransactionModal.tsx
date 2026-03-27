import React from 'react';
import {
  IonModal, IonHeader, IonToolbar, IonContent, IonSpinner, IonIcon,
} from '@ionic/react';
import { closeOutline } from 'ionicons/icons';
import { Transaction } from '../services/transactionService';
import { formatFullCurrency } from '../utils/transactionFormatters';

interface DayTransactionModalProps {
  isOpen: boolean;
  day: number | null;
  month: number; // 0-indexed
  year: number;
  transactions: Transaction[];
  isLoading: boolean;
  onClose: () => void;
}

const SHORT_MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const DayTransactionModal: React.FC<DayTransactionModalProps> = ({
  isOpen, day, month, year, transactions, isLoading, onClose,
}) => {
  return (
    <IonModal isOpen={isOpen} onDidDismiss={onClose}>
      <IonHeader className="ion-no-border border-b border-gray-200">
        <IonToolbar>
          <div className="flex items-center justify-between px-4 py-3">
            <span className="text-base font-semibold text-gray-800">
              {day} {SHORT_MONTHS[month]} {year}
            </span>
            <button onClick={onClose} className="p-2 rounded-full active:bg-gray-100">
              <IonIcon icon={closeOutline} className="text-xl text-gray-600" />
            </button>
          </div>
        </IonToolbar>
      </IonHeader>

      <IonContent>
        <div className="p-5">
          {isLoading ? (
            <div className="flex items-center justify-center h-32">
              <IonSpinner name="bubbles" />
            </div>
          ) : transactions.length === 0 ? (
            <div className="text-center text-gray-400 py-10 text-sm">
              No transactions on this day
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {transactions.map(tx => {
                const isExpense = tx.type === 'expense';
                const isIncome  = tx.type === 'income';
                return (
                  <div
                    key={tx.id ?? tx.transaction_id}
                    className="flex items-center justify-between bg-white rounded-xl border border-gray-200 p-3"
                  >
                    <div className="flex-1 min-w-0 pr-3">
                      <div className="text-sm font-medium text-gray-800 truncate">{tx.description}</div>
                      {tx.category && typeof tx.category === 'object' && (
                        <div className="text-xs text-gray-400 mt-0.5">{tx.category.label}</div>
                      )}
                    </div>
                    <div className={`text-sm font-bold flex-shrink-0 ${isExpense ? 'text-red-500' : isIncome ? 'text-green-600' : 'text-blue-500'}`}>
                      {isExpense ? '-' : '+'}{formatFullCurrency(Math.abs(tx.amount))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </IonContent>
    </IonModal>
  );
};

export default DayTransactionModal;

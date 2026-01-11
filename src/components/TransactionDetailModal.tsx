import React from 'react';
import { IonModal, IonContent, IonInput } from '@ionic/react';
import { Transaction } from '../services/transactionService';
import { useTransactionModal } from '../hooks/useTransactionModal';
import { getCategoryLabel } from '../utils/transactionFormatters';
import { TransactorHeader } from './TransactionModal/TransactorHeader';
import { CategorySelector } from './TransactionModal/CategorySelector';
import { TransactionDetails } from './TransactionModal/TransactionDetails';
import { TransactionActions } from './TransactionModal/TransactionActions';

interface TransactionDetailModalProps {
  isOpen: boolean;
  transaction: Transaction | null;
  onClose: () => void;
  onSave: (
    transactionId: string, 
    updates: { category_id?: string; transactor_label?: string },
    updateScope: 'single' | 'current_and_future' | 'month_only' | 'month_and_future'
  ) => void;
  categories: Array<{ id: string; label: string }>;
}

/**
 * Modal for viewing and editing transaction details
 * Supports bulk updates with different scopes
 */
const TransactionDetailModal: React.FC<TransactionDetailModalProps> = ({
  isOpen,
  transaction,
  onClose,
  onSave,
  categories,
}) => {
  const {
    selectedCategoryId,
    transactorLabel,
    includeFuture,
    hasChanges,
    updateCategory,
    updateTransactorLabel,
    toggleIncludeFuture,
    resetChanges,
    confirmChanges,
    getUpdates,
    getUpdateScope,
  } = useTransactionModal(transaction);

  if (!transaction) return null;

  const handleSave = (buttonType: 'single' | 'month') => {
    if (!transaction.id) return;
    
    const updateScope = getUpdateScope(buttonType);
    const updates = getUpdates();
    
    onSave(transaction.id, updates, updateScope);
    confirmChanges();
  };

  const handleCancel = () => {
    resetChanges();
  };

  const categoryLabel = getCategoryLabel(transaction.category);

  return (
    <IonModal
      isOpen={isOpen}
      onDidDismiss={onClose}
      className="transaction-modal"
      breakpoints={[0, 1]}
      initialBreakpoint={1}
    >
      <IonContent className="ion-padding">
        <div className="relative bg-white">
          {/* Main Content */}
          <div className="flex flex-col items-center pt-6">
            {/* Transactor Header */}
            <TransactorHeader transaction={transaction} />

            {/* Transactor Label Input */}
            <IonInput
              value={transactorLabel}
              onIonInput={(e) => updateTransactorLabel(e.detail.value || '')}
              placeholder="Add label"
              className="w-20! min-h-6! border border-gray-300 rounded-md text-sm! py-0 px-3 mb-4 text-center"
            />

            {/* Source ID */}
            <p className="text-xs text-gray-500 mb-4">
              {transaction.transactor?.source_id || ''}
            </p>

            <div className="w-full flex justify-start ">
              <div className="px-4 py-1 border border-b-0 rounded-lg rounded-b-none border-gray-200 bg-gray-50 text-sm text-primary font-semibold">
                {transaction.date ? new Date(transaction.date).toLocaleDateString() : ''}
              </div>
            </div>

            {/* Category and Transaction Details Container */}
            <div className="w-full flex items-center justify-start border rounded-tl-none border-gray-200 mb-4 py-3 px-2 rounded-lg gap-2">
              <CategorySelector
                categoryLabel={categoryLabel}
                selectedCategoryId={selectedCategoryId}
                categories={categories}
                onCategoryChange={updateCategory}
              />
              <TransactionDetails transaction={transaction} />
            </div>

            {/* Description */}
            <div className="w-full bg-white rounded-lg p-3 mb-2">
              <p className="text-xs text-gray-700 text-center leading-relaxed">
                {transaction.description || ''}
              </p>
            </div>

            {/* Action Buttons - Show only when there are changes */}
            {hasChanges && (
              <TransactionActions
                includeFuture={includeFuture}
                onToggleIncludeFuture={toggleIncludeFuture}
                onSave={handleSave}
                onCancel={handleCancel}
              />
            )}
          </div>
        </div>
      </IonContent>
    </IonModal>
  );
};

export default TransactionDetailModal;

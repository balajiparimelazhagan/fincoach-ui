import React from 'react';
import { IonButton, IonCheckbox } from '@ionic/react';

interface TransactionActionsProps {
  includeFuture: boolean;
  onToggleIncludeFuture: () => void;
  onSave: (buttonType: 'single' | 'month') => void;
  onCancel: () => void;
}

/**
 * Action buttons and controls for transaction updates
 */
export const TransactionActions: React.FC<TransactionActionsProps> = ({
  includeFuture,
  onToggleIncludeFuture,
  onSave,
  onCancel,
}) => {
  return (
    <div className="w-full bg-white rounded-lg p-3">
      <div className="flex flex-col items-start gap-2">
        {/* Include Future Checkbox */}
        <div className="flex items-center justify-start mb-1">
          <IonCheckbox
            checked={includeFuture}
            onIonChange={onToggleIncludeFuture}
            className="mr-2"
          />
          <label 
            className="text-xs font-semibold text-primary cursor-pointer" 
            onClick={onToggleIncludeFuture}
          >
            Include future transactions
          </label>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-center gap-3">
          <IonButton
            onClick={() => onSave('single')}
            fill="solid"
          >
            Save
          </IonButton>
          <IonButton
            onClick={() => onSave('month')}
            fill="solid"
          >
            This month
          </IonButton>
          <IonButton
            onClick={onCancel}
            className="secondary-btn"
            fill="solid"
          >
            Cancel
          </IonButton>
        </div>
      </div>
    </div>
  );
};

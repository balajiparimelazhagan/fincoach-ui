import React from 'react';
import { IonIcon } from '@ionic/react';
import { addCircleOutline, checkmarkDoneOutline, swapHorizontalOutline, cloudDownloadOutline } from 'ionicons/icons';
import { useHistory } from 'react-router-dom';

interface QuickAction {
  id: string;
  label: string;
  icon: string;
  color: string;
  bg: string;
  onClick: () => void;
}

interface QuickActionsWidgetProps {
  onSyncGmail?: () => void;
  onAddExpense?: () => void;
  onMarkBillPaid?: () => void;
  onAddTransfer?: () => void;
}

const QuickActionsWidget: React.FC<QuickActionsWidgetProps> = ({
  onSyncGmail,
  onAddExpense,
  onMarkBillPaid,
  onAddTransfer,
}) => {
  const history = useHistory();

  const actions: QuickAction[] = [
    {
      id: 'add-expense',
      label: 'Add Expense',
      icon: addCircleOutline,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
      onClick: onAddExpense || (() => {}),
    },
    {
      id: 'mark-paid',
      label: 'Mark Bill Paid',
      icon: checkmarkDoneOutline,
      color: 'text-green-600',
      bg: 'bg-green-50',
      onClick: onMarkBillPaid || (() => history.push('/bills')),
    },
    {
      id: 'add-transfer',
      label: 'Add Transfer',
      icon: swapHorizontalOutline,
      color: 'text-purple-600',
      bg: 'bg-purple-50',
      onClick: onAddTransfer || (() => {}),
    },
    {
      id: 'sync-gmail',
      label: 'Sync Gmail',
      icon: cloudDownloadOutline,
      color: 'text-orange-600',
      bg: 'bg-orange-50',
      onClick: onSyncGmail || (() => {}),
    },
  ];

  return (
    <div className="grid grid-cols-4 gap-2">
      {actions.map(action => (
        <button
          key={action.id}
          onClick={action.onClick}
          className={`flex flex-col items-center gap-1.5 rounded-xl p-3 ${action.bg} active:opacity-70 transition-opacity`}
        >
          <IonIcon icon={action.icon} className={`text-2xl ${action.color}`} />
          <span className="text-xs font-medium text-gray-700 text-center leading-tight">
            {action.label}
          </span>
        </button>
      ))}
    </div>
  );
};

export default QuickActionsWidget;

import React from 'react';
import { IonIcon } from '@ionic/react';
import { eyeOutline, eyeOffOutline } from 'ionicons/icons';
import { DashboardPreferences } from '../services/userService';

interface PreferenceToggleProps {
  label: string;
  checked: boolean;
  onToggle: (checked: boolean) => void;
  disabled?: boolean;
}

export const PreferenceToggle: React.FC<PreferenceToggleProps> = ({
  label,
  checked,
  onToggle,
  disabled = false
}) => {
  return (
    <div className="flex items-center justify-between py-3 border-b border-gray-200">
      <div className="flex-1 pr-4">
        <div className="font-medium text-sm text-gray-900">{label}</div>
      </div>
      <button
        onClick={() => !disabled && onToggle(!checked)}
        disabled={disabled}
        className={`p-1 rounded-md transition-colors ${
          disabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-100'
        }`}
      >
        <IonIcon
          icon={checked ? eyeOutline : eyeOffOutline}
          className={`text-2xl ${checked ? 'text-primary' : 'text-gray-400'}`}
        />
      </button>
    </div>
  );
};

interface DashboardPreferencesPanelProps {
  preferences: DashboardPreferences;
  onPreferenceChange: (key: keyof DashboardPreferences, value: boolean) => void;
  disabled?: boolean;
}

export const DashboardPreferencesPanel: React.FC<DashboardPreferencesPanelProps> = ({
  preferences,
  onPreferenceChange,
  disabled = false
}) => {
  const preferenceConfig = [
    {
      key: 'show_income_expense' as keyof DashboardPreferences,
      label: 'Charts',
    },
    {
      key: 'show_ai_suggestions' as keyof DashboardPreferences,
      label: 'Top Picks',
    },
    {
      key: 'show_budget_summary' as keyof DashboardPreferences,
      label: 'Budget review',
    },
    {
      key: 'show_transaction_list' as keyof DashboardPreferences,
      label: 'Recent Transactions',
    },
    {
      key: 'show_category_breakdown' as keyof DashboardPreferences,
      label: 'Category Breakdown',
    }
  ];

  return (
    <div className="bg-white rounded-lg p-2 border border-gray-200">
      <p className="font-semibold mb-2">Dashboard</p>
      <div>
        {preferenceConfig.map(({ key, label }) => (
          <PreferenceToggle
            key={key}
            label={label}
            checked={preferences[key]}
            onToggle={(checked) => onPreferenceChange(key, checked)}
            disabled={disabled}
          />
        ))}
      </div>
    </div>
  );
};

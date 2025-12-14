import React from 'react';
import { IonToggle } from '@ionic/react';
import { DashboardPreferences } from '../services/userService';

interface PreferenceToggleProps {
  label: string;
  description?: string;
  checked: boolean;
  onToggle: (checked: boolean) => void;
  disabled?: boolean;
}

export const PreferenceToggle: React.FC<PreferenceToggleProps> = ({
  label,
  description,
  checked,
  onToggle,
  disabled = false
}) => {
  return (
    <div className="flex items-center justify-between py-3 border-b border-gray-200">
      <div className="flex-1 pr-4">
        <div className="font-medium text-gray-900">{label}</div>
        {description && (
          <div className="text-sm text-gray-500 mt-1">{description}</div>
        )}
      </div>
      <IonToggle
        checked={checked}
        onIonChange={(e) => onToggle(e.detail.checked)}
        disabled={disabled}
      />
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
      key: 'show_income_expense_charts' as keyof DashboardPreferences,
      label: 'Income & Expense Charts',
      description: 'Show donut charts with income and expense breakdown'
    },
    {
      key: 'show_ai_suggestions' as keyof DashboardPreferences,
      label: 'AI Suggestions',
      description: 'Show AI-powered financial insights and recommendations'
    },
    {
      key: 'show_budget_summary' as keyof DashboardPreferences,
      label: 'Budget Summary',
      description: 'Show your budget overview and review cards'
    },
    {
      key: 'show_transaction_list' as keyof DashboardPreferences,
      label: 'Recent Transactions',
      description: 'Show your most recent transactions'
    },
    {
      key: 'show_category_breakdown' as keyof DashboardPreferences,
      label: 'Category Breakdown',
      description: 'Show spending breakdown by category'
    }
  ];

  return (
    <div className="bg-white rounded-xl p-4 border border-gray-200">
      <h3 className="text-lg font-semibold mb-4">Dashboard Sections</h3>
      <div>
        {preferenceConfig.map(({ key, label, description }) => (
          <PreferenceToggle
            key={key}
            label={label}
            description={description}
            checked={preferences[key]}
            onToggle={(checked) => onPreferenceChange(key, checked)}
            disabled={disabled}
          />
        ))}
      </div>
    </div>
  );
};

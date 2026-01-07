import React from 'react';
import { IonToggle } from '@ionic/react';
import { Card } from './types';

interface CardItemProps {
  card: Card;
  isEnabled: boolean;
  onToggle: (cardId: string, isChecked: boolean) => void;
  formatCurrency: (amount: number) => string;
}

const CardItem: React.FC<CardItemProps> = ({ card, isEnabled, onToggle, formatCurrency }) => {
  return (
    <div
      className="shrink-0 flex justify-center snap-center w-full px-5"
      style={{
        scrollSnapAlign: 'center',
        scrollSnapStop: 'always',
      }}
    >
      <div className={`relative rounded-xl border border-gray-200 pb-1 w-80 overflow-hidden transition-all ${
        isEnabled ? 'bg-white' : 'bg-gray-100'
      }`}>
        {/* Header: Bank Name and Toggle */}
        <div className="flex justify-between bg-primary items-center py-2 mb-3 px-2">
          <div className="text-left shrink-0">
            <p className={`text-xs font-semibold whitespace-nowrap ${
              isEnabled ? 'text-white' : 'text-white/50'
            }`}>
              {card.bankName}
            </p>
          </div>
          <div className="shrink-0 mx-1">
            <IonToggle 
              className="card-toggle" 
              checked={isEnabled}
              onIonChange={(e) => onToggle(card.id, e.detail.checked)}
            />
          </div>
        </div>

        {/* Card Title */}
        <div className="flex-1 min-w-0 mb-4 px-4">
          <p className={`text-xs font-medium leading-tight truncate ${
            isEnabled ? 'text-gray-900' : 'text-gray-400'
          }`}>
            {card.title}
          </p>
        </div>

        {/* Card Number */}
        <div className="mb-3 px-4">
          <p className={`text font-mono font-bold tracking-wider ${
            isEnabled ? 'text-gray-900' : 'text-gray-400'
          }`}>
            **** **** **** {card.lastFourDigits}
          </p>
        </div>

        {/* Financial Summary: Income, Expense, Savings */}
        <div className="flex justify-between items-center mb-2 px-4 gap-4">
          <div className="flex-1">
            <p className={`text-xs font-semibold ${
              isEnabled ? 'text-green-600' : 'text-green-400/50'
            }`}>
              {formatCurrency(card.income || 0)}
            </p>
          </div>
          <div className="flex-1">
            <p className={`text-xs font-semibold ${
              isEnabled ? 'text-red-600' : 'text-red-400/50'
            }`}>
              {formatCurrency(card.expense || 0)}
            </p>
          </div>
          <div className="flex-1">
            <p className={`text-xs font-semibold ${
              isEnabled ? 'text-primary' : 'text-primary/50'
            }`}>
              {formatCurrency(card.savings || 0)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CardItem;

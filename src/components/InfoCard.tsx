import React from 'react';
import { IonIcon } from '@ionic/react';
import { getCategoryIcon } from '../utils/categoryIconMap';

export interface InfoCardItem {
  id: string;
  name: string;
  amount: number;
  icon?: string; // Optional custom icon
}

interface InfoCardProps {
  item: InfoCardItem;
  iconColor?: string; // Optional custom icon color
  onClick?: (item: InfoCardItem) => void; // Optional click handler
}

const InfoCard: React.FC<InfoCardProps> = ({ 
  item, 
  iconColor = 'text-gray-700',
  onClick 
}) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const iconSrc = item.icon || getCategoryIcon(item.name);

  return (
    <div
      onClick={() => onClick?.(item)}
      className={`flex-shrink-0 flex items-center justify-center min-w-[120px] p-2 bg-white border border-gray-200 rounded-lg ${
        onClick ? 'cursor-pointer hover:border-gray-300 active:bg-gray-50 transition-colors' : ''
      }`}
    >
      {/* Icon */}
      <div className="flex-shrink-0">
        <IonIcon 
          icon={iconSrc} 
          className={`text-xl ${iconColor}`}
        />
      </div>
      
      <div className='ml-3 flex-1 min-w-0'>
        {/* Category Name */}
        <p className="text-xs text-gray-600 mb-1 line-clamp-1">
          {item.name}
        </p>
        
        {/* Amount */}
        <p className="text-xs font-semibold text-gray-900">
          {formatCurrency(item.amount)}
        </p>
      </div>
    </div>
  );
};

export default InfoCard;

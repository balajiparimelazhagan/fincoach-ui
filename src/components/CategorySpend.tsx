import React from 'react';
import { IonIcon } from '@ionic/react';
import { getCategoryIcon } from '../utils/categoryIconMap';
import * as icons from 'ionicons/icons';

export interface ICategorySpend {
  id: string;
  name: string;
  amount: number;
}

interface CategorySpendProps {
  categories: ICategorySpend[];
}

const CategorySpend: React.FC<CategorySpendProps> = ({ categories }) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  return (
    <div className="mb-4">
      <div
        className="flex overflow-x-auto scrollbar-hide gap-4 pb-2"
        style={{
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
          WebkitOverflowScrolling: 'touch',
        }}
      >
        {categories.map((category) => {
          const iconSrc = getCategoryIcon(category.name);
          
          return (
            <div
              key={category.id}
              className="flex-shrink-0 flex items-center justify-center min-w-[120px] p-2 bg-white border border-gray-200 rounded-lg"
            >
              {/* Icon */}
              <div className="flex-shrink-0">
                <IonIcon 
                  icon={iconSrc} 
                  className="text-xl text-gray-400"
                />
              </div>
              
              <div className='ml-3 flex-1 min-w-0'>
                {/* Category Name */}
                <p className="text-xs text-gray-600 mb-1 line-clamp-1">
                  {category.name}
                </p>
                
                {/* Amount */}
                <p className="text-xs font-semibold text-gray-900">
                  {formatCurrency(category.amount)}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CategorySpend;

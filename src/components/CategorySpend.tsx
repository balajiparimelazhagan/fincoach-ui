import React from 'react';
import InfoCardList from './InfoCardList';
import { InfoCardItem } from './InfoCard';

export interface ICategorySpend {
  id: string;
  name: string;
  amount: number;
}

interface CategorySpendProps {
  categories: ICategorySpend[];
  onCategoryClick?: (category: ICategorySpend) => void;
}

const CategorySpend: React.FC<CategorySpendProps> = ({ categories, onCategoryClick }) => {
  // Convert ICategorySpend to InfoCardItem format
  const items: InfoCardItem[] = categories.map(cat => ({
    id: cat.id,
    name: cat.name,
    amount: cat.amount,
  }));

  return <InfoCardList items={items} iconColor="text-gray-700" onItemClick={onCategoryClick} />;
};

export default CategorySpend;

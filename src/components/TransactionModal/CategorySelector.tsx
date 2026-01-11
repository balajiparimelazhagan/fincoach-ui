import React from 'react';
import { IonIcon, IonSelect, IonSelectOption } from '@ionic/react';
import { getCategoryIcon } from '../../utils/categoryIconMap';

interface CategorySelectorProps {
  categoryLabel: string;
  selectedCategoryId: string;
  categories: Array<{ id: string; label: string }>;
  onCategoryChange: (categoryId: string) => void;
}

/**
 * Category icon display and selector
 */
export const CategorySelector: React.FC<CategorySelectorProps> = ({
  categoryLabel,
  selectedCategoryId,
  categories,
  onCategoryChange,
}) => {
  const categoryIcon = getCategoryIcon(categoryLabel);

  return (
    <div className="w-4/12 flex flex-col items-center justify-center">
      <div className="rounded-full bg-primary/10 w-10 h-10 flex items-center justify-center">
        <IonIcon icon={categoryIcon} className="text-xl text-primary" />
      </div>
      <IonSelect
        value={selectedCategoryId}
        onIonChange={(e) => onCategoryChange(e.detail.value)}
        interface="action-sheet"
        className="mt-2 border border-gray-300 rounded-lg px-2 text-xs text-primary text-center py-0! min-h-6! focus"
      >
        {categories.map((cat) => (
          <IonSelectOption key={cat.id} value={cat.id}>
            {cat.label}
          </IonSelectOption>
        ))}
      </IonSelect>
    </div>
  );
};

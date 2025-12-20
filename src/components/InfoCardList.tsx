import React from 'react';
import InfoCard, { InfoCardItem } from './InfoCard';

interface InfoCardListProps {
  items: InfoCardItem[];
  iconColor?: string;
  onItemClick?: (item: InfoCardItem) => void;
  className?: string;
}

const InfoCardList: React.FC<InfoCardListProps> = ({ 
  items, 
  iconColor,
  onItemClick,
  className = ''
}) => {
  return (
    <div className={`mb-4 ${className}`}>
      <div
        className="flex overflow-x-auto scrollbar-hide gap-4 pb-2"
        style={{
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
          WebkitOverflowScrolling: 'touch',
        }}
      >
        {items.map((item) => (
          <InfoCard
            key={item.id}
            item={item}
            iconColor={iconColor}
            onClick={onItemClick}
          />
        ))}
      </div>
    </div>
  );
};

export default InfoCardList;

import React from 'react';

interface CardItem {
  id: string;
  message: string;
}

interface TopPicksScrollProps {
  items: CardItem[];
  onCardClick?: (item: CardItem) => void;
}

const TopPicksScroll: React.FC<TopPicksScrollProps> = ({ items, onCardClick }) => {
  return (
    <>
    <div className='font-semibold mb-2 px-1'>Top picks for you</div>
    <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
      {items.map((item) => (
        <div
          key={item.id}
          onClick={() => onCardClick?.(item)}
          className="w-32 h-32 bg-primary-light rounded-2xl border border-gray-200 p-4 flex flex-col justify-between cursor-pointer hover:shadow-md transition-shadow"
        >
          <div className="text-sm  font-semibold text-subtle-light">
              {item.message}
          </div>
        </div>
      ))}
    </div>
    </>
  );
};

export default TopPicksScroll;

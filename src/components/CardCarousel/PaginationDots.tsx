import React from 'react';

interface PaginationDotsProps {
  count: number;
  activeIndex: number;
}

const PaginationDots: React.FC<PaginationDotsProps> = ({ count, activeIndex }) => {
  return (
    <div className="flex justify-center gap-2 mt-2">
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className={`h-2 rounded-full transition-all duration-300 ${
            index === activeIndex
              ? 'w-8 bg-gray-800'
              : 'w-2 bg-gray-300'
          }`}
        />
      ))}
    </div>
  );
};

export default PaginationDots;

import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import CardItem from './CardItem';
import PaginationDots from './PaginationDots';
import { Card } from './types';

// Re-export types for backward compatibility
export type { Card };

interface CardCarouselProps {
  cards: Card[];
  onToggleChange?: (accountId: string, isEnabled: boolean) => void;
  enabledAccounts?: Set<string>;
}

const CardCarousel: React.FC<CardCarouselProps> = ({ 
  cards,
  onToggleChange,
  enabledAccounts
}) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Track scroll position to update active card indicator
  const handleScroll = useCallback(() => {
    if (scrollContainerRef.current) {
      const scrollLeft = scrollContainerRef.current.scrollLeft;
      const cardWidth = scrollContainerRef.current.offsetWidth;
      const newIndex = Math.round(scrollLeft / cardWidth);
      setActiveIndex(newIndex);
    }
  }, []);

  // Handle card toggle
  const handleToggle = useCallback((cardId: string, isChecked: boolean) => {
    onToggleChange?.(cardId, isChecked);
  }, [onToggleChange]);

  // Set up scroll listener
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll, { passive: true });
      return () => container.removeEventListener('scroll', handleScroll);
    }
  }, [handleScroll]);

  // Currency formatter
  const formatCurrency = useMemo(() => {
    return (amount: number) => {
      return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(amount);
    };
  }, []);

  return (
    <div className="relative mb-6">
      {/* Scroll Container */}
      <div
        ref={scrollContainerRef}
        className="flex overflow-x-auto scrollbar-hide snap-x snap-mandatory pb-4"
        style={{
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
          scrollSnapType: 'x mandatory',
          WebkitOverflowScrolling: 'touch',
        }}
      >
        {cards.map((card) => {
          const isEnabled = enabledAccounts ? enabledAccounts.has(card.id) : true;
          return (
            <CardItem
              key={card.id}
              card={card}
              isEnabled={isEnabled}
              onToggle={handleToggle}
              formatCurrency={formatCurrency}
            />
          );
        })}
      </div>

      {/* Pagination Indicators */}
      <PaginationDots count={cards.length} activeIndex={activeIndex} />
    </div>
  );
};

export default CardCarousel;

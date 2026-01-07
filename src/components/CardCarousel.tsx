import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { IonToggle } from '@ionic/react';

export interface Card {
  id: string;
  type: 'credit' | 'debit';
  balance: number;
  title: string;
  bankName: string;
  lastFourDigits: string;
  referenceNumber?: string;
  cardBrand?: 'visa' | 'mastercard' | 'rupay';
  income?: number;
  expense?: number;
  savings?: number;
}

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

  const handleScroll = useCallback(() => {
    if (scrollContainerRef.current) {
      const scrollLeft = scrollContainerRef.current.scrollLeft;
      const cardWidth = scrollContainerRef.current.offsetWidth;
      const newIndex = Math.round(scrollLeft / cardWidth);
      setActiveIndex(newIndex);
    }
  }, []);

  const handleToggle = (cardId: string, isChecked: boolean) => {
    onToggleChange?.(cardId, isChecked);
  };

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll, { passive: true });
      return () => container.removeEventListener('scroll', handleScroll);
    }
  }, [handleScroll]);

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
          <div
            key={card.id}
            className="shrink-0 flex justify-center snap-center w-full px-5"
            style={{
              scrollSnapAlign: 'center',
              scrollSnapStop: 'always',
            }}
          >
            <div className={`relative rounded-xl border border-gray-200 pb-1 w-80 overflow-hidden transition-all ${
              isEnabled ? 'bg-white' : 'bg-gray-100'
            }`}>
              {/* Top Section: Card Title and Bank Name */}
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
                    onIonChange={(e) => handleToggle(card.id, e.detail.checked)}
                  />
                </div>
              </div>
              <div className="flex-1 min-w-0 mb-4 px-4">
                <p className={`text-xs font-medium leading-tight truncate ${
                  isEnabled ? 'text-gray-900' : 'text-gray-400'
                }`}>
                  {card.title}
                </p>
              </div>

              {/* Card Number Section */}
              <div className="mb-3 px-4">
                <p className={`text font-mono font-bold tracking-wider ${
                  isEnabled ? 'text-gray-900' : 'text-gray-400'
                }`}>
                  **** **** **** {card.lastFourDigits}
                </p>
              </div>

              {/* Bottom Section: Income, Expense, Savings Summary */}
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
        )})}
      </div>

      {/* Pagination Dots */}
      <div className="flex justify-center gap-2 mt-2">
        {cards.map((_, index) => (
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
    </div>
  );
};

export default CardCarousel;

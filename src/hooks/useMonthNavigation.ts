import { useState, useCallback } from 'react';

export const useMonthNavigation = (initialDate: Date = new Date()) => {
  const [selectedMonth, setSelectedMonth] = useState<Date>(initialDate);
  const [currentDayIndex, setCurrentDayIndex] = useState(0);

  const handlePrevMonth = useCallback(() => {
    const newDate = new Date(selectedMonth);
    newDate.setMonth(newDate.getMonth() - 1);
    setSelectedMonth(newDate);
    setCurrentDayIndex(0);
  }, [selectedMonth]);

  const handleNextMonth = useCallback(() => {
    const newDate = new Date(selectedMonth);
    newDate.setMonth(newDate.getMonth() + 1);
    setSelectedMonth(newDate);
    setCurrentDayIndex(0);
  }, [selectedMonth]);

  const resetDayIndex = useCallback(() => {
    setCurrentDayIndex(0);
  }, []);

  const incrementDayIndex = useCallback(() => {
    setCurrentDayIndex((prev) => prev + 1);
  }, []);

  return {
    selectedMonth,
    currentDayIndex,
    handlePrevMonth,
    handleNextMonth,
    setCurrentDayIndex,
    resetDayIndex,
    incrementDayIndex,
  };
};

// src/hooks/useWeekNavigation.js
import { useState, useCallback } from 'react';
import { addWeeks, getWeekNumber } from '../utils/dateUtils';

export const useWeekNavigation = (initialDate = new Date()) => {
  const [currentDate, setCurrentDate] = useState(initialDate);
  const [weekNumber, setWeekNumber] = useState(getWeekNumber(initialDate));

  const goToNextWeek = useCallback(() => {
    const nextWeek = addWeeks(currentDate, 1);
    setCurrentDate(nextWeek);
    setWeekNumber(getWeekNumber(nextWeek));
  }, [currentDate]);

  const goToPreviousWeek = useCallback(() => {
    const prevWeek = addWeeks(currentDate, -1);
    setCurrentDate(prevWeek);
    setWeekNumber(getWeekNumber(prevWeek));
  }, [currentDate]);

  const goToWeek = useCallback((date) => {
    setCurrentDate(date);
    setWeekNumber(getWeekNumber(date));
  }, []);

  const goToToday = useCallback(() => {
    const today = new Date();
    setCurrentDate(today);
    setWeekNumber(getWeekNumber(today));
  }, []);

  return {
    currentDate,
    weekNumber,
    goToNextWeek,
    goToPreviousWeek,
    goToWeek,
    goToToday
  };
};
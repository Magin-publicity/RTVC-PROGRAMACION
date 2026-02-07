// src/hooks/useWeekNavigation.js
import { useState, useCallback, useEffect } from 'react';
import { addWeeks, getWeekNumber } from '../utils/dateUtils';

/**
 * Hook para navegación de semanas con persistencia en localStorage
 * Guarda la última fecha seleccionada y la restaura al recargar la página
 */
export const useWeekNavigation = (initialDate = new Date()) => {
  // 📅 Intentar restaurar la última fecha guardada
  // IMPORTANTE: Usar función inicializadora lazy en useState
  const [currentDate, setCurrentDate] = useState(() => {
    try {
      const savedDate = localStorage.getItem('rtvc_last_selected_date');
      if (savedDate) {
        const parsed = new Date(savedDate);
        // Validar que la fecha es válida
        if (!isNaN(parsed.getTime())) {
          console.log('📅 [useWeekNavigation] Restaurando última fecha:', savedDate);
          return parsed;
        }
      }
    } catch (error) {
      console.error('❌ [useWeekNavigation] Error restaurando fecha:', error);
    }
    return initialDate;
  });

  const [weekNumber, setWeekNumber] = useState(() => {
    // Calcular weekNumber basado en la misma lógica de restauración
    try {
      const savedDate = localStorage.getItem('rtvc_last_selected_date');
      if (savedDate) {
        const parsed = new Date(savedDate);
        if (!isNaN(parsed.getTime())) {
          return getWeekNumber(parsed);
        }
      }
    } catch (error) {
      // Error ya fue logueado arriba
    }
    return getWeekNumber(initialDate);
  });

  // 💾 Guardar la fecha actual cada vez que cambie
  useEffect(() => {
    try {
      const dateStr = currentDate.toISOString();
      localStorage.setItem('rtvc_last_selected_date', dateStr);
      console.log('💾 [useWeekNavigation] Fecha guardada:', dateStr);
    } catch (error) {
      console.error('❌ [useWeekNavigation] Error guardando fecha:', error);
    }
  }, [currentDate]);

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
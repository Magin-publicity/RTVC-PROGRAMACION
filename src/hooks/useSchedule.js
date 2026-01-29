// src/hooks/useSchedule.js
import { useState, useEffect, useCallback } from 'react';
import { scheduleService } from '../services/scheduleService';
import { generateWeeklySchedule } from '../utils/scheduleGenerator';
import { getWeekDates, formatDate } from '../utils/dateUtils';

export const useSchedule = (selectedDate) => {
  const [schedule, setSchedule] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadSchedule = useCallback(async (date) => {
    setLoading(true);
    setError(null);
    try {
      const weekDates = getWeekDates(date);
      const startDate = formatDate(weekDates[0]);
      const endDate = formatDate(weekDates[6]);
      
       // Intentar cargar desde el backend
      try {
        // TEMPORALMENTE DESHABILITADO - usando solo localStorage
        // const data = await scheduleService.getByWeek(startDate, endDate);
        // setSchedule(data);
        throw new Error('Backend deshabilitado temporalmente');
      } catch (apiError) {
        // Si falla, usar localStorage
        console.log('Usando datos locales');
        const localData = scheduleService.getByWeekLocal(startDate, endDate);
        setSchedule(localData);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const saveSchedule = useCallback(async (date, scheduleData) => {
    setLoading(true);
    setError(null);
    try {
      // Intentar guardar en backend
      try {
        // TEMPORALMENTE DESHABILITADO
        // await scheduleService.bulkCreate(scheduleData);
        throw new Error('Backend deshabilitado temporalmente');
      } catch (apiError) {
        console.log('Guardando localmente');
      }
      
      // Siempre guardar en localStorage como respaldo
      scheduleService.saveScheduleLocal(date, scheduleData);
      
      setSchedule(prev => ({
        ...prev,
        [date]: scheduleData
      }));
      
      return true;
    } catch (err) {
      setError(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateScheduleEntry = useCallback((date, area, personnelId, updates) => {
    setSchedule(prev => {
      const newSchedule = { ...prev };
      if (newSchedule[date] && newSchedule[date][area]) {
        newSchedule[date][area] = newSchedule[date][area].map(entry =>
          entry.personnel.id === personnelId
            ? { ...entry, ...updates }
            : entry
        );
      }
      scheduleService.saveScheduleLocal(date, newSchedule[date]);
      return newSchedule;
    });
  }, []);

  const deleteScheduleEntry = useCallback((date, area, personnelId) => {
    setSchedule(prev => {
      const newSchedule = { ...prev };
      if (newSchedule[date] && newSchedule[date][area]) {
        newSchedule[date][area] = newSchedule[date][area].filter(
          entry => entry.personnel.id !== personnelId
        );
      }
      scheduleService.saveScheduleLocal(date, newSchedule[date]);
      return newSchedule;
    });
  }, []);

  const generateSchedule = useCallback((personnel, startDate, novelties) => {
    const generated = generateWeeklySchedule(personnel, startDate, novelties);
    setSchedule(generated);
    
    // Guardar en localStorage
    Object.keys(generated).forEach(date => {
      scheduleService.saveScheduleLocal(date, generated[date]);
    });
  }, []);

  useEffect(() => {
    // DESHABILITADO TEMPORALMENTE PARA EVITAR BUCLES
    // if (selectedDate) {
    //   loadSchedule(selectedDate);
    // }
  }, [selectedDate, loadSchedule]);

  return {
    schedule,
    loading,
    error,
    loadSchedule,
    saveSchedule,
    updateScheduleEntry,
    deleteScheduleEntry,
    generateSchedule
  };
};
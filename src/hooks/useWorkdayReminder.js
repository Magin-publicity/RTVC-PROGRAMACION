// src/hooks/useWorkdayReminder.js
import { useEffect, useRef } from 'react';

/**
 * Hook para mostrar recordatorio de cierre de jornada a las 8 PM
 * Solo se activa si la fecha seleccionada es HOY
 *
 * @param {Date} selectedDate - Fecha actualmente seleccionada
 * @param {Function} onCloseWorkday - Callback para cerrar la jornada
 * @param {boolean} isEnabled - Si el recordatorio está habilitado (default: true)
 */
export function useWorkdayReminder(selectedDate, onCloseWorkday, isEnabled = true) {
  const intervalRef = useRef(null);
  const lastCheckRef = useRef(null);
  const hasShownTodayRef = useRef(false);

  useEffect(() => {
    if (!isEnabled || !selectedDate || !onCloseWorkday) {
      return;
    }

    // Verificar cada minuto si es hora de mostrar el recordatorio
    intervalRef.current = setInterval(() => {
      const now = new Date();
      const currentHour = now.getHours();
      const currentMinute = now.getMinutes();
      const currentDateStr = now.toDateString();

      // Verificar si la fecha seleccionada es HOY
      const selectedDateStr = selectedDate.toDateString();
      const isToday = currentDateStr === selectedDateStr;

      // Solo mostrar si:
      // 1. La fecha seleccionada es HOY
      // 2. Son las 8 PM (20:00)
      // 3. No se ha mostrado hoy (para evitar spam)
      // 4. No es el primer check (para evitar mostrar inmediatamente al cargar)
      if (
        isToday &&
        currentHour === 20 &&
        currentMinute === 0 &&
        lastCheckRef.current !== currentDateStr &&
        !hasShownTodayRef.current
      ) {
        // Marcar que ya se mostró hoy
        hasShownTodayRef.current = true;
        lastCheckRef.current = currentDateStr;

        // Mostrar el recordatorio
        showWorkdayReminder(onCloseWorkday, now);
      }

      // Resetear el flag a medianoche
      if (currentHour === 0 && currentMinute === 0) {
        hasShownTodayRef.current = false;
      }
    }, 60000); // Verificar cada minuto

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [selectedDate, onCloseWorkday, isEnabled]);

  return null;
}

/**
 * Muestra el diálogo de recordatorio para cerrar la jornada
 */
function showWorkdayReminder(onCloseWorkday, currentTime) {
  const timeStr = currentTime.toLocaleTimeString('es-CO', {
    hour: '2-digit',
    minute: '2-digit'
  });

  const confirmed = window.confirm(
    '🕐 RECORDATORIO - CIERRE DE JORNADA\n\n' +
    `Son las ${timeStr}. Es hora de cerrar la jornada del día.\n\n` +
    '¿Deseas cerrar la jornada ahora?\n\n' +
    '✅ SÍ: Se guardará la programación actual y se creará un snapshot histórico\n' +
    '⏰ NO: Puedes cerrarla más tarde con el botón "Cerrar Jornada"'
  );

  if (confirmed && onCloseWorkday) {
    onCloseWorkday();
  }
}

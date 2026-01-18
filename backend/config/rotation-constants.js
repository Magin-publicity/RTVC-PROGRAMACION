// ⚠️⚠️⚠️ CRÍTICO - NO MODIFICAR ESTAS FECHAS ⚠️⚠️⚠️

// FECHA BASE PARA ROTACIÓN DE FINES DE SEMANA
// Esta fecha base es usada por MÚLTIPLES endpoints para calcular la rotación de fines de semana
// Cambiar esta fecha romperá la sincronización entre turnos y asignaciones
// Fecha base: 4 de noviembre 2025 (Rotación 0)
//
// ENDPOINTS QUE USAN ESTA FECHA:
// - /api/schedule/auto-shifts/:date (genera turnos de fin de semana)
// - /api/schedule/daily/:date (calcula callTimes y asignaciones)
//
// ⚠️ SI CAMBIAS ESTA FECHA, LA ROTACIÓN DE CONTRIBUCIONES EN FIN DE SEMANA SE ROMPERÁ ⚠️
const WEEKEND_ROTATION_BASE_DATE = '2025-11-04T12:00:00';

// FECHA BASE PARA ROTACIÓN DE ENTRE SEMANA
// Esta fecha base es usada para calcular la rotación semanal de turnos en días de lunes a viernes
// Cambiar esta fecha romperá toda la rotación de entre semana
// Fecha base: 4 de noviembre 2025 (Semana 0)
//
// ENDPOINTS QUE USAN ESTA FECHA:
// - /api/schedule/daily/:date (calcula turnos de entre semana)
//
// ⚠️ SI CAMBIAS ESTA FECHA, TODA LA ROTACIÓN DE ENTRE SEMANA SE ROMPERÁ ⚠️
const WEEKDAY_ROTATION_BASE_DATE = '2025-11-04T12:00:00';

// Validación: Verifica que la fecha base de fin de semana no haya sido modificada
function validateWeekendBaseDate(dateString) {
  if (dateString !== WEEKEND_ROTATION_BASE_DATE) {
    console.error('❌❌❌ ADVERTENCIA CRÍTICA ❌❌❌');
    console.error(`La fecha base de FIN DE SEMANA ha sido modificada: ${dateString}`);
    console.error(`Fecha esperada: ${WEEKEND_ROTATION_BASE_DATE}`);
    console.error('Esto causará desincronización entre turnos y asignaciones');
    console.error('⚠️ LA ROTACIÓN DE CONTRIBUCIONES EN FIN DE SEMANA ESTÁ ROTA ⚠️');
    throw new Error('FECHA BASE INCORRECTA - La rotación de fin de semana está desincronizada');
  }
}

// Validación: Verifica que la fecha base de entre semana no haya sido modificada
function validateWeekdayBaseDate(dateString) {
  if (dateString !== WEEKDAY_ROTATION_BASE_DATE) {
    console.error('❌❌❌ ADVERTENCIA CRÍTICA ❌❌❌');
    console.error(`La fecha base de ENTRE SEMANA ha sido modificada: ${dateString}`);
    console.error(`Fecha esperada: ${WEEKDAY_ROTATION_BASE_DATE}`);
    console.error('Esto causará que toda la rotación de entre semana se rompa');
    console.error('⚠️ LA ROTACIÓN DE ENTRE SEMANA ESTÁ ROTA ⚠️');
    throw new Error('FECHA BASE INCORRECTA - La rotación de entre semana está desincronizada');
  }
}

// Función helper para calcular weekendCount de forma consistente
function calculateWeekendCount(selectedDate) {
  const baseDate = new Date(WEEKEND_ROTATION_BASE_DATE);
  const daysDiff = Math.floor((selectedDate - baseDate) / (1000 * 60 * 60 * 24));
  return Math.floor(daysDiff / 7);
}

// Función helper para calcular weeksDiff (semanas desde fecha base) de forma consistente
function calculateWeeksDiff(selectedDate) {
  const baseDate = new Date(WEEKDAY_ROTATION_BASE_DATE);
  const daysDiff = Math.floor((selectedDate - baseDate) / (1000 * 60 * 60 * 24));
  return Math.floor(daysDiff / 7);
}

module.exports = {
  WEEKEND_ROTATION_BASE_DATE,
  WEEKDAY_ROTATION_BASE_DATE,
  validateWeekendBaseDate,
  validateWeekdayBaseDate,
  calculateWeekendCount,
  calculateWeeksDiff
};

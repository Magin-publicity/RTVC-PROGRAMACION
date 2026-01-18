// backend/utils/reporteriaRotation.js
// Utilidad para determinar el turno actual de reportería según rotación semanal

/**
 * Calcula el número de semana del año para una fecha dada
 * @param {Date} date - Fecha a calcular
 * @returns {number} - Número de semana del año
 */
function getWeekNumber(date) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
}

/**
 * Determina el turno actual (AM o PM) para un empleado de reportería
 * @param {string} grupoReporteria - 'GRUPO_A' o 'GRUPO_B'
 * @param {Date|string} fecha - Fecha a evaluar (opcional, default: hoy)
 * @returns {Object} - { turno: 'AM'|'PM', horario: string, semanaEsPar: boolean }
 */
function getTurnoActual(grupoReporteria, fecha = new Date()) {
  // Convertir string a Date si es necesario
  const date = typeof fecha === 'string' ? new Date(fecha + 'T12:00:00') : fecha;

  // Calcular número de semana
  const weekNumber = getWeekNumber(date);
  const semanaEsPar = weekNumber % 2 === 0;

  // Lógica de rotación:
  // Semana PAR: GRUPO_A → AM, GRUPO_B → PM
  // Semana IMPAR: GRUPO_A → PM, GRUPO_B → AM
  let turno;
  if (semanaEsPar) {
    turno = grupoReporteria === 'GRUPO_A' ? 'AM' : 'PM';
  } else {
    turno = grupoReporteria === 'GRUPO_A' ? 'PM' : 'AM';
  }

  const horario = turno === 'AM' ? '08:00 - 13:00' : '13:00 - 20:00';
  const callTime = turno === 'AM' ? '08:00' : '13:00';

  return {
    turno,
    horario,
    callTime,
    semanaEsPar,
    weekNumber
  };
}

/**
 * Valida si una hora de programa es compatible con el turno del empleado
 * @param {string} grupoReporteria - 'GRUPO_A' o 'GRUPO_B'
 * @param {string} horaSalida - Hora en formato 'HH:MM'
 * @param {Date|string} fecha - Fecha a evaluar
 * @returns {boolean} - true si es válido, false si no
 */
function validarHorarioPrograma(grupoReporteria, horaSalida, fecha = new Date()) {
  const { turno } = getTurnoActual(grupoReporteria, fecha);

  // Convertir hora a minutos
  const [hora, minutos] = horaSalida.split(':').map(Number);
  const horaEnMinutos = hora * 60 + minutos;

  if (turno === 'AM') {
    // Turno AM: Solo programas antes de las 13:00 (780 minutos)
    return horaEnMinutos < 780;
  } else {
    // Turno PM: Solo programas desde las 13:00 (780 minutos) en adelante
    return horaEnMinutos >= 780;
  }
}

module.exports = {
  getTurnoActual,
  validarHorarioPrograma,
  getWeekNumber
};

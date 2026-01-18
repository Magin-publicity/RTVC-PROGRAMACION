// Festivos de Colombia 2026
// Lista simple y estática de festivos colombianos

const COLOMBIAN_HOLIDAYS_2026 = [
  '2026-01-01', // Año Nuevo
  '2026-01-12', // Reyes Magos (trasladado a lunes)
  '2026-03-23', // San José (trasladado a lunes)
  '2026-04-02', // Jueves Santo
  '2026-04-03', // Viernes Santo
  '2026-05-01', // Día del Trabajo
  '2026-05-18', // Ascensión del Señor (trasladado a lunes)
  '2026-06-08', // Corpus Christi (trasladado a lunes)
  '2026-06-15', // Sagrado Corazón (trasladado a lunes)
  '2026-06-29', // San Pedro y San Pablo (trasladado a lunes)
  '2026-07-20', // Día de la Independencia
  '2026-08-07', // Batalla de Boyacá
  '2026-08-17', // Asunción de la Virgen (trasladado a lunes)
  '2026-10-12', // Día de la Raza (trasladado a lunes)
  '2026-11-02', // Todos los Santos (trasladado a lunes)
  '2026-11-16', // Independencia de Cartagena (trasladado a lunes)
  '2026-12-08', // Inmaculada Concepción
  '2026-12-25'  // Navidad
];

/**
 * Verifica si una fecha es festivo en Colombia
 * @param {string} dateStr - Fecha en formato 'YYYY-MM-DD'
 * @returns {boolean}
 */
function isColombianHoliday(dateStr) {
  return COLOMBIAN_HOLIDAYS_2026.includes(dateStr);
}

module.exports = {
  isColombianHoliday,
  COLOMBIAN_HOLIDAYS_2026
};

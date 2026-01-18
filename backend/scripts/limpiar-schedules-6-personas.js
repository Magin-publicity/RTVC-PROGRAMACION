// Script para limpiar schedules de áreas con 6 personas
// Para que se regeneren con la nueva plantilla de relevos
const pool = require('../config/database');

async function limpiarSchedules6Personas() {
  try {
    console.log('🧹 Limpiando schedules de días de semana (áreas con 6 personas)...\n');

    // Eliminar schedules de días de semana (lunes-viernes) desde diciembre 2025
    const result = await pool.query(`
      DELETE FROM daily_schedules
      WHERE EXTRACT(DOW FROM date) BETWEEN 1 AND 5
        AND date >= '2025-12-01'
        AND date <= '2026-02-28'
      RETURNING date
    `);

    const deletedDates = result.rows || result;
    console.log(`✅ Eliminados ${deletedDates.length} schedules de días de semana\n`);

    console.log('🔄 Ahora recarga la página para que se generen con la nueva plantilla de 6 turnos');

    await pool.end();
  } catch (error) {
    console.error('❌ Error:', error);
    await pool.end();
    process.exit(1);
  }
}

limpiarSchedules6Personas();

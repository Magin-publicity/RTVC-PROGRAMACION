// Script para limpiar schedules guardados de fines de semana
// Para que se regeneren con la nueva lógica de 4 AM + 4 PM
const pool = require('../config/database');

async function limpiarSabados() {
  try {
    console.log('🧹 Limpiando schedules de fines de semana...\n');

    // Eliminar todos los schedules de sábados y domingos
    const result = await pool.query(`
      DELETE FROM daily_schedules
      WHERE EXTRACT(DOW FROM date) IN (0, 6)
        AND date >= '2025-12-01'
      RETURNING date
    `);

    const deletedDates = result.rows || result;
    console.log(`✅ Eliminados ${deletedDates.length} schedules de fin de semana:`);
    deletedDates.forEach(row => {
      const date = row.date.toISOString().split('T')[0];
      const dayName = row.date.getDay() === 0 ? 'Domingo' : 'Sábado';
      console.log(`   ${date} (${dayName})`);
    });

    console.log('\n🔄 Ahora recarga la página para que se generen con la nueva lógica (4 AM + 4 PM)');

    await pool.end();
  } catch (error) {
    console.error('❌ Error:', error);
    await pool.end();
    process.exit(1);
  }
}

limpiarSabados();

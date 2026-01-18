const pool = require('../config/database');

async function limpiarFinesAbril() {
  try {
    console.log('🔄 Limpiando TODOS los fines de semana de abril 2026...\n');

    // Eliminar solo sábados y domingos de abril
    const result = await pool.query(`
      DELETE FROM daily_schedules
      WHERE date >= '2026-04-01'
        AND date <= '2026-04-30'
        AND EXTRACT(DOW FROM date) IN (0, 6)
    `);

    console.log(`✅ Datos eliminados. Filas afectadas: ${result.rowCount}`);
    console.log('\n📋 Se eliminaron SOLO los fines de semana de abril');
    console.log('   ✅ Los datos de ENTRE SEMANA no fueron tocados');
    console.log('\n🔄 Recarga la página para regenerar los fines de semana correctamente');

    pool.end();
  } catch (error) {
    console.error('Error:', error);
    pool.end();
  }
}

limpiarFinesAbril();

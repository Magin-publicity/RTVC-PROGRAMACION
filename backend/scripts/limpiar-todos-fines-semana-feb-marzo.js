const pool = require('../config/database');

async function limpiarFinesDeSemana() {
  try {
    console.log('🔄 Limpiando TODOS los fines de semana de febrero y marzo 2026...\n');

    // Eliminar solo sábados y domingos de febrero y marzo
    const result = await pool.query(`
      DELETE FROM daily_schedules
      WHERE date >= '2026-02-01'
        AND date <= '2026-03-31'
        AND EXTRACT(DOW FROM date) IN (0, 6)
    `);

    console.log(`✅ Datos eliminados. Filas afectadas: ${result.rowCount}`);
    console.log('\n📋 Se eliminaron SOLO los fines de semana de febrero y marzo');
    console.log('   ✅ Los datos de ENTRE SEMANA no fueron tocados');
    console.log('\n🔄 Recarga la página para regenerar los fines de semana');

    pool.end();
  } catch (error) {
    console.error('Error:', error);
    pool.end();
  }
}

limpiarFinesDeSemana();

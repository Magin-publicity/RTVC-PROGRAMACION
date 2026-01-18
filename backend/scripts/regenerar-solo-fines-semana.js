const pool = require('../config/database');

async function regenerarSoloFinesDeSemana() {
  try {
    console.log('🔄 Limpiando SOLO los datos de FINES DE SEMANA de enero 2026...\n');

    // Eliminar solo los sábados y domingos de enero 2026
    const result = await pool.query(`
      DELETE FROM daily_schedules
      WHERE date >= '2026-01-01'
        AND date <= '2026-01-31'
        AND EXTRACT(DOW FROM date) IN (0, 6)
    `);

    console.log(`✅ Datos eliminados. Filas afectadas: ${result.rowCount}`);
    console.log('\n📋 Ahora recarga la página y SOLO los fines de semana se regenerarán');
    console.log('   ✅ Los datos de ENTRE SEMANA no fueron tocados');

    pool.end();
  } catch (error) {
    console.error('Error:', error);
    pool.end();
  }
}

regenerarSoloFinesDeSemana();

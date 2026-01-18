const pool = require('../config/database');

async function limpiarAbril21() {
  try {
    console.log('🔄 Limpiando datos del 21 de abril 2026...\n');

    const result = await pool.query(
      'DELETE FROM daily_schedules WHERE date = $1',
      ['2026-04-21']
    );

    console.log(`✅ Datos eliminados. Filas afectadas: ${result.rowCount}`);
    console.log('\n📋 Ahora recarga la página y el 21 de abril se regenerará con la estructura correcta');

    pool.end();
  } catch (error) {
    console.error('Error:', error);
    pool.end();
  }
}

limpiarAbril21();

const pool = require('../config/database');

async function limpiarSabado14() {
  try {
    console.log('🔄 Limpiando datos del sábado 14 de febrero 2026...\n');

    const result = await pool.query(
      'DELETE FROM daily_schedules WHERE date = $1',
      ['2026-02-14']
    );

    console.log(`✅ Datos eliminados. Filas afectadas: ${result.rowCount}`);
    console.log('\n📋 Ahora recarga la página y el sábado 14 se regenerará correctamente');

    pool.end();
  } catch (error) {
    console.error('Error:', error);
    pool.end();
  }
}

limpiarSabado14();

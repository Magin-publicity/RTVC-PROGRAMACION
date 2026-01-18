const pool = require('../config/database');

async function deleteJan7() {
  try {
    console.log('🗑️ Eliminando datos del 7 de enero...');

    const result = await pool.query(
      'DELETE FROM daily_schedules WHERE date = $1',
      ['2026-01-07']
    );

    console.log(`✅ Eliminado exitosamente. Filas afectadas: ${result.rowCount}`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

deleteJan7();

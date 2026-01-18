const pool = require('../config/database');

async function regenerarTurnos() {
  try {
    console.log('🔄 Limpiando datos guardados para 2026-01-07 para forzar regeneración...\n');

    // Eliminar el registro completo para que se regenere desde cero
    const result = await pool.query(
      'DELETE FROM daily_schedules WHERE date = $1',
      ['2026-01-07']
    );

    console.log(`✅ Datos eliminados. Filas afectadas: ${result.rowCount}`);
    console.log('\n📋 Ahora recarga la página y los turnos se generarán con la plantilla correcta de 4 personas');

    pool.end();
  } catch (error) {
    console.error('Error:', error);
    pool.end();
  }
}

regenerarTurnos();

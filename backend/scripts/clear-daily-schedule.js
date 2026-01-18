const { Pool } = require('pg');
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'rtvc_scheduling',
  password: 'Padres2023',
  port: 5432
});

async function clearDailySchedule() {
  const fecha = '2026-01-09';

  console.log('='.repeat(70));
  console.log(`ELIMINANDO SCHEDULE CORRUPTO PARA: ${fecha}`);
  console.log('='.repeat(70));

  try {
    // Eliminar el daily_schedule para forzar regeneración
    const result = await pool.query(
      'DELETE FROM daily_schedules WHERE date = $1 RETURNING id',
      [fecha]
    );

    console.log(`✅ Eliminados ${result.rowCount} registros de daily_schedules`);
    console.log('');
    console.log('Ahora refresque el navegador (F5) para que se regeneren automáticamente');
    console.log('las asignaciones desde los llamados y la rotación.');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    pool.end();
  }
}

clearDailySchedule();

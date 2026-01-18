const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'rtvc_scheduling',
  password: 'Padres2023',
  port: 5432
});

async function resetDay() {
  const client = await pool.connect();

  try {
    const date = '2026-01-12';

    console.log(`🗑️ Reseteando día ${date}...\n`);

    await client.query('BEGIN');

    // Eliminar rutas optimizadas
    const routesResult = await client.query(
      'DELETE FROM optimized_routes WHERE date = $1',
      [date]
    );
    console.log(`✅ Eliminadas ${routesResult.rowCount} rutas optimizadas`);

    // Eliminar asignaciones de transporte
    const assignmentsResult = await client.query(
      'DELETE FROM daily_transport_assignments WHERE date = $1',
      [date]
    );
    console.log(`✅ Eliminadas ${assignmentsResult.rowCount} asignaciones de transporte`);

    // Eliminar alertas
    const alertsResult = await client.query(
      'DELETE FROM route_alerts WHERE date = $1',
      [date]
    );
    console.log(`✅ Eliminadas ${alertsResult.rowCount} alertas`);

    await client.query('COMMIT');
    console.log('\n✅ Día reseteado correctamente');

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Error:', error.message);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

resetDay().catch(err => {
  console.error(err);
  process.exit(1);
});

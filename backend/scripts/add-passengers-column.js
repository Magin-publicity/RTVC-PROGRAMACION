const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'rtvc_scheduling',
  password: 'Padres2023',
  port: 5432
});

async function addPassengersColumn() {
  const client = await pool.connect();

  try {
    console.log('🔧 Agregando columna passengers a optimized_routes...\n');

    await client.query('BEGIN');

    // Agregar columna passengers (JSON)
    await client.query(`
      ALTER TABLE optimized_routes
      ADD COLUMN IF NOT EXISTS passengers JSONB
    `);

    console.log('✅ Columna passengers agregada correctamente');

    await client.query('COMMIT');
    console.log('✅ Migración completada');

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Error:', error.message);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

addPassengersColumn().catch(err => {
  console.error(err);
  process.exit(1);
});

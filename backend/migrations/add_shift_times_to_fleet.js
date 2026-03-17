const { Pool } = require('pg');

const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'rtvc_scheduling',
  password: process.env.DB_PASSWORD || 'Padres2023',
  port: process.env.DB_PORT || 5432,
});

async function addShiftTimesToFleet() {
  const client = await pool.connect();

  try {
    console.log('🔧 Agregando columnas shift_start y shift_end a fleet_vehicles...');

    await client.query('BEGIN');

    // Agregar columnas shift_start y shift_end si no existen
    await client.query(`
      ALTER TABLE fleet_vehicles
      ADD COLUMN IF NOT EXISTS shift_start TIME,
      ADD COLUMN IF NOT EXISTS shift_end TIME;
    `);

    console.log('✅ Columnas shift_start y shift_end agregadas exitosamente');

    // Agregar columna plate si no existe
    await client.query(`
      ALTER TABLE fleet_vehicles
      ADD COLUMN IF NOT EXISTS plate VARCHAR(20);
    `);

    console.log('✅ Columna plate agregada exitosamente');

    await client.query('COMMIT');

    console.log('✅ Migración completada exitosamente');
    process.exit(0);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Error en migración:', error);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

addShiftTimesToFleet();

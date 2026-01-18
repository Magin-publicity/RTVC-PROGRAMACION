const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'rtvc_scheduling',
  password: 'Padres2023',
  port: 5432,
});

async function checkTables() {
  try {
    const result = await pool.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);

    console.log('Tablas en la base de datos:');
    console.log('='.repeat(50));
    result.rows.forEach(row => {
      console.log(`  - ${row.table_name}`);
    });

    // Verificar si existe tabla de vehículos
    const vehiclesCheck = await pool.query(`
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_name = 'vehicles'
      ORDER BY ordinal_position
    `);

    if (vehiclesCheck.rows.length > 0) {
      console.log('\n\nEstructura tabla "vehicles":');
      console.log('='.repeat(50));
      vehiclesCheck.rows.forEach(col => {
        console.log(`  ${col.column_name}: ${col.data_type}`);
      });
    }

    await pool.end();
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

checkTables();

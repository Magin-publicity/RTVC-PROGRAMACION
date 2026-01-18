const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'rtvc_scheduling',
  password: 'Padres2023',
  port: 5432,
});

async function check() {
  try {
    // Estructura de fleet_vehicles
    const structure = await pool.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'fleet_vehicles'
      ORDER BY ordinal_position
    `);

    console.log('Estructura tabla "fleet_vehicles":');
    console.log('='.repeat(60));
    structure.rows.forEach(col => {
      console.log(`  ${col.column_name.padEnd(25)} ${col.data_type.padEnd(20)} ${col.is_nullable === 'YES' ? 'NULL' : 'NOT NULL'}`);
    });

    // Ver datos de ejemplo
    const data = await pool.query('SELECT * FROM fleet_vehicles LIMIT 5');

    console.log('\n\nDatos de ejemplo:');
    console.log('='.repeat(60));
    data.rows.forEach(v => {
      console.log(`  ${v.id}: ${v.plate} - ${v.type} (${v.capacity} pasajeros) - ${v.status}`);
    });

    await pool.end();
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

check();

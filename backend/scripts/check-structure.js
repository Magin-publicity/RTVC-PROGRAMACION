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
    const result = await pool.query(`
      SELECT assignments_data
      FROM daily_schedules
      WHERE date = '2026-01-12'
    `);

    if (result.rows.length > 0) {
      const data = result.rows[0].assignments_data;
      const sampleKeys = Object.keys(data).slice(0, 3);

      console.log('Estructura de assignments_data para 2026-01-12:');
      console.log('==================================================\n');
      console.log('Total entradas:', Object.keys(data).length);
      console.log('\nEjemplos:');

      sampleKeys.forEach(key => {
        console.log(`\n${key}:`, JSON.stringify(data[key], null, 2));
      });
    }

    await pool.end();
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

check();

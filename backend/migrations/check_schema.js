const pool = require('../config/database');

async function check() {
  const client = await pool.connect();
  try {
    const result = await client.query(`
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_name = 'daily_schedules'
      ORDER BY ordinal_position;
    `);

    console.log('📋 Estructura de daily_schedules:');
    result.rows.forEach(row => {
      console.log(`  - ${row.column_name}: ${row.data_type}`);
    });
  } finally {
    client.release();
    await pool.end();
  }
}

check();

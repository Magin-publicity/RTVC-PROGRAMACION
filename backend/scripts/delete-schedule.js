const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD
});

async function deleteSchedule() {
  try {
    const date = process.argv[2] || '2026-01-04';

    const result = await pool.query(
      'DELETE FROM daily_schedules WHERE date = $1 RETURNING *',
      [date]
    );

    if (result.rowCount > 0) {
      console.log(`✅ Eliminado schedule guardado para ${date}`);
      console.log(`   Filas eliminadas: ${result.rowCount}`);
    } else {
      console.log(`⚠️ No había schedule guardado para ${date}`);
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

deleteSchedule();

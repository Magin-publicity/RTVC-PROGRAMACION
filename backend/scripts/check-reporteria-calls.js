const pool = require('../config/database');

async function checkReporteriaCalls() {
  try {
    const result = await pool.query(`
      SELECT date, program, shift_time, location, notes
      FROM schedules
      WHERE program LIKE '%Reportería%'
      ORDER BY date, shift_time
      LIMIT 20
    `);

    console.log(`\n📋 Llamados de reportería en BD: ${result.rows.length}\n`);

    result.rows.forEach(row => {
      const dateStr = row.date.toISOString().split('T')[0];
      console.log(`  ${dateStr} - ${row.program} - ${row.shift_time}`);
    });

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkReporteriaCalls();

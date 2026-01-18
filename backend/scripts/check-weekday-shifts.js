const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'rtvc_scheduling',
  password: 'Padres2023',
  port: 5432,
});

async function checkShifts() {
  try {
    const result = await pool.query(`
      SELECT assignments_data
      FROM daily_schedules
      WHERE date = '2026-01-12'
    `);

    if (result.rows.length > 0) {
      const data = result.rows[0].assignments_data;

      // Ver horarios únicos
      const endTimes = new Set();

      Object.keys(data).forEach(area => {
        if (Array.isArray(data[area])) {
          data[area].forEach(person => {
            endTimes.add(person.end_time);
          });
        }
      });

      console.log('Horarios de salida disponibles:', [...endTimes].sort().join(', '));

      // Contar personas por horario de salida
      const countByEnd = {};
      Object.keys(data).forEach(area => {
        if (Array.isArray(data[area])) {
          data[area].forEach(person => {
            const end = person.end_time;
            countByEnd[end] = (countByEnd[end] || 0) + 1;
          });
        }
      });

      console.log('\nPersonas por horario de salida:');
      Object.keys(countByEnd).sort().forEach(time => {
        console.log(`  ${time}: ${countByEnd[time]} personas`);
      });
    }

    await pool.end();
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

checkShifts();

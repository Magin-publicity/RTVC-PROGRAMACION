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
      SELECT date,
             assignments_data IS NOT NULL as has_assignments,
             programs_data IS NOT NULL as has_programs
      FROM daily_schedules
      WHERE date >= '2026-01-10' AND date <= '2026-01-20'
      ORDER BY date
    `);

    console.log('Programación 10-20 enero 2026:');
    console.log('================================');

    if (result.rows.length === 0) {
      console.log('❌ No hay programación en este rango');
    } else {
      result.rows.forEach(r => {
        const d = new Date(r.date);
        const day = d.getDay();
        const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
        const dateStr = d.toISOString().split('T')[0];
        console.log(`${dateStr} (${dayNames[day]}): assignments=${r.has_assignments}, programs=${r.has_programs}`);
      });
    }

    await pool.end();
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

check();

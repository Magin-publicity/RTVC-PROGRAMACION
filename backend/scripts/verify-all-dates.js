const pool = require('../config/database');

(async () => {
  try {
    const result = await pool.query(`
      SELECT date, assignments_data
      FROM daily_schedules
      WHERE date >= $1 AND date <= $2
      ORDER BY date
    `, ['2026-01-12', '2026-02-13']);

    console.log('═══════════════════════════════════════════════════════');
    console.log('VERIFICACIÓN - Total de asignaciones por fecha:');
    console.log('═══════════════════════════════════════════════════════');
    console.log('');

    result.rows.forEach(row => {
      const dateStr = row.date instanceof Date
        ? row.date.toISOString().split('T')[0]
        : row.date;

      const assignmentCount = Object.keys(row.assignments_data || {}).length;
      const dateObj = new Date(dateStr + 'T12:00:00');
      const dayName = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'][dateObj.getDay()];

      const status = assignmentCount >= 360 ? '✅' : '⚠️ ';
      console.log(`${status} ${dayName} ${dateStr}: ${assignmentCount} asignaciones`);
    });

    console.log('');
    console.log('═══════════════════════════════════════════════════════');

    await pool.end();
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
})();

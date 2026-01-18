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
      SELECT assignments_data, programs_data
      FROM daily_schedules
      WHERE date = '2026-01-12'
    `);

    if (result.rows.length === 0) {
      console.log('❌ No hay programación para 2026-01-12');
      await pool.end();
      return;
    }

    const assignmentsData = result.rows[0].assignments_data;
    const programsData = result.rows[0].programs_data;
    const callTimes = programsData?.callTimes || {};

    console.log('2026-01-12 (Lunes) - Análisis de Turnos');
    console.log('========================================\n');

    // Buscar todo el personal que termina a las 22:00
    const ending22 = [];
    Object.keys(assignmentsData).forEach(area => {
      if (Array.isArray(assignmentsData[area])) {
        assignmentsData[area].forEach(person => {
          if (person.end_time === '22:00') {
            ending22.push({
              id: person.personnel_id,
              name: person.name,
              area: area,
              start: person.start_time,
              end: person.end_time,
              call: person.call_time
            });
          }
        });
      }
    });

    console.log(`Personal que termina a las 22:00: ${ending22.length} personas\n`);

    if (ending22.length > 0) {
      // Mostrar primeras 10 personas
      console.log('Primeras 10 personas:');
      ending22.slice(0, 10).forEach(p => {
        console.log(`  ${p.name} (${p.area}): ${p.start}-${p.end}, callTime: ${p.call}`);
      });

      // Ver callTimes únicos
      const uniqueCallTimes = [...new Set(ending22.map(p => p.call))].sort();
      console.log(`\nCallTimes únicos para personal de 22:00: ${uniqueCallTimes.join(', ')}`);

      // Ver cuántos tienen cada callTime
      const callTimeCount = {};
      ending22.forEach(p => {
        callTimeCount[p.call] = (callTimeCount[p.call] || 0) + 1;
      });

      console.log('\nDistribución por callTime:');
      Object.keys(callTimeCount).sort().forEach(time => {
        console.log(`  ${time}: ${callTimeCount[time]} personas`);
      });
    } else {
      console.log('❌ No hay personal programado que termine a las 22:00');
    }

    await pool.end();
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

check();

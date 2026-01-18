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

    if (result.rows.length === 0) {
      console.log('❌ No hay programación para 2026-01-12');
      await pool.end();
      return;
    }

    const data = result.rows[0].assignments_data;

    console.log('2026-01-12 (Lunes) - Horarios de Trabajo');
    console.log('==========================================\n');

    // Contar personas por horario de salida
    const endTimes = {};
    const startTimes = {};

    Object.keys(data).forEach(area => {
      if (Array.isArray(data[area])) {
        data[area].forEach(person => {
          const end = person.end_time;
          const start = person.start_time;
          endTimes[end] = (endTimes[end] || 0) + 1;
          startTimes[start] = (startTimes[start] || 0) + 1;
        });
      }
    });

    console.log('Horarios de SALIDA:');
    Object.keys(endTimes).sort().forEach(time => {
      console.log(`  ${time}: ${endTimes[time]} personas`);
    });

    console.log('\nHorarios de ENTRADA:');
    Object.keys(startTimes).sort().forEach(time => {
      console.log(`  ${time}: ${startTimes[time]} personas`);
    });

    // Mostrar algunas áreas clave con sus horarios
    console.log('\n\nEjemplos de horarios por área:');
    console.log('================================');
    const areasToCheck = ['PRODUCTORES', 'REALIZADORES', 'DIRECTORES DE CÁMARA', 'CAMARÓGRAFOS DE ESTUDIO'];

    areasToCheck.forEach(area => {
      if (data[area] && data[area].length > 0) {
        console.log(`\n${area}:`);
        data[area].slice(0, 3).forEach(p => {
          console.log(`  ${p.name}: ${p.start_time}-${p.end_time} (call: ${p.call_time})`);
        });
      }
    });

    await pool.end();
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

check();

const pool = require('../config/database');

async function checkApril21() {
  try {
    const result = await pool.query(
      'SELECT assignments_data, programs_data FROM daily_schedules WHERE date = $1',
      ['2026-04-21']
    );

    if (result.rows.length === 0) {
      console.log('❌ No hay datos guardados para 2026-04-21');
      pool.end();
      return;
    }

    const data = result.rows[0];

    console.log('📊 Datos para 2026-04-21 (martes):\n');
    console.log('Total asignaciones:', Object.keys(data.assignments_data || {}).length);
    console.log('Total programas:', Object.keys(data.programs_data || {}).length);

    if (data.programs_data) {
      console.log('\nProgramas guardados:');
      Object.entries(data.programs_data).forEach(([key, program]) => {
        console.log(`  ${key}:`, program);
      });
    } else {
      console.log('\n⚠️ NO HAY PROGRAMAS GUARDADOS - Este es el problema!');
    }

    console.log('\nPrimeras 5 asignaciones:');
    const assignments = Object.entries(data.assignments_data || {}).slice(0, 5);
    assignments.forEach(([key, value]) => {
      console.log(`  ${key}: ${value}`);
    });

    pool.end();
  } catch (error) {
    console.error('Error:', error);
    pool.end();
  }
}

checkApril21();

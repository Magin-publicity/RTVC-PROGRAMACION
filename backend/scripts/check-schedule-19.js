const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'rtvc_scheduling',
  password: 'Padres2023',
  port: 5432,
});

async function checkSchedule() {
  try {
    console.log('Verificando programación para 2026-01-19...\n');

    const result = await pool.query(`
      SELECT date, programs_data
      FROM daily_schedules
      WHERE date = '2026-01-19'
    `);

    if (result.rows.length === 0) {
      console.log('❌ No existe registro para 2026-01-19');
    } else {
      console.log('✅ Registro existe para 2026-01-19');
      const data = result.rows[0].programs_data;

      if (!data) {
        console.log('⚠️  programs_data es NULL');
      } else if (!data.shifts) {
        console.log('⚠️  programs_data.shifts no existe');
        console.log('Estructura:', Object.keys(data));
      } else if (data.shifts.length === 0) {
        console.log('⚠️  programs_data.shifts está vacío (0 turnos)');
      } else {
        console.log(`✅ Total de turnos: ${data.shifts.length}`);
        console.log('\nPrimeros 3 turnos:');
        data.shifts.slice(0, 3).forEach((shift, i) => {
          console.log(`  ${i + 1}. ${shift.name} - ${shift.area} (${shift.shift_start} - ${shift.shift_end})`);
        });
      }
    }

    await pool.end();
  } catch (error) {
    console.error('❌ Error:', error.message);
    await pool.end();
  }
}

checkSchedule();

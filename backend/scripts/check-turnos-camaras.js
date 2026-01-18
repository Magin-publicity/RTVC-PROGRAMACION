const pool = require('../database/db');

async function checkTurnosCamaras() {
  try {
    const res = await pool.query(`
      SELECT personnel_id, name, area, shift_start, shift_end, grupo_reporteria
      FROM daily_schedules
      WHERE date = '2025-12-26'
        AND area = 'CAMARÓGRAFOS DE REPORTERÍA'
      ORDER BY shift_start, name
    `);

    console.log('📅 Turnos de CAMARÓGRAFOS para 2025-12-26:\n');

    if (res.rows.length === 0) {
      console.log('   ⚠️  NO hay turnos generados para esta fecha');
      console.log('   El sistema debería generarlos automáticamente al acceder al dashboard\n');
    } else {
      res.rows.forEach(row => {
        console.log(`   ${row.name} (${row.grupo_reporteria}): ${row.shift_start} - ${row.shift_end}`);
      });
      console.log(`\n   Total: ${res.rows.length} camarógrafos con turno\n`);
    }

    await pool.end();
  } catch (error) {
    console.error('❌ Error:', error);
    await pool.end();
  }
}

checkTurnosCamaras();

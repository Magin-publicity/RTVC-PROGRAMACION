const pool = require('../config/database');

async function checkDaily() {
  const result = await pool.query(
    'SELECT * FROM daily_schedules WHERE date = $1',
    ['2026-01-04']
  );

  if (result.rows.length === 0) {
    console.log('❌ No hay schedule guardado para 2026-01-04');
  } else {
    const schedule = result.rows[0];
    const programsData = schedule.programs_data || {};
    const callTimes = programsData.callTimes || {};
    const shifts = programsData.shifts || [];

    const camarasShifts = shifts.filter(s => s.area === 'CAMARÓGRAFOS DE ESTUDIO');

    console.log('\n📅 Schedule guardado para 2026-01-04:');
    console.log(`\nShifts de camarógrafos: ${camarasShifts.length}`);
    camarasShifts.forEach(s => {
      console.log(`  ${s.name} (ID: ${s.personnel_id}): ${s.shift_start} - ${s.shift_end}`);
    });

    console.log('\nCallTimes de camarógrafos:');
    Object.keys(callTimes).forEach(personId => {
      const shift = camarasShifts.find(s => s.personnel_id.toString() === personId);
      if (shift) {
        console.log(`  ${shift.name} (ID: ${personId}): ${callTimes[personId]}`);
      }
    });
  }

  await pool.end();
}

checkDaily();

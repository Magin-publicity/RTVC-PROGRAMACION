const pool = require('../config/database');

async function checkGeneradores() {
  const result = await pool.query(`
    SELECT name, turno, current_shift
    FROM personnel
    WHERE area = 'GENERADORES DE CARACTERES'
      AND active = true
    ORDER BY name
  `);

  console.log('\n📺 GENERADORES DE CARACTERES:');
  console.log(`Total: ${result.rows.length} personas\n`);

  result.rows.forEach(person => {
    console.log(`${person.name.padEnd(25)} Turno: ${person.turno || 'NULL'.padEnd(10)} Current Shift: ${person.current_shift || 'NULL'}`);
  });

  // Verificar callTimes para hoy o una fecha específica
  const date = '2026-02-02'; // Lunes de tu captura
  const scheduleResult = await pool.query(
    'SELECT programs_data FROM daily_schedules WHERE date = $1',
    [date]
  );

  if (scheduleResult.rows.length > 0) {
    const callTimes = scheduleResult.rows[0].programs_data?.callTimes || {};

    console.log(`\n⏰ CallTimes para ${date}:`);
    result.rows.forEach(person => {
      const personId = person.id?.toString();
      const callTime = callTimes[personId] || 'NO GUARDADO';
      console.log(`${person.name.padEnd(25)} → ${callTime}`);
    });
  }

  await pool.end();
}

checkGeneradores();

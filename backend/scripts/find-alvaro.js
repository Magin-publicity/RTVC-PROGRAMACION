const pool = require('../database/db');

async function findAlvaro() {
  try {
    // Buscar Álvaro Díaz
    const alvaro = await pool.query(
      `SELECT id, name, area, grupo_reporteria, active
       FROM personnel
       WHERE name ILIKE '%alvaro%diaz%'`
    );

    console.log('👤 Álvaro Díaz:');
    console.log(JSON.stringify(alvaro.rows, null, 2));

    if (alvaro.rows.length > 0) {
      const alvaroId = alvaro.rows[0].id;

      // Ver su turno para hoy
      const shifts = await pool.query(
        `SELECT * FROM daily_schedules WHERE date = '2025-12-26' AND personnel_id = $1`,
        [alvaroId]
      );

      console.log('\n📅 Turno para 2025-12-26:');
      console.log(JSON.stringify(shifts.rows, null, 2));

      // Ver auto-shifts
      console.log('\n🔍 Verificando si aparece en auto-shifts...');
    }

    await pool.end();
  } catch (error) {
    console.error('❌ Error:', error);
    await pool.end();
  }
}

findAlvaro();

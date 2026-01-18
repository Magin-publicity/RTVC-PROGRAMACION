// Script para verificar daily_schedules de CONTRIBUCIONES
const db = require('../config/database');

async function checkDailySchedule() {
  try {
    console.log('Verificando daily_schedules para 2025-12-20...\n');

    const result = await db.query(`
      SELECT
        date,
        assignments_data
      FROM daily_schedules
      WHERE date = '2025-12-20'
    `);

    const schedule = result.rows?.[0] || result[0];

    if (!schedule) {
      console.log('❌ No hay schedule guardado para esta fecha');
      await db.end();
      return;
    }

    console.log(`✅ Schedule encontrado para ${schedule.date}\n`);

    const assignments = schedule.assignments_data;

    if (!assignments || !assignments.CONTRIBUCIONES) {
      console.log('❌ No hay asignaciones para CONTRIBUCIONES');
      await db.end();
      return;
    }

    const contribucionesData = assignments.CONTRIBUCIONES;
    console.log(`\n📋 Asignaciones de CONTRIBUCIONES:\n`);
    console.log(JSON.stringify(contribucionesData, null, 2));

    await db.end();
  } catch (error) {
    console.error('❌ Error:', error);
    await db.end();
    process.exit(1);
  }
}

checkDailySchedule();

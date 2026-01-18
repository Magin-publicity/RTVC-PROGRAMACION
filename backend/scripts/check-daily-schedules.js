const pool = require('../database/db');

async function checkDailySchedules() {
  try {
    const fecha = '2025-12-26';

    // Verificar si existe registro en daily_schedules para esta fecha
    const dailyData = await pool.query(
      'SELECT date, assignments_data FROM daily_schedules WHERE date = $1',
      [fecha]
    );

    console.log(`📅 Datos en daily_schedules para ${fecha}:`);
    if (dailyData.rows.length === 0) {
      console.log('   ❌ NO HAY DATOS - La tabla está vacía para esta fecha');
    } else {
      console.log('   ✅ SÍ HAY DATOS guardados');
      console.log('\n📋 assignments_data:');
      console.log(JSON.stringify(dailyData.rows[0].assignments_data, null, 2));
    }

    // Verificar qué devuelve el endpoint de daily schedule
    console.log(`\n🔍 Verificando endpoint /api/schedule/daily/${fecha}...`);
    const response = await fetch(`http://localhost:3000/api/schedule/daily/${fecha}`);
    const dailySchedule = await response.json();

    console.log('\n📊 Turnos (shifts) en daily schedule:');
    const contribuciones = dailySchedule.shifts?.filter(s => s.area === 'CONTRIBUCIONES') || [];
    console.log(JSON.stringify(contribuciones, null, 2));

    await pool.end();
  } catch (error) {
    console.error('❌ Error:', error);
    await pool.end();
  }
}

checkDailySchedules();

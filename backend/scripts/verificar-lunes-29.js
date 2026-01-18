const pool = require('../database/db');

async function verificar() {
  try {
    const result = await pool.query(
      'SELECT date, assignments_data FROM daily_schedules WHERE date = $1',
      ['2025-12-29']
    );

    if (result.rows.length === 0) {
      console.log('❌ Lunes 29 NO tiene programación guardada');
      console.log('💡 Solución: Ve al lunes 29 en la pestaña de Programación y guarda');
    } else {
      console.log('✅ Lunes 29 SÍ tiene programación');
      const assignments = result.rows[0].assignments_data;
      const reporteriaAssignments = Object.keys(assignments).filter(k => {
        const [personnelId] = k.split('_');
        return parseInt(personnelId) >= 94 && parseInt(personnelId) <= 125;
      });
      console.log(`📊 Asignaciones de reportería: ${reporteriaAssignments.length}`);
    }

    await pool.end();
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

verificar();

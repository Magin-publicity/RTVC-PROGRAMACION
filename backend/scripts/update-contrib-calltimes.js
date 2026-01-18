const pool = require('../config/database');

async function updateContribucionesCallTimes() {
  try {
    console.log('🔄 Actualizando callTimes de CONTRIBUCIONES...\n');

    // Fechas de enero 2026
    const startDate = new Date('2026-01-06');
    const endDate = new Date('2026-01-31');

    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      const dateStr = d.toISOString().split('T')[0];

      // Obtener turnos desde el nuevo endpoint
      const response = await fetch(`http://localhost:3000/api/contribuciones/turnos/${dateStr}`);
      const data = await response.json();
      const { turnos } = data;

      // Obtener programación existente
      const scheduleResult = await pool.query(
        'SELECT programs_data FROM daily_schedules WHERE date = $1',
        [dateStr]
      );

      if (scheduleResult.rows.length > 0) {
        const programsData = scheduleResult.rows[0].programs_data || {};
        const callTimes = programsData.callTimes || {};

        // Actualizar callTimes de CONTRIBUCIONES
        let updated = false;
        turnos.forEach(t => {
          const personId = t.personnelId.toString();
          if (callTimes[personId] !== t.callTime) {
            callTimes[personId] = t.callTime;
            console.log(`   ✏️ ${dateStr}: ${t.name} → ${t.callTime} (${t.turno})`);
            updated = true;
          }
        });

        if (updated) {
          programsData.callTimes = callTimes;
          await pool.query(
            'UPDATE daily_schedules SET programs_data = $1 WHERE date = $2',
            [JSON.stringify(programsData), dateStr]
          );
        }
      } else {
        console.log(`   ⏭️ ${dateStr}: No hay programación guardada`);
      }
    }

    console.log('\n✅ Actualización completada');
    pool.end();
  } catch (error) {
    console.error('❌ Error:', error.message);
    pool.end();
    process.exit(1);
  }
}

updateContribucionesCallTimes();

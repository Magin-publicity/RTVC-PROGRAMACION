const pool = require('../config/database');

async function cleanInvalidAssignments() {
  try {
    console.log('🧹 Limpiando asignaciones inválidas de CONTRIBUCIONES...\n');

    const startDate = new Date('2026-01-06');
    const endDate = new Date('2026-01-31');

    const contribIds = [91, 92, 93]; // Adrian, Michael, Carolina
    let totalCleaned = 0;

    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      const dateStr = d.toISOString().split('T')[0];

      // Obtener programación
      const scheduleResult = await pool.query(
        'SELECT programs_data, assignments_data FROM daily_schedules WHERE date = $1',
        [dateStr]
      );

      if (scheduleResult.rows.length === 0) continue;

      const programsData = scheduleResult.rows[0].programs_data || {};
      const assignments = scheduleResult.rows[0].assignments_data || {};
      const callTimes = programsData.callTimes || {};
      const programs = programsData.programs || [];

      let cleaned = 0;
      const newAssignments = { ...assignments };

      // Revisar cada asignación
      Object.keys(assignments).forEach(key => {
        if (!assignments[key]) return; // Solo revisar asignaciones activas

        const [personnelId, programId] = key.split('_');

        // Solo revisar CONTRIBUCIONES
        if (!contribIds.includes(parseInt(personnelId))) return;

        const callTime = callTimes[personnelId];
        if (!callTime) return;

        const program = programs.find(p => p.id === programId || p.id === parseInt(programId));
        if (!program) return;

        // Validar si está dentro del rango
        const [callHour] = callTime.split(':').map(Number);
        const [progHour, progMin] = program.defaultTime.split(':').map(Number);
        const progMinutes = progHour * 60 + progMin;

        let isValid = false;

        if (callTime === '05:00') {
          // T1: 05:00-12:00
          isValid = progMinutes >= 300 && progMinutes < 720;
        } else if (callTime === '11:00') {
          // T2: 11:00-18:00
          isValid = progMinutes >= 660 && progMinutes < 1080;
        } else if (callTime === '17:00') {
          // T3: 17:00-22:00
          isValid = progMinutes >= 1020 && progMinutes <= 1320;
        }

        if (!isValid) {
          console.log(`   🗑️ ${dateStr}: Eliminando asignación inválida - Persona ${personnelId} (${callTime}) → Programa ${program.name} (${program.defaultTime})`);
          delete newAssignments[key];
          cleaned++;
        }
      });

      if (cleaned > 0) {
        await pool.query(
          'UPDATE daily_schedules SET assignments_data = $1 WHERE date = $2',
          [JSON.stringify(newAssignments), dateStr]
        );
        totalCleaned += cleaned;
      }
    }

    console.log(`\n✅ Limpieza completada: ${totalCleaned} asignaciones inválidas eliminadas`);
    pool.end();
  } catch (error) {
    console.error('❌ Error:', error.message);
    pool.end();
    process.exit(1);
  }
}

cleanInvalidAssignments();

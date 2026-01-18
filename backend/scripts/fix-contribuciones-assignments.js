// Script para corregir asignaciones de CONTRIBUCIONES
const db = require('../config/database');

async function fixContribucionesAssignments() {
  try {
    console.log('🔧 Corrigiendo asignaciones de CONTRIBUCIONES...\n');

    // 1. Obtener el personal de CONTRIBUCIONES con sus callTimes del daily_schedule
    const scheduleResult = await db.query(`
      SELECT date, assignments_data
      FROM daily_schedules
      WHERE date >= '2025-01-05'
      ORDER BY date
    `);

    const schedules = scheduleResult.rows || scheduleResult;
    console.log(`📅 Encontrados ${schedules.length} schedules guardados\n`);

    for (const schedule of schedules) {
      const date = schedule.date.toISOString().split('T')[0];
      console.log(`\n📆 Procesando fecha: ${date}`);

      // Obtener los datos guardados
      const assignmentsData = schedule.assignments_data;
      if (!assignmentsData || !assignmentsData.CONTRIBUCIONES) {
        console.log('   ⏭️ No hay asignaciones de CONTRIBUCIONES');
        continue;
      }

      // Obtener personal de CONTRIBUCIONES con sus IDs
      const personnelResult = await db.query(`
        SELECT id, name
        FROM personnel
        WHERE area = 'CONTRIBUCIONES'
          AND active = true
        ORDER BY name
      `);

      const personnel = personnelResult.rows || personnelResult;
      console.log(`   👥 Personal: ${personnel.map(p => p.name).join(', ')}`);

      // Calcular callTimes para esta fecha
      const selectedDate = new Date(date + 'T12:00:00');
      const dayOfWeekNum = selectedDate.getDay();

      let rotationNumber;

      // Verificar si es fin de semana
      if (dayOfWeekNum === 0 || dayOfWeekNum === 6) {
        // FIN DE SEMANA
        const baseDate = new Date('2025-12-13T12:00:00');
        const daysDiff = Math.floor((selectedDate - baseDate) / (1000 * 60 * 60 * 24));
        rotationNumber = Math.floor(daysDiff / 7);
        console.log(`   📅 Fin de semana - rotación: ${rotationNumber}`);
      } else {
        // DÍA DE SEMANA
        const daysFromMonday = dayOfWeekNum === 0 ? 6 : dayOfWeekNum - 1;
        const mondayOfWeek = new Date(selectedDate);
        mondayOfWeek.setDate(selectedDate.getDate() - daysFromMonday);
        const baseMonday = new Date('2025-11-10T12:00:00');
        const daysDiff = Math.floor((mondayOfWeek - baseMonday) / (1000 * 60 * 60 * 24));
        rotationNumber = Math.floor(daysDiff / 7);
        console.log(`   📅 Día de semana - rotación: ${rotationNumber}`);
      }

      // Definir los 3 turnos
      const turnos = [
        { start: '05:00', end: '11:00', startMin: 300, endMin: 660 },  // 05:00 - 10:59
        { start: '11:00', end: '17:00', startMin: 660, endMin: 1020 }, // 11:00 - 16:59
        { start: '17:00', end: '22:00', startMin: 1020, endMin: 1320 } // 17:00 - 22:00
      ];

      // Calcular callTime para cada persona
      const callTimes = {};
      personnel.forEach((person, personIndex) => {
        const turnoIndex = (personIndex + rotationNumber) % turnos.length;
        const turno = turnos[turnoIndex];
        callTimes[person.id] = { ...turno, name: person.name };
        console.log(`   ✅ ${person.name} (ID ${person.id}): ${turno.start}-${turno.end}`);
      });

      // Obtener todos los programas
      const programsResult = await db.query(`
        SELECT id, nombre, horario_inicio
        FROM programas
        WHERE estado = 'activo'
        ORDER BY horario_inicio
      `);

      const programs = programsResult.rows || programsResult;

      // Limpiar asignaciones actuales de CONTRIBUCIONES
      let correctedCount = 0;
      let removedCount = 0;

      const newAssignments = { ...assignmentsData };

      // Recorrer todas las asignaciones actuales
      Object.keys(newAssignments).forEach(key => {
        const [personnelId, programId] = key.split('_').map(Number);

        // Verificar si es personal de CONTRIBUCIONES
        const personCallTime = callTimes[personnelId];
        if (!personCallTime) return;

        const isAssigned = newAssignments[key];
        if (!isAssigned) return;

        // Obtener el programa
        const program = programs.find(p => p.id === programId);
        if (!program) return;

        // Convertir horario del programa a minutos
        const progTime = program.horario_inicio;
        const [progHour, progMin] = progTime.split(':').map(Number);
        const progTimeMinutes = progHour * 60 + progMin;

        // Verificar si el programa está dentro del turno de la persona
        const isInShift = progTimeMinutes >= personCallTime.startMin &&
                         progTimeMinutes < personCallTime.endMin;

        if (!isInShift) {
          // Desasignar si NO está en el turno
          newAssignments[key] = false;
          removedCount++;
          console.log(`   ❌ Desasignado: ${personCallTime.name} de ${program.nombre} (${progTime})`);
        } else {
          correctedCount++;
        }
      });

      // Actualizar el schedule en la base de datos
      if (removedCount > 0) {
        await db.query(`
          UPDATE daily_schedules
          SET assignments_data = $1,
              updated_at = NOW()
          WHERE date = $2
        `, [JSON.stringify(newAssignments), date]);

        console.log(`   ✅ Corregido: ${removedCount} asignaciones removidas, ${correctedCount} asignaciones correctas`);
      } else {
        console.log(`   ✓ No se requirieron correcciones`);
      }
    }

    console.log('\n✅ Corrección completada');
    await db.end();
  } catch (error) {
    console.error('❌ Error:', error);
    await db.end();
    process.exit(1);
  }
}

fixContribucionesAssignments();

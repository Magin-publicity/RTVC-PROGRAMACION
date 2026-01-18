const { Pool } = require('pg');
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'rtvc_scheduling',
  password: 'Padres2023',
  port: 5432
});

// Función para convertir hora a minutos
function timeToMinutes(timeStr) {
  if (!timeStr || timeStr === '--:--') return 0;
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours * 60 + minutes;
}

// Programas de lunes a viernes
const WEEKDAY_PROGRAMS = [
  { id: 1, name: 'Calentado', time: '06:00-10:00', order: 1 },
  { id: 2, name: 'Emisión RTVC Noticias', time: '12:00-14:00', order: 2 },
  { id: 3, name: 'Avancé Informativo', time: '14:55-15:00', order: 3 },
  { id: 4, name: 'Avancé Informativo', time: '18:00-18:05', order: 4 },
  { id: 5, name: 'Emisión Central', time: '19:00-20:00', order: 5 },
  { id: 6, name: 'Noches de Opinión', time: '20:00-21:00', order: 6 },
  { id: 7, name: 'Última Emisión', time: '21:30-22:00', order: 7 }
];

async function regenerateAllAssignments() {
  console.log('='.repeat(80));
  console.log('REGENERANDO TODAS LAS ASIGNACIONES PARA TODO EL AÑO 2026');
  console.log('='.repeat(80));

  try {
    // 1. Limpiar todas las asignaciones existentes
    console.log('\n🗑️  Eliminando asignaciones antiguas...');
    await pool.query('DELETE FROM daily_schedules WHERE date >= $1', ['2026-01-01']);
    console.log('✅ Asignaciones antiguas eliminadas');

    // 2. Obtener todo el personal activo
    console.log('\n👥 Obteniendo personal activo...');
    const personnelResult = await pool.query(`
      SELECT id, name, area, role
      FROM personnel
      WHERE active = true
      ORDER BY area, name
    `);
    const personnel = personnelResult.rows;
    console.log(`✅ ${personnel.length} personas activas encontradas`);

    // 3. Generar asignaciones para cada día del año 2026
    const startDate = new Date('2026-01-01');
    const endDate = new Date('2026-12-31');

    let totalDays = 0;
    let totalAssignments = 0;

    for (let date = new Date(startDate); date <= endDate; date.setDate(date.getDate() + 1)) {
      const dateStr = date.toISOString().split('T')[0];
      const dayOfWeek = date.getDay(); // 0 = domingo, 6 = sábado

      // Solo procesar días de semana (lunes a viernes)
      if (dayOfWeek === 0 || dayOfWeek === 6) {
        continue; // Saltar fines de semana por ahora
      }

      totalDays++;

      // Obtener los turnos automáticos para esta fecha
      const shiftsResponse = await fetch(`http://localhost:3000/api/schedule/auto-shifts/${dateStr}`);
      if (!shiftsResponse.ok) {
        console.error(`❌ Error obteniendo turnos para ${dateStr}`);
        continue;
      }

      const shifts = await shiftsResponse.json();

      // Crear un mapa de personnel_id -> shift_start
      const callTimes = {};
      shifts.forEach(shift => {
        callTimes[shift.personnel_id] = shift.shift_start.substring(0, 5);
      });

      // Generar asignaciones automáticas
      const assignments = {};

      personnel.forEach(person => {
        const callTime = callTimes[person.id];
        if (!callTime || callTime === '--:--') return;

        const callMinutes = timeToMinutes(callTime);

        WEEKDAY_PROGRAMS.forEach(program => {
          const programStartTime = program.time.split('-')[0].trim();
          const programMinutes = timeToMinutes(programStartTime);

          // Solo asignar si el programa empieza en o después del llamado
          if (programMinutes >= callMinutes) {
            const key = `${person.id}_${program.id}`;
            assignments[key] = true;
            totalAssignments++;
          }
        });
      });

      // Guardar en la base de datos
      const scheduleData = {
        date: dateStr,
        assignments: assignments,
        callTimes: callTimes
      };

      await pool.query(
        `INSERT INTO daily_schedules (date, assignments_data, created_at, updated_at)
         VALUES ($1, $2, NOW(), NOW())
         ON CONFLICT (date)
         DO UPDATE SET assignments_data = $2, updated_at = NOW()`,
        [dateStr, JSON.stringify(scheduleData)]
      );

      if (totalDays % 10 === 0) {
        console.log(`📅 Procesados ${totalDays} días...`);
      }
    }

    console.log('\n' + '='.repeat(80));
    console.log('✅ REGENERACIÓN COMPLETADA');
    console.log('='.repeat(80));
    console.log(`📅 Días procesados: ${totalDays}`);
    console.log(`✅ Asignaciones totales creadas: ${totalAssignments}`);
    console.log('\n🔄 Refresque el navegador para ver los cambios');

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error.stack);
  } finally {
    pool.end();
  }
}

regenerateAllAssignments();

const pool = require('../database/db');

async function regenerarAsignaciones() {
  try {
    const fecha = '2025-12-26';
    console.log(`\n🔄 Regenerando asignaciones para ${fecha}...\n`);

    // 1. Obtener todos los turnos del día desde la API
    const response = await fetch(`http://localhost:3000/api/schedule/auto-shifts/${fecha}`);
    const shifts = await response.json();

    console.log(`✅ ${shifts.length} turnos encontrados`);

    // 2. Programas de lunes a viernes
    const programs = [
      { id: 1, name: 'Calentado', time: '06:00' },
      { id: 2, name: 'Avance Informativo', time: '11:00' },
      { id: 3, name: 'Emisión RTVC Noticias', time: '12:00' },
      { id: 4, name: 'Avance Informativo', time: '15:30' },
      { id: 5, name: 'Avance Informativo', time: '17:00' },
      { id: 6, name: 'Señal Investigativa', time: '17:00' },
      { id: 7, name: 'Avance Informativo', time: '18:00' },
      { id: 8, name: 'Emisión Central', time: '19:00' },
      { id: 9, name: 'Noches de Opinión', time: '20:00' },
      { id: 10, name: 'Última Emisión', time: '21:30' }
    ];

    // 3. Generar asignaciones
    const assignments = {};
    const callTimes = {};

    shifts.forEach(shift => {
      const shiftStart = shift.shift_start.substring(0, 5); // "08:00"
      const shiftEnd = shift.shift_end.substring(0, 5);

      callTimes[shift.personnel_id] = shiftStart;

      // Convertir a minutos
      const [startHour, startMin] = shiftStart.split(':').map(Number);
      const [endHour, endMin] = shiftEnd.split(':').map(Number);
      const startMinutes = startHour * 60 + startMin;
      const endMinutes = endHour * 60 + endMin;

      programs.forEach(program => {
        const [progHour, progMin] = program.time.split(':').map(Number);
        const progMinutes = progHour * 60 + progMin;

        // Asignar si el programa está dentro de la franja horaria
        if (progMinutes >= startMinutes && progMinutes < endMinutes) {
          const key = `${shift.personnel_id}_${program.id}`;
          assignments[key] = true;
        }
      });
    });

    console.log(`✅ ${Object.keys(assignments).length} asignaciones generadas`);
    console.log(`✅ ${Object.keys(callTimes).length} horarios de llamado generados`);

    // 4. Guardar en BD
    const scheduleData = {
      programs,
      assignments,
      callTimes
    };

    await pool.query(`
      INSERT INTO daily_schedules (date, assignments_data, programs_data, created_at, updated_at)
      VALUES ($1, $2, $3, NOW(), NOW())
      ON CONFLICT (date)
      DO UPDATE SET
        assignments_data = $2,
        programs_data = $3,
        updated_at = NOW()
    `, [fecha, JSON.stringify(scheduleData), JSON.stringify(programs)]);

    console.log('\n✅ Asignaciones guardadas en base de datos');
    console.log('\n📊 Resumen:');
    console.log(`   Fecha: ${fecha}`);
    console.log(`   Programas: ${programs.length}`);
    console.log(`   Personal: ${shifts.length}`);
    console.log(`   Asignaciones: ${Object.keys(assignments).length}`);
    console.log(`   Horarios de llamado: ${Object.keys(callTimes).length}`);

    await pool.end();
    console.log('\n✅ Completado\n');

  } catch (error) {
    console.error('❌ Error:', error);
    await pool.end();
    process.exit(1);
  }
}

regenerarAsignaciones();

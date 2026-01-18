const pool = require('../database/db');
const { getTurnoActual } = require('../utils/reporteriaRotation');

// Script para rotar las asignaciones de programas según el turno de la semana 29

async function rotarProgramas() {
  try {
    console.log('\n🔄 ROTACIÓN DE PROGRAMAS PARA SEMANA 29\n');

    const fecha = '2025-12-29';

    // 1. Obtener la programación actual
    const scheduleResult = await pool.query(
      'SELECT * FROM daily_schedules WHERE date = $1',
      [fecha]
    );

    if (scheduleResult.rows.length === 0) {
      console.log('❌ No hay programación para', fecha);
      await pool.end();
      return;
    }

    const currentAssignments = scheduleResult.rows[0].assignments_data;
    const programsData = scheduleResult.rows[0].programs_data;
    const programs = programsData.programs || [];

    // 2. Obtener todo el personal de reportería con sus grupos
    const reporteriaResult = await pool.query(`
      SELECT id, name, grupo_reporteria FROM personnel
      WHERE area IN ('CAMARÓGRAFOS DE REPORTERÍA', 'ASISTENTES DE REPORTERÍA')
        AND active = true
      ORDER BY id
    `);

    const reporteriaIds = reporteriaResult.rows.map(p => p.id.toString());

    // 3. Separar programas por franja horaria
    const programasAM = programs.filter(p => {
      const [hora] = p.defaultTime.split(':');
      return parseInt(hora) < 13;
    });

    const programasPM = programs.filter(p => {
      const [hora] = p.defaultTime.split(':');
      return parseInt(hora) >= 13;
    });

    console.log(`📊 Programas:`);
    console.log(`   AM (< 13:00): ${programasAM.length}`);
    programasAM.forEach(p => console.log(`     - ${p.name} (${p.defaultTime})`));
    console.log(`   PM (>= 13:00): ${programasPM.length}`);
    programasPM.forEach(p => console.log(`     - ${p.name} (${p.defaultTime})`));

    // 4. Crear nuevas asignaciones según turno actual
    const newAssignments = {};

    // Copiar asignaciones no-reportería
    Object.keys(currentAssignments).forEach(key => {
      const [personnelId] = key.split('_');
      if (!reporteriaIds.includes(personnelId)) {
        newAssignments[key] = currentAssignments[key];
      }
    });

    // 5. Asignar programas según turno
    let asignadosAM = 0;
    let asignadosPM = 0;

    reporteriaResult.rows.forEach(persona => {
      const turnoInfo = getTurnoActual(persona.grupo_reporteria, fecha);
      const programasAsignar = turnoInfo.turno === 'AM' ? programasAM : programasPM;

      programasAsignar.forEach(programa => {
        const key = `${persona.id}_${programa.id}`;
        newAssignments[key] = true;

        if (turnoInfo.turno === 'AM') {
          asignadosAM++;
        } else {
          asignadosPM++;
        }
      });

      console.log(`   ${persona.name} (${persona.grupo_reporteria}): ${turnoInfo.turno} - ${programasAsignar.length} programas`);
    });

    console.log(`\n📈 Resumen:`);
    console.log(`   Asignaciones AM: ${asignadosAM}`);
    console.log(`   Asignaciones PM: ${asignadosPM}`);
    console.log(`   Total nuevas asignaciones reportería: ${asignadosAM + asignadosPM}`);

    // 6. Guardar
    await pool.query(
      `UPDATE daily_schedules
       SET assignments_data = $1, updated_at = CURRENT_TIMESTAMP
       WHERE date = $2`,
      [JSON.stringify(newAssignments), fecha]
    );

    console.log(`\n✅ Programas rotados exitosamente para ${fecha}\n`);

    await pool.end();
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

rotarProgramas();

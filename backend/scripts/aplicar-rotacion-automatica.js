const pool = require('../database/db');
const { getTurnoActual } = require('../utils/reporteriaRotation');

// Script para aplicar rotación automática a TODAS las semanas

async function aplicarRotacion(fecha) {
  console.log(`\n📅 Procesando ${fecha}...`);

  // 1. Obtener la programación actual
  const scheduleResult = await pool.query(
    'SELECT * FROM daily_schedules WHERE date = $1',
    [fecha]
  );

  if (scheduleResult.rows.length === 0) {
    console.log(`   ⚠️  No hay programación para ${fecha}`);
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
  });

  // 6. Guardar
  await pool.query(
    `UPDATE daily_schedules
     SET assignments_data = $1, updated_at = CURRENT_TIMESTAMP
     WHERE date = $2`,
    [JSON.stringify(newAssignments), fecha]
  );

  console.log(`   ✅ Rotación aplicada: ${asignadosAM} AM, ${asignadosPM} PM`);
}

async function aplicarRotacionCompleta() {
  try {
    console.log('\n🔄 APLICANDO ROTACIÓN AUTOMÁTICA A TODAS LAS SEMANAS\n');

    // Semanas a procesar
    const semanas = [
      // Semana del 22 de diciembre
      ['2025-12-22', '2025-12-23', '2025-12-24', '2025-12-25', '2025-12-26'],
      // Semana del 29 de diciembre
      ['2025-12-29', '2025-12-30', '2025-12-31', '2026-01-01', '2026-01-02']
    ];

    for (const semana of semanas) {
      console.log(`\n📆 SEMANA: ${semana[0]} a ${semana[4]}`);

      for (const fecha of semana) {
        await aplicarRotacion(fecha);
      }
    }

    console.log(`\n✅ Rotación automática aplicada a todas las semanas\n`);

    await pool.end();
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

aplicarRotacionCompleta();

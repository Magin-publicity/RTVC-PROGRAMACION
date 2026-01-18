const pool = require('../database/db');
const { getTurnoActual } = require('../utils/reporteriaRotation');

async function analizar() {
  try {
    const fecha = '2025-12-29';

    // 1. Obtener la programación guardada
    const scheduleResult = await pool.query(
      'SELECT assignments_data, programs_data FROM daily_schedules WHERE date = $1',
      [fecha]
    );

    if (scheduleResult.rows.length === 0) {
      console.log('❌ No hay programación para 2025-12-29');
      await pool.end();
      return;
    }

    const assignments = scheduleResult.rows[0].assignments_data;
    const programsData = scheduleResult.rows[0].programs_data;
    const programs = programsData.programs || [];

    console.log('\n📋 PROGRAMAS DISPONIBLES:');
    programs.forEach(p => {
      console.log(`   ${p.id}: ${p.name} (${p.defaultTime})`);
    });

    // 2. Obtener Floresmiro Luna (debe estar en turno PM)
    const floresmiro = await pool.query(
      'SELECT id, name, grupo_reporteria FROM personnel WHERE name = $1',
      ['Floresmiro Luna']
    );

    const floresId = floresmiro.rows[0].id;
    const floresGrupo = floresmiro.rows[0].grupo_reporteria;

    // 3. Calcular su turno actual
    const turnoInfo = getTurnoActual(floresGrupo, fecha);

    console.log(`\n👤 FLORESMIRO LUNA (ID ${floresId}, ${floresGrupo}):`);
    console.log(`   Turno calculado: ${turnoInfo.turno} (${turnoInfo.horario})`);
    console.log(`   Call Time: ${turnoInfo.callTime}`);

    // 4. Ver qué programas tiene asignados en la BD
    const floresAssignments = Object.entries(assignments).filter(([key]) =>
      key.startsWith(floresId + '_')
    );

    console.log(`\n📊 ASIGNACIONES EN BD (${floresAssignments.length}):`);
    floresAssignments.forEach(([key, value]) => {
      const [, programId] = key.split('_');
      const programa = programs.find(p => p.id.toString() === programId);
      if (value === true && programa) {
        console.log(`   ✅ ${programa.name} (${programa.defaultTime})`);
      }
    });

    // 5. ANÁLISIS: ¿Cuáles son incompatibles?
    console.log(`\n⚠️ PROGRAMAS INCOMPATIBLES (turno ${turnoInfo.turno}):`);
    floresAssignments.forEach(([key, value]) => {
      const [, programId] = key.split('_');
      const programa = programs.find(p => p.id.toString() === programId);
      if (value === true && programa) {
        const [horaPrograma] = programa.defaultTime.split(':');
        const hora = parseInt(horaPrograma);

        if (turnoInfo.turno === 'PM' && hora < 13) {
          console.log(`   ❌ ${programa.name} (${programa.defaultTime}) - ANTES DE 13:00`);
        } else if (turnoInfo.turno === 'AM' && hora >= 13) {
          console.log(`   ❌ ${programa.name} (${programa.defaultTime}) - DESPUÉS DE 13:00`);
        }
      }
    });

    await pool.end();
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

analizar();

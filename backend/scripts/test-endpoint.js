const pool = require('../database/db');
const { getTurnoActual } = require('../utils/reporteriaRotation');

async function testEndpoint() {
  try {
    const fecha = '2025-12-22';

    // Simular el código del endpoint
    const scheduleResult = await pool.query(
      'SELECT assignments_data, programs_data FROM daily_schedules WHERE date = $1',
      [fecha]
    );

    const assignmentsData = scheduleResult.rows[0]?.assignments_data || {};
    const programsData = scheduleResult.rows[0]?.programs_data || {};
    const programs = programsData.programs || [];

    // Obtener Álvaro Díaz
    const persona = {
      id: 94,
      name: 'Álvaro Díaz',
      grupo_reporteria: 'GRUPO_A'
    };

    console.log(`\n🎯 Procesando: ${persona.name} (ID ${persona.id})`);

    // Buscar programas asignados
    const programasAsignados = [];
    Object.entries(assignmentsData).forEach(([key, value]) => {
      const [personnelId, programId] = key.split('_');
      if (personnelId === persona.id.toString() && value === true) {
        // Buscar el programa (programId puede ser string o número)
        const programa = programs.find(p => p.id.toString() === programId.toString());
        if (programa) {
          programasAsignados.push({
            id: programId,
            nombre: programa.name,
            hora: programa.defaultTime || programa.time
          });
        }
      }
    });

    console.log(`\n📋 Programas asignados: ${programasAsignados.length}`);
    programasAsignados.forEach((p, i) => {
      console.log(`   ${i + 1}. ${p.nombre} - ${p.hora}`);
    });

    // Crear espacios
    console.log(`\n🆕 Creando espacios...`);
    for (let i = 1; i <= 3; i++) {
      const programaAsignado = programasAsignados[i - 1];
      console.log(`   Espacio ${i}: ${programaAsignado ? programaAsignado.nombre + ' (' + programaAsignado.hora + ')' : 'vacío'}`);
    }

    await pool.end();
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

testEndpoint();

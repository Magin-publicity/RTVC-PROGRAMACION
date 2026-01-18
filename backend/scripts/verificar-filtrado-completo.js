const http = require('http');
const { getTurnoActual } = require('../utils/reporteriaRotation');

// Comprehensive test to verify all reportería employees have compatible assignments

const fecha = '2025-12-30'; // Tuesday

const options = {
  hostname: 'localhost',
  port: 3000,
  path: `/api/schedule/daily/${fecha}`,
  method: 'GET'
};

console.log(`\n🔍 VERIFICACIÓN COMPLETA - ${fecha}\n`);

const req = http.request(options, (res) => {
  let data = '';

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    const json = JSON.parse(data);

    console.log(`📅 Fecha: ${fecha}`);
    console.log(`📊 Total asignaciones: ${Object.keys(json.assignments).length}`);

    // Get all reportería personnel with their groups
    const reporteriaIds = Array.from({length: 32}, (_, i) => 94 + i);

    // Group personnel by their assignments
    const personalAsignaciones = {};

    reporteriaIds.forEach(id => {
      const asignaciones = Object.entries(json.assignments).filter(([key, value]) =>
        key.startsWith(id + '_') && value === true
      );

      if (asignaciones.length > 0) {
        personalAsignaciones[id] = asignaciones.map(([key]) => {
          const [, programId] = key.split('_');
          return programId;
        });
      }
    });

    // Test personnel from different groups
    const testPersonnel = [
      { id: 94, name: 'Álvaro Díaz', grupo: 'GRUPO_A' },
      { id: 110, name: 'Floresmiro Luna', grupo: 'GRUPO_B' },
      { id: 95, name: 'Camila González', grupo: 'GRUPO_A' },
      { id: 111, name: 'Carlos Ramírez', grupo: 'GRUPO_B' }
    ];

    let totalCompatibles = 0;
    let totalIncompatibles = 0;

    console.log('\n📋 VERIFICACIÓN POR EMPLEADO:\n');

    testPersonnel.forEach(persona => {
      const programIds = personalAsignaciones[persona.id] || [];

      if (programIds.length === 0) {
        console.log(`👤 ${persona.name} (${persona.grupo}):`);
        console.log(`   Sin asignaciones\n`);
        return;
      }

      const turnoInfo = getTurnoActual(persona.grupo, fecha);

      console.log(`👤 ${persona.name} (${persona.grupo}):`);
      console.log(`   Turno: ${turnoInfo.turno} (${turnoInfo.horario})`);
      console.log(`   Asignaciones: ${programIds.length}`);

      let compatibles = 0;
      let incompatibles = 0;

      programIds.forEach(programId => {
        const programa = json.programs.find(p => p.id.toString() === programId);

        if (programa) {
          const [horaStr] = programa.defaultTime.split(':');
          const hora = parseInt(horaStr);

          const esCompatible = (turnoInfo.turno === 'AM' && hora < 13) ||
                               (turnoInfo.turno === 'PM' && hora >= 13);

          if (esCompatible) {
            compatibles++;
            console.log(`   ✅ ${programa.name} (${programa.defaultTime})`);
          } else {
            incompatibles++;
            console.log(`   ❌ ${programa.name} (${programa.defaultTime}) - INCOMPATIBLE`);
          }
        }
      });

      totalCompatibles += compatibles;
      totalIncompatibles += incompatibles;

      console.log(`   Resultado: ${compatibles} compatibles, ${incompatibles} incompatibles\n`);
    });

    console.log('═══════════════════════════════════════════');
    console.log(`📊 RESUMEN FINAL:`);
    console.log(`   Total compatibles: ${totalCompatibles}`);
    console.log(`   Total incompatibles: ${totalIncompatibles}`);

    if (totalIncompatibles === 0) {
      console.log(`\n🎉 ¡PERFECTO! Todas las asignaciones son compatibles`);
    } else {
      console.log(`\n⚠️ HAY ${totalIncompatibles} ASIGNACIONES INCOMPATIBLES`);
    }
    console.log('═══════════════════════════════════════════\n');
  });
});

req.on('error', (error) => {
  console.error('Error:', error);
});

req.end();

const http = require('http');

// Test script to verify POST endpoint filters assignments by shift
// This will test saving a Monday and checking if Tuesday has filtered assignments

const fecha = '2025-12-29'; // Monday

// First, let's get the current Monday data
const getOptions = {
  hostname: 'localhost',
  port: 3000,
  path: `/api/schedule/daily/${fecha}`,
  method: 'GET'
};

console.log('\n🔍 PASO 1: Obteniendo programación del lunes 29...\n');

const getReq = http.request(getOptions, (res) => {
  let data = '';

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    const lunesData = JSON.parse(data);

    console.log(`✅ Lunes cargado`);
    console.log(`   Total assignments: ${Object.keys(lunesData.assignments).length}`);

    // Count reportería assignments
    const reporteriaIds = Array.from({length: 32}, (_, i) => (94 + i).toString());
    const reporteriaAssignments = Object.entries(lunesData.assignments).filter(([key]) => {
      const [personnelId] = key.split('_');
      return reporteriaIds.includes(personnelId);
    });

    console.log(`   Reportería assignments: ${reporteriaAssignments.length}`);

    // Now POST this Monday to trigger espejo semanal with filtering
    console.log('\n📤 PASO 2: Guardando lunes (trigger espejo semanal con filtrado)...\n');

    const postData = JSON.stringify(lunesData);

    const postOptions = {
      hostname: 'localhost',
      port: 3000,
      path: `/api/schedule/daily/${fecha}`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const postReq = http.request(postOptions, (postRes) => {
      let postDataStr = '';

      postRes.on('data', (chunk) => {
        postDataStr += chunk;
      });

      postRes.on('end', () => {
        console.log('✅ Lunes guardado con espejo semanal');

        // Now check Tuesday to see if assignments were filtered
        console.log('\n🔍 PASO 3: Verificando martes 30 (debe tener asignaciones filtradas)...\n');

        const martes = '2025-12-30';
        const checkOptions = {
          hostname: 'localhost',
          port: 3000,
          path: `/api/schedule/daily/${martes}`,
          method: 'GET'
        };

        const checkReq = http.request(checkOptions, (checkRes) => {
          let checkData = '';

          checkRes.on('data', (chunk) => {
            checkData += chunk;
          });

          checkRes.on('end', () => {
            const martesData = JSON.parse(checkData);

            console.log(`📅 MARTES 30:`);
            console.log(`   Total assignments: ${Object.keys(martesData.assignments).length}`);

            // Analyze Floresmiro Luna (should only have AM programs)
            const floresAssignments = Object.entries(martesData.assignments).filter(([key]) =>
              key.startsWith('110_')
            );

            console.log(`\n👤 Floresmiro Luna (ID 110):`);
            console.log(`   Total asignaciones: ${floresAssignments.length}`);

            const { getTurnoActual } = require('../utils/reporteriaRotation');
            const turnoInfo = getTurnoActual('GRUPO_B', martes);
            console.log(`   Turno: ${turnoInfo.turno} (${turnoInfo.horario})`);

            // Check each assignment
            let compatibles = 0;
            let incompatibles = 0;

            floresAssignments.forEach(([key, value]) => {
              if (value === true) {
                const [, programId] = key.split('_');
                const programa = martesData.programs.find(p => p.id.toString() === programId);

                if (programa) {
                  const [horaStr] = programa.defaultTime.split(':');
                  const hora = parseInt(horaStr);

                  const esCompatible = (turnoInfo.turno === 'AM' && hora < 13) ||
                                       (turnoInfo.turno === 'PM' && hora >= 13);

                  if (esCompatible) {
                    compatibles++;
                    console.log(`   ✅ ${programa.name} (${programa.defaultTime}) - Compatible con ${turnoInfo.turno}`);
                  } else {
                    incompatibles++;
                    console.log(`   ❌ ${programa.name} (${programa.defaultTime}) - INCOMPATIBLE con ${turnoInfo.turno}`);
                  }
                }
              }
            });

            console.log(`\n📊 RESULTADO:`);
            console.log(`   Compatibles: ${compatibles}`);
            console.log(`   Incompatibles: ${incompatibles}`);

            if (incompatibles === 0) {
              console.log(`\n🎉 ¡ÉXITO! Todas las asignaciones son compatibles con el turno`);
            } else {
              console.log(`\n⚠️ PROBLEMA: Hay ${incompatibles} asignaciones incompatibles`);
            }
          });
        });

        checkReq.on('error', (error) => {
          console.error('Error:', error);
        });

        checkReq.end();
      });
    });

    postReq.on('error', (error) => {
      console.error('Error:', error);
    });

    postReq.write(postData);
    postReq.end();
  });
});

getReq.on('error', (error) => {
  console.error('Error:', error);
});

getReq.end();

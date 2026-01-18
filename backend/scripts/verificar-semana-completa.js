const http = require('http');
const { getTurnoActual } = require('../utils/reporteriaRotation');

// Verify the entire week has correct shift-based filtering

const fechas = [
  '2025-12-29', // Lunes
  '2025-12-30', // Martes
  '2025-12-31', // Miércoles
  '2026-01-01', // Jueves
  '2026-01-02'  // Viernes
];

const diasSemana = ['LUNES', 'MARTES', 'MIÉRCOLES', 'JUEVES', 'VIERNES'];

async function verificarFecha(fecha, dia) {
  return new Promise((resolve) => {
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: `/api/schedule/daily/${fecha}`,
      method: 'GET'
    };

    const req = http.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        const json = JSON.parse(data);

        // Test Floresmiro Luna (GRUPO_B, should be AM in week 53)
        const floresAssignments = Object.entries(json.assignments).filter(([key, value]) =>
          key.startsWith('110_') && value === true
        );

        const turnoInfo = getTurnoActual('GRUPO_B', fecha);

        let compatibles = 0;
        let incompatibles = 0;

        floresAssignments.forEach(([key]) => {
          const [, programId] = key.split('_');
          const programa = json.programs.find(p => p.id.toString() === programId);

          if (programa) {
            const [horaStr] = programa.defaultTime.split(':');
            const hora = parseInt(horaStr);

            const esCompatible = (turnoInfo.turno === 'AM' && hora < 13) ||
                                 (turnoInfo.turno === 'PM' && hora >= 13);

            if (esCompatible) {
              compatibles++;
            } else {
              incompatibles++;
            }
          }
        });

        resolve({
          dia,
          fecha,
          turno: turnoInfo.turno,
          asignaciones: floresAssignments.length,
          compatibles,
          incompatibles
        });
      });
    });

    req.on('error', (error) => {
      console.error('Error:', error);
      resolve(null);
    });

    req.end();
  });
}

async function verificarSemana() {
  console.log('\n═══════════════════════════════════════════');
  console.log('🔍 VERIFICACIÓN SEMANA COMPLETA (29 Dic - 2 Ene)');
  console.log('═══════════════════════════════════════════\n');
  console.log('👤 Floresmiro Luna (GRUPO_B) - Turno AM en semana 53\n');

  for (let i = 0; i < fechas.length; i++) {
    const resultado = await verificarFecha(fechas[i], diasSemana[i]);

    if (resultado) {
      const icon = resultado.incompatibles === 0 ? '✅' : '❌';
      console.log(`${icon} ${resultado.dia} (${resultado.fecha}):`);
      console.log(`   Turno calculado: ${resultado.turno}`);
      console.log(`   Asignaciones: ${resultado.asignaciones}`);
      console.log(`   Compatibles: ${resultado.compatibles} | Incompatibles: ${resultado.incompatibles}`);

      if (resultado.incompatibles > 0) {
        console.log(`   ⚠️ PROBLEMA: Tiene programas incompatibles con su turno`);
      }

      console.log('');
    }
  }

  console.log('═══════════════════════════════════════════\n');
}

verificarSemana();

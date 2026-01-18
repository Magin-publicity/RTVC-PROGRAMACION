// Script para verificar asignación de camarógrafos de estudio en fin de semana
const http = require('http');

function testWeekendCameras(date) {
  const options = {
    hostname: 'localhost',
    port: 3000,
    path: `/api/schedule/auto-shifts/${date}`,
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    }
  };

  const req = http.request(options, (res) => {
    let data = '';

    res.on('data', (chunk) => {
      data += chunk;
    });

    res.on('end', () => {
      const shifts = JSON.parse(data);

      console.log(`\n📅 Turnos para ${date}`);

      // Filtrar camarógrafos de estudio
      const camarasEstudio = shifts.filter(s => s.area === 'CAMARÓGRAFOS DE ESTUDIO');

      const amShifts = camarasEstudio.filter(s => s.shift_start === '08:00:00');
      const pmShifts = camarasEstudio.filter(s => s.shift_start === '14:00:00');

      console.log(`\n🎥 CAMARÓGRAFOS DE ESTUDIO:`);
      console.log(`   Total: ${camarasEstudio.length}`);
      console.log(`   Turno AM (08:00-16:00): ${amShifts.length} personas`);
      console.log(`   Turno PM (14:00-22:00): ${pmShifts.length} personas`);

      if (amShifts.length > 0) {
        console.log(`\n   👥 Turno AM:`);
        amShifts.forEach(s => console.log(`      #${s.rotation_number} ${s.name}`));
      }

      if (pmShifts.length > 0) {
        console.log(`\n   👥 Turno PM:`);
        pmShifts.forEach(s => console.log(`      #${s.rotation_number} ${s.name}`));
      }

      if (amShifts.length !== 4 || pmShifts.length !== 4) {
        console.log(`\n   ❌ ERROR: Se esperaban 4 en AM y 4 en PM`);
      } else {
        console.log(`\n   ✅ Correcto: 4 en AM y 4 en PM`);
      }
    });
  });

  req.on('error', (error) => {
    console.error('❌ Error:', error.message);
  });

  req.end();
}

// Probar con sábado 3 de enero 2026
testWeekendCameras('2026-01-04');

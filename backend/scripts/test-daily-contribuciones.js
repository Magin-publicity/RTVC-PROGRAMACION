// Script para probar el endpoint daily de CONTRIBUCIONES
const http = require('http');

function testDaily() {
  const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/schedule/daily/2025-12-20',
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
      const result = JSON.parse(data);

      console.log('\n📅 Schedule para 2025-12-20');
      console.log('found:', result.found);

      if (result.callTimes) {
        console.log('\n⏰ CallTimes de CONTRIBUCIONES:');
        console.log('  91 (Adrian Contreras):', result.callTimes['91'] || 'N/A');
        console.log('  92 (Michael Torres):', result.callTimes['92'] || 'N/A');
        console.log('  93 (Carolina Benavides):', result.callTimes['93'] || 'N/A');
      }

      if (result.shifts) {
        const contribShifts = result.shifts.filter(s => s.area === 'CONTRIBUCIONES');
        console.log('\n📋 Shifts de CONTRIBUCIONES:');
        contribShifts.forEach(s => {
          console.log(`  ${s.name}: ${s.shift_start} - ${s.shift_end} (${s.original_shift})`);
        });
      }
    });
  });

  req.on('error', (error) => {
    console.error('❌ Error:', error.message);
  });

  req.end();
}

testDaily();

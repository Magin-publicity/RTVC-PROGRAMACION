const http = require('http');

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/api/schedule/auto-shifts/2026-01-04',
  method: 'GET'
};

const req = http.request(options, (res) => {
  let data = '';
  res.on('data', (chunk) => { data += chunk; });
  res.on('end', () => {
    const shifts = JSON.parse(data);
    const camaras = shifts.filter(s => s.area === 'CAMARÓGRAFOS DE ESTUDIO');

    console.log('\n📹 CAMARÓGRAFOS DE ESTUDIO - Shifts generados:');
    console.log(`Total: ${camaras.length}`);
    console.log(`AM (08:00): ${camaras.filter(s => s.shift_start === '08:00:00').length}`);
    console.log(`PM (14:00): ${camaras.filter(s => s.shift_start === '14:00:00').length}`);

    console.log('\nTurno AM:');
    camaras.filter(s => s.shift_start === '08:00:00').forEach(s =>
      console.log(`  ${s.name} (ID: ${s.personnel_id})`)
    );

    console.log('\nTurno PM:');
    camaras.filter(s => s.shift_start === '14:00:00').forEach(s =>
      console.log(`  ${s.name} (ID: ${s.personnel_id})`)
    );
  });
});

req.on('error', (e) => console.error(e));
req.end();

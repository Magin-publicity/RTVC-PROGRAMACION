const http = require('http');

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/api/schedule/auto-shifts/2026-01-05', // Lunes 5 de enero
  method: 'GET'
};

const req = http.request(options, (res) => {
  let data = '';
  res.on('data', (chunk) => { data += chunk; });
  res.on('end', () => {
    const shifts = JSON.parse(data);

    console.log('\n📺 GENERADORES DE CARACTERES - Shifts generados:\n');

    const generadores = shifts.filter(s => s.area === 'GENERADORES DE CARACTERES');

    generadores.forEach(s => {
      console.log(`${s.name.padEnd(25)} ${s.shift_start} - ${s.shift_end} (${s.original_shift})`);
    });

    console.log('\n📊 PRODUCTORES - Shifts generados:\n');

    const productores = shifts.filter(s => s.area === 'PRODUCTORES');

    productores.forEach(s => {
      console.log(`${s.name.padEnd(25)} ${s.shift_start} - ${s.shift_end} (${s.original_shift})`);
    });
  });
});

req.on('error', (e) => console.error(e));
req.end();

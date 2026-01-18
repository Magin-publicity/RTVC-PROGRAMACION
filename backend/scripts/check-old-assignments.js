const http = require('http');

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/api/schedule/daily/2026-04-21', // Fecha que sabemos que tiene datos
  method: 'GET'
};

const req = http.request(options, (res) => {
  let data = '';
  res.on('data', (chunk) => { data += chunk; });
  res.on('end', () => {
    const response = JSON.parse(data);
    const assignments = response.assignments || {};

    console.log('\n📅 ASIGNACIONES PARA 2026-04-21 (FECHA ANTIGUA QUE FUNCIONABA)\n');
    console.log(`Total asignaciones: ${Object.keys(assignments).length}`);

    // Ver primeras 3 asignaciones para ver estructura
    const firstThree = Object.entries(assignments).slice(0, 3);
    console.log('\n🔍 Estructura de las primeras 3 asignaciones:');
    firstThree.forEach(([key, value]) => {
      console.log(`\nKey: ${key}`);
      console.log('Value:', JSON.stringify(value, null, 2));
    });

    // Verificar si tienen campo area
    const withArea = Object.values(assignments).filter(a => a.area);
    console.log(`\n📊 Asignaciones CON campo area: ${withArea.length}`);
    console.log(`📊 Asignaciones SIN campo area: ${Object.keys(assignments).length - withArea.length}`);
  });
});

req.on('error', (e) => console.error(e));
req.end();

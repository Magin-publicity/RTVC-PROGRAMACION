const http = require('http');

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/api/schedule/daily/2026-01-07',
  method: 'GET'
};

const req = http.request(options, (res) => {
  let data = '';
  res.on('data', (chunk) => { data += chunk; });
  res.on('end', () => {
    const response = JSON.parse(data);
    const assignments = response.assignments || {};

    console.log('\n📅 ASIGNACIONES PARA 2026-01-07\n');
    console.log(`Total asignaciones: ${Object.keys(assignments).length}`);
    console.log(`Total callTimes: ${Object.keys(response.callTimes || {}).length}`);
    console.log(`Total programas: ${(response.programs || []).length}`);

    const areas = {};
    Object.values(assignments).forEach(a => {
      if (!areas[a.area]) areas[a.area] = 0;
      areas[a.area]++;
    });

    console.log('\n📊 Asignaciones por área:');
    Object.entries(areas).sort((a,b) => b[1] - a[1]).forEach(([area, count]) => {
      console.log(`  ${area}: ${count} asignaciones`);
    });

    // Ver ejemplos de GENERADORES
    const genAssignments = Object.entries(assignments).filter(([k,v]) =>
      v.area && v.area.includes('GENERADOR')
    );

    console.log(`\n📺 GENERADORES (encontradas ${genAssignments.length}):` );
    genAssignments.slice(0, 5).forEach(([k,v]) => {
      console.log(`  ${v.personnel_name}: ${v.program_name}`);
    });
  });
});

req.on('error', (e) => console.error(e));
req.end();

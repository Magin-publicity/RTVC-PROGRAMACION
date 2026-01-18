const http = require('http');

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/api/schedule/daily/2025-12-30',
  method: 'GET'
};

const req = http.request(options, (res) => {
  let data = '';

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    const json = JSON.parse(data);

    console.log('\n📅 MARTES 30 DE DICIEMBRE:');
    console.log(`Found: ${json.found}`);
    console.log(`Total assignments: ${Object.keys(json.assignments).length}`);

    // Contar asignaciones de reportería
    const reporteriaIds = Array.from({length: 32}, (_, i) => (94 + i).toString());
    const reporteriaAssignments = Object.entries(json.assignments).filter(([key]) => {
      const [personnelId] = key.split('_');
      return reporteriaIds.includes(personnelId);
    });

    console.log(`Reportería assignments: ${reporteriaAssignments.length}`);

    // Ver Floresmiro Luna (ID 110)
    const floresAssignments = reporteriaAssignments.filter(([key, value]) =>
      key.startsWith('110_') && value === true
    );

    console.log(`\n👤 Floresmiro Luna (ID 110):`);
    console.log(`   Asignaciones: ${floresAssignments.length}`);
    floresAssignments.forEach(([key]) => {
      const [, programId] = key.split('_');
      const programa = json.programs.find(p => p.id.toString() === programId);
      if (programa) {
        console.log(`   - ${programa.name} (${programa.defaultTime})`);
      }
    });
  });
});

req.on('error', (error) => {
  console.error('Error:', error);
});

req.end();

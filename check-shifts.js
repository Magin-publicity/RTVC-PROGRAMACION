const fs = require('fs');

// Leer desde stdin
let data = '';
process.stdin.on('data', chunk => data += chunk);
process.stdin.on('end', () => {
  const shifts = JSON.parse(data);

  const camaras = shifts.filter(s => s.area === 'CAMARÓGRAFOS DE REPORTERÍA');
  const asistentes = shifts.filter(s => s.area === 'ASISTENTES DE REPORTERÍA');

  console.log('=== CAMARÓGRAFOS DE REPORTERÍA ===');
  console.log('Total:', camaras.length);
  camaras.forEach(c => {
    console.log(`${c.name.padEnd(30)} ${c.shift_start.substring(0,5)} - ${c.shift_end.substring(0,5)}`);
  });

  console.log('\n=== ASISTENTES DE REPORTERÍA ===');
  console.log('Total:', asistentes.length);
  asistentes.forEach(a => {
    console.log(`${a.name.padEnd(30)} ${a.shift_start.substring(0,5)} - ${a.shift_end.substring(0,5)}`);
  });
});

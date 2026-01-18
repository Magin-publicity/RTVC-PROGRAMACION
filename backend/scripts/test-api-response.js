const http = require('http');

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/api/reporteria-espacios/grupos/2025-12-22',
  method: 'GET'
};

const req = http.request(options, (res) => {
  let data = '';

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    const json = JSON.parse(data);
    const alvaro = json.turnos.AM.camarografos.find(c => c.name === 'Álvaro Díaz');

    console.log('\n🎯 Álvaro Díaz - Espacios de salida:');
    alvaro.espacios_salida.forEach((espacio, i) => {
      console.log(`   ${i + 1}. Programa: ${espacio.ubicacion || 'Sin asignar'}`);
      console.log(`      Hora salida: ${espacio.hora_salida || 'Sin hora'}`);
      console.log(`      Hora llegada: ${espacio.hora_llegada || 'Sin hora'}`);
      console.log('');
    });
  });
});

req.on('error', (error) => {
  console.error('Error:', error);
});

req.end();

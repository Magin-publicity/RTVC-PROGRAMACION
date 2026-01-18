const http = require('http');

// Script para re-guardar el lunes 29 y forzar el espejo semanal con la nueva lógica

const fecha = '2025-12-29';

console.log('\n🔄 Re-guardando lunes 29 para aplicar nueva lógica (herencia completa)...\n');

// Primero obtener los datos actuales del lunes
const getOptions = {
  hostname: 'localhost',
  port: 3000,
  path: `/api/schedule/daily/${fecha}`,
  method: 'GET'
};

const getReq = http.request(getOptions, (res) => {
  let data = '';

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    const lunesData = JSON.parse(data);

    console.log('✅ Datos del lunes obtenidos');
    console.log(`   Asignaciones: ${Object.keys(lunesData.assignments).length}`);
    console.log(`   Programas: ${lunesData.programs.length}`);

    // Ahora re-guardar (trigger espejo semanal)
    const postData = JSON.stringify(lunesData);

    const postOptions = {
      hostname: 'localhost',
      port: 3000,
      path: `/api/schedule/daily/${fecha}`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    console.log('\n📤 Guardando lunes (trigger espejo semanal)...\n');

    const postReq = http.request(postOptions, (postRes) => {
      let postDataStr = '';

      postRes.on('data', (chunk) => {
        postDataStr += chunk;
      });

      postRes.on('end', () => {
        const result = JSON.parse(postDataStr);
        console.log('✅ Lunes guardado exitosamente');
        console.log('   Espejo semanal aplicado a Mar-Vie con HERENCIA COMPLETA\n');
      });
    });

    postReq.on('error', (error) => {
      console.error('❌ Error:', error);
    });

    postReq.write(postData);
    postReq.end();
  });
});

getReq.on('error', (error) => {
  console.error('❌ Error:', error);
});

getReq.end();

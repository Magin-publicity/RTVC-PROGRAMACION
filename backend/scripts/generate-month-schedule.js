const http = require('http');

function httpGet(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          resolve(data);
        }
      });
    }).on('error', reject);
  });
}

function httpPost(url, body) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port,
      path: urlObj.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body)
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          try {
            resolve({ ok: true, data: JSON.parse(data) });
          } catch (e) {
            resolve({ ok: true, data });
          }
        } else {
          resolve({ ok: false, error: data });
        }
      });
    });

    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

async function generateMonthSchedule() {
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth(); // 0-11

  // Generar desde el primer día del mes hasta 60 días en el futuro
  const startDate = new Date(year, month, 1);
  const endDate = new Date(today);
  endDate.setDate(endDate.getDate() + 60);

  console.log(`📅 Generando programación desde ${startDate.toISOString().split('T')[0]} hasta ${endDate.toISOString().split('T')[0]}`);

  const currentDate = new Date(startDate);
  let successCount = 0;
  let errorCount = 0;

  while (currentDate <= endDate) {
    const dateStr = currentDate.toISOString().split('T')[0];

    try {
      // Primero verificar si ya existe programación para esta fecha
      const existingSchedule = await httpGet(`http://localhost:3000/api/schedule/daily/${dateStr}`);

      if (existingSchedule && existingSchedule.programs && existingSchedule.programs.length > 0) {
        console.log(`✅ ${dateStr} - Ya existe programación guardada`);
        successCount++;
      } else {
        // Generar los turnos automáticos
        const shifts = await httpGet(`http://localhost:3000/api/schedule/auto-shifts/${dateStr}`);

        if (shifts && shifts.length > 0) {
          // Guardar la programación vacía (sin programas) solo con los turnos
          const body = JSON.stringify({
            programs: [],
            assignments: {},
            callTimes: {}
          });

          const saveResponse = await httpPost(`http://localhost:3000/api/schedule/daily/${dateStr}`, body);

          if (saveResponse.ok) {
            console.log(`✅ ${dateStr} - Programación generada (${shifts.length} turnos)`);
            successCount++;
          } else {
            console.error(`❌ ${dateStr} - Error al guardar: ${saveResponse.error}`);
            errorCount++;
          }
        } else {
          console.log(`⚠️  ${dateStr} - No se generaron turnos`);
          errorCount++;
        }
      }
    } catch (error) {
      console.error(`❌ ${dateStr} - Error: ${error.message}`);
      errorCount++;
    }

    // Avanzar al siguiente día
    currentDate.setDate(currentDate.getDate() + 1);

    // Pequeña pausa para no saturar el servidor
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  console.log(`\n📊 Resumen:`);
  console.log(`   ✅ Exitosos: ${successCount}`);
  console.log(`   ❌ Errores: ${errorCount}`);
  console.log(`   📅 Total: ${successCount + errorCount}`);
}

// Ejecutar si se llama directamente
if (require.main === module) {
  generateMonthSchedule()
    .then(() => {
      console.log('\n✅ Proceso completado');
      process.exit(0);
    })
    .catch(error => {
      console.error('\n❌ Error fatal:', error);
      process.exit(1);
    });
}

module.exports = { generateMonthSchedule };

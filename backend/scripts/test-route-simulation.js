const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'rtvc_scheduling',
  password: 'Padres2023',
  port: 5432
});

async function testRouteSimulation() {
  console.log('='.repeat(80));
  console.log('PRUEBA SIMULADA DE RUTAS (SIN GOOGLE API)');
  console.log('='.repeat(80));

  try {
    const testDate = '2026-01-16';
    const shiftType = 'AM';

    console.log(`\n📅 Fecha de prueba: ${testDate}`);
    console.log(`⏰ Turno: ${shiftType}\n`);

    // Limpiar datos de prueba
    console.log('🧹 Limpiando datos de prueba anteriores...');
    await pool.query('DELETE FROM daily_transport_assignments WHERE date = $1', [testDate]);
    await pool.query('DELETE FROM optimized_routes WHERE date = $1', [testDate]);
    await pool.query('DELETE FROM address_geocoding_cache WHERE address LIKE \'%SIMULADO%\'');

    console.log('\n📝 Creando direcciones geocodificadas simuladas...\n');

    // Insertar coordenadas simuladas en el cache
    const simulatedAddresses = [
      {
        address: 'Carrera 6 # 15-30, Soacha - SIMULADO',
        formatted: 'Carrera 6 #15-30, Soacha, Cundinamarca, Colombia',
        lat: 4.5772,  // SUR (Soacha está al sur de Bogotá)
        lng: -74.2166,
        zone: 'SUR'
      },
      {
        address: 'Calle 170 # 54-32, Usaquén - SIMULADO',
        formatted: 'Calle 170 #54-32, Usaquén, Bogotá, Colombia',
        lat: 4.7360,  // NORTE (Usaquén está al norte)
        lng: -74.0319,
        zone: 'NORTE'
      },
      {
        address: 'Calle 18 # 4-56, Soacha - SIMULADO',
        formatted: 'Calle 18 #4-56, Soacha, Cundinamarca, Colombia',
        lat: 4.5650,  // SUR
        lng: -74.2250,
        zone: 'SUR'
      },
      {
        address: 'Carrera 7 # 140-25, Usaquén - SIMULADO',
        formatted: 'Carrera 7 #140-25, Usaquén, Bogotá, Colombia',
        lat: 4.7100,  // NORTE
        lng: -74.0350,
        zone: 'NORTE'
      },
      {
        address: 'Carrera 13 # 26-40, Centro - SIMULADO',
        formatted: 'Carrera 13 #26-40, Santa Fe, Bogotá, Colombia',
        lat: 4.6097,  // CENTRO
        lng: -74.0700,
        zone: 'CENTRO'
      },
      {
        address: 'Calle 80 # 100-20, Engativá - SIMULADO',
        formatted: 'Calle 80 #100-20, Engativá, Bogotá, Colombia',
        lat: 4.6950,
        lng: -74.1150,  // OCCIDENTE
        zone: 'OCCIDENTE'
      }
    ];

    for (const addr of simulatedAddresses) {
      await pool.query(
        `INSERT INTO address_geocoding_cache
         (address, formatted_address, latitude, longitude, zone, is_valid, last_verified)
         VALUES ($1, $2, $3, $4, $5, true, NOW())`,
        [addr.address, addr.formatted, addr.lat, addr.lng, addr.zone]
      );
      console.log(`   ✓ ${addr.zone.padEnd(10)} | ${addr.formatted}`);
    }

    console.log('\n📝 Creando asignaciones de prueba...\n');

    const testAssignments = [
      {
        name: 'Carlos Rodríguez',
        direccion: 'Carrera 6 # 15-30, Soacha - SIMULADO',
        role: 'Periodista',
        area: 'PERIODISTAS',
        expectedZone: 'SUR'
      },
      {
        name: 'María González',
        direccion: 'Calle 170 # 54-32, Usaquén - SIMULADO',
        role: 'Presentadora',
        area: 'PRESENTADORES',
        expectedZone: 'NORTE'
      },
      {
        name: 'Luis Martínez',
        direccion: 'Calle 18 # 4-56, Soacha - SIMULADO',
        role: 'Ingeniero',
        area: 'INGENIEROS',
        expectedZone: 'SUR'
      },
      {
        name: 'Ana Torres',
        direccion: 'Carrera 7 # 140-25, Usaquén - SIMULADO',
        role: 'Productora',
        area: 'PRODUCTORES',
        expectedZone: 'NORTE'
      },
      {
        name: 'Pedro Ramírez',
        direccion: 'Carrera 13 # 26-40, Centro - SIMULADO',
        role: 'Ingeniero Master',
        area: 'INGENIEROS MASTER',
        expectedZone: 'CENTRO'
      },
      {
        name: 'Laura Mendoza',
        direccion: 'Calle 80 # 100-20, Engativá - SIMULADO',
        role: 'Directora',
        area: 'DIRECTORES',
        expectedZone: 'OCCIDENTE'
      }
    ];

    for (const person of testAssignments) {
      await pool.query(
        `INSERT INTO daily_transport_assignments
         (date, shift_type, personnel_name, personnel_role, personnel_area,
          transport_mode, direccion, confirmed_by_admin)
         VALUES ($1, $2, $3, $4, $5, 'RUTA', $6, true)`,
        [testDate, shiftType, person.name, person.role, person.area, person.direccion]
      );
      console.log(`   ✓ ${person.name.padEnd(20)} | Zona esperada: ${person.expectedZone}`);
    }

    console.log('\n' + '='.repeat(80));
    console.log('EJECUTANDO OPTIMIZACIÓN DE RUTAS');
    console.log('='.repeat(80));

    // Importar y ejecutar servicio de optimización
    const routeOptimizationService = require('../services/routeOptimizationService');
    const routes = await routeOptimizationService.optimizeRoutes(testDate, shiftType);

    console.log('\n' + '='.repeat(80));
    console.log('RESULTADOS DE LA OPTIMIZACIÓN');
    console.log('='.repeat(80));

    if (routes.length === 0) {
      console.log('\n❌ No se crearon rutas');
    } else {
      routes.forEach(route => {
        console.log(`\n📍 RUTA ${route.route_number} - Zona ${route.zone}`);
        console.log(`   ${'─'.repeat(70)}`);
        console.log(`   👥 Pasajeros: ${route.total_passengers}`);
        console.log(`   📏 Distancia total: ${route.total_distance_km.toFixed(2)} km`);
        console.log(`   ⏱️  Duración estimada: ${route.estimated_duration_minutes} min`);

        if (route.passengers && route.passengers.length > 0) {
          console.log(`\n   Orden de recogida:`);
          route.passengers.forEach(p => {
            const person = testAssignments.find(t => t.name === p.personnel_name);
            const emoji = person && person.expectedZone === route.zone ? '✅' : '⚠️';
            console.log(`   ${emoji} ${p.pickup_order}. ${p.personnel_name}`);
            console.log(`      📍 ${p.direccion}`);
            if (p.distance_km) {
              console.log(`      📏 ${p.distance_km.toFixed(2)} km | ⏱️ ${p.duration_minutes || 0} min`);
            }
          });
        }
      });
    }

    // Verificación de agrupación correcta
    console.log('\n' + '='.repeat(80));
    console.log('VERIFICACIÓN DE AGRUPACIÓN POR ZONAS');
    console.log('='.repeat(80));

    const verification = await pool.query(
      `SELECT
         r.route_number,
         r.zone as ruta_zone,
         t.personnel_name,
         t.direccion,
         g.zone as direccion_zone,
         CASE WHEN r.zone = g.zone THEN '✅ CORRECTO' ELSE '❌ ERROR' END as verificacion
       FROM optimized_routes r
       INNER JOIN daily_transport_assignments t ON t.route_id = r.id
       LEFT JOIN address_geocoding_cache g ON g.address = t.direccion
       WHERE r.date = $1 AND r.shift_type = $2
       ORDER BY r.route_number, t.pickup_order`,
      [testDate, shiftType]
    );

    const byRoute = {};
    verification.rows.forEach(row => {
      if (!byRoute[row.route_number]) byRoute[row.route_number] = [];
      byRoute[row.route_number].push(row);
    });

    let allCorrect = true;

    Object.keys(byRoute).forEach(routeNum => {
      const routeData = byRoute[routeNum];
      const routeZone = routeData[0].ruta_zone;

      console.log(`\n🚐 Ruta ${routeNum} - Zona ${routeZone}:`);

      routeData.forEach(person => {
        console.log(`   ${person.verificacion} ${person.personnel_name}`);
        console.log(`      Zona de ruta: ${person.ruta_zone} | Zona de dirección: ${person.direccion_zone}`);

        if (person.ruta_zone !== person.direccion_zone) {
          allCorrect = false;
        }
      });
    });

    console.log('\n' + '='.repeat(80));
    console.log('RESUMEN DE LA PRUEBA');
    console.log('='.repeat(80));

    if (allCorrect) {
      console.log('\n✅ TODAS LAS AGRUPACIONES SON CORRECTAS');
      console.log('   Las personas de Soacha (SUR) están en rutas SUR');
      console.log('   Las personas de Usaquén (NORTE) están en rutas NORTE');
      console.log('   Las personas del Centro están en rutas CENTRO');
      console.log('   Las personas de Engativá (OCCIDENTE) están en rutas OCCIDENTE\n');
    } else {
      console.log('\n❌ HAY ERRORES EN LA AGRUPACIÓN');
      console.log('   Revisar la lógica de agrupación por zonas\n');
    }

    console.log('📊 Estadísticas:');
    console.log(`   • Total de pasajeros: ${testAssignments.length}`);
    console.log(`   • Rutas creadas: ${routes.length}`);
    console.log(`   • Zonas: ${[...new Set(routes.map(r => r.zone))].join(', ')}`);

    // Mostrar distribución esperada vs real
    console.log('\n📍 Distribución por Zonas:');
    const zoneDistribution = {};

    testAssignments.forEach(person => {
      if (!zoneDistribution[person.expectedZone]) {
        zoneDistribution[person.expectedZone] = { expected: 0, assigned: 0 };
      }
      zoneDistribution[person.expectedZone].expected++;
    });

    routes.forEach(route => {
      if (!zoneDistribution[route.zone]) {
        zoneDistribution[route.zone] = { expected: 0, assigned: 0 };
      }
      zoneDistribution[route.zone].assigned += route.total_passengers;
    });

    Object.keys(zoneDistribution).forEach(zone => {
      const data = zoneDistribution[zone];
      const emoji = data.expected === data.assigned ? '✅' : '⚠️';
      console.log(`   ${emoji} ${zone}: Esperado ${data.expected} → Asignado ${data.assigned}`);
    });

    console.log('\n' + '='.repeat(80));
    console.log(allCorrect ? 'PRUEBA EXITOSA ✅' : 'PRUEBA CON ERRORES ❌');
    console.log('='.repeat(80) + '\n');

  } catch (error) {
    console.error('\n❌ ERROR:', error.message);
    console.error(error.stack);
  } finally {
    await pool.end();
  }
}

testRouteSimulation();

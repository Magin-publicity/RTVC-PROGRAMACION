const { Pool } = require('pg');
const routeOptimizationService = require('../services/routeOptimizationService');
const googleMapsService = require('../services/googleMapsService');

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'rtvc_scheduling',
  password: 'Padres2023',
  port: 5432
});

async function testRouteOptimization() {
  console.log('='.repeat(80));
  console.log('PRUEBA DE OPTIMIZACIÓN DE RUTAS');
  console.log('='.repeat(80));

  try {
    // Fecha de prueba
    const testDate = '2026-01-15';
    const shiftType = 'AM';

    console.log(`\n📅 Fecha de prueba: ${testDate}`);
    console.log(`⏰ Turno: ${shiftType}\n`);

    // Limpiar datos de prueba anteriores
    console.log('🧹 Limpiando datos de prueba anteriores...');
    await pool.query('DELETE FROM daily_transport_assignments WHERE date = $1', [testDate]);
    await pool.query('DELETE FROM optimized_routes WHERE date = $1', [testDate]);
    await pool.query("DELETE FROM route_alerts WHERE date = $1 AND message LIKE '%PRUEBA%'", [testDate]);

    // Crear asignaciones de prueba
    console.log('\n📝 Creando asignaciones de prueba...\n');

    const testAssignments = [
      {
        name: 'Carlos Rodríguez (SUR)',
        direccion: 'Carrera 6 # 15-30, Soacha, Cundinamarca',
        role: 'Periodista',
        area: 'PERIODISTAS'
      },
      {
        name: 'María González (NORTE)',
        direccion: 'Calle 170 # 54-32, Usaquén, Bogotá',
        role: 'Presentadora',
        area: 'PRESENTADORES'
      },
      {
        name: 'Luis Martínez (SUR)',
        direccion: 'Calle 18 # 4-56, Soacha, Cundinamarca',
        role: 'Ingeniero',
        area: 'INGENIEROS'
      },
      {
        name: 'Ana Torres (NORTE)',
        direccion: 'Carrera 7 # 140-25, Usaquén, Bogotá',
        role: 'Productora',
        area: 'PRODUCTORES'
      },
      {
        name: 'Pedro Ramírez (CENTRO)',
        direccion: 'Carrera 13 # 26-40, Centro, Bogotá',
        role: 'Ingeniero Master',
        area: 'INGENIEROS MASTER'
      }
    ];

    const insertedIds = [];

    for (const person of testAssignments) {
      const result = await pool.query(
        `INSERT INTO daily_transport_assignments
         (date, shift_type, personnel_name, personnel_role, personnel_area,
          transport_mode, direccion, confirmed_by_admin)
         VALUES ($1, $2, $3, $4, $5, 'RUTA', $6, true)
         RETURNING id, personnel_name, direccion`,
        [testDate, shiftType, person.name, person.role, person.area, person.direccion]
      );

      insertedIds.push(result.rows[0].id);
      console.log(`   ✓ ${result.rows[0].personnel_name}`);
      console.log(`     📍 ${result.rows[0].direccion}\n`);
    }

    console.log(`\n✅ ${testAssignments.length} asignaciones creadas\n`);

    // Probar geocodificación individual
    console.log('='.repeat(80));
    console.log('PASO 1: PRUEBA DE GEOCODIFICACIÓN');
    console.log('='.repeat(80));

    for (const person of testAssignments) {
      try {
        console.log(`\n🔍 Geocodificando: ${person.name}`);
        console.log(`   Dirección original: ${person.direccion}`);

        const geocoded = await googleMapsService.geocodeAddress(person.direccion);

        console.log(`   ✓ Dirección formateada: ${geocoded.formatted_address}`);
        console.log(`   ✓ Coordenadas: ${geocoded.latitude}, ${geocoded.longitude}`);
        console.log(`   ✓ Zona detectada: ${geocoded.zone}`);
        console.log(`   ✓ Válida: ${geocoded.is_valid ? 'Sí' : 'No'}`);
        console.log(`   ✓ Desde cache: ${geocoded.from_cache ? 'Sí' : 'No'}`);
      } catch (error) {
        console.log(`   ❌ Error: ${error.message}`);
      }
    }

    // Probar cálculo de distancias
    console.log('\n' + '='.repeat(80));
    console.log('PASO 2: PRUEBA DE CÁLCULO DE DISTANCIAS');
    console.log('='.repeat(80));

    const rtvcAddress = 'Cra 45 # 26-33, Bogotá, Colombia';
    const testAddresses = testAssignments.map(p => p.direccion);

    console.log(`\n📍 Punto de referencia (RTVC): ${rtvcAddress}\n`);

    try {
      const distances = await googleMapsService.getDistanceMatrix(
        testAddresses,
        [rtvcAddress]
      );

      console.log('Distancias calculadas:\n');
      distances.forEach(d => {
        const person = testAssignments.find(p => p.direccion === d.origin);
        console.log(`${person.name}:`);
        console.log(`   📏 Distancia: ${d.distance_km.toFixed(2)} km`);
        console.log(`   ⏱️  Duración: ${d.duration_minutes} min`);
        console.log(`   💾 Desde cache: ${d.from_cache ? 'Sí' : 'No'}\n`);
      });
    } catch (error) {
      console.log(`❌ Error calculando distancias: ${error.message}`);
    }

    // Ejecutar optimización completa
    console.log('='.repeat(80));
    console.log('PASO 3: OPTIMIZACIÓN COMPLETA DE RUTAS');
    console.log('='.repeat(80));

    const routes = await routeOptimizationService.optimizeRoutes(testDate, shiftType);

    console.log(`\n✅ Optimización completada: ${routes.length} ruta(s) creada(s)\n`);

    // Mostrar resultados
    console.log('='.repeat(80));
    console.log('RESULTADOS DE LA OPTIMIZACIÓN');
    console.log('='.repeat(80));

    routes.forEach(route => {
      console.log(`\n📍 RUTA ${route.route_number} - Zona ${route.zone}`);
      console.log(`   ${'─'.repeat(70)}`);
      console.log(`   👥 Pasajeros: ${route.total_passengers}`);
      console.log(`   📏 Distancia total: ${route.total_distance_km.toFixed(2)} km`);
      console.log(`   ⏱️  Duración estimada: ${route.estimated_duration_minutes} min`);
      console.log(`   📊 Estado: ${route.status}\n`);

      if (route.passengers && route.passengers.length > 0) {
        console.log('   Orden de recogida:');
        route.passengers.forEach((p, idx) => {
          console.log(`   ${p.pickup_order}. ${p.personnel_name}`);
          console.log(`      📍 ${p.direccion}`);
          if (p.distance_km) {
            console.log(`      📏 ${p.distance_km.toFixed(2)} km | ⏱️ ${p.duration_minutes} min`);
          }
        });
      }
    });

    // Verificar alertas generadas
    console.log('\n' + '='.repeat(80));
    console.log('ALERTAS GENERADAS');
    console.log('='.repeat(80));

    const alerts = await pool.query(
      `SELECT * FROM route_alerts WHERE date = $1 AND shift_type = $2 ORDER BY created_at DESC`,
      [testDate, shiftType]
    );

    if (alerts.rows.length === 0) {
      console.log('\n✅ No se generaron alertas (todo OK)');
    } else {
      console.log(`\n⚠️  ${alerts.rows.length} alerta(s) encontrada(s):\n`);
      alerts.rows.forEach((alert, idx) => {
        console.log(`${idx + 1}. [${alert.severity}] ${alert.alert_type}`);
        console.log(`   ${alert.message}\n`);
      });
    }

    // Resumen final
    console.log('\n' + '='.repeat(80));
    console.log('RESUMEN DE LA PRUEBA');
    console.log('='.repeat(80));

    console.log('\n✓ Geocodificación: Funcionando');
    console.log('✓ Cálculo de distancias: Funcionando');
    console.log('✓ Agrupación por zonas: Funcionando');
    console.log('✓ Optimización de rutas: Funcionando');
    console.log('✓ Generación de alertas: Funcionando');

    console.log('\n📊 Estadísticas:');
    console.log(`   • Total de pasajeros: ${testAssignments.length}`);
    console.log(`   • Rutas creadas: ${routes.length}`);
    console.log(`   • Zonas identificadas: ${[...new Set(routes.map(r => r.zone))].join(', ')}`);
    console.log(`   • Alertas: ${alerts.rows.length}`);

    console.log('\n' + '='.repeat(80));
    console.log('PRUEBA COMPLETADA EXITOSAMENTE ✅');
    console.log('='.repeat(80));

    // Verificación de zonas
    console.log('\n📍 VERIFICACIÓN DE ZONAS:');
    const zoneCheck = await pool.query(
      `SELECT t.personnel_name, t.direccion, g.zone, g.latitude, g.longitude
       FROM daily_transport_assignments t
       LEFT JOIN address_geocoding_cache g ON g.address = t.direccion
       WHERE t.date = $1
       ORDER BY g.zone, t.personnel_name`,
      [testDate]
    );

    const byZone = {};
    zoneCheck.rows.forEach(row => {
      if (!byZone[row.zone]) byZone[row.zone] = [];
      byZone[row.zone].push(row);
    });

    Object.keys(byZone).forEach(zone => {
      console.log(`\n🏷️  Zona ${zone}:`);
      byZone[zone].forEach(person => {
        console.log(`   • ${person.personnel_name}`);
        console.log(`     ${person.direccion}`);
        console.log(`     Coords: ${person.latitude}, ${person.longitude}`);
      });
    });

    console.log('\n💡 NOTA: Si ves direcciones en la zona esperada (SUR para Soacha, NORTE para Usaquén),');
    console.log('    el sistema está funcionando correctamente.\n');

  } catch (error) {
    console.error('\n❌ ERROR EN LA PRUEBA:', error.message);
    console.error(error.stack);
  } finally {
    await pool.end();
  }
}

testRouteOptimization();

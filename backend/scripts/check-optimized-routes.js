const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'rtvc_scheduling',
  password: 'Padres2023',
  port: 5432
});

async function checkOptimizedRoutes() {
  try {
    const date = '2026-01-12';
    const shiftType = 'AM';

    console.log(`🔍 Verificando rutas optimizadas para ${date} ${shiftType}\n`);

    // Consultar rutas optimizadas
    const routesResult = await pool.query(
      `SELECT * FROM optimized_routes
       WHERE date = $1 AND shift_type = $2
       ORDER BY route_number`,
      [date, shiftType]
    );

    console.log(`📊 Total rutas optimizadas: ${routesResult.rows.length}\n`);

    if (routesResult.rows.length > 0) {
      routesResult.rows.forEach((route, i) => {
        console.log(`${i + 1}. Ruta ${route.route_number} - ${route.zone}`);
        const passengerCount = route.passengers ? (Array.isArray(route.passengers) ? route.passengers.length : 0) : 0;
        console.log(`   Pasajeros: ${passengerCount}`);
        console.log(`   Vehículo: ${route.vehicle_plate || 'Sin asignar'}`);
        console.log(`   Conductor: ${route.driver_name || 'Sin asignar'}`);
        if (route.passengers && Array.isArray(route.passengers)) {
          console.log(`   Personas en ruta:`);
          route.passengers.forEach((p, j) => {
            console.log(`     ${j + 1}. ${p.name} (${p.localidad || p.barrio || 'Sin localidad'})`);
          });
        }
        console.log('');
      });
    } else {
      console.log('⚠️ No hay rutas optimizadas');
    }

    await pool.end();
  } catch (error) {
    console.error('❌ Error:', error.message);
    await pool.end();
    process.exit(1);
  }
}

checkOptimizedRoutes();

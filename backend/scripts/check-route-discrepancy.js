const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'rtvc_scheduling',
  password: 'Padres2023',
  port: 5432,
});

async function checkDiscrepancy() {
  try {
    // Buscar todos los registros recientes
    const allDates = await pool.query(`
      SELECT DISTINCT date, shift_type,
             (SELECT COUNT(*) FROM daily_transport_assignments a
              WHERE a.date = d.date AND a.shift_type = d.shift_type AND a.transport_mode = 'RUTA') as en_ruta_count
      FROM daily_transport_assignments d
      WHERE date >= CURRENT_DATE - INTERVAL '10 days'
      ORDER BY date DESC, shift_type
    `);

    console.log('Fechas con asignaciones:');
    console.log('========================\n');

    for (const row of allDates.rows) {
      const dateStr = new Date(row.date).toISOString().split('T')[0];
      const enRuta = row.en_ruta_count;

      if (enRuta > 0) {
        // Contar en rutas optimizadas
        const routesCount = await pool.query(`
          SELECT COALESCE(SUM(passenger_count), 0) as total_in_routes,
                 COUNT(*) as num_routes
          FROM optimized_routes
          WHERE date = $1 AND shift_type = $2
        `, [row.date, row.shift_type]);

        const totalInRoutes = parseInt(routesCount.rows[0].total_in_routes);
        const numRoutes = parseInt(routesCount.rows[0].num_routes);

        const diff = enRuta - totalInRoutes;
        const status = diff === 0 ? '✅' : '⚠️';

        console.log(`${status} ${dateStr} ${row.shift_type}:`);
        console.log(`   En Ruta: ${enRuta} personas`);
        console.log(`   En Rutas Optimizadas: ${totalInRoutes} personas (${numRoutes} rutas)`);
        if (diff !== 0) {
          console.log(`   ⚠️  DIFERENCIA: ${diff} personas`);

          // Buscar personas sin route_id
          const orphans = await pool.query(`
            SELECT id, personnel_name, direccion, localidad
            FROM daily_transport_assignments
            WHERE date = $1 AND shift_type = $2 AND transport_mode = 'RUTA' AND route_id IS NULL
          `, [row.date, row.shift_type]);

          if (orphans.rows.length > 0) {
            console.log(`   Personas SIN route_id asignado:`);
            orphans.rows.forEach(p => {
              console.log(`     - ${p.personnel_name} (${p.localidad || 'sin localidad'})`);
            });
          }
        }
        console.log('');
      }
    }

    await pool.end();
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

checkDiscrepancy();

const { Pool } = require('pg');
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'rtvc_scheduling',
  password: 'Padres2023',
  port: 5432
});

async function checkAllActive() {
  const result = await pool.query(`
    SELECT
      area,
      COUNT(*) as total,
      SUM(CASE WHEN active = true THEN 1 ELSE 0 END) as activos,
      SUM(CASE WHEN active IS NULL OR active = false THEN 1 ELSE 0 END) as inactivos
    FROM personnel
    GROUP BY area
    ORDER BY area
  `);

  console.log('='.repeat(80));
  console.log('ESTADO DE ACTIVACIÓN POR ÁREA');
  console.log('='.repeat(80));

  result.rows.forEach(r => {
    const status = r.activos === r.total ? '✅' : '⚠️ ';
    console.log(`${status} ${r.area}: ${r.activos}/${r.total} activos (${r.inactivos} inactivos)`);
  });

  console.log('\n' + '='.repeat(80));
  const totalActivos = result.rows.reduce((sum, r) => sum + parseInt(r.activos), 0);
  const totalPersonal = result.rows.reduce((sum, r) => sum + parseInt(r.total), 0);
  console.log(`TOTAL: ${totalActivos}/${totalPersonal} personas activas`);

  pool.end();
}

checkAllActive().catch(console.error);

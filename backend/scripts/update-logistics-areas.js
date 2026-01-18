const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'rtvc_scheduling',
  password: 'Padres2023',
  port: 5432
});

async function updateLogisticsAreas() {
  console.log('='.repeat(80));
  console.log('ACTUALIZANDO NOMBRES DE ÁREAS LOGÍSTICAS');
  console.log('='.repeat(80));

  try {
    // 1. Actualizar "LOGISTICA" a "DIRECTORES"
    const logisticaResult = await pool.query(
      `UPDATE personnel
       SET area = 'DIRECTORES', updated_at = NOW()
       WHERE area = 'LOGISTICA' AND tipo_personal = 'LOGISTICO'
       RETURNING id, name, area`
    );

    console.log(`\n✅ Actualizado "LOGISTICA" → "DIRECTORES": ${logisticaResult.rows.length} personas`);
    logisticaResult.rows.forEach(p => {
      console.log(`   - ${p.name} (ID: ${p.id})`);
    });

    // 2. Actualizar "PRODUCTORES LOGISTICA" a "PRODUCTORES"
    const productoresResult = await pool.query(
      `UPDATE personnel
       SET area = 'PRODUCTORES', updated_at = NOW()
       WHERE area = 'PRODUCTORES LOGISTICA' AND tipo_personal = 'LOGISTICO'
       RETURNING id, name, area`
    );

    console.log(`\n✅ Actualizado "PRODUCTORES LOGISTICA" → "PRODUCTORES": ${productoresResult.rows.length} personas`);
    productoresResult.rows.forEach(p => {
      console.log(`   - ${p.name} (ID: ${p.id})`);
    });

    // 3. Verificar el estado final
    console.log('\n' + '='.repeat(80));
    console.log('ESTADO FINAL - ÁREAS LOGÍSTICAS:');
    console.log('='.repeat(80));

    const areasResult = await pool.query(
      `SELECT area, COUNT(*) as total
       FROM personnel
       WHERE tipo_personal = 'LOGISTICO'
       GROUP BY area
       ORDER BY area`
    );

    areasResult.rows.forEach(row => {
      console.log(`📊 ${row.area}: ${row.total} persona${row.total !== 1 ? 's' : ''}`);
    });

    const totalResult = await pool.query(
      `SELECT COUNT(*) as total FROM personnel WHERE tipo_personal = 'LOGISTICO'`
    );
    console.log(`\n✅ Total Personal Logístico: ${totalResult.rows[0].total}`);

  } catch (error) {
    console.error('\n❌ ERROR:', error.message);
    console.error(error.stack);
  } finally {
    pool.end();
  }
}

updateLogisticsAreas();

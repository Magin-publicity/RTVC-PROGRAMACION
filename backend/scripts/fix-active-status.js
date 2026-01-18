const { Pool } = require('pg');
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'rtvc_scheduling',
  password: 'Padres2023',
  port: 5432
});

async function fixActiveStatus() {
  console.log('='.repeat(80));
  console.log('ARREGLANDO CAMPO ACTIVE EN PERSONNEL');
  console.log('='.repeat(80));

  // Ver cuántos tienen active = NULL
  const nullCount = await pool.query(`
    SELECT COUNT(*) as count FROM personnel WHERE active IS NULL
  `);
  console.log(`\n⚠️  Personas con active = NULL: ${nullCount.rows[0].count}`);

  // Ver cuántos tienen active = false
  const falseCount = await pool.query(`
    SELECT COUNT(*) as count FROM personnel WHERE active = false
  `);
  console.log(`❌ Personas con active = false: ${falseCount.rows[0].count}`);

  // Ver cuántos tienen active = true
  const trueCount = await pool.query(`
    SELECT COUNT(*) as count FROM personnel WHERE active = true
  `);
  console.log(`✅ Personas con active = true: ${trueCount.rows[0].count}`);

  console.log('\n' + '='.repeat(80));
  console.log('ACTUALIZANDO TODOS LOS NULL A TRUE...');
  console.log('='.repeat(80));

  // Actualizar todos los NULL a true
  const updateResult = await pool.query(`
    UPDATE personnel
    SET active = true
    WHERE active IS NULL
    RETURNING id, name, area
  `);

  console.log(`\n✅ Se actualizaron ${updateResult.rows.length} personas:`);
  updateResult.rows.forEach((r, idx) => {
    console.log(`   ${idx + 1}. ID: ${r.id}, Nombre: ${r.name}, Área: ${r.area}`);
  });

  // Verificar resultado final
  const finalCount = await pool.query(`
    SELECT COUNT(*) as count FROM personnel WHERE active = true
  `);
  console.log(`\n\n📊 Total final con active = true: ${finalCount.rows[0].count}`);

  pool.end();
}

fixActiveStatus().catch(console.error);

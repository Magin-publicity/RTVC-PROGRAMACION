const { Pool } = require('pg');
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'rtvc_scheduling',
  password: 'Padres2023',
  port: 5432
});

async function checkCamarografos() {
  console.log('='.repeat(80));
  console.log('VERIFICACIÓN DE CAMARÓGRAFOS DE ESTUDIO');
  console.log('='.repeat(80));

  // Buscar todas las variaciones de área que contengan "ESTUDIO"
  const areasQuery = await pool.query(`
    SELECT DISTINCT area, COUNT(*) as count
    FROM personnel
    WHERE area LIKE '%ESTUDIO%'
    GROUP BY area
    ORDER BY area
  `);

  console.log('\n📊 Áreas que contienen "ESTUDIO":');
  areasQuery.rows.forEach(r => {
    console.log(`   - "${r.area}" (${r.count} personas)`);
  });

  // Buscar todos los camarógrafos de estudio con su status
  const camarografosQuery = await pool.query(`
    SELECT id, name, area, active
    FROM personnel
    WHERE area LIKE '%CAMARÓGRAFO%ESTUDIO%'
       OR area LIKE '%CAMARA%ESTUDIO%'
    ORDER BY active DESC NULLS LAST, name
  `);

  console.log(`\n\n👥 Total de camarógrafos encontrados: ${camarografosQuery.rows.length}`);
  console.log('='.repeat(80));

  const activos = camarografosQuery.rows.filter(r => r.active === true);
  const inactivos = camarografosQuery.rows.filter(r => r.active === false);
  const nulls = camarografosQuery.rows.filter(r => r.active === null);

  console.log(`✅ Activos (active = true): ${activos.length}`);
  console.log(`❌ Inactivos (active = false): ${inactivos.length}`);
  console.log(`⚠️  NULL (active = null): ${nulls.length}`);

  if (activos.length > 0) {
    console.log('\n✅ CAMARÓGRAFOS ACTIVOS:');
    activos.forEach((r, idx) => {
      console.log(`   ${idx + 1}. ID: ${r.id}, Nombre: ${r.name}, Área: "${r.area}"`);
    });
  }

  if (inactivos.length > 0) {
    console.log('\n❌ CAMARÓGRAFOS INACTIVOS:');
    inactivos.forEach((r, idx) => {
      console.log(`   ${idx + 1}. ID: ${r.id}, Nombre: ${r.name}, Área: "${r.area}"`);
    });
  }

  if (nulls.length > 0) {
    console.log('\n⚠️  CAMARÓGRAFOS CON ACTIVE=NULL:');
    nulls.forEach((r, idx) => {
      console.log(`   ${idx + 1}. ID: ${r.id}, Nombre: ${r.name}, Área: "${r.area}"`);
    });
  }

  pool.end();
}

checkCamarografos().catch(console.error);

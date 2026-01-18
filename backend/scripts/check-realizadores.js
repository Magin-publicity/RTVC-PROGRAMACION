const { Pool } = require('pg');
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'rtvc_scheduling',
  password: 'Padres2023',
  port: 5432
});

async function checkRealizadores() {
  console.log('='.repeat(80));
  console.log('VERIFICACIÓN DE REALIZADORES');
  console.log('='.repeat(80));

  // Buscar por área que contenga "REALIZADOR"
  const areaQuery = await pool.query(`
    SELECT id, name, area, role, active
    FROM personnel
    WHERE area LIKE '%REALIZADOR%'
    ORDER BY area, name
  `);

  console.log(`\n📊 Personas con área que contiene "REALIZADOR": ${areaQuery.rows.length}`);
  areaQuery.rows.forEach(r => {
    console.log(`   ID: ${r.id}, Nombre: ${r.name}, Área: "${r.area}", Rol: "${r.role}", Activo: ${r.active}`);
  });

  // Buscar por rol que contenga "REALIZADOR"
  const roleQuery = await pool.query(`
    SELECT id, name, area, role, active
    FROM personnel
    WHERE role LIKE '%REALIZADOR%' OR role LIKE '%Realizador%'
    ORDER BY area, name
  `);

  console.log(`\n\n📋 Personas con rol que contiene "REALIZADOR": ${roleQuery.rows.length}`);
  roleQuery.rows.forEach(r => {
    console.log(`   ID: ${r.id}, Nombre: ${r.name}, Área: "${r.area}", Rol: "${r.role}", Activo: ${r.active}`);
  });

  // Buscar todas las áreas únicas que existen
  const allAreasQuery = await pool.query(`
    SELECT DISTINCT area, COUNT(*) as count
    FROM personnel
    WHERE active = true
    GROUP BY area
    ORDER BY area
  `);

  console.log('\n\n' + '='.repeat(80));
  console.log('TODAS LAS ÁREAS EN LA BASE DE DATOS:');
  console.log('='.repeat(80));
  allAreasQuery.rows.forEach(r => {
    console.log(`   "${r.area}" (${r.count} personas)`);
  });

  pool.end();
}

checkRealizadores().catch(console.error);

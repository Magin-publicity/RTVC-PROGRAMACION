const { Pool } = require('pg');
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'rtvc_scheduling',
  password: 'Padres2023',
  port: 5432
});

async function checkCamarasReporteria() {
  console.log('='.repeat(80));
  console.log('VERIFICACIÓN DE CAMARÓGRAFOS DE REPORTERÍA');
  console.log('='.repeat(80));

  const result = await pool.query(`
    SELECT id, name, area, grupo_reporteria, turno, active
    FROM personnel
    WHERE area = 'CAMARÓGRAFOS DE REPORTERÍA'
    ORDER BY grupo_reporteria NULLS LAST, name
  `);

  console.log(`\nTotal: ${result.rows.length} camarógrafos\n`);

  const porGrupo = {};
  result.rows.forEach(r => {
    const grupo = r.grupo_reporteria || 'SIN_GRUPO';
    if (!porGrupo[grupo]) porGrupo[grupo] = [];
    porGrupo[grupo].push(r);
  });

  Object.keys(porGrupo).sort().forEach(grupo => {
    console.log(`\n📹 ${grupo} (${porGrupo[grupo].length} personas):`);
    porGrupo[grupo].forEach(r => {
      const status = r.active ? '✅' : '❌';
      console.log(`   ${status} ${r.name} - Turno: ${r.turno || 'NULL'}`);
    });
  });

  pool.end();
}

checkCamarasReporteria().catch(console.error);

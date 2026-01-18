const { Pool } = require('pg');
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'rtvc_scheduling',
  password: 'Padres2023',
  port: 5432
});

async function fixAlexanderValencia() {
  console.log('='.repeat(80));
  console.log('CORRIGIENDO ALEXANDER VALENCIA');
  console.log('='.repeat(80));

  // Actualizar Alexander Valencia a área REALIZADORES y activarlo
  const result = await pool.query(`
    UPDATE personnel
    SET area = 'REALIZADORES', active = true, updated_at = NOW()
    WHERE id = 114
    RETURNING id, name, area, role, active
  `);

  console.log(`\n✅ Alexander Valencia actualizado:`);
  console.log(`   ID: ${result.rows[0].id}`);
  console.log(`   Nombre: ${result.rows[0].name}`);
  console.log(`   Área: ${result.rows[0].area}`);
  console.log(`   Rol: ${result.rows[0].role}`);
  console.log(`   Activo: ${result.rows[0].active}`);

  // Verificar total de realizadores
  const countQuery = await pool.query(`
    SELECT COUNT(*) as count
    FROM personnel
    WHERE area = 'REALIZADORES' AND active = true
  `);

  console.log(`\n📊 Total de REALIZADORES activos: ${countQuery.rows[0].count}`);

  pool.end();
}

fixAlexanderValencia().catch(console.error);

const { Pool } = require('pg');
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'rtvc_scheduling',
  password: 'Padres2023',
  port: 5432
});

async function fixCamarografosArea() {
  console.log('='.repeat(80));
  console.log('ACTUALIZANDO ÁREA DE CAMARÓGRAFOS DE ESTUDIO');
  console.log('='.repeat(80));

  // Ver cuántos tienen el área incorrecta
  const countQuery = await pool.query(`
    SELECT COUNT(*) as count
    FROM personnel
    WHERE area = 'CAMARÓGRAFOS DE ESTUDIO'
  `);

  console.log(`\n📊 Personas con área "CAMARÓGRAFOS DE ESTUDIO": ${countQuery.rows[0].count}`);
  console.log(`🔄 Se actualizarán a: "CAMARÓGRAFOS Y ASISTENTES DE ESTUDIO"\n`);

  // Actualizar el área
  const updateResult = await pool.query(`
    UPDATE personnel
    SET area = 'CAMARÓGRAFOS Y ASISTENTES DE ESTUDIO', updated_at = NOW()
    WHERE area = 'CAMARÓGRAFOS DE ESTUDIO'
    RETURNING id, name, area
  `);

  console.log('='.repeat(80));
  console.log(`✅ Se actualizaron ${updateResult.rows.length} personas:`);
  console.log('='.repeat(80));

  updateResult.rows.forEach((r, idx) => {
    console.log(`${idx + 1}. ${r.name} (ID: ${r.id})`);
  });

  // Verificar resultado final
  const verifyQuery = await pool.query(`
    SELECT COUNT(*) as count
    FROM personnel
    WHERE area = 'CAMARÓGRAFOS Y ASISTENTES DE ESTUDIO' AND active = true
  `);

  console.log('\n' + '='.repeat(80));
  console.log(`📊 Total final con área "CAMARÓGRAFOS Y ASISTENTES DE ESTUDIO": ${verifyQuery.rows[0].count}`);
  console.log('='.repeat(80));

  pool.end();
}

fixCamarografosArea().catch(console.error);

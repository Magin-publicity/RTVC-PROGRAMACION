const { Pool } = require('pg');
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'rtvc_scheduling',
  password: 'Padres2023',
  port: 5432
});

async function revertCamarografosArea() {
  console.log('='.repeat(80));
  console.log('REVIRTIENDO CAMBIO DE ÁREA DE CAMARÓGRAFOS');
  console.log('='.repeat(80));

  // Actualizar de vuelta a "CAMARÓGRAFOS DE ESTUDIO"
  const updateResult = await pool.query(`
    UPDATE personnel
    SET area = 'CAMARÓGRAFOS DE ESTUDIO', updated_at = NOW()
    WHERE area = 'CAMARÓGRAFOS Y ASISTENTES DE ESTUDIO'
      AND role = 'Camarógrafo de estudio'
    RETURNING id, name, area
  `);

  console.log(`✅ Se revirtieron ${updateResult.rows.length} camarógrafos a "CAMARÓGRAFOS DE ESTUDIO":\n`);

  updateResult.rows.forEach((r, idx) => {
    console.log(`${idx + 1}. ${r.name} (ID: ${r.id})`);
  });

  // Verificar que los asistentes se mantengan separados
  const asistentesQuery = await pool.query(`
    SELECT id, name, area, role
    FROM personnel
    WHERE area LIKE '%ASISTENTE%ESTUDIO%' OR role LIKE '%Asistente de estudio%'
  `);

  console.log('\n' + '='.repeat(80));
  console.log(`📊 Asistentes de estudio (separados): ${asistentesQuery.rows.length}`);
  asistentesQuery.rows.forEach(r => {
    console.log(`   - ${r.name} (${r.area})`);
  });

  pool.end();
}

revertCamarografosArea().catch(console.error);

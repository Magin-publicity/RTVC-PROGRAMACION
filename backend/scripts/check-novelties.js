const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'rtvc_scheduling',
  password: 'Padres2023',
  port: 5432
});

async function checkNovelties() {
  console.log('='.repeat(80));
  console.log('VERIFICACIÓN DE NOVEDADES EN LA BASE DE DATOS');
  console.log('='.repeat(80));

  try {
    // Verificar estructura de tabla novelties
    console.log('\n📋 ESTRUCTURA DE TABLA novelties:');
    console.log('─'.repeat(80));

    const columns = await pool.query(`
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_name = 'novelties'
      ORDER BY ordinal_position
    `);

    console.log('\nColumnas:');
    columns.rows.forEach(col => {
      console.log(`  • ${col.column_name.padEnd(30)} | ${col.data_type}`);
    });

    // Obtener todas las novedades
    console.log('\n\n📊 TODAS LAS NOVEDADES EN LA BASE DE DATOS:');
    console.log('─'.repeat(80));

    const allNovelties = await pool.query(`
      SELECT n.*, p.name as personnel_name
      FROM novelties n
      LEFT JOIN personnel p ON p.id = n.personnel_id
      ORDER BY n.created_at DESC
      LIMIT 20
    `);

    console.log(`\nTotal de novedades: ${allNovelties.rows.length}\n`);

    if (allNovelties.rows.length > 0) {
      allNovelties.rows.forEach((n, idx) => {
        console.log(`${idx + 1}. ${n.personnel_name || 'Sin personal'}`);
        console.log(`   Tipo: ${n.type}`);
        console.log(`   Descripción: ${n.description || 'Sin descripción'}`);
        console.log(`   Fecha inicio: ${n.start_date || n.date || 'N/A'}`);
        console.log(`   Fecha fin: ${n.end_date || 'N/A'}`);
        console.log(`   Creada: ${n.created_at}`);
        console.log('');
      });
    } else {
      console.log('⚠️  No hay novedades en la base de datos');
    }

    // Verificar novedades activas para hoy
    const today = new Date();
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

    console.log('\n\n📅 NOVEDADES ACTIVAS PARA HOY (' + todayStr + '):');
    console.log('─'.repeat(80));

    const activeNovelties = await pool.query(`
      SELECT n.*, p.name as personnel_name
      FROM novelties n
      LEFT JOIN personnel p ON p.id = n.personnel_id
      WHERE
        (n.start_date IS NOT NULL AND n.end_date IS NOT NULL AND $1 BETWEEN n.start_date AND n.end_date)
        OR (n.start_date IS NOT NULL AND n.end_date IS NULL AND $1 >= n.start_date)
        OR (n.date IS NOT NULL AND n.date::date = $1::date)
      ORDER BY n.created_at DESC
    `, [todayStr]);

    console.log(`\nTotal de novedades activas hoy: ${activeNovelties.rows.length}\n`);

    if (activeNovelties.rows.length > 0) {
      activeNovelties.rows.forEach((n, idx) => {
        console.log(`${idx + 1}. ${n.personnel_name || 'Sin personal'}`);
        console.log(`   Tipo: ${n.type}`);
        console.log(`   Descripción: ${n.description || 'Sin descripción'}`);
        console.log(`   Fecha inicio: ${n.start_date || n.date || 'N/A'}`);
        console.log(`   Fecha fin: ${n.end_date || 'N/A'}`);
        console.log('');
      });
    } else {
      console.log('⚠️  No hay novedades activas para hoy');
    }

    // Verificar contratos próximos a vencer
    console.log('\n\n⚠️  CONTRATOS PRÓXIMOS A VENCER (8 días o menos):');
    console.log('─'.repeat(80));

    const expiringContracts = await pool.query(`
      SELECT id, name, role, area, contract_end
      FROM personnel
      WHERE contract_end IS NOT NULL
      AND contract_end BETWEEN $1::date AND ($1::date + INTERVAL '8 days')
      AND active = true
      ORDER BY contract_end
    `, [todayStr]);

    console.log(`\nTotal de contratos venciendo: ${expiringContracts.rows.length}\n`);

    if (expiringContracts.rows.length > 0) {
      expiringContracts.rows.forEach((p, idx) => {
        const daysLeft = Math.ceil((new Date(p.contract_end) - today) / (1000 * 60 * 60 * 24));
        console.log(`${idx + 1}. ${p.name}`);
        console.log(`   Rol: ${p.role}`);
        console.log(`   Área: ${p.area}`);
        console.log(`   Vence: ${p.contract_end} (${daysLeft} días)`);
        console.log('');
      });
    }

    console.log('\n' + '='.repeat(80));
    console.log('ANÁLISIS COMPLETADO');
    console.log('='.repeat(80) + '\n');

  } catch (error) {
    console.error('\n❌ ERROR:', error.message);
    console.error(error.stack);
  } finally {
    await pool.end();
  }
}

checkNovelties();

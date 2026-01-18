const pool = require('../database/db');

async function activateAdrian() {
  try {
    console.log('🔧 Activando a Adrian Contreras...\n');

    // Verificar estado actual
    const before = await pool.query(
      "SELECT id, name, area, active FROM personnel WHERE name ILIKE '%adrian%contreras%'"
    );

    console.log('📋 Estado ANTES:');
    console.log(`   ID: ${before.rows[0].id}`);
    console.log(`   Nombre: ${before.rows[0].name}`);
    console.log(`   Área: ${before.rows[0].area}`);
    console.log(`   Active: ${before.rows[0].active}`);

    // Actualizar a active = true
    await pool.query(
      "UPDATE personnel SET active = true WHERE name ILIKE '%adrian%contreras%'"
    );

    // Verificar estado después
    const after = await pool.query(
      "SELECT id, name, area, active FROM personnel WHERE name ILIKE '%adrian%contreras%'"
    );

    console.log('\n✅ Estado DESPUÉS:');
    console.log(`   ID: ${after.rows[0].id}`);
    console.log(`   Nombre: ${after.rows[0].name}`);
    console.log(`   Área: ${after.rows[0].area}`);
    console.log(`   Active: ${after.rows[0].active}`);

    console.log('\n✅ Adrian Contreras activado correctamente\n');

    await pool.end();
  } catch (error) {
    console.error('❌ Error:', error);
    await pool.end();
    process.exit(1);
  }
}

activateAdrian();

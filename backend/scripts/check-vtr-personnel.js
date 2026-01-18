const pool = require('../config/database');

async function checkVTRPersonnel() {
  try {
    console.log('📋 Verificando personal de VTR activo...\n');

    const result = await pool.query(`
      SELECT name, active, contract_end
      FROM personnel
      WHERE area = 'VTR'
      ORDER BY name
    `);

    console.log(`Total personas en VTR: ${result.rows.length}`);
    console.log(`\nDetalle:`);

    let activeCount = 0;
    result.rows.forEach(p => {
      const status = p.active ? '✅ ACTIVO' : '❌ INACTIVO';
      console.log(`  ${p.name}: ${status}`);
      if (p.active) activeCount++;
    });

    console.log(`\n📊 Resumen: ${activeCount} personas ACTIVAS en VTR`);
    console.log(`\n🔧 Con ${activeCount} personas, debería usar plantilla de ${activeCount} turnos`);

    pool.end();
  } catch (error) {
    console.error('Error:', error);
    pool.end();
  }
}

checkVTRPersonnel();

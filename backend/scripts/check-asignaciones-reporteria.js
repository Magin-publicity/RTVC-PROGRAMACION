const pool = require('../database/db');

async function checkAsignacionesReporteria() {
  try {
    const res = await pool.query(`
      SELECT ar.*, p.name
      FROM asignaciones_reporteria ar
      JOIN personnel p ON ar.id_personal = p.id
      WHERE ar.fecha = '2025-12-26'
      ORDER BY ar.id_personal, ar.numero_salida
    `);

    console.log('📋 Asignaciones en BD para 2025-12-26:');
    console.log(`   Total: ${res.rows.length} registros\n`);

    res.rows.forEach(row => {
      console.log(`   ID: ${row.id} | ${row.name} | Salida ${row.numero_salida}`);
      console.log(`      Destino: ${row.destino}`);
      console.log(`      Producto: ${row.producto}`);
      console.log(`      Estatus: ${row.estatus}\n`);
    });

    await pool.end();
  } catch (error) {
    console.error('❌ Error:', error);
    await pool.end();
  }
}

checkAsignacionesReporteria();

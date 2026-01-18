const pool = require('../database/db');

async function limpiarAsignacionesHuerfanas() {
  try {
    console.log('🧹 Buscando asignaciones huérfanas (con personal inexistente)...\n');

    // Encontrar asignaciones que tienen id_personal que no existe en personnel
    const huerfanas = await pool.query(`
      SELECT ar.id, ar.id_personal, ar.fecha, ar.numero_salida, ar.destino
      FROM asignaciones_reporteria ar
      LEFT JOIN personnel p ON ar.id_personal = p.id
      WHERE p.id IS NULL
    `);

    console.log(`📋 Encontradas: ${huerfanas.rows.length} asignaciones huérfanas`);

    if (huerfanas.rows.length > 0) {
      console.log('\nDetalle:');
      huerfanas.rows.forEach(row => {
        console.log(`  ID ${row.id}: personal_id=${row.id_personal} (NO EXISTE), fecha=${row.fecha}, salida=${row.numero_salida}, destino=${row.destino}`);
      });

      // Eliminar asignaciones huérfanas
      const result = await pool.query(`
        DELETE FROM asignaciones_reporteria ar
        WHERE NOT EXISTS (
          SELECT 1 FROM personnel p WHERE p.id = ar.id_personal
        )
        RETURNING id
      `);

      console.log(`\n✅ ${result.rowCount} asignación(es) huérfana(s) eliminada(s)`);
      console.log('   El dashboard ahora debería mostrar la disponibilidad correctamente\n');
    } else {
      console.log('\n✅ No hay asignaciones huérfanas\n');
    }

    await pool.end();
  } catch (error) {
    console.error('❌ Error:', error);
    await pool.end();
    process.exit(1);
  }
}

limpiarAsignacionesHuerfanas();

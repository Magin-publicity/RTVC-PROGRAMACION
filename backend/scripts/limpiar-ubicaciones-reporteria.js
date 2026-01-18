const pool = require('../database/db');

// Script para limpiar las ubicaciones automáticas de reportería

async function limpiarUbicaciones() {
  try {
    console.log('\n🧹 Limpiando ubicaciones automáticas de reportería...\n');

    // Actualizar todos los registros para dejar ubicacion, hora_salida, hora_llegada en null
    const result = await pool.query(`
      UPDATE reporteria_espacios_salida
      SET ubicacion = NULL,
          hora_salida = NULL,
          hora_llegada = NULL,
          updated_at = CURRENT_TIMESTAMP
      WHERE ubicacion IS NOT NULL
         OR hora_salida IS NOT NULL
         OR hora_llegada IS NOT NULL
      RETURNING id, personnel_id, numero_espacio, fecha
    `);

    console.log(`✅ ${result.rows.length} registros actualizados`);
    console.log(`\n📊 Registros limpiados por fecha:`);

    // Agrupar por fecha
    const porFecha = {};
    result.rows.forEach(row => {
      if (!porFecha[row.fecha]) {
        porFecha[row.fecha] = 0;
      }
      porFecha[row.fecha]++;
    });

    Object.keys(porFecha).sort().forEach(fecha => {
      console.log(`   ${fecha}: ${porFecha[fecha]} espacios`);
    });

    console.log('\n✅ Limpieza completada\n');

    await pool.end();

  } catch (error) {
    console.error('❌ Error:', error);
    await pool.end();
    process.exit(1);
  }
}

limpiarUbicaciones();

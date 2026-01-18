const pool = require('../config/database');

async function separateProduction() {
  try {
    console.log('🔄 Separando áreas de PRODUCCIÓN...\n');

    // Ver el personal actual
    const current = await pool.query(
      "SELECT name, role, area FROM personnel WHERE area = 'PRODUCCIÓN' ORDER BY role, name"
    );
    console.log('📊 Personal actual en PRODUCCIÓN:');
    console.table(current.rows);

    // Separar en dos áreas
    // 1. Asistentes de producción → ASISTENTES DE PRODUCCIÓN
    const asistentes = await pool.query(
      "UPDATE personnel SET area = 'ASISTENTES DE PRODUCCIÓN' WHERE area = 'PRODUCCIÓN' AND role = 'Asistente de producción' RETURNING name, role, area"
    );
    console.log(`\n✅ Movidos ${asistentes.rowCount} asistentes a ASISTENTES DE PRODUCCIÓN:`);
    console.table(asistentes.rows);

    // 2. Productores (todos los demás roles) → PRODUCTORES
    const productores = await pool.query(
      "UPDATE personnel SET area = 'PRODUCTORES' WHERE area = 'PRODUCCIÓN' RETURNING name, role, area"
    );
    console.log(`\n✅ Movidos ${productores.rowCount} productores a PRODUCTORES:`);
    console.table(productores.rows);

    // Verificar que ya no quede nadie en PRODUCCIÓN
    const remaining = await pool.query(
      "SELECT COUNT(*) FROM personnel WHERE area = 'PRODUCCIÓN'"
    );
    console.log(`\n📊 Personal restante en PRODUCCIÓN: ${remaining.rows[0].count}`);

    // Mostrar las nuevas áreas
    const newAreas = await pool.query(
      "SELECT area, COUNT(*) as total FROM personnel WHERE area IN ('PRODUCTORES', 'ASISTENTES DE PRODUCCIÓN') GROUP BY area ORDER BY area"
    );
    console.log('\n✨ Nuevas áreas creadas:');
    console.table(newAreas.rows);

    // Ahora necesitamos crear patrones de rotación para las nuevas áreas
    console.log('\n🔄 Creando patrones de rotación para las nuevas áreas...');

    // Verificar si hay patrones para PRODUCCIÓN
    const oldPatterns = await pool.query(
      "SELECT * FROM rotation_patterns WHERE area = 'PRODUCCIÓN' ORDER BY week_number, shift_start"
    );

    if (oldPatterns.rows.length > 0) {
      console.log(`\n📋 Encontrados ${oldPatterns.rows.length} patrones de PRODUCCIÓN`);

      // Duplicar patrones para PRODUCTORES
      for (const pattern of oldPatterns.rows) {
        await pool.query(
          "INSERT INTO rotation_patterns (week_number, area, shift_start, shift_end) VALUES ($1, $2, $3, $4)",
          [pattern.week_number, 'PRODUCTORES', pattern.shift_start, pattern.shift_end]
        );
      }
      console.log('✅ Patrones creados para PRODUCTORES');

      // Duplicar patrones para ASISTENTES DE PRODUCCIÓN
      for (const pattern of oldPatterns.rows) {
        await pool.query(
          "INSERT INTO rotation_patterns (week_number, area, shift_start, shift_end) VALUES ($1, $2, $3, $4)",
          [pattern.week_number, 'ASISTENTES DE PRODUCCIÓN', pattern.shift_start, pattern.shift_end]
        );
      }
      console.log('✅ Patrones creados para ASISTENTES DE PRODUCCIÓN');

      // Eliminar patrones antiguos
      await pool.query("DELETE FROM rotation_patterns WHERE area = 'PRODUCCIÓN'");
      console.log('✅ Patrones antiguos eliminados');
    } else {
      console.log('\n⚠️  No se encontraron patrones para PRODUCCIÓN');
    }

    console.log('\n✨ ¡Separación completada exitosamente!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
    process.exit(1);
  }
}

separateProduction();

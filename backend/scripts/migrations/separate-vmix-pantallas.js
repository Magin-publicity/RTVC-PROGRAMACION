const pool = require('../config/database');

async function separateVmixPantallas() {
  try {
    console.log('🔄 Separando áreas de VMIX y PANTALLAS...\n');

    // Ver el personal actual
    const current = await pool.query(
      "SELECT name, role, area FROM personnel WHERE area = 'OPERADOR DE VMIX Y PANTALLAS' ORDER BY role, name"
    );
    console.log('📊 Personal actual en OPERADOR DE VMIX Y PANTALLAS:');
    console.table(current.rows);

    // Separar en dos áreas
    // 1. Operadores de Vmix → OPERADORES DE VMIX
    const vmix = await pool.query(
      "UPDATE personnel SET area = 'OPERADORES DE VMIX' WHERE area = 'OPERADOR DE VMIX Y PANTALLAS' AND role = 'Operador de Vmix' RETURNING name, role, area"
    );
    console.log(`\n✅ Movidos ${vmix.rowCount} operadores a OPERADORES DE VMIX:`);
    console.table(vmix.rows);

    // 2. Operadores de Pantallas → OPERADORES DE PANTALLAS
    const pantallas = await pool.query(
      "UPDATE personnel SET area = 'OPERADORES DE PANTALLAS' WHERE area = 'OPERADOR DE VMIX Y PANTALLAS' AND role = 'Operador de Pantallas' RETURNING name, role, area"
    );
    console.log(`\n✅ Movidos ${pantallas.rowCount} operadores a OPERADORES DE PANTALLAS:`);
    console.table(pantallas.rows);

    // Verificar que ya no quede nadie en la área antigua
    const remaining = await pool.query(
      "SELECT COUNT(*) FROM personnel WHERE area = 'OPERADOR DE VMIX Y PANTALLAS'"
    );
    console.log(`\n📊 Personal restante en OPERADOR DE VMIX Y PANTALLAS: ${remaining.rows[0].count}`);

    // Mostrar las nuevas áreas
    const newAreas = await pool.query(
      "SELECT area, COUNT(*) as total FROM personnel WHERE area IN ('OPERADORES DE VMIX', 'OPERADORES DE PANTALLAS') GROUP BY area ORDER BY area"
    );
    console.log('\n✨ Nuevas áreas creadas:');
    console.table(newAreas.rows);

    // Ahora necesitamos crear patrones de rotación para las nuevas áreas
    console.log('\n🔄 Creando patrones de rotación para las nuevas áreas...');

    // Verificar si hay patrones para OPERADOR DE VMIX Y PANTALLAS
    const oldPatterns = await pool.query(
      "SELECT * FROM rotation_patterns WHERE area = 'OPERADOR DE VMIX Y PANTALLAS' ORDER BY week_number, shift_start"
    );

    if (oldPatterns.rows.length > 0) {
      console.log(`\n📋 Encontrados ${oldPatterns.rows.length} patrones de OPERADOR DE VMIX Y PANTALLAS`);

      // Duplicar patrones para OPERADORES DE VMIX
      for (const pattern of oldPatterns.rows) {
        await pool.query(
          "INSERT INTO rotation_patterns (week_number, area, shift_start, shift_end) VALUES ($1, $2, $3, $4)",
          [pattern.week_number, 'OPERADORES DE VMIX', pattern.shift_start, pattern.shift_end]
        );
      }
      console.log('✅ Patrones creados para OPERADORES DE VMIX');

      // Duplicar patrones para OPERADORES DE PANTALLAS
      for (const pattern of oldPatterns.rows) {
        await pool.query(
          "INSERT INTO rotation_patterns (week_number, area, shift_start, shift_end) VALUES ($1, $2, $3, $4)",
          [pattern.week_number, 'OPERADORES DE PANTALLAS', pattern.shift_start, pattern.shift_end]
        );
      }
      console.log('✅ Patrones creados para OPERADORES DE PANTALLAS');

      // Eliminar patrones antiguos
      await pool.query("DELETE FROM rotation_patterns WHERE area = 'OPERADOR DE VMIX Y PANTALLAS'");
      console.log('✅ Patrones antiguos eliminados');
    } else {
      console.log('\n⚠️  No se encontraron patrones para OPERADOR DE VMIX Y PANTALLAS');
    }

    console.log('\n✨ ¡Separación completada exitosamente!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
    process.exit(1);
  }
}

separateVmixPantallas();

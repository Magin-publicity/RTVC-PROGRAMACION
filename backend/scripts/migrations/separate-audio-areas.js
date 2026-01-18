const pool = require('../config/database');

async function separateAudioAreas() {
  try {
    console.log('🔄 Separando áreas de audio...\n');

    // Ver el personal actual
    const current = await pool.query(
      "SELECT name, role, area FROM personnel WHERE area = 'OPERADORES DE AUDIO' ORDER BY role, name"
    );
    console.log('📊 Personal actual en OPERADORES DE AUDIO:');
    console.table(current.rows);

    // Separar en dos áreas
    // 1. Operadores de consola de sonido → OPERADORES DE SONIDO
    const operadores = await pool.query(
      "UPDATE personnel SET area = 'OPERADORES DE SONIDO' WHERE area = 'OPERADORES DE AUDIO' AND role = 'Operador consola de sonido' RETURNING name, role, area"
    );
    console.log(`\n✅ Movidos ${operadores.rowCount} operadores a OPERADORES DE SONIDO:`);
    console.table(operadores.rows);

    // 2. Asistentes de sonido → ASISTENTES DE SONIDO
    const asistentes = await pool.query(
      "UPDATE personnel SET area = 'ASISTENTES DE SONIDO' WHERE area = 'OPERADORES DE AUDIO' AND role = 'Asistente de sonido' RETURNING name, role, area"
    );
    console.log(`\n✅ Movidos ${asistentes.rowCount} asistentes a ASISTENTES DE SONIDO:`);
    console.table(asistentes.rows);

    // Verificar que ya no quede nadie en OPERADORES DE AUDIO
    const remaining = await pool.query(
      "SELECT COUNT(*) FROM personnel WHERE area = 'OPERADORES DE AUDIO'"
    );
    console.log(`\n📊 Personal restante en OPERADORES DE AUDIO: ${remaining.rows[0].count}`);

    // Mostrar las nuevas áreas
    const newAreas = await pool.query(
      "SELECT area, COUNT(*) as total FROM personnel WHERE area IN ('OPERADORES DE SONIDO', 'ASISTENTES DE SONIDO') GROUP BY area ORDER BY area"
    );
    console.log('\n✨ Nuevas áreas creadas:');
    console.table(newAreas.rows);

    // Ahora necesitamos crear patrones de rotación para las nuevas áreas
    console.log('\n🔄 Creando patrones de rotación para las nuevas áreas...');

    // Primero, verificar si hay patrones para OPERADORES DE AUDIO
    const oldPatterns = await pool.query(
      "SELECT * FROM rotation_patterns WHERE area = 'OPERADORES DE AUDIO' ORDER BY week_number, shift_start"
    );

    if (oldPatterns.rows.length > 0) {
      console.log(`\n📋 Encontrados ${oldPatterns.rows.length} patrones de OPERADORES DE AUDIO`);

      // Duplicar patrones para OPERADORES DE SONIDO
      for (const pattern of oldPatterns.rows) {
        await pool.query(
          "INSERT INTO rotation_patterns (week_number, area, shift_start, shift_end) VALUES ($1, $2, $3, $4)",
          [pattern.week_number, 'OPERADORES DE SONIDO', pattern.shift_start, pattern.shift_end]
        );
      }
      console.log('✅ Patrones creados para OPERADORES DE SONIDO');

      // Duplicar patrones para ASISTENTES DE SONIDO
      for (const pattern of oldPatterns.rows) {
        await pool.query(
          "INSERT INTO rotation_patterns (week_number, area, shift_start, shift_end) VALUES ($1, $2, $3, $4)",
          [pattern.week_number, 'ASISTENTES DE SONIDO', pattern.shift_start, pattern.shift_end]
        );
      }
      console.log('✅ Patrones creados para ASISTENTES DE SONIDO');

      // Eliminar patrones antiguos de OPERADORES DE AUDIO
      await pool.query("DELETE FROM rotation_patterns WHERE area = 'OPERADORES DE AUDIO'");
      console.log('✅ Patrones antiguos eliminados');
    } else {
      console.log('\n⚠️  No se encontraron patrones para OPERADORES DE AUDIO');
    }

    console.log('\n✨ ¡Separación completada exitosamente!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
    process.exit(1);
  }
}

separateAudioAreas();

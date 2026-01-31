// backend/scripts/asignar-grupos-camaras.js
// Asignar grupos A, B, C, D a los 20 Camarógrafos de Estudio

const pool = require('../config/database');

async function asignarGrupos() {
  try {
    console.log('📋 Asignando grupos A, B, C, D a Camarógrafos de Estudio...\n');

    // Primero ver todos los camarógrafos con sus turnos
    const todos = await pool.query(`
      SELECT name, current_shift
      FROM personnel
      WHERE area = 'CAMARÓGRAFOS DE ESTUDIO'
        AND active = true
      ORDER BY current_shift, name
    `);

    console.log('📊 Total camarógrafos:', todos.rows.length);
    console.table(todos.rows);

    // Asignaciones específicas según indicación del usuario:
    // John Loaiza -> GRUPO A
    // Luis Bernal -> GRUPO B
    // Jefferson Pérez -> GRUPO C
    // Carlos García -> GRUPO D

    console.log('\n🔄 Asignando operadores de grúa a sus grupos...\n');

    await pool.query(`
      UPDATE personnel
      SET grupo = 'A'
      WHERE name = 'John Loaiza' AND area = 'CAMARÓGRAFOS DE ESTUDIO'
    `);
    console.log('✅ John Loaiza -> GRUPO A');

    await pool.query(`
      UPDATE personnel
      SET grupo = 'B'
      WHERE name = 'Luis Bernal' AND area = 'CAMARÓGRAFOS DE ESTUDIO'
    `);
    console.log('✅ Luis Bernal -> GRUPO B');

    await pool.query(`
      UPDATE personnel
      SET grupo = 'C'
      WHERE name = 'Jefferson Pérez' AND area = 'CAMARÓGRAFOS DE ESTUDIO'
    `);
    console.log('✅ Jefferson Pérez -> GRUPO C');

    await pool.query(`
      UPDATE personnel
      SET grupo = 'D'
      WHERE name = 'Carlos García' AND area = 'CAMARÓGRAFOS DE ESTUDIO'
    `);
    console.log('✅ Carlos García -> GRUPO D');

    // Ahora distribuir el resto de camarógrafos equitativamente
    // 4 operadores de grúa + 16 camarógrafos restantes = 20 total
    // Objetivo: 5 por grupo (A, B, C, D)

    console.log('\n📦 Distribuyendo resto de camarógrafos en grupos...\n');

    // Obtener los que aún no tienen grupo
    const sinGrupo = await pool.query(`
      SELECT name, current_shift
      FROM personnel
      WHERE area = 'CAMARÓGRAFOS DE ESTUDIO'
        AND active = true
        AND (grupo IS NULL OR grupo = '')
      ORDER BY current_shift, name
    `);

    console.log('Camarógrafos sin grupo:', sinGrupo.rows.length);

    // Distribuir 4 camarógrafos a cada grupo (para completar 5 con el operador de grúa)
    const grupos = ['A', 'B', 'C', 'D'];
    let grupoIndex = 0;

    for (const persona of sinGrupo.rows) {
      const grupo = grupos[grupoIndex % 4];
      await pool.query(
        'UPDATE personnel SET grupo = $1 WHERE name = $2 AND area = $3',
        [grupo, persona.name, 'CAMARÓGRAFOS DE ESTUDIO']
      );
      console.log(`   ✅ ${persona.name} (Turno ${persona.current_shift}) -> GRUPO ${grupo}`);
      grupoIndex++;
    }

    // Mostrar distribución final
    console.log('\n═══════════════════════════════════════════════════════════');
    console.log('   📊 DISTRIBUCIÓN FINAL POR GRUPOS');
    console.log('═══════════════════════════════════════════════════════════\n');

    for (const grupo of grupos) {
      const result = await pool.query(
        'SELECT name, current_shift FROM personnel WHERE area = $1 AND grupo = $2 AND active = true ORDER BY name',
        ['CAMARÓGRAFOS DE ESTUDIO', grupo]
      );

      console.log(`🔷 GRUPO ${grupo}: ${result.rows.length} personas`);
      result.rows.forEach(r => {
        const esGrua = ['John Loaiza', 'Luis Bernal', 'Jefferson Pérez', 'Carlos García'].some(
          g => r.name.includes(g) || g.includes(r.name)
        );
        console.log(`   ${esGrua ? '🏗️' : '  '} ${r.name} (Turno: ${r.current_shift})`);
      });
      console.log('');
    }

    console.log('✅ GRUPOS ASIGNADOS EXITOSAMENTE\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

asignarGrupos();

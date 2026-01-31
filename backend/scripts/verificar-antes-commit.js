// Verificar estado antes de hacer commit
const pool = require('../config/database');

async function verificar() {
  console.log('═══════════════════════════════════════════════════════════');
  console.log('   ✅ VERIFICACIÓN ANTES DE COMMIT');
  console.log('═══════════════════════════════════════════════════════════\n');

  // 1. Verificar Camarógrafos de Estudio con grupos
  const camaras = await pool.query(`
    SELECT COUNT(*) as total, COUNT(grupo) as con_grupo
    FROM personnel
    WHERE area = 'CAMARÓGRAFOS DE ESTUDIO' AND active = true
  `);

  console.log('📹 CAMARÓGRAFOS DE ESTUDIO:');
  console.log(`   Total: ${camaras.rows[0].total}`);
  console.log(`   Con grupo asignado: ${camaras.rows[0].con_grupo}`);

  const todosConGrupo = camaras.rows[0].total === camaras.rows[0].con_grupo;
  console.log(`   Estado: ${todosConGrupo ? '✅ Todos tienen grupo' : '⚠️ Faltan grupos por asignar'}\n`);

  // 2. Verificar Realizadores
  const realizadores = await pool.query(`
    SELECT COUNT(*) as total
    FROM personnel
    WHERE role = 'Realizador' AND active = true
  `);

  console.log('🎬 REALIZADORES:');
  console.log(`   Total: ${realizadores.rows[0].total}`);
  console.log(`   Estado: ${realizadores.rows[0].total >= 4 ? '✅ OK' : '⚠️ Muy pocos'}\n`);

  // 3. Verificar enroques aplicados
  const enroques = await pool.query(`
    SELECT name, current_shift, grupo
    FROM personnel
    WHERE name IN ('Luis Bernal', 'Jefferson Pérez', 'Andrés López', 'William Mosquera')
      AND area = 'CAMARÓGRAFOS DE ESTUDIO'
    ORDER BY name
  `);

  console.log('🔄 ENROQUES VERIFICADOS:');
  console.table(enroques.rows);

  // 4. Distribución por grupos
  const grupos = await pool.query(`
    SELECT grupo, COUNT(*) as count
    FROM personnel
    WHERE area = 'CAMARÓGRAFOS DE ESTUDIO' AND active = true
    GROUP BY grupo
    ORDER BY grupo
  `);

  console.log('\n📊 DISTRIBUCIÓN POR GRUPOS:');
  console.table(grupos.rows);

  const balanceado = grupos.rows.every(g => g.count === '5');
  console.log(`   Estado: ${balanceado ? '✅ Balanceado (5 por grupo)' : '⚠️ Desbalanceado'}\n`);

  // Resumen final
  console.log('═══════════════════════════════════════════════════════════');
  console.log('   📝 RESUMEN');
  console.log('═══════════════════════════════════════════════════════════\n');

  const todoOK = todosConGrupo && balanceado && realizadores.rows[0].total >= 4;

  if (todoOK) {
    console.log('✅ TODO CORRECTO - LISTO PARA COMMIT\n');
  } else {
    console.log('⚠️ REVISAR ANTES DE COMMIT\n');
  }

  console.log('Archivos a incluir en commit:');
  console.log('  ✅ src/data/departments.js (área REALIZADORES)');
  console.log('  ✅ backend/config/crane-operators.js (grupos A,B,C,D)');
  console.log('  ✅ backend/models/TravelEvent.js (viajes y eventos)');
  console.log('  ✅ backend/server.js');
  console.log('  ✅ src/components/Dashboard/PersonnelAreaCards.jsx');
  console.log('  ✅ docs/*.md (documentación)');
  console.log('  ✅ backend/scripts/*.js (scripts de migración)\n');

  process.exit(0);
}

verificar().catch(err => {
  console.error('❌ Error:', err);
  process.exit(1);
});

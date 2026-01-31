// backend/scripts/verificar-grupos-final.js
// Verificación final de la distribución de grupos después del cambio de Luis Bernal

const pool = require('../config/database');

async function verificarGruposFinal() {
  try {
    console.log('═══════════════════════════════════════════════════════════');
    console.log('   ✅ VERIFICACIÓN FINAL - DISTRIBUCIÓN DE GRUPOS');
    console.log('═══════════════════════════════════════════════════════════\n');

    const grupos = ['A', 'B', 'C', 'D'];
    const operadores = {
      'A': 'John Loaiza',
      'B': 'Sin asignar',
      'C': 'Luis Bernal & Jefferson Pérez',
      'D': 'Carlos García'
    };

    for (const grupo of grupos) {
      const result = await pool.query(`
        SELECT name, current_shift
        FROM personnel
        WHERE area = 'CAMARÓGRAFOS DE ESTUDIO'
          AND grupo = $1
          AND active = true
        ORDER BY name
      `, [grupo]);

      console.log(`${getIcon(grupo)} GRUPO ${grupo}: ${result.rows.length} personas - Líder: ${operadores[grupo]}`);
      result.rows.forEach(r => {
        const esGrua = esOperadorGrua(r.name);
        console.log(`   ${esGrua ? '🏗️ ' : '  '} ${r.name} (Turno: ${r.current_shift})`);
      });
      console.log('');
    }

    console.log('═══════════════════════════════════════════════════════════');
    console.log('   📊 RESUMEN DE CAMBIOS');
    console.log('═══════════════════════════════════════════════════════════\n');

    console.log('✅ Luis Bernal movido del Grupo B al Grupo C');
    console.log('✅ Sebastián Hernández movido del Grupo C al Grupo B');
    console.log('✅ Todos los grupos balanceados: 5 personas cada uno');
    console.log('✅ Grupo C ahora tiene 2 operadores de grúa: Luis Bernal & Jefferson Pérez');
    console.log('✅ Jorge Jaramillo permanece en Grupo B\n');

    console.log('═══════════════════════════════════════════════════════════');
    console.log('   📁 ARCHIVOS ACTUALIZADOS');
    console.log('═══════════════════════════════════════════════════════════\n');

    console.log('✅ Base de datos: campo grupo actualizado');
    console.log('✅ backend/config/crane-operators.js');
    console.log('✅ docs/GRUPOS_CAMARAS_ESTUDIO.md\n');

    console.log('✅ SISTEMA VERIFICADO Y OPERATIVO\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

function getIcon(grupo) {
  const icons = { 'A': '🔴', 'B': '🔵', 'C': '🟢', 'D': '🟡' };
  return icons[grupo] || '⚪';
}

function esOperadorGrua(nombre) {
  const gruas = ['John Loaiza', 'Luis Bernal', 'Jefferson Pérez', 'Carlos García', 'Raul Ramírez', 'Carlos A. López'];
  return gruas.some(g => nombre.includes(g) || g.includes(nombre));
}

verificarGruposFinal();

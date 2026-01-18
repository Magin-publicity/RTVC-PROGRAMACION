const pool = require('../config/database');

async function removeAllShifts() {
  try {
    console.log('🔄 Eliminando turnos de todo el personal...\n');

    // Contar personal con turnos asignados
    const beforeCount = await pool.query(
      'SELECT COUNT(*) FROM personnel WHERE current_shift IS NOT NULL'
    );
    console.log(`📊 Personal con turnos asignados: ${beforeCount.rows[0].count}`);

    // Actualizar todos los registros para quitar el turno
    const result = await pool.query(
      'UPDATE personnel SET current_shift = NULL WHERE current_shift IS NOT NULL RETURNING id, name, area, role, current_shift'
    );

    console.log(`\n✅ Se eliminaron los turnos de ${result.rowCount} personas\n`);

    if (result.rowCount > 0) {
      console.log('Ejemplos de personal actualizado (primeras 10 personas):');
      console.table(result.rows.slice(0, 10));
    }

    // Verificar que todos quedaron sin turno
    const afterCount = await pool.query(
      'SELECT COUNT(*) FROM personnel WHERE current_shift IS NOT NULL'
    );
    console.log(`\n📊 Personal con turnos después de la actualización: ${afterCount.rows[0].count}`);

    if (afterCount.rows[0].count === '0') {
      console.log('\n✨ ¡Todos los turnos fueron eliminados exitosamente!');
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error al eliminar turnos:', error.message);
    console.error(error);
    process.exit(1);
  }
}

removeAllShifts();

const pool = require('../config/database');

async function regenerarTodosTurnos() {
  try {
    console.log('🔄 Limpiando TODOS los datos guardados de enero 2026 para regenerar con personal actual...\n');

    // Eliminar todos los registros de enero 2026
    const result = await pool.query(
      `DELETE FROM daily_schedules
       WHERE date >= '2026-01-01' AND date <= '2026-01-31'`
    );

    console.log(`✅ Datos eliminados. Filas afectadas: ${result.rowCount}`);
    console.log('\n📋 Ahora recarga la página y TODOS los días se generarán con las plantillas correctas según personal activo');
    console.log('   - 4 personas en VTR → Plantilla de 4 turnos');
    console.log('   - Cada área usará la plantilla según su cantidad de personal');

    pool.end();
  } catch (error) {
    console.error('Error:', error);
    pool.end();
  }
}

regenerarTodosTurnos();

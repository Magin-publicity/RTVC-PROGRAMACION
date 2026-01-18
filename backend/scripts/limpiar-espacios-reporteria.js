const pool = require('../database/db');

async function limpiarEspacios() {
  try {
    const fecha = process.argv[2] || '2025-12-22';

    console.log(`🧹 Limpiando espacios de reportería para ${fecha}...`);

    const result = await pool.query(
      'DELETE FROM reporteria_espacios_salida WHERE fecha = $1',
      [fecha]
    );

    console.log(`✅ Eliminados ${result.rowCount} espacios`);
    console.log('📋 Recarga la pestaña de Asignaciones para regenerar los espacios desde la Programación');

    await pool.end();
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

limpiarEspacios();

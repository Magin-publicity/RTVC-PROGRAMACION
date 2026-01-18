const pool = require('../database/db');

// Script para restaurar asignaciones del lunes 22 desde el martes 23

async function restaurar() {
  try {
    console.log('\n🔄 Restaurando asignaciones del lunes 22...\n');

    // 1. Obtener asignaciones del lunes 15 (completo con reportería)
    const lun15 = await pool.query(
      'SELECT assignments_data FROM daily_schedules WHERE date = $1',
      ['2025-12-15']
    );

    if (lun15.rows.length === 0) {
      console.log('❌ No hay datos del lunes 15');
      await pool.end();
      return;
    }

    const asignaciones15 = lun15.rows[0].assignments_data;
    console.log(`✅ Obtenidas ${Object.keys(asignaciones15).length} asignaciones del lunes 15`);

    // 2. Actualizar el lunes 22 con esas asignaciones
    await pool.query(
      `UPDATE daily_schedules
       SET assignments_data = $1, updated_at = CURRENT_TIMESTAMP
       WHERE date = $2`,
      [JSON.stringify(asignaciones15), '2025-12-22']
    );

    console.log(`✅ Asignaciones restauradas en el lunes 22`);

    // 3. Verificar
    const lun22 = await pool.query(
      'SELECT assignments_data FROM daily_schedules WHERE date = $1',
      ['2025-12-22']
    );

    console.log(`\n📊 Verificación:`);
    console.log(`   Lunes 22: ${Object.keys(lun22.rows[0].assignments_data).length} asignaciones`);
    console.log(`   Lunes 15 (backup): ${Object.keys(asignaciones15).length} asignaciones`);
    console.log(`\n✅ Restauración completada!\n`);

    await pool.end();
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

restaurar();

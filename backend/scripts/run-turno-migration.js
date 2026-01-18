const fs = require('fs');
const path = require('path');
const pool = require('../config/database');

async function runMigration() {
  try {
    console.log('🔄 Ejecutando migración: Agregar campo turno a personnel...');

    // Leer el archivo SQL
    const migrationPath = path.join(__dirname, '..', 'database', 'migrations', 'add_turno_to_personnel.sql');
    const sql = fs.readFileSync(migrationPath, 'utf8');

    // Ejecutar la migración
    await pool.query(sql);

    console.log('✅ Migración completada exitosamente');
    console.log('✅ Campo "turno" agregado a la tabla personnel');
    console.log('✅ Personal distribuido entre turnos mañana y tarde');

    // Mostrar estadísticas
    const stats = await pool.query(`
      SELECT
        area,
        turno,
        COUNT(*) as cantidad
      FROM personnel
      WHERE area IN ('CAMARÓGRAFOS DE REPORTERÍA', 'ASISTENTES DE REPORTERÍA', 'REALIZADORES DE TELEVISIÓN')
      GROUP BY area, turno
      ORDER BY area, turno
    `);

    console.log('\n📊 Distribución de turnos:');
    stats.rows.forEach(row => {
      console.log(`   ${row.area} - Turno ${row.turno}: ${row.cantidad} personas`);
    });

    process.exit(0);
  } catch (error) {
    console.error('❌ Error al ejecutar migración:', error);
    process.exit(1);
  }
}

runMigration();

const { Pool } = require('pg');
const fs = require('fs');

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'rtvc_scheduling',
  password: 'Padres2023',
  port: 5432,
});

async function restoreAssignments() {
  try {
    console.log('🔄 Intentando restaurar asignaciones de los días 13, 14, 15 de enero...\n');

    // Leer el backup
    const backupPath = '../backups/backup_BEFORE_ROUTES_MODULE_2026-01-10_22-27-40.sql';
    console.log('📂 Leyendo backup:', backupPath);

    if (!fs.existsSync(backupPath)) {
      console.log('❌ Archivo de backup no encontrado');
      process.exit(1);
    }

    const backup = fs.readFileSync(backupPath, 'utf8');

    // Buscar los registros de daily_schedules para esas fechas
    const dates = ['2026-01-13', '2026-01-14', '2026-01-15'];

    for (const date of dates) {
      console.log(`\n📅 Procesando ${date}...`);

      // Buscar el INSERT de esta fecha en el backup
      const regex = new RegExp(`INSERT INTO public\\.daily_schedules.*?'${date}'.*?;`, 's');
      const match = backup.match(regex);

      if (!match) {
        console.log(`  ⚠️  No se encontró en el backup`);
        continue;
      }

      console.log(`  ✅ Encontrado en backup`);

      // Extraer solo el assignments_data del backup (esto es complejo, mejor hacer restore manual)
      console.log(`  ℹ️  Por favor restaura manualmente desde el módulo de Asignaciones`);
    }

    console.log('\n⚠️  IMPORTANTE:');
    console.log('Para restaurar las asignaciones de los días 13, 14, 15:');
    console.log('1. Ve a "Asignación Reportería/Asistentes"');
    console.log('2. Selecciona cada día (13, 14, 15)');
    console.log('3. Haz las asignaciones nuevamente');
    console.log('4. Guarda');
    console.log('\nLo mismo para "Asignación Realizadores"');

    await pool.end();
  } catch (error) {
    console.error('❌ Error:', error.message);
    await pool.end();
    process.exit(1);
  }
}

restoreAssignments();

const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'rtvc_scheduling',
  password: 'Padres2023',
  port: 5432
});

// USAGE: node restore-from-backup.js 2026-01-09_17-08-48
const timestamp = process.argv[2];

if (!timestamp) {
  console.error('❌ Error: Debe proporcionar un timestamp de backup');
  console.log('\nUso: node restore-from-backup.js <timestamp>');
  console.log('Ejemplo: node restore-from-backup.js 2026-01-09_17-08-48');
  console.log('\nBackups disponibles:');

  const backupDir = path.join(__dirname, '../../backups/database');
  if (fs.existsSync(backupDir)) {
    const files = fs.readdirSync(backupDir)
      .filter(f => f.startsWith('BACKUP_SUMMARY_'))
      .map(f => f.replace('BACKUP_SUMMARY_', '').replace('.json', ''));
    files.forEach(f => console.log('  - ' + f));
  }
  process.exit(1);
}

async function restoreFromBackup() {
  const backupDir = path.join(__dirname, '../../backups/database');

  console.log('='.repeat(80));
  console.log('RESTAURANDO DESDE BACKUP');
  console.log('='.repeat(80));
  console.log(`Timestamp: ${timestamp}\n`);

  try {
    // Verificar que existen los archivos
    const personnelFile = path.join(backupDir, `personnel_${timestamp}.json`);
    const schedulesFile = path.join(backupDir, `daily_schedules_${timestamp}.json`);

    if (!fs.existsSync(personnelFile)) {
      throw new Error(`No existe el archivo: personnel_${timestamp}.json`);
    }

    // 1. Restaurar personnel (solo el campo active, sin tocar los demás datos)
    console.log('[1/2] Restaurando campo active de personnel...');
    const personnelData = JSON.parse(fs.readFileSync(personnelFile, 'utf8'));

    let personnelUpdated = 0;
    for (const person of personnelData) {
      await pool.query(
        'UPDATE personnel SET active = $1 WHERE id = $2',
        [person.active, person.id]
      );
      personnelUpdated++;
    }
    console.log(`✅ ${personnelUpdated} registros de personnel actualizados (solo campo active)`);

    // 2. Restaurar daily_schedules
    console.log('\n[2/2] Restaurando daily_schedules...');
    const schedulesData = JSON.parse(fs.readFileSync(schedulesFile, 'utf8'));

    await pool.query('DELETE FROM daily_schedules');

    let schedulesInserted = 0;
    for (const schedule of schedulesData) {
      await pool.query(
        `INSERT INTO daily_schedules (date, assignments_data, programs_data, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5)`,
        [
          schedule.date,
          schedule.assignments_data,
          schedule.programs_data,
          schedule.created_at,
          schedule.updated_at
        ]
      );
      schedulesInserted++;
    }
    console.log(`✅ ${schedulesInserted} registros de daily_schedules restaurados`);

    console.log('\n' + '='.repeat(80));
    console.log('✅ RESTAURACIÓN COMPLETADA EXITOSAMENTE');
    console.log('='.repeat(80));
    console.log('\n🔄 Refresque el navegador para ver los cambios');

  } catch (error) {
    console.error('\n❌ ERROR:', error.message);
  } finally {
    pool.end();
  }
}

restoreFromBackup();

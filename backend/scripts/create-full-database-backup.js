const { exec } = require('child_process');
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

async function createFullBackup() {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0] + '_' +
                    new Date().toTimeString().split(' ')[0].replace(/:/g, '-');

  const backupDir = path.join(__dirname, '../../backups/database');

  // Crear directorio si no existe
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }

  console.log('='.repeat(80));
  console.log('CREANDO BACKUP COMPLETO DE LA BASE DE DATOS');
  console.log('='.repeat(80));
  console.log('');

  try {
    // 1. Backup de todas las tablas en JSON
    console.log('[1/4] Respaldando tabla personnel...');
    const personnel = await pool.query('SELECT * FROM personnel ORDER BY id');
    fs.writeFileSync(
      path.join(backupDir, `personnel_${timestamp}.json`),
      JSON.stringify(personnel.rows, null, 2)
    );
    console.log(`✅ ${personnel.rows.length} registros de personnel guardados`);

    console.log('\n[2/4] Respaldando tabla daily_schedules...');
    const schedules = await pool.query('SELECT * FROM daily_schedules ORDER BY date');
    fs.writeFileSync(
      path.join(backupDir, `daily_schedules_${timestamp}.json`),
      JSON.stringify(schedules.rows, null, 2)
    );
    console.log(`✅ ${schedules.rows.length} registros de daily_schedules guardados`);

    console.log('\n[3/4] Respaldando tabla asignaciones_realizadores...');
    const realizadores = await pool.query('SELECT * FROM asignaciones_realizadores ORDER BY fecha, id');
    fs.writeFileSync(
      path.join(backupDir, `asignaciones_realizadores_${timestamp}.json`),
      JSON.stringify(realizadores.rows, null, 2)
    );
    console.log(`✅ ${realizadores.rows.length} registros de asignaciones_realizadores guardados`);

    console.log('\n[4/4] Respaldando tabla asignaciones_reporteria...');
    const reporteria = await pool.query('SELECT * FROM asignaciones_reporteria ORDER BY fecha, id');
    fs.writeFileSync(
      path.join(backupDir, `asignaciones_reporteria_${timestamp}.json`),
      JSON.stringify(reporteria.rows, null, 2)
    );
    console.log(`✅ ${reporteria.rows.length} registros de asignaciones_reporteria guardados`);

    // 5. Crear archivo de resumen
    const summary = {
      timestamp: new Date().toISOString(),
      tables: {
        personnel: personnel.rows.length,
        daily_schedules: schedules.rows.length,
        asignaciones_realizadores: realizadores.rows.length,
        asignaciones_reporteria: reporteria.rows.length
      },
      total_records: personnel.rows.length + schedules.rows.length + realizadores.rows.length + reporteria.rows.length
    };

    fs.writeFileSync(
      path.join(backupDir, `BACKUP_SUMMARY_${timestamp}.json`),
      JSON.stringify(summary, null, 2)
    );

    console.log('\n' + '='.repeat(80));
    console.log('✅ BACKUP COMPLETADO EXITOSAMENTE');
    console.log('='.repeat(80));
    console.log('\nArchivos creados en: backups/database/');
    console.log(`  - personnel_${timestamp}.json`);
    console.log(`  - daily_schedules_${timestamp}.json`);
    console.log(`  - asignaciones_realizadores_${timestamp}.json`);
    console.log(`  - asignaciones_reporteria_${timestamp}.json`);
    console.log(`  - BACKUP_SUMMARY_${timestamp}.json`);
    console.log('\n📊 Resumen:');
    console.log(`  Personnel: ${summary.tables.personnel} registros`);
    console.log(`  Daily Schedules: ${summary.tables.daily_schedules} registros`);
    console.log(`  Asignaciones Realizadores: ${summary.tables.asignaciones_realizadores} registros`);
    console.log(`  Asignaciones Reportería: ${summary.tables.asignaciones_reporteria} registros`);
    console.log(`  TOTAL: ${summary.total_records} registros`);

  } catch (error) {
    console.error('\n❌ ERROR:', error.message);
  } finally {
    pool.end();
  }
}

createFullBackup();

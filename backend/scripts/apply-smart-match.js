const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'rtvc_scheduling',
  password: 'Padres2023',
  port: 5432
});

async function applySmartMatch() {
  console.log('='.repeat(80));
  console.log('APLICANDO ACTUALIZACIONES DE SMART MATCH');
  console.log('='.repeat(80));

  // Leer el reporte
  const reportPath = path.join(__dirname, '../../backups/personnel-data/smart_match_report.json');
  const report = JSON.parse(fs.readFileSync(reportPath, 'utf8'));

  console.log(`\n📊 Total de actualizaciones a aplicar: ${report.updates.length}`);
  console.log(`Fecha del reporte: ${new Date(report.date).toLocaleString()}`);

  // Crear respaldo antes de actualizar
  console.log('\n📦 Creando respaldo antes de actualizar...');
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0] + '_' +
                    new Date().toTimeString().split(' ')[0].replace(/:/g, '-');

  const backupResult = await pool.query('SELECT * FROM personnel ORDER BY id');
  const backupPath = path.join(__dirname, `../../backups/personnel-data/personnel_backup_before_smart_match_${timestamp}.json`);
  fs.writeFileSync(backupPath, JSON.stringify(backupResult.rows, null, 2));
  console.log(`✅ Respaldo creado: ${backupPath}`);

  console.log('\n' + '='.repeat(80));
  console.log('APLICANDO ACTUALIZACIONES...');
  console.log('='.repeat(80));

  let successCount = 0;
  let errorCount = 0;

  for (const update of report.updates) {
    try {
      const result = await pool.query(
        `UPDATE personnel
         SET direccion = $1, phone = $2, email = $3, updated_at = NOW()
         WHERE id = $4
         RETURNING id, name, direccion, phone, email`,
        [update.direccion, update.telefono, update.email, update.id]
      );

      if (result.rows.length > 0) {
        successCount++;
        console.log(`✅ ${successCount}. ${result.rows[0].name} (ID: ${result.rows[0].id})`);
        if (update.direccion) console.log(`   📍 ${update.direccion}`);
        if (update.telefono) console.log(`   📞 ${update.telefono}`);
        if (update.email) console.log(`   ✉️  ${update.email}`);
      } else {
        errorCount++;
        console.log(`❌ Error: No se encontró persona con ID ${update.id}`);
      }
    } catch (err) {
      errorCount++;
      console.log(`❌ Error actualizando ${update.name} (ID: ${update.id}): ${err.message}`);
    }
  }

  console.log('\n' + '='.repeat(80));
  console.log('RESUMEN FINAL');
  console.log('='.repeat(80));
  console.log(`✅ Actualizaciones exitosas: ${successCount}`);
  console.log(`❌ Errores: ${errorCount}`);
  console.log(`📦 Respaldo disponible en: ${backupPath}`);

  // Verificar algunas actualizaciones
  console.log('\n' + '='.repeat(80));
  console.log('VERIFICACIÓN DE ACTUALIZACIONES (Primeros 5)');
  console.log('='.repeat(80));

  const verifyResult = await pool.query(`
    SELECT id, name, area, direccion, phone, email
    FROM personnel
    WHERE id IN (${report.updates.slice(0, 5).map(u => u.id).join(',')})
    ORDER BY name
  `);

  verifyResult.rows.forEach((row, idx) => {
    console.log(`\n${idx + 1}. ${row.name} - ${row.area}`);
    console.log(`   📍 ${row.direccion || 'N/A'}`);
    console.log(`   📞 ${row.phone || 'N/A'}`);
    console.log(`   ✉️  ${row.email || 'N/A'}`);
  });

  pool.end();
}

applySmartMatch().catch(console.error);

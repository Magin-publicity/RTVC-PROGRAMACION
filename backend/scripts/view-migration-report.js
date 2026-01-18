const fs = require('fs');
const path = require('path');

const reportFile = path.join(__dirname, '../../backups/personnel-data/migration_report_2026-01-08.json');
const data = JSON.parse(fs.readFileSync(reportFile, 'utf8'));

console.log('='.repeat(80));
console.log('REPORTE DE MIGRACIÓN DE DATOS');
console.log('='.repeat(80));
console.log(`Fecha de migración: ${new Date(data.migration_date).toLocaleString()}`);
console.log(`Total actualizados: ${data.summary.total_updated}`);
console.log(`Total no encontrados: ${data.summary.total_not_found}`);
console.log(`Total procesados: ${data.summary.total_processed}`);

if (data.updates.length > 0) {
  console.log('\n' + '='.repeat(80));
  console.log(`EMPLEADOS ACTUALIZADOS (${data.updates.length})`);
  console.log('='.repeat(80));

  data.updates.forEach((u, idx) => {
    console.log(`\n${idx + 1}. ${u.name} (ID: ${u.id})`);
    console.log(`   📍 Dirección: ${u.direccion || 'N/A'}`);
    console.log(`   📞 Teléfono: ${u.telefono || 'N/A'}`);
    console.log(`   ✉️  Email: ${u.email || 'N/A'}`);
    console.log(`   📄 Pestaña: ${u.sheet}`);
  });
}

console.log('\n' + '='.repeat(80));
console.log('ARCHIVOS DE RESPALDO');
console.log('='.repeat(80));
console.log(`📦 Respaldo JSON: ${data.backup_file}`);
console.log(`📄 Script SQL de restauración: ${data.restore_script}`);
console.log('\n Para restaurar: node backend/scripts/restore-personnel-backup.js');

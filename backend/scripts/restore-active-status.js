const fs = require('fs');
const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'rtvc_scheduling',
  password: 'Padres2023',
  port: 5432
});

async function restoreActiveStatus() {
  console.log('='.repeat(80));
  console.log('RESTAURANDO ESTADO ACTIVE DESDE BACKUP');
  console.log('='.repeat(80));

  // Leer el backup
  const backupPath = '../../backups/personnel-data/personnel_backup_before_smart_match_2026-01-08_17-31-35.json';
  const backupData = JSON.parse(fs.readFileSync(backupPath, 'utf8'));

  console.log(`\nBackup contiene ${backupData.length} registros\n`);

  let updated = 0;
  let errors = 0;

  for (const person of backupData) {
    try {
      // Restaurar SOLO el campo active, sin tocar direccion, barrio, localidad, phone, email
      const result = await pool.query(
        'UPDATE personnel SET active = $1 WHERE id = $2 RETURNING name, area, active',
        [person.active, person.id]
      );

      if (result.rowCount > 0) {
        const updated_person = result.rows[0];
        const icon = updated_person.active ? '✅' : '❌';
        console.log(`${icon} ${updated_person.name} (${updated_person.area}) -> active: ${updated_person.active}`);
        updated++;
      }
    } catch (error) {
      console.error(`❌ Error con ID ${person.id}: ${error.message}`);
      errors++;
    }
  }

  console.log('\n' + '='.repeat(80));
  console.log(`RESULTADO:`);
  console.log(`✅ Actualizados: ${updated}`);
  console.log(`❌ Errores: ${errors}`);
  console.log('='.repeat(80));

  pool.end();
}

restoreActiveStatus().catch(console.error);

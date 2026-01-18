// Script para restaurar un respaldo de personnel
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'rtvc_scheduling',
  password: 'Padres2023',
  port: 5432,
});

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

async function listBackups() {
  const backupDir = path.join(__dirname, '../../backups/personnel-data');

  if (!fs.existsSync(backupDir)) {
    console.log('❌ No se encontró la carpeta de respaldos');
    return [];
  }

  const files = fs.readdirSync(backupDir)
    .filter(f => f.startsWith('personnel_backup_') && f.endsWith('.json'))
    .sort()
    .reverse();

  return files.map(f => path.join(backupDir, f));
}

async function restoreBackup(backupFile) {
  const client = await pool.connect();

  try {
    console.log('\n🔄 Iniciando restauración de datos...');
    console.log(`📁 Archivo: ${backupFile}`);

    // Leer el archivo de respaldo
    const backupData = JSON.parse(fs.readFileSync(backupFile, 'utf8'));

    console.log(`📊 Respaldo creado: ${backupData.backup_date}`);
    console.log(`📊 Total de registros: ${backupData.total_records}`);

    const answer = await question('\n⚠️  ¿Estás seguro de restaurar este respaldo? (SI/no): ');

    if (answer.toUpperCase() !== 'SI') {
      console.log('❌ Restauración cancelada');
      return;
    }

    console.log('\n🔄 Restaurando datos...');

    await client.query('BEGIN');

    let restoredCount = 0;
    for (const person of backupData.data) {
      await client.query(`
        UPDATE personnel
        SET
          name = $1,
          area = $2,
          role = $3,
          current_shift = $4,
          email = $5,
          phone = $6,
          direccion = $7,
          barrio = $8,
          localidad = $9,
          active = $10,
          contract_start = $11,
          contract_end = $12,
          updated_at = NOW()
        WHERE id = $13
      `, [
        person.name,
        person.area,
        person.role,
        person.current_shift,
        person.email,
        person.phone,
        person.direccion,
        person.barrio,
        person.localidad,
        person.active,
        person.contract_start,
        person.contract_end,
        person.id
      ]);

      restoredCount++;
      if (restoredCount % 10 === 0) {
        console.log(`   Restaurados: ${restoredCount}/${backupData.total_records}`);
      }
    }

    await client.query('COMMIT');

    console.log('\n✅ Restauración completada exitosamente');
    console.log(`📊 Total de registros restaurados: ${restoredCount}`);

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('\n❌ Error en la restauración:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
    rl.close();
  }
}

async function main() {
  console.log('='.repeat(80));
  console.log('📦 RESTAURADOR DE RESPALDOS DE PERSONNEL');
  console.log('='.repeat(80));

  const backups = await listBackups();

  if (backups.length === 0) {
    console.log('❌ No se encontraron respaldos disponibles');
    rl.close();
    await pool.end();
    return;
  }

  console.log('\n📋 Respaldos disponibles:\n');
  backups.forEach((backup, idx) => {
    const fileName = path.basename(backup);
    console.log(`   ${idx + 1}. ${fileName}`);
  });

  const selection = await question('\n Selecciona un respaldo (número): ');
  const selectedIndex = parseInt(selection) - 1;

  if (selectedIndex < 0 || selectedIndex >= backups.length) {
    console.log('❌ Selección inválida');
    rl.close();
    await pool.end();
    return;
  }

  await restoreBackup(backups[selectedIndex]);
}

if (require.main === module) {
  main()
    .then(() => {
      console.log('\n✅ Proceso completado');
      process.exit(0);
    })
    .catch(error => {
      console.error('\n❌ Error:', error);
      process.exit(1);
    });
}

module.exports = { restoreBackup };

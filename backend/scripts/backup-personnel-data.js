// Script para crear respaldo completo de la tabla personnel ANTES de la migración
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'rtvc_scheduling',
  password: 'Padres2023',
  port: 5432,
});

async function backupPersonnelData() {
  const client = await pool.connect();

  try {
    console.log('🔄 Creando respaldo de la tabla personnel...');

    // Obtener todos los datos actuales
    const result = await client.query('SELECT * FROM personnel ORDER BY id');
    const personnelData = result.rows;

    // Crear carpeta de respaldos si no existe
    const backupDir = path.join(__dirname, '../../backups/personnel-data');
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }

    // Generar nombre de archivo con timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0] + '_' +
                      new Date().toTimeString().split(' ')[0].replace(/:/g, '-');
    const backupFile = path.join(backupDir, `personnel_backup_${timestamp}.json`);

    // Guardar respaldo en JSON
    fs.writeFileSync(backupFile, JSON.stringify({
      backup_date: new Date().toISOString(),
      total_records: personnelData.length,
      data: personnelData
    }, null, 2));

    console.log('✅ Respaldo creado exitosamente');
    console.log(`📁 Archivo: ${backupFile}`);
    console.log(`📊 Total de registros: ${personnelData.length}`);

    // También crear un script SQL de restauración
    const sqlFile = path.join(backupDir, `personnel_restore_${timestamp}.sql`);
    let sqlContent = `-- Script de restauración de personnel
-- Fecha: ${new Date().toISOString()}
-- Total de registros: ${personnelData.length}

BEGIN;

-- Deshabilitar triggers temporalmente
ALTER TABLE personnel DISABLE TRIGGER ALL;

`;

    personnelData.forEach(person => {
      sqlContent += `
UPDATE personnel SET
  name = ${client.escapeLiteral(person.name || '')},
  area = ${client.escapeLiteral(person.area || '')},
  role = ${client.escapeLiteral(person.role || '')},
  current_shift = ${client.escapeLiteral(person.current_shift || '')},
  email = ${person.email ? client.escapeLiteral(person.email) : 'NULL'},
  phone = ${person.phone ? client.escapeLiteral(person.phone) : 'NULL'},
  direccion = ${person.direccion ? client.escapeLiteral(person.direccion) : 'NULL'},
  barrio = ${person.barrio ? client.escapeLiteral(person.barrio) : 'NULL'},
  localidad = ${person.localidad ? client.escapeLiteral(person.localidad) : 'NULL'},
  active = ${person.active},
  contract_start = ${person.contract_start ? client.escapeLiteral(person.contract_start.toISOString().split('T')[0]) : 'NULL'},
  contract_end = ${person.contract_end ? client.escapeLiteral(person.contract_end.toISOString().split('T')[0]) : 'NULL'}
WHERE id = ${person.id};
`;
    });

    sqlContent += `
-- Rehabilitar triggers
ALTER TABLE personnel ENABLE TRIGGER ALL;

COMMIT;

-- Para ejecutar este script:
-- psql -U postgres -d rtvc_scheduling -f ${path.basename(sqlFile)}
`;

    fs.writeFileSync(sqlFile, sqlContent);
    console.log(`📄 Script SQL de restauración: ${sqlFile}`);

    return {
      backupFile,
      sqlFile,
      recordCount: personnelData.length
    };

  } catch (error) {
    console.error('❌ Error creando respaldo:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  backupPersonnelData()
    .then(() => {
      console.log('\n✅ Proceso de respaldo completado');
      process.exit(0);
    })
    .catch(error => {
      console.error('\n❌ Error en el proceso de respaldo:', error);
      process.exit(1);
    });
}

module.exports = { backupPersonnelData };

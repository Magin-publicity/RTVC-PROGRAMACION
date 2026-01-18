// Script para migrar datos del Excel de contratistas a la tabla personnel
const XLSX = require('xlsx');
const { Pool } = require('pg');
const path = require('path');
const fs = require('fs');
const { backupPersonnelData } = require('./backup-personnel-data');

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'rtvc_scheduling',
  password: 'Padres2023',
  port: 5432,
});

// Función para normalizar nombres (quitar espacios extras, convertir a mayúsculas para comparar)
function normalizeName(name) {
  if (!name) return '';
  return name.toString().trim().toUpperCase().replace(/\s+/g, ' ');
}

// Función para limpiar texto
function cleanText(text) {
  if (!text) return null;
  const cleaned = text.toString().trim();
  return cleaned === '' ? null : cleaned;
}

// Mapeo de pestañas del Excel a áreas en nuestra BD
const SHEET_TO_AREA_MAP = {
  'DIRECTORES DE CAMARA': 'Dirección de Cámara',
  'OPERADORES VTR': 'Operación VTR',
  'GENERADORES DE CARACTERES': 'Generación de Caracteres',
  'AUDIO': 'Audio',
  'INGENIERIA': 'Ingeniería',
  'CONTRIBUCIONES': 'Contribuciones',
  'EDITORES': 'Edición',
  'VMIX': 'VMix',
  'PANTALLAS': 'Pantallas',
  'PRODUCCION': 'Producción'
};

async function migrateExcelData() {
  const client = await pool.connect();

  try {
    console.log('='.repeat(80));
    console.log('🚀 INICIANDO MIGRACIÓN DE DATOS DE CONTRATISTAS');
    console.log('='.repeat(80));

    // PASO 1: Crear respaldo
    console.log('\n📦 PASO 1: Creando respaldo de seguridad...');
    const backup = await backupPersonnelData();
    console.log(`✅ Respaldo creado: ${backup.recordCount} registros`);

    // PASO 2: Leer el archivo Excel
    console.log('\n📖 PASO 2: Leyendo archivo Excel...');
    const excelPath = path.join(__dirname, '../../Datos y Documentos RTVC/BASE DE DATOS CONTRATISTAS ÁREA TÉCNICA RTVC (1).xlsx');

    if (!fs.existsSync(excelPath)) {
      throw new Error(`No se encuentra el archivo: ${excelPath}`);
    }

    const workbook = XLSX.readFile(excelPath);
    console.log(`✅ Excel cargado. Pestañas encontradas: ${workbook.SheetNames.join(', ')}`);

    // PASO 3: Obtener todos los empleados actuales
    console.log('\n📊 PASO 3: Obteniendo empleados actuales de la BD...');
    const currentPersonnel = await client.query('SELECT * FROM personnel WHERE active = true');
    const personnelMap = new Map();

    currentPersonnel.rows.forEach(person => {
      const normalizedName = normalizeName(person.name);
      personnelMap.set(normalizedName, person);
    });

    console.log(`✅ ${personnelMap.size} empleados activos en BD`);

    // PASO 4: Procesar cada pestaña del Excel
    console.log('\n🔄 PASO 4: Procesando pestañas del Excel...');

    const updates = [];
    const notFound = [];
    const processed = new Set();

    for (const sheetName of workbook.SheetNames) {
      // Saltar pestañas que no son de personal
      if (sheetName.includes('RESUMEN') || sheetName.includes('TOTAL')) {
        continue;
      }

      console.log(`\n  📄 Procesando pestaña: "${sheetName}"`);
      const sheet = workbook.Sheets[sheetName];

      // Leer como array de arrays para manejar el formato del Excel
      const rawData = XLSX.utils.sheet_to_json(sheet, { header: 1 });

      // Buscar la fila de encabezados (contiene "NOMBRE")
      let headerRowIndex = -1;
      for (let i = 0; i < rawData.length; i++) {
        if (rawData[i] && rawData[i].some(cell =>
          cell && cell.toString().toUpperCase().includes('NOMBRE') &&
          !cell.toString().toUpperCase().includes('LISTADO')
        )) {
          headerRowIndex = i;
          break;
        }
      }

      if (headerRowIndex === -1) {
        console.log(`     ⚠️ No se encontraron encabezados en esta pestaña, saltando...`);
        continue;
      }

      const headers = rawData[headerRowIndex];
      const dataRows = rawData.slice(headerRowIndex + 1);

      // Convertir a objetos usando los encabezados
      const data = dataRows.map(row => {
        const obj = {};
        headers.forEach((header, idx) => {
          if (header) {
            obj[header] = row[idx];
          }
        });
        return obj;
      }).filter(row => row['NOMBRE'] || row['Nombre'] || row['NOMBRE COMPLETO']);

      console.log(`     Registros encontrados: ${data.length}`);

      let matchCount = 0;

      for (const row of data) {
        // Extraer datos según las columnas del Excel
        const excelName = row['NOMBRE'] || row['NOMBRE COMPLETO'] || row['Nombre'] || '';
        const direccion = cleanText(row['DIRECCIÓN DE RESIDENCIA'] || row['DIRECCION'] || row['Dirección'] || row['DIRECCIÓN']);
        const telefono = cleanText(row['CELULAR'] || row['CEL'] || row['Celular'] || row['TELEFONO'] || row['Teléfono']);
        const email = cleanText(row['CORREO ELECTRÓNICO'] || row['CORREO'] || row['Email'] || row['E-MAIL'] || row['Correo']);

        if (!excelName) continue;

        const normalizedExcelName = normalizeName(excelName);

        // Buscar coincidencia EXACTA o PARCIAL en la BD
        let person = null;

        // Primero intentar coincidencia exacta
        if (personnelMap.has(normalizedExcelName)) {
          person = personnelMap.get(normalizedExcelName);
        } else {
          // Intentar coincidencia parcial: nombre de BD contenido en nombre de Excel
          for (const [dbName, dbPerson] of personnelMap.entries()) {
            // El nombre de la BD debe estar completo en el nombre del Excel
            if (normalizedExcelName.includes(dbName)) {
              person = dbPerson;
              break;
            }
          }
        }

        if (person) {

          // Solo actualizar si hay datos nuevos
          const needsUpdate =
            (direccion && direccion !== person.direccion) ||
            (telefono && telefono !== person.phone) ||
            (email && email !== person.email);

          if (needsUpdate) {
            updates.push({
              id: person.id,
              name: person.name,
              direccion: direccion || person.direccion,
              telefono: telefono || person.phone,
              email: email || person.email,
              sheet: sheetName
            });

            processed.add(normalizedExcelName);
            matchCount++;
          }
        } else {
          // No se encontró en la BD
          if (!notFound.some(nf => normalizeName(nf.name) === normalizedExcelName)) {
            notFound.push({
              name: excelName,
              sheet: sheetName,
              direccion,
              telefono,
              email
            });
          }
        }
      }

      console.log(`     ✅ Coincidencias encontradas: ${matchCount}`);
    }

    // PASO 5: Mostrar resumen antes de actualizar
    console.log('\n' + '='.repeat(80));
    console.log('📊 RESUMEN DE CAMBIOS PROPUESTOS');
    console.log('='.repeat(80));
    console.log(`✅ Empleados a actualizar: ${updates.length}`);
    console.log(`⚠️  Nombres no encontrados en BD: ${notFound.length}`);

    if (updates.length > 0) {
      console.log('\n📝 Primeros 10 cambios:');
      updates.slice(0, 10).forEach((update, idx) => {
        console.log(`   ${idx + 1}. ${update.name}`);
        console.log(`      📍 Dirección: ${update.direccion || '(sin cambio)'}`);
        console.log(`      📞 Teléfono: ${update.telefono || '(sin cambio)'}`);
        console.log(`      ✉️  Email: ${update.email || '(sin cambio)'}`);
      });

      if (updates.length > 10) {
        console.log(`   ... y ${updates.length - 10} más`);
      }
    }

    if (notFound.length > 0) {
      console.log('\n⚠️  Nombres en Excel que NO están en la BD:');
      notFound.slice(0, 10).forEach((nf, idx) => {
        console.log(`   ${idx + 1}. ${nf.name} (Pestaña: ${nf.sheet})`);
      });

      if (notFound.length > 10) {
        console.log(`   ... y ${notFound.length - 10} más`);
      }
    }

    // PASO 6: Ejecutar actualizaciones
    console.log('\n' + '='.repeat(80));
    console.log('🔄 PASO 5: Ejecutando actualizaciones en la BD...');
    console.log('='.repeat(80));

    await client.query('BEGIN');

    let updateCount = 0;
    for (const update of updates) {
      await client.query(`
        UPDATE personnel
        SET
          direccion = $1,
          phone = $2,
          email = $3,
          updated_at = NOW()
        WHERE id = $4
      `, [update.direccion, update.telefono, update.email, update.id]);

      updateCount++;
      if (updateCount % 10 === 0) {
        console.log(`   Actualizados: ${updateCount}/${updates.length}`);
      }
    }

    await client.query('COMMIT');
    console.log(`✅ Actualizaciones completadas: ${updateCount} empleados`);

    // PASO 7: Generar reporte
    console.log('\n📄 PASO 6: Generando reporte...');
    const reportDir = path.join(__dirname, '../../backups/personnel-data');
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0];
    const reportFile = path.join(reportDir, `migration_report_${timestamp}.json`);

    const report = {
      migration_date: new Date().toISOString(),
      backup_file: backup.backupFile,
      restore_script: backup.sqlFile,
      summary: {
        total_updated: updateCount,
        total_not_found: notFound.length,
        total_processed: processed.size
      },
      updates,
      not_found: notFound
    };

    fs.writeFileSync(reportFile, JSON.stringify(report, null, 2));
    console.log(`✅ Reporte guardado: ${reportFile}`);

    console.log('\n' + '='.repeat(80));
    console.log('✅ MIGRACIÓN COMPLETADA EXITOSAMENTE');
    console.log('='.repeat(80));
    console.log(`📦 Respaldo: ${backup.backupFile}`);
    console.log(`📄 Reporte: ${reportFile}`);
    console.log(`🔄 Para revertir: node backend/scripts/restore-personnel-backup.js`);
    console.log('='.repeat(80));

    return report;

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('\n❌ ERROR EN LA MIGRACIÓN:', error);
    console.log('\n⚠️  La migración fue revertida. Los datos no fueron modificados.');
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  migrateExcelData()
    .then(() => {
      console.log('\n✅ Proceso completado');
      process.exit(0);
    })
    .catch(error => {
      console.error('\n❌ Error en el proceso:', error);
      process.exit(1);
    });
}

module.exports = { migrateExcelData };

const XLSX = require('xlsx');
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

// Función para normalizar nombres (quitar acentos, mayúsculas, espacios extras)
function normalizar(str) {
  if (!str) return '';
  return str
    .toString()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' ');
}

// Función para extraer apellidos (últimas 2 palabras generalmente)
function extraerApellidos(nombreCompleto) {
  const palabras = nombreCompleto.trim().split(/\s+/);
  if (palabras.length >= 2) {
    return palabras.slice(-2).join(' '); // Últimas 2 palabras
  }
  return palabras[palabras.length - 1]; // Si solo hay 1 palabra
}

// Función para buscar coincidencia inteligente
function buscarCoincidencia(nombreExcel, personnelMap) {
  const normalizedExcel = normalizar(nombreExcel);

  // 1. Coincidencia exacta
  if (personnelMap.has(normalizedExcel)) {
    return personnelMap.get(normalizedExcel);
  }

  // 2. Coincidencia: nombre de BD contenido en nombre de Excel
  for (const [dbName, dbPerson] of personnelMap.entries()) {
    if (normalizedExcel.includes(dbName)) {
      return dbPerson;
    }
  }

  // 3. Coincidencia por apellidos
  const apellidosExcel = normalizar(extraerApellidos(nombreExcel));
  for (const [dbName, dbPerson] of personnelMap.entries()) {
    const apellidosDB = normalizar(extraerApellidos(dbPerson.name));
    if (apellidosExcel === apellidosDB && apellidosExcel.length > 0) {
      return dbPerson;
    }
  }

  // 4. Coincidencia: nombre de Excel contenido en nombre de BD (inverso)
  for (const [dbName, dbPerson] of personnelMap.entries()) {
    if (dbName.includes(normalizedExcel)) {
      return dbPerson;
    }
  }

  // 5. Coincidencia por primer nombre + primer apellido
  const palabrasExcel = normalizedExcel.split(/\s+/);
  if (palabrasExcel.length >= 2) {
    const primerNombreExcel = palabrasExcel[0];
    const primerApellidoExcel = palabrasExcel[palabrasExcel.length - 2] || palabrasExcel[palabrasExcel.length - 1];

    for (const [dbName, dbPerson] of personnelMap.entries()) {
      const palabrasDB = dbName.split(/\s+/);
      if (palabrasDB.length >= 2) {
        const primerNombreDB = palabrasDB[0];
        const primerApellidoDB = palabrasDB[palabrasDB.length - 1];

        if (primerNombreExcel === primerNombreDB && primerApellidoExcel === primerApellidoDB) {
          return dbPerson;
        }
      }
    }
  }

  return null;
}

async function smartMatchExcel() {
  console.log('='.repeat(80));
  console.log('MATCHING INTELIGENTE DE EXCEL CON BASE DE DATOS');
  console.log('='.repeat(80));

  // Leer Excel
  const excelPath = path.join(__dirname, '../../Datos y Documentos RTVC/BASE DE DATOS CONTRATISTAS ÁREA TÉCNICA RTVC (1).xlsx');
  const workbook = XLSX.readFile(excelPath);

  // Cargar todo el personal de la BD
  const personnelResult = await pool.query('SELECT id, name, area, role FROM personnel WHERE active = true');
  const personnelMap = new Map();
  personnelResult.rows.forEach(p => {
    personnelMap.set(normalizar(p.name), p);
  });

  console.log(`\n📊 Total de personas en BD: ${personnelResult.rows.length}`);

  const updates = [];
  const notFound = [];
  const alreadyUpdated = new Set();

  // Pestañas a procesar
  const sheets = [
    'DIRECTORES DE CÁMARA',
    'OPERADORES VTR',
    'GENERADORES DE CARACTERES',
    'OPERADORES Y ASISTENTES DE AUDIO',
    'OPERADORES DE TELEPRÓMTER',
    'CAMARÓGRAFOS DE ESTUDIO',
    'CAMARÓGRAFOS DE REPORTERÍA',
    'VIDEO, LUCES Y FOTOGRAFÍA',
    'VESTUARIO Y MAQUILLAJE',
    'CONTRIBUCIONES',
    'PERIODISTAS Y PRODUCTORES',
    'Ingeniería y emisión',
    'EDITORES',
    'PERIODISTAS'
  ];

  for (const sheetName of sheets) {
    if (!workbook.SheetNames.includes(sheetName)) continue;

    console.log(`\n📄 Procesando pestaña: ${sheetName}`);
    const sheet = workbook.Sheets[sheetName];
    const rawData = XLSX.utils.sheet_to_json(sheet, { header: 1 });

    // Encontrar fila de encabezados
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

    if (headerRowIndex === -1) continue;

    const headers = rawData[headerRowIndex].map(h => h ? h.toString().trim() : '');
    const nombreCol = headers.findIndex(h => h.toUpperCase().includes('NOMBRE') && !h.toUpperCase().includes('LISTADO'));
    const direccionCol = headers.findIndex(h => h.toUpperCase().includes('DIRECCI') || h.toUpperCase().includes('RESIDENCIA'));
    const telefonoCol = headers.findIndex(h => h.toUpperCase().includes('TELÉFONO') || h.toUpperCase().includes('TELEFONO') || h.toUpperCase().includes('CELULAR'));
    const emailCol = headers.findIndex(h => h.toUpperCase().includes('CORREO') || h.toUpperCase().includes('EMAIL') || h.toUpperCase().includes('E-MAIL'));

    // Procesar datos
    for (let i = headerRowIndex + 1; i < rawData.length; i++) {
      const row = rawData[i];
      if (!row || row.length === 0) continue;

      const nombreExcel = row[nombreCol];
      if (!nombreExcel || nombreExcel.toString().trim() === '') continue;

      const direccion = direccionCol !== -1 ? row[direccionCol] : null;
      const telefono = telefonoCol !== -1 ? row[telefonoCol] : null;
      const email = emailCol !== -1 ? row[emailCol] : null;

      // Buscar coincidencia inteligente
      const person = buscarCoincidencia(nombreExcel.toString(), personnelMap);

      if (person) {
        const personKey = `${person.id}-${person.name}`;
        if (!alreadyUpdated.has(personKey)) {
          updates.push({
            id: person.id,
            name: person.name,
            excelName: nombreExcel.toString(),
            area: person.area,
            direccion: direccion ? direccion.toString() : null,
            telefono: telefono ? telefono.toString() : null,
            email: email ? email.toString() : null,
            sheet: sheetName
          });
          alreadyUpdated.add(personKey);
        }
      } else {
        notFound.push({ name: nombreExcel.toString(), sheet: sheetName });
      }
    }
  }

  console.log('\n' + '='.repeat(80));
  console.log(`✅ COINCIDENCIAS ENCONTRADAS: ${updates.length}`);
  console.log(`⚠️  NO ENCONTRADOS: ${notFound.length}`);
  console.log('='.repeat(80));

  // Mostrar primeras 10 coincidencias con detalles
  console.log('\n📋 Primeras 10 coincidencias:');
  updates.slice(0, 10).forEach((u, idx) => {
    console.log(`\n${idx + 1}. "${u.name}" (BD) ← "${u.excelName}" (Excel)`);
    console.log(`   Área: ${u.area}`);
    if (u.direccion) console.log(`   📍 ${u.direccion}`);
    if (u.telefono) console.log(`   📞 ${u.telefono}`);
    if (u.email) console.log(`   ✉️  ${u.email}`);
  });

  // Preguntar si continuar
  console.log('\n' + '='.repeat(80));
  console.log(`¿Proceder a actualizar ${updates.length} registros? (Este script solo muestra, no actualiza)`);
  console.log('Para actualizar, ejecuta: node backend/scripts/apply-smart-match.js');
  console.log('='.repeat(80));

  // Guardar resultados
  const reportPath = path.join(__dirname, '../../backups/personnel-data/smart_match_report.json');
  fs.writeFileSync(reportPath, JSON.stringify({
    date: new Date().toISOString(),
    total_matches: updates.length,
    total_not_found: notFound.length,
    updates: updates,
    not_found: notFound
  }, null, 2));

  console.log(`\n✅ Reporte guardado en: ${reportPath}`);

  pool.end();
}

smartMatchExcel().catch(console.error);

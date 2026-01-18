const { Pool } = require('pg');
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'rtvc_scheduling',
  password: 'Padres2023',
  port: 5432
});

async function validateAreas() {
  console.log('='.repeat(80));
  console.log('VALIDACIÓN DE ÁREAS - BASE DE DATOS vs FRONTEND');
  console.log('='.repeat(80));

  // Áreas definidas en el frontend (departments.js) - ACTUALIZADAS
  const frontendDepartments = [
    'PRODUCTORES',
    'ASISTENTES DE PRODUCCIÓN',
    'DIRECTORES DE CÁMARA',
    'VTR',
    'OPERADORES DE VMIX',
    'OPERADORES DE PANTALLAS',
    'GENERADORES DE CARACTERES',
    'OPERADORES DE SONIDO',
    'ASISTENTES DE SONIDO',
    'OPERADORES DE PROMPTER',
    'CAMARÓGRAFOS DE ESTUDIO',
    'ASISTENTES DE ESTUDIO',
    'COORDINADOR ESTUDIO',
    'ESCENOGRAFÍA',
    'ASISTENTES DE LUCES',
    'OPERADORES DE VIDEO',
    'CONTRIBUCIONES',
    'REALIZADORES',
    'CAMARÓGRAFOS DE REPORTERÍA',
    'ASISTENTES DE REPORTERÍA',
    'VESTUARIO',
    'MAQUILLAJE'
  ];

  // Obtener áreas de la base de datos
  const dbAreasQuery = await pool.query(`
    SELECT DISTINCT area, COUNT(*) as count
    FROM personnel
    WHERE active = true
    GROUP BY area
    ORDER BY area
  `);

  console.log('\n📊 ÁREAS EN LA BASE DE DATOS:');
  console.log('='.repeat(80));
  dbAreasQuery.rows.forEach(r => {
    const inFrontend = frontendDepartments.includes(r.area) ? '✅' : '❌';
    console.log(`${inFrontend} "${r.area}" (${r.count} personas)`);
  });

  // Verificar áreas del frontend que NO están en BD
  console.log('\n\n⚠️  DEPARTAMENTOS DEL FRONTEND SIN PERSONAS EN BD:');
  console.log('='.repeat(80));
  const dbAreas = dbAreasQuery.rows.map(r => r.area);
  const missingInDB = frontendDepartments.filter(dept => !dbAreas.includes(dept));
  if (missingInDB.length > 0) {
    missingInDB.forEach(dept => console.log(`   - "${dept}"`));
  } else {
    console.log('   Ninguno - ¡Perfecto!');
  }

  // Áreas en BD sin departamento frontend
  console.log('\n\n❌ ÁREAS EN BD SIN DEPARTAMENTO EN FRONTEND:');
  console.log('='.repeat(80));
  const missingInFrontend = dbAreasQuery.rows.filter(r => !frontendDepartments.includes(r.area));
  if (missingInFrontend.length > 0) {
    missingInFrontend.forEach(r => console.log(`   - "${r.area}" (${r.count} personas)`));
  } else {
    console.log('   Ninguno - ¡Perfecto!');
  }

  // Resumen
  const matchCount = dbAreasQuery.rows.filter(r => frontendDepartments.includes(r.area)).length;
  console.log('\n\n' + '='.repeat(80));
  console.log('RESUMEN:');
  console.log('='.repeat(80));
  console.log(`✅ Áreas coincidentes: ${matchCount}/${dbAreasQuery.rows.length}`);
  console.log(`❌ Áreas en BD sin departamento frontend: ${dbAreasQuery.rows.length - matchCount}`);
  console.log(`⚠️  Departamentos frontend sin personas: ${missingInDB.length}`);

  pool.end();
}

validateAreas().catch(console.error);

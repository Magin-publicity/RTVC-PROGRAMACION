const pool = require('../config/database');
const http = require('http');

async function diagnoseComplete() {
  console.log('🔍 DIAGNÓSTICO COMPLETO DEL SISTEMA DE PERSISTENCIA\n');

  const testDate = '2026-01-07';

  try {
    // ============================================
    // 1. VERIFICAR BASE DE DATOS
    // ============================================
    console.log('📦 PASO 1: Verificar datos en PostgreSQL');
    const dbResult = await pool.query(
      'SELECT assignments_data, programs_data FROM daily_schedules WHERE date = $1',
      [testDate]
    );

    if (dbResult.rows.length === 0) {
      console.log('❌ ERROR: No hay datos para 2026-01-07 en la BD');
      pool.end();
      return;
    }

    const dbAssignments = dbResult.rows[0].assignments_data;
    const dbProgramsData = dbResult.rows[0].programs_data;
    const dbCallTimes = dbProgramsData.callTimes || {};

    console.log('   ✅ Asignaciones en BD:', Object.keys(dbAssignments).length);
    console.log('   ✅ CallTimes en BD:', Object.keys(dbCallTimes).length);
    console.log('   📋 Primeras 5 asignaciones:', Object.keys(dbAssignments).slice(0, 5));
    console.log('   📋 Primeros 5 callTimes:', Object.entries(dbCallTimes).slice(0, 5).map(([k,v]) => `${k}:${v}`));

    // ============================================
    // 2. VERIFICAR API GET
    // ============================================
    console.log('\n🌐 PASO 2: Verificar endpoint GET /api/schedule/daily/:date');

    const apiData = await new Promise((resolve, reject) => {
      const options = {
        hostname: 'localhost',
        port: 3000,
        path: `/api/schedule/daily/${testDate}`,
        method: 'GET',
        headers: { 'Accept': 'application/json' }
      };

      const req = http.request(options, (res) => {
        let data = '';
        res.on('data', (chunk) => { data += chunk; });
        res.on('end', () => {
          try {
            resolve(JSON.parse(data));
          } catch (e) {
            reject(new Error('Error parseando JSON: ' + data.substring(0, 100)));
          }
        });
      });

      req.on('error', reject);
      req.setTimeout(5000, () => reject(new Error('Timeout')));
      req.end();
    });

    console.log('   ✅ API Assignments:', Object.keys(apiData.assignments).length);
    console.log('   ✅ API CallTimes:', Object.keys(apiData.callTimes).length);
    console.log('   📋 Primeras 5 asignaciones API:', Object.keys(apiData.assignments).slice(0, 5));

    // ============================================
    // 3. COMPARAR BD vs API
    // ============================================
    console.log('\n🔄 PASO 3: Comparar BD vs API');

    const bdKeys = Object.keys(dbAssignments).sort();
    const apiKeys = Object.keys(apiData.assignments).sort();

    if (bdKeys.length !== apiKeys.length) {
      console.log(`   ❌ ERROR: Diferente cantidad de asignaciones`);
      console.log(`      BD: ${bdKeys.length}, API: ${apiKeys.length}`);

      const bdOnly = bdKeys.filter(k => !apiKeys.includes(k));
      const apiOnly = apiKeys.filter(k => !bdKeys.includes(k));

      if (bdOnly.length > 0) {
        console.log(`   ❌ En BD pero NO en API (${bdOnly.length}):`, bdOnly.slice(0, 10));
      }
      if (apiOnly.length > 0) {
        console.log(`   ❌ En API pero NO en BD (${apiOnly.length}):`, apiOnly.slice(0, 10));
      }
    } else {
      console.log('   ✅ Misma cantidad de asignaciones en BD y API');
    }

    // CallTimes
    const bdCtKeys = Object.keys(dbCallTimes).sort();
    const apiCtKeys = Object.keys(apiData.callTimes).sort();

    if (bdCtKeys.length !== apiCtKeys.length) {
      console.log(`   ❌ ERROR: Diferente cantidad de callTimes`);
      console.log(`      BD: ${bdCtKeys.length}, API: ${apiCtKeys.length}`);
    } else {
      console.log('   ✅ Misma cantidad de callTimes en BD y API');
    }

    // ============================================
    // 4. HACER UN CAMBIO Y VERIFICAR PERSISTENCIA
    // ============================================
    console.log('\n💾 PASO 4: Test de persistencia - Agregar marcador TEST_999_999');

    const testAssignments = { ...dbAssignments, 'TEST_999_999': true };
    const testCallTimes = { ...dbCallTimes, '999': '99:99' };

    // Guardar vía API POST
    const saveData = await new Promise((resolve, reject) => {
      const postData = JSON.stringify({
        assignments: testAssignments,
        callTimes: testCallTimes,
        programs: dbProgramsData.programs || [],
        shifts: dbProgramsData.shifts || []
      });

      const options = {
        hostname: 'localhost',
        port: 3000,
        path: `/api/schedule/daily/${testDate}`,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(postData)
        }
      };

      const req = http.request(options, (res) => {
        let data = '';
        res.on('data', (chunk) => { data += chunk; });
        res.on('end', () => {
          try {
            resolve(JSON.parse(data));
          } catch (e) {
            reject(new Error('Error parseando respuesta POST'));
          }
        });
      });

      req.on('error', reject);
      req.setTimeout(5000, () => reject(new Error('Timeout en POST')));
      req.write(postData);
      req.end();
    });

    console.log('   ✅ POST guardado');

    // Esperar 1 segundo
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Verificar en BD
    const checkDb = await pool.query(
      'SELECT assignments_data, programs_data FROM daily_schedules WHERE date = $1',
      [testDate]
    );

    const newDbAssignments = checkDb.rows[0].assignments_data;
    const newDbCallTimes = checkDb.rows[0].programs_data.callTimes || {};

    console.log('   🔍 Verificando en BD...');
    console.log('      Tiene TEST_999_999:', newDbAssignments['TEST_999_999'] === true ? '✅ SÍ' : '❌ NO');
    console.log('      Tiene callTime 999:', newDbCallTimes['999'] === '99:99' ? '✅ SÍ' : '❌ NO');

    // Verificar en API GET
    const checkApi = await new Promise((resolve, reject) => {
      const options = {
        hostname: 'localhost',
        port: 3000,
        path: `/api/schedule/daily/${testDate}`,
        method: 'GET'
      };

      const req = http.request(options, (res) => {
        let data = '';
        res.on('data', (chunk) => { data += chunk; });
        res.on('end', () => {
          try {
            resolve(JSON.parse(data));
          } catch (e) {
            reject(new Error('Error parseando GET'));
          }
        });
      });

      req.on('error', reject);
      req.setTimeout(5000, () => reject(new Error('Timeout en GET')));
      req.end();
    });

    console.log('   🔍 Verificando en API GET...');
    console.log('      Tiene TEST_999_999:', checkApi.assignments['TEST_999_999'] === true ? '✅ SÍ' : '❌ NO');
    console.log('      Tiene callTime 999:', checkApi.callTimes['999'] === '99:99' ? '✅ SÍ' : '❌ NO');

    // Limpiar marcadores de test
    delete newDbAssignments['TEST_999_999'];
    delete newDbCallTimes['999'];
    await pool.query(
      `UPDATE daily_schedules SET assignments_data = $1, programs_data = $2 WHERE date = $3`,
      [JSON.stringify(newDbAssignments), JSON.stringify({ ...dbProgramsData, callTimes: newDbCallTimes }), testDate]
    );

    // ============================================
    // 5. RESUMEN
    // ============================================
    console.log('\n📊 RESUMEN DEL DIAGNÓSTICO');
    console.log('═══════════════════════════════════════');

    if (bdKeys.length === apiKeys.length &&
        newDbAssignments['TEST_999_999'] === true &&
        checkApi.assignments['TEST_999_999'] === true) {
      console.log('✅ SISTEMA FUNCIONANDO CORRECTAMENTE');
      console.log('   - BD guarda datos correctamente');
      console.log('   - API GET devuelve datos de BD correctamente');
      console.log('   - API POST guarda datos correctamente');
      console.log('\n⚠️  Si los cambios no persisten en el frontend:');
      console.log('   → El problema está en el FRONTEND (React)');
      console.log('   → Posibles causas:');
      console.log('     1. WebSocket sobrescribiendo datos');
      console.log('     2. Estado local no se actualiza');
      console.log('     3. useEffect con dependencias incorrectas');
    } else {
      console.log('❌ PROBLEMAS DETECTADOS EN EL BACKEND');
      if (bdKeys.length !== apiKeys.length) {
        console.log('   → API GET no devuelve los mismos datos que BD');
      }
      if (newDbAssignments['TEST_999_999'] !== true) {
        console.log('   → API POST no guarda en BD correctamente');
      }
      if (checkApi.assignments['TEST_999_999'] !== true) {
        console.log('   → API GET no lee de BD correctamente');
      }
    }

    pool.end();

  } catch (error) {
    console.error('\n❌ ERROR EN DIAGNÓSTICO:', error.message);
    console.error(error.stack);
    pool.end();
  }
}

diagnoseComplete();

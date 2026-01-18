// Script para verificar la fecha actual del sistema
console.log('='.repeat(80));
console.log('VERIFICACIÓN DE FECHA ACTUAL');
console.log('='.repeat(80));

const now = new Date();

console.log('\n📅 Fecha y hora del sistema:');
console.log(`   Fecha completa: ${now}`);
console.log(`   ISO String: ${now.toISOString()}`);
console.log(`   Fecha (YYYY-MM-DD): ${now.toISOString().split('T')[0]}`);
console.log(`   Hora local: ${now.toLocaleTimeString('es-CO')}`);
console.log(`   Timezone offset: ${now.getTimezoneOffset()} minutos`);

console.log('\n📊 Comparación con la novedad:');
console.log('   Novedad: 9 de enero - 10 de enero');
console.log(`   Hoy: ${now.toISOString().split('T')[0]}`);

const todayStr = now.toISOString().split('T')[0];
const startDateStr = '2026-01-09';
const endDateStr = '2026-01-10';

console.log(`\n🔍 Verificación de fechas (comparación de strings):`);
console.log(`   todayStr >= startDateStr: ${todayStr} >= ${startDateStr} = ${todayStr >= startDateStr}`);
console.log(`   todayStr <= endDateStr: ${todayStr} <= ${endDateStr} = ${todayStr <= endDateStr}`);
console.log(`   ¿Está activa?: ${todayStr >= startDateStr && todayStr <= endDateStr}`);

console.log('\n' + '='.repeat(80));

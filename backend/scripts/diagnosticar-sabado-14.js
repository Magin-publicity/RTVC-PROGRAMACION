const { calculateWeekendCount, WEEKEND_ROTATION_BASE_DATE } = require('../config/rotation-constants');

// Diagnosticar el sábado 14 de febrero que tiene problemas
const fecha = new Date('2026-02-14T12:00:00');

console.log(`📅 Diagnóstico para: ${fecha.toISOString().split('T')[0]}`);
console.log(`   Día de la semana: ${fecha.getDay()} (6 = sábado)`);
console.log(`   Fecha base rotación: ${WEEKEND_ROTATION_BASE_DATE}`);

const weekendCount = calculateWeekendCount(fecha);
console.log(`   weekendCount calculado: ${weekendCount}`);

// Calcular manualmente para verificar
const baseDate = new Date(WEEKEND_ROTATION_BASE_DATE);
const daysDiff = Math.floor((fecha - baseDate) / (1000 * 60 * 60 * 24));
const weekendCountManual = Math.floor(daysDiff / 7);

console.log(`\n🔍 Verificación manual:`);
console.log(`   Días desde base: ${daysDiff}`);
console.log(`   weekendCount manual: ${weekendCountManual}`);

if (weekendCount !== weekendCountManual) {
  console.log(`\n⚠️ ERROR: weekendCount no coincide!`);
} else {
  console.log(`\n✅ weekendCount correcto`);
}

// Mostrar otros fines de semana de febrero para comparar
console.log(`\n📊 Otros sábados de febrero 2026:`);
const febreroSabados = [
  '2026-02-07',
  '2026-02-14',
  '2026-02-21',
  '2026-02-28'
];

febreroSabados.forEach(sabado => {
  const d = new Date(sabado + 'T12:00:00');
  const wc = calculateWeekendCount(d);
  console.log(`   ${sabado}: weekendCount = ${wc}`);
});

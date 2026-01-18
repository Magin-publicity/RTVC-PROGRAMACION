async function verifyFix() {
  try {
    const response = await fetch('http://localhost:3000/api/schedule/daily/2025-12-26');
    const data = await response.json();

    console.log('📊 Verificación del fix:');
    console.log(`   found: ${data.found}`);

    console.log('\n👥 Turnos de CONTRIBUCIONES:');
    const contrib = data.shifts?.filter(s => s.area === 'CONTRIBUCIONES') || [];
    contrib.forEach(s => {
      console.log(`   ${s.name}: ${s.shift_start} - ${s.shift_end}`);
    });

    console.log('\n⏰ Call Times de CONTRIBUCIONES:');
    if (data.callTimes) {
      contrib.forEach(s => {
        const callTime = data.callTimes[s.personnel_id];
        console.log(`   ${s.name} (ID ${s.personnel_id}): ${callTime || 'NO ASIGNADO'}`);
      });
    } else {
      console.log('   ❌ No hay callTimes en la respuesta');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

verifyFix();

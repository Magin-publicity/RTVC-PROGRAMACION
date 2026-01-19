// Script para verificar configuración de red
const os = require('os');

console.log('🌐 Verificando configuración de red...\n');

// Obtener todas las interfaces de red
const networkInterfaces = os.networkInterfaces();
const addresses = [];

Object.keys(networkInterfaces).forEach(interfaceName => {
  networkInterfaces[interfaceName].forEach(iface => {
    // Solo IPv4 y no loopback
    if (iface.family === 'IPv4' && !iface.internal) {
      addresses.push({
        name: interfaceName,
        address: iface.address,
        netmask: iface.netmask
      });
    }
  });
});

if (addresses.length === 0) {
  console.error('❌ No se encontraron interfaces de red activas');
  console.log('\n💡 Verifica que estés conectado a Wi-Fi o Ethernet');
  process.exit(1);
}

console.log('✅ Interfaces de red encontradas:\n');

addresses.forEach((addr, index) => {
  console.log(`${index + 1}. ${addr.name}`);
  console.log(`   IP: ${addr.address}`);
  console.log(`   Máscara: ${addr.netmask}`);
  console.log('');
});

const mainAddress = addresses[0].address;

console.log('📱 Para acceder desde el celular:\n');
console.log(`   Frontend: http://${mainAddress}:5173`);
console.log(`   Backend:  http://${mainAddress}:3000`);

console.log('\n🔧 Comandos útiles:\n');
console.log('   1. Verificar puertos abiertos:');
console.log('      netstat -an | findstr "5173 3000"');
console.log('');
console.log('   2. Agregar excepción al firewall:');
console.log('      netsh advfirewall firewall add rule name="Vite" dir=in action=allow protocol=TCP localport=5173');
console.log('      netsh advfirewall firewall add rule name="Backend" dir=in action=allow protocol=TCP localport=3000');
console.log('');
console.log('   3. Verificar conectividad desde celular:');
console.log(`      ping ${mainAddress}`);

console.log('\n✅ Tu PC está lista para recibir conexiones de red');
console.log(`📱 Conecta tu celular a la misma Wi-Fi y abre: http://${mainAddress}:5173\n`);

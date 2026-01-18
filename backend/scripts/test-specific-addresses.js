const { groupAddressesByZone } = require('../services/geographicZonification');

// Probar las direcciones que aparecen como no clasificadas
const testAddresses = [
  {
    name: 'Wilmar Matiz',
    address: 'Carrera 10 # 6-94',
    barrio: 'Belverde II',
    localidad: 'Mosquera, Cundinamarca'
  },
  {
    name: 'Santiago Torres',
    address: 'Calle 67 # 29B‑13',
    barrio: '7 de Agosto',
    localidad: 'Barrios Unidos'
  },
  {
    name: 'Vanesa Castañeda',
    address: 'Carrera 115 # 18A‑15',
    barrio: 'San José de Bavaria',
    localidad: 'Suba'
  },
  {
    name: 'William Mosquera',
    address: 'transversal 68a # 66b - 11',
    barrio: 'Bellavista Occidental',
    localidad: 'Engativá'
  },
  {
    name: 'Andrés Patiño',
    address: 'Carrera 69B # 24 - 10',
    barrio: 'Sauzalito',
    localidad: 'Fontibón'
  }
];

const result = groupAddressesByZone(testAddresses);

console.log('🔍 Resultados de clasificación:\n');

Object.keys(result).forEach(zone => {
  if (result[zone].length > 0) {
    console.log(`\n📍 ${zone}:`);
    result[zone].forEach(person => {
      console.log(`  - ${person.name} (${person.localidad})`);
      console.log(`    Confianza: ${person.zoneConfidence}`);
      console.log(`    Keywords: ${person.matchedKeywords.join(', ')}`);
    });
  }
});

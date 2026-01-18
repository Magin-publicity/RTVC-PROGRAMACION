// Script para actualizar información de contacto y contrato del personal
const pool = require('../config/database');

// Datos del personal con su información de contacto y contrato
const personnelData = [
  {
    name: 'Laura Meneses',
    email: 'laurameneses@rtvc.gov.co',
    phone: '3001234001',
    contract_start: '2024-01-01',
    contract_end: '2025-12-31'
  },
  {
    name: 'Andrés Torres',
    email: 'andrestorres@rtvc.gov.co',
    phone: '3001234002',
    contract_start: '2024-01-01',
    contract_end: '2025-12-31'
  },
  {
    name: 'María Rodríguez',
    email: 'mariarodriguez@rtvc.gov.co',
    phone: '3001234003',
    contract_start: '2024-01-01',
    contract_end: '2025-12-31'
  },
  {
    name: 'Camila López',
    email: 'camilalopez@rtvc.gov.co',
    phone: '3001234004',
    contract_start: '2024-01-01',
    contract_end: '2025-12-31'
  },
  {
    name: 'Julián Gómez',
    email: 'juliangomez@rtvc.gov.co',
    phone: '3001234005',
    contract_start: '2024-01-01',
    contract_end: '2025-12-31'
  },
  {
    name: 'Daniela Castro',
    email: 'danielacastro@rtvc.gov.co',
    phone: '3001234006',
    contract_start: '2024-01-01',
    contract_end: '2025-12-31'
  },
  {
    name: 'Felipe Moreno',
    email: 'felipemoreno@rtvc.gov.co',
    phone: '3001234007',
    contract_start: '2024-01-01',
    contract_end: '2025-12-31'
  },
  {
    name: 'Valentina Ruiz',
    email: 'valentinaruiz@rtvc.gov.co',
    phone: '3001234008',
    contract_start: '2024-01-01',
    contract_end: '2025-12-31'
  },
  {
    name: 'Santiago Vargas',
    email: 'santiagovargas@rtvc.gov.co',
    phone: '3001234009',
    contract_start: '2024-01-01',
    contract_end: '2025-12-31'
  },
  {
    name: 'Isabella Herrera',
    email: 'isabellaherrera@rtvc.gov.co',
    phone: '3001234010',
    contract_start: '2024-01-01',
    contract_end: '2025-12-31'
  },
  {
    name: 'Sebastián Ríos',
    email: 'sebastianrios@rtvc.gov.co',
    phone: '3001234011',
    contract_start: '2024-01-01',
    contract_end: '2025-12-31'
  },
  {
    name: 'Lucía Díaz',
    email: 'luciadiaz@rtvc.gov.co',
    phone: '3001234012',
    contract_start: '2024-01-01',
    contract_end: '2025-12-31'
  },
  {
    name: 'Mateo Sánchez',
    email: 'mateosanchez@rtvc.gov.co',
    phone: '3001234013',
    contract_start: '2024-01-01',
    contract_end: '2025-12-31'
  },
  {
    name: 'Sofía Ramírez',
    email: 'sofiaramirez@rtvc.gov.co',
    phone: '3001234014',
    contract_start: '2024-01-01',
    contract_end: '2025-12-31'
  },
  {
    name: 'Nicolás Fernández',
    email: 'nicolasfernandez@rtvc.gov.co',
    phone: '3001234015',
    contract_start: '2024-01-01',
    contract_end: '2025-12-31'
  },
  {
    name: 'Emma Gutiérrez',
    email: 'emmagutierrez@rtvc.gov.co',
    phone: '3001234016',
    contract_start: '2024-01-01',
    contract_end: '2025-12-31'
  },
  {
    name: 'Samuel Jiménez',
    email: 'samueljimenez@rtvc.gov.co',
    phone: '3001234017',
    contract_start: '2024-01-01',
    contract_end: '2025-12-31'
  },
  {
    name: 'Olivia Martínez',
    email: 'oliviamartinez@rtvc.gov.co',
    phone: '3001234018',
    contract_start: '2024-01-01',
    contract_end: '2025-12-31'
  },
  {
    name: 'Benjamín Pérez',
    email: 'benjaminperez@rtvc.gov.co',
    phone: '3001234019',
    contract_start: '2024-01-01',
    contract_end: '2025-12-31'
  },
  {
    name: 'Mía González',
    email: 'miagonzalez@rtvc.gov.co',
    phone: '3001234020',
    contract_start: '2024-01-01',
    contract_end: '2025-12-31'
  },
  {
    name: 'Lucas Ortiz',
    email: 'lucasortiz@rtvc.gov.co',
    phone: '3001234021',
    contract_start: '2024-01-01',
    contract_end: '2025-12-31'
  },
  {
    name: 'Amelia Silva',
    email: 'ameliasilva@rtvc.gov.co',
    phone: '3001234022',
    contract_start: '2024-01-01',
    contract_end: '2025-12-31'
  },
  {
    name: 'Diego Rojas',
    email: 'diegorojas@rtvc.gov.co',
    phone: '3001234023',
    contract_start: '2024-01-01',
    contract_end: '2025-12-31'
  },
  {
    name: 'Victoria Molina',
    email: 'victoriamolina@rtvc.gov.co',
    phone: '3001234024',
    contract_start: '2024-01-01',
    contract_end: '2025-12-31'
  },
  {
    name: 'Gabriel Navarro',
    email: 'gabrielnavarro@rtvc.gov.co',
    phone: '3001234025',
    contract_start: '2024-01-01',
    contract_end: '2025-12-31'
  },
  {
    name: 'Catalina Reyes',
    email: 'catalinareyes@rtvc.gov.co',
    phone: '3001234026',
    contract_start: '2024-01-01',
    contract_end: '2025-12-31'
  },
  {
    name: 'Tomás Muñoz',
    email: 'tomasmunoz@rtvc.gov.co',
    phone: '3001234027',
    contract_start: '2024-01-01',
    contract_end: '2025-12-31'
  },
  {
    name: 'Luna Cárdenas',
    email: 'lunacardenas@rtvc.gov.co',
    phone: '3001234028',
    contract_start: '2024-01-01',
    contract_end: '2025-12-31'
  },
  {
    name: 'Emilio Acosta',
    email: 'emilioacosta@rtvc.gov.co',
    phone: '3001234029',
    contract_start: '2024-01-01',
    contract_end: '2025-12-31'
  },
  {
    name: 'Renata Campos',
    email: 'renatacampos@rtvc.gov.co',
    phone: '3001234030',
    contract_start: '2024-01-01',
    contract_end: '2025-12-31'
  },
  {
    name: 'Maximiliano Vega',
    email: 'maximiliano@rtvc.gov.co',
    phone: '3001234031',
    contract_start: '2024-01-01',
    contract_end: '2025-12-31'
  },
  {
    name: 'Aurora Medina',
    email: 'auroramedina@rtvc.gov.co',
    phone: '3001234032',
    contract_start: '2024-01-01',
    contract_end: '2025-12-31'
  }
];

async function updatePersonnelInfo() {
  try {
    console.log('📝 Actualizando información de contacto y contrato del personal...\n');

    let updated = 0;
    let notFound = 0;

    for (const data of personnelData) {
      try {
        const result = await pool.query(
          `UPDATE personnel
           SET email = $1, phone = $2, contract_start = $3, contract_end = $4
           WHERE name = $5
           RETURNING name`,
          [data.email, data.phone, data.contract_start, data.contract_end, data.name]
        );

        if (result.rows.length > 0) {
          console.log(`✅ ${data.name} - Actualizado`);
          updated++;
        } else {
          console.log(`⚠️  ${data.name} - No encontrado en la base de datos`);
          notFound++;
        }
      } catch (error) {
        console.error(`❌ Error al actualizar ${data.name}:`, error.message);
      }
    }

    console.log(`\n📊 Resumen:`);
    console.log(`   ✅ Actualizados: ${updated}`);
    console.log(`   ⚠️  No encontrados: ${notFound}`);
    console.log(`   📝 Total procesados: ${personnelData.length}`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error general:', error);
    process.exit(1);
  }
}

updatePersonnelInfo();

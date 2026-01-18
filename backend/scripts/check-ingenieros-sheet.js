const XLSX = require('xlsx');
const path = require('path');

const excelPath = path.join(__dirname, '../../Datos y Documentos RTVC/personal_logistico.xlsx');
const workbook = XLSX.readFile(excelPath);

const sheetName = 'Ingenieros ';
const worksheet = workbook.Sheets[sheetName];

if (!worksheet) {
  console.log('❌ Hoja "Ingenieros" no encontrada');
  console.log('Hojas disponibles:', workbook.SheetNames);
  process.exit(1);
}

const data = XLSX.utils.sheet_to_json(worksheet);

console.log('📋 Hoja: Ingenieros');
console.log('Total registros:', data.length);
console.log('\nPrimeros 3 registros:');
data.slice(0, 3).forEach((row, i) => {
  console.log(`\nRegistro ${i + 1}:`);
  console.log(JSON.stringify(row, null, 2));
});

console.log('\nColumnas encontradas:');
if (data.length > 0) {
  console.log(Object.keys(data[0]));
}

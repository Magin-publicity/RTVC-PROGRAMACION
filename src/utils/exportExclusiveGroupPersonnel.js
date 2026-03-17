// src/utils/exportExclusiveGroupPersonnel.js
import * as XLSX from 'xlsx-js-style';

/**
 * Exporta el personal de un grupo exclusivo a Excel
 * @param {Object} program - El programa con grupo exclusivo
 * @param {Array} allPersonnel - Lista completa de personal
 */
export const exportExclusiveGroupPersonnel = (program, allPersonnel) => {
  if (!program.isExclusiveGroup || !program.exclusivePersonnel || program.exclusivePersonnel.length === 0) {
    alert('Este programa no tiene personal asignado para exportar');
    return;
  }

  // Filtrar el personal del grupo exclusivo
  const groupPersonnel = allPersonnel.filter(person =>
    program.exclusivePersonnel.includes(person.id)
  );

  if (groupPersonnel.length === 0) {
    alert('No se encontró información del personal asignado');
    return;
  }

  // Preparar los datos para Excel
  const excelData = groupPersonnel.map((person, index) => ({
    '#': index + 1,
    'Nombre': person.name || '',
    'Cédula': person.cedula || '',
    'Cargo': person.role || '',
    'Área': person.area || '',
    'Fecha de Nacimiento': person.fecha_nacimiento ? formatDate(person.fecha_nacimiento) : '',
    'Teléfono': person.phone || '',
    'Email': person.email || '',
    'ARL': person.arl || '',
    'EPS': person.eps || '',
    'Dirección': person.direccion || '',
    'Barrio': person.barrio || '',
    'Localidad': person.localidad || ''
  }));

  // Crear workbook y worksheet
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(excelData);

  // Configurar el ancho de las columnas
  const colWidths = [
    { wch: 5 },   // #
    { wch: 30 },  // Nombre
    { wch: 15 },  // Cédula
    { wch: 25 },  // Cargo
    { wch: 20 },  // Área
    { wch: 18 },  // Fecha Nacimiento
    { wch: 15 },  // Teléfono
    { wch: 30 },  // Email
    { wch: 20 },  // ARL
    { wch: 20 },  // EPS
    { wch: 30 },  // Dirección
    { wch: 20 },  // Barrio
    { wch: 20 }   // Localidad
  ];
  ws['!cols'] = colWidths;

  // Estilo para el encabezado
  const headerStyle = {
    font: { bold: true, color: { rgb: "FFFFFF" } },
    fill: { fgColor: { rgb: "4472C4" } },
    alignment: { horizontal: "center", vertical: "center" },
    border: {
      top: { style: "thin", color: { rgb: "000000" } },
      bottom: { style: "thin", color: { rgb: "000000" } },
      left: { style: "thin", color: { rgb: "000000" } },
      right: { style: "thin", color: { rgb: "000000" } }
    }
  };

  // Estilo para las celdas de datos
  const cellStyle = {
    alignment: { vertical: "center" },
    border: {
      top: { style: "thin", color: { rgb: "D3D3D3" } },
      bottom: { style: "thin", color: { rgb: "D3D3D3" } },
      left: { style: "thin", color: { rgb: "D3D3D3" } },
      right: { style: "thin", color: { rgb: "D3D3D3" } }
    }
  };

  // Aplicar estilos al encabezado (primera fila)
  const range = XLSX.utils.decode_range(ws['!ref']);
  for (let C = range.s.c; C <= range.e.c; ++C) {
    const address = XLSX.utils.encode_col(C) + "1";
    if (!ws[address]) continue;
    ws[address].s = headerStyle;
  }

  // Aplicar estilos a las celdas de datos
  for (let R = range.s.r + 1; R <= range.e.r; ++R) {
    for (let C = range.s.c; C <= range.e.c; ++C) {
      const address = XLSX.utils.encode_col(C) + (R + 1);
      if (!ws[address]) continue;
      ws[address].s = cellStyle;
    }
  }

  // Agregar el worksheet al workbook
  XLSX.utils.book_append_sheet(wb, ws, 'Personal');

  // Generar nombre del archivo
  const groupType = program.exclusiveType || 'Grupo';
  const programName = program.name.replace(/[^a-zA-Z0-9]/g, '_');
  const date = new Date().toISOString().split('T')[0];
  const fileName = `Personal_${groupType}_${programName}_${date}.xlsx`;

  // Descargar el archivo
  XLSX.writeFile(wb, fileName);

  console.log(`✅ Archivo exportado: ${fileName}`);
};

/**
 * Formatea una fecha para mostrar en formato legible
 * @param {string} dateString - Fecha en formato ISO
 * @returns {string} Fecha formateada
 */
const formatDate = (dateString) => {
  if (!dateString) return '';

  try {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${day}/${month}/${year}`;
  } catch (error) {
    return dateString;
  }
};

/**
 * Exporta todos los grupos exclusivos de un día a Excel
 * @param {Array} programs - Lista de programas
 * @param {Array} allPersonnel - Lista completa de personal
 * @param {string} day - Día de la semana
 */
export const exportAllExclusiveGroups = (programs, allPersonnel, day) => {
  const exclusivePrograms = programs.filter(p => p.isExclusiveGroup && p.exclusivePersonnel?.length > 0);

  if (exclusivePrograms.length === 0) {
    alert('No hay grupos exclusivos con personal asignado para exportar');
    return;
  }

  const wb = XLSX.utils.book_new();

  exclusivePrograms.forEach(program => {
    const groupPersonnel = allPersonnel.filter(person =>
      program.exclusivePersonnel.includes(person.id)
    );

    if (groupPersonnel.length === 0) return;

    const excelData = groupPersonnel.map((person, index) => ({
      '#': index + 1,
      'Nombre': person.name || '',
      'Cédula': person.cedula || '',
      'Cargo': person.role || '',
      'Área': person.area || '',
      'Fecha de Nacimiento': person.fecha_nacimiento ? formatDate(person.fecha_nacimiento) : '',
      'Teléfono': person.phone || '',
      'Email': person.email || '',
      'ARL': person.arl || '',
      'EPS': person.eps || '',
      'Dirección': person.direccion || '',
      'Barrio': person.barrio || '',
      'Localidad': person.localidad || ''
    }));

    const ws = XLSX.utils.json_to_sheet(excelData);

    // Configurar ancho de columnas
    ws['!cols'] = [
      { wch: 5 }, { wch: 30 }, { wch: 15 }, { wch: 25 }, { wch: 20 },
      { wch: 18 }, { wch: 15 }, { wch: 30 }, { wch: 20 }, { wch: 20 },
      { wch: 30 }, { wch: 20 }, { wch: 20 }
    ];

    const sheetName = `${program.exclusiveType || 'Grupo'}_${program.name}`.substring(0, 31);
    XLSX.utils.book_append_sheet(wb, ws, sheetName);
  });

  const date = new Date().toISOString().split('T')[0];
  const fileName = `Grupos_Exclusivos_${day}_${date}.xlsx`;
  XLSX.writeFile(wb, fileName);

  console.log(`✅ Archivo exportado: ${fileName} con ${exclusivePrograms.length} grupos`);
};
